from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, Header
from pydantic import BaseModel
from typing import List, Optional
import hmac
import hashlib
import os
import json
import logging
from datetime import datetime

from database.mongodb import get_db
from services.workflow_service import start_review_workflow
from models.models import Repository, Workflow, Review

logger = logging.getLogger(__name__)
router = APIRouter()

# Environment secret for webhook verification
GITHUB_WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET", "")

def serialize_doc(doc):
    if not doc:
        return doc
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    # Also recursively serialize list fields or sub-documents if they contain _id
    return doc

def serialize_list(docs):
    return [serialize_doc(d) for d in docs]

class ConnectRepoRequest(BaseModel):
    name: str
    owner: str

class TriggerWorkflowRequest(BaseModel):
    repo_name: str
    pr_number: int
    pr_title: str

@router.get("/stats")
async def get_dashboard_stats():
    db = get_db()
    
    # 1. Total Reviews
    total_reviews = len(await db["reviews"].find().to_list(10000))
    
    # 2. Active Workflows (Running or Pending)
    active_wf_list = await db["workflows"].find({"status": {"$in": ["Pending", "Running"]}}).to_list(100)
    active_workflows = len(active_wf_list)
    
    # 3. Critical Issues
    critical_issues = len(await db["workflows"].find({"status": "Critical"}).to_list(1000))
    
    # 4. Repos Monitored
    repos_monitored = len(await db["repositories"].find().to_list(1000))
    
    return {
        "total_reviews": total_reviews,
        "active_workflows": active_workflows,
        "critical_issues": critical_issues,
        "repos_monitored": repos_monitored
    }

@router.get("/workflows")
async def get_workflows():
    db = get_db()
    workflows_list = await db["workflows"].find().to_list(100)
    # Sort workflows: Running/Pending first, then by date descending
    def sort_key(w):
        status_priority = {"Running": 0, "Pending": 1, "Clean": 2, "Issues": 3, "Critical": 4, "Failed": 5}
        return (status_priority.get(w.get("status"), 9), w.get("created_at", ""))
        
    # Sort locally for simplicity
    sorted_wf = sorted(serialize_list(workflows_list), key=sort_key)
    return sorted_wf

@router.get("/workflows/{workflow_id}")
async def get_workflow_by_id(workflow_id: str):
    db = get_db()
    wf = await db["workflows"].find_one({"id": workflow_id})
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return serialize_doc(wf)

@router.get("/history")
async def get_history():
    db = get_db()
    reviews = await db["reviews"].find().to_list(100)
    # Sort by created_at descending
    sorted_reviews = sorted(serialize_list(reviews), key=lambda r: r.get("created_at", ""), reverse=True)
    return sorted_reviews

@router.get("/reviews/{review_id}")
async def get_review_by_id(review_id: str):
    db = get_db()
    review = await db["reviews"].find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return serialize_doc(review)

@router.get("/repos")
async def get_repositories():
    db = get_db()
    repos = await db["repositories"].find().to_list(100)
    return serialize_list(repos)

@router.post("/repos/connect")
async def connect_repository(req: ConnectRepoRequest):
    db = get_db()
    
    # Check if already connected
    existing = await db["repositories"].find_one({"name": req.name, "owner": req.owner})
    if existing:
        return {"status": "already_connected", "repository": serialize_doc(existing)}
        
    repo_id = f"repo_{req.owner.lower()}_{req.name.lower()}"
    new_repo = {
        "id": repo_id,
        "name": req.name,
        "owner": req.owner,
        "health_score": 100,
        "prs_count": 0,
        "active": True,
        "connected_at": datetime.utcnow().isoformat() + "Z"
    }
    await db["repositories"].insert_one(new_repo)
    return {"status": "success", "repository": serialize_doc(new_repo)}

@router.post("/repos/disconnect")
async def disconnect_repository(repo_id: str):
    db = get_db()
    await db["repositories"].update_one(
        {"id": repo_id},
        {"$set": {"active": False}}
    )
    return {"status": "success", "message": "Repository disconnected."}

@router.post("/workflows/trigger")
async def trigger_workflow(req: TriggerWorkflowRequest, background_tasks: BackgroundTasks):
    """
    Manually trigger an AI review workflow (for demo/hackathon testing).
    """
    workflow_id = await start_review_workflow(
        repo_name=req.repo_name,
        pr_number=req.pr_number,
        pr_title=req.pr_title,
        background_tasks=background_tasks
    )
    return {"status": "success", "workflow_id": workflow_id}

@router.post("/webhook")
async def github_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_github_event: str = Header(None),
    x_hub_signature_256: str = Header(None)
):
    """
    Listens to GitHub Webhook Events.
    Processes pull_request events asynchronously.
    """
    payload_bytes = await request.body()
    
    # Optional Signature Verification
    if GITHUB_WEBHOOK_SECRET and x_hub_signature_256:
        # Verify hash signature
        hash_format = "sha256="
        if not x_hub_signature_256.startswith(hash_format):
            raise HTTPException(status_code=400, detail="Invalid signature format")
        signature = x_hub_signature_256[len(hash_format):]
        mac = hmac.new(GITHUB_WEBHOOK_SECRET.encode(), msg=payload_bytes, digestmod=hashlib.sha256)
        if not hmac.compare_digest(mac.hexdigest(), signature):
            raise HTTPException(status_code=401, detail="Webhook signature mismatch")

    # Load JSON payload
    try:
        payload = json.loads(payload_bytes.decode())
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
    logger.info(f"Received GitHub webhook event: {x_github_event}")
    
    if x_github_event == "pull_request":
        action = payload.get("action")
        # Trigger review on PR open, synchronize (push code updates), or reopen
        if action in ["opened", "reopened", "synchronize"]:
            pr_data = payload.get("pull_request", {})
            pr_number = pr_data.get("number")
            pr_title = pr_data.get("title")
            
            repo_data = payload.get("repository", {})
            repo_name = repo_data.get("full_name")
            
            logger.info(f"Triggering automated PR review workflow: {repo_name} PR #{pr_number}")
            workflow_id = await start_review_workflow(
                repo_name=repo_name,
                pr_number=pr_number,
                pr_title=pr_title,
                background_tasks=background_tasks
            )
            return {"status": "triggered", "workflow_id": workflow_id}
            
    return {"status": "ignored", "reason": "event_type_not_matching_pr_activities"}
