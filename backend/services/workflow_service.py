import uuid
import logging
from datetime import datetime
from database.mongodb import get_db
from agents.agents import run_autonomous_review
from services.github_service import get_pr_diff, post_pr_review_comments

logger = logging.getLogger(__name__)

async def async_review_task(workflow_id: str, repo_name: str, pr_number: int, pr_title: str):
    try:
        # 1. Fetch the diff
        diff = await get_pr_diff(repo_name, pr_number)
        
        # 2. Run the multi-agent system
        review = await run_autonomous_review(workflow_id, repo_name, pr_number, pr_title, diff)
        
        # 3. Post comments to GitHub
        await post_pr_review_comments(repo_name, pr_number, review["findings"], review["summary"])
        
    except Exception as e:
        logger.error(f"Error in async review workflow {workflow_id}: {e}", exc_info=True)
        # Update workflow to failed state
        db = get_db()
        await db["workflows"].update_one(
            {"id": workflow_id},
            {
                "$set": {
                    "status": "Failed",
                    "completed_at": datetime.utcnow().isoformat() + "Z"
                },
                "$push": {
                    "traces": {
                        "step": "Failed",
                        "agent": "System",
                        "status": "failed",
                        "message": f"Execution error: {str(e)}",
                        "timestamp": datetime.utcnow().isoformat() + "Z"
                    }
                }
            }
        )

async def start_review_workflow(repo_name: str, pr_number: int, pr_title: str, background_tasks) -> str:
    db = get_db()
    workflow_id = "wf_" + uuid.uuid4().hex[:12]
    
    # Initialize workflow document
    workflow_doc = {
        "id": workflow_id,
        "repo_name": repo_name,
        "pr_number": pr_number,
        "pr_title": pr_title,
        "status": "Pending",
        "progress": 0,
        "agents": ["Planner", "Bug Detection", "Security", "Performance", "Code Quality", "Summary"],
        "created_at": datetime.utcnow().isoformat() + "Z",
        "completed_at": None,
        "traces": [
            {
                "step": "Triggered",
                "agent": "Webhook Handler",
                "status": "completed",
                "message": f"Workflow initiated for {repo_name} PR #{pr_number}.",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        ],
        "review_id": None
    }
    
    await db["workflows"].insert_one(workflow_doc)
    logger.info(f"Initialized review workflow {workflow_id} for PR {repo_name} #{pr_number}")
    
    # Add background task
    background_tasks.add_task(async_review_task, workflow_id, repo_name, pr_number, pr_title)
    
    return workflow_id
