import logging
from datetime import datetime, timedelta
from database.mongodb import get_db

logger = logging.getLogger(__name__)

async def seed_initial_data():
    db = get_db()
    
    # 1. Seed Repositories if empty
    repos_count = len(await db["repositories"].find().to_list(10))
    if repos_count == 0:
        logger.info("Database is empty. Seeding initial repositories...")
        initial_repos = [
            {
                "id": "repo_core_backend",
                "name": "core-backend",
                "owner": "Hrithik-GV",
                "health_score": 94,
                "prs_count": 24,
                "active": True,
                "connected_at": (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z"
            },
            {
                "id": "repo_docs_portal",
                "name": "docs-portal",
                "owner": "Hrithik-GV",
                "health_score": 100,
                "prs_count": 8,
                "active": True,
                "connected_at": (datetime.utcnow() - timedelta(days=25)).isoformat() + "Z"
            },
            {
                "id": "repo_auth_service",
                "name": "auth-service",
                "owner": "Hrithik-GV",
                "health_score": 88,
                "prs_count": 11,
                "active": True,
                "connected_at": (datetime.utcnow() - timedelta(days=20)).isoformat() + "Z"
            }
        ]
        for repo in initial_repos:
            await db["repositories"].insert_one(repo)
            
    # 2. Seed Workflows and Reviews if empty
    wf_count = len(await db["workflows"].find().to_list(10))
    if wf_count == 0:
        logger.info("Seeding historical reviews and workflows...")
        
        # Historical workflow 1 (Clean)
        wf_id_1 = "wf_hist0001"
        rev_id_1 = "rev_hist0001"
        time_1 = (datetime.utcnow() - timedelta(minutes=12)).isoformat() + "Z"
        
        wf1 = {
            "id": wf_id_1,
            "repo_name": "Hrithik-GV/core-backend",
            "pr_number": 1201,
            "pr_title": "fix/null-pointer-exception",
            "status": "Clean",
            "progress": 100,
            "agents": ["Planner", "Bug Detection", "Security", "Performance", "Code Quality", "Summary"],
            "created_at": time_1,
            "completed_at": time_1,
            "traces": [
                {"step": "Triggered", "agent": "Webhook", "status": "completed", "message": "Triggered via Webhook", "timestamp": time_1},
                {"step": "Planning Complete", "agent": "Planner Agent", "status": "completed", "message": "Scheduled general logic scan", "timestamp": time_1},
                {"step": "Bug Scan Complete", "agent": "Bug Detection", "status": "completed", "message": "No logic issues found.", "timestamp": time_1},
                {"step": "Security Scan Complete", "agent": "Security Agent", "status": "completed", "message": "No credentials or vulnerabilities found.", "timestamp": time_1},
                {"step": "Summary Complete", "agent": "Summary Agent", "status": "completed", "message": "Workflow clean.", "timestamp": time_1}
            ],
            "review_id": rev_id_1
        }
        rev1 = {
            "id": rev_id_1,
            "workflow_id": wf_id_1,
            "pr_number": 1201,
            "pr_title": "fix/null-pointer-exception",
            "repo_name": "Hrithik-GV/core-backend",
            "score": 100,
            "bug_count": 0,
            "security_issues": 0,
            "perf_issues": 0,
            "code_quality": "Excellent",
            "findings": [],
            "summary": "### PulseReview Summary\n\nNo major issues were detected in this PR. All safety checks and code conventions were followed successfully.",
            "created_at": time_1
        }
        
        # Historical workflow 2 (Issues)
        wf_id_2 = "wf_hist0002"
        rev_id_2 = "rev_hist0002"
        time_2 = (datetime.utcnow() - timedelta(hours=1)).isoformat() + "Z"
        
        wf2 = {
            "id": wf_id_2,
            "repo_name": "Hrithik-GV/docs-portal",
            "pr_number": 892,
            "pr_title": "feat/user-dashboard",
            "status": "Issues",
            "progress": 100,
            "agents": ["Planner", "Bug Detection", "Security", "Performance", "Code Quality", "Summary"],
            "created_at": time_2,
            "completed_at": time_2,
            "traces": [
                {"step": "Triggered", "agent": "Webhook", "status": "completed", "message": "Triggered via Webhook", "timestamp": time_2},
                {"step": "Planning Complete", "agent": "Planner Agent", "status": "completed", "message": "Scheduled documentation scan", "timestamp": time_2},
                {"step": "Bug Scan Complete", "agent": "Bug Detection", "status": "completed", "message": "Found 1 bug.", "timestamp": time_2},
                {"step": "Quality Scan Complete", "agent": "Code Quality", "status": "completed", "message": "Found 2 quality concerns.", "timestamp": time_2},
                {"step": "Summary Complete", "agent": "Summary Agent", "status": "completed", "message": "Workflow completed with issues.", "timestamp": time_2}
            ],
            "review_id": rev_id_2
        }
        rev2 = {
            "id": rev_id_2,
            "workflow_id": wf_id_2,
            "pr_number": 892,
            "pr_title": "feat/user-dashboard",
            "repo_name": "Hrithik-GV/docs-portal",
            "score": 82,
            "bug_count": 1,
            "security_issues": 0,
            "perf_issues": 2,
            "code_quality": "Good",
            "findings": [
                {
                    "file_path": "src/components/dashboard.jsx",
                    "line_number": 44,
                    "severity": "warning",
                    "message": "Potential null object reference on user details rendering. Accessing state without checking loading state.",
                    "suggestion": "if (!user) return <Loading />;"
                },
                {
                    "file_path": "src/components/dashboard.jsx",
                    "line_number": 102,
                    "severity": "info",
                    "message": "Unresolved TODO placeholder found.",
                    "suggestion": "Implement real API fetch."
                }
            ],
            "summary": "### PulseReview Summary\n\nThe PR implements the user dashboard feature. A few small code quality smells and one null protection issue were found. Please see details below.",
            "created_at": time_2
        }
        
        # Historical workflow 3 (Critical)
        wf_id_3 = "wf_hist0003"
        rev_id_3 = "rev_hist0003"
        time_3 = (datetime.utcnow() - timedelta(hours=5)).isoformat() + "Z"
        
        wf3 = {
            "id": wf_id_3,
            "repo_name": "Hrithik-GV/auth-service",
            "pr_number": 445,
            "pr_title": "feat/stripe-integration",
            "status": "Critical",
            "progress": 100,
            "agents": ["Planner", "Bug Detection", "Security", "Performance", "Code Quality", "Summary"],
            "created_at": time_3,
            "completed_at": time_3,
            "traces": [
                {"step": "Triggered", "agent": "Webhook", "status": "completed", "message": "Triggered via Webhook", "timestamp": time_3},
                {"step": "Planning Complete", "agent": "Planner Agent", "status": "completed", "message": "Scheduled billing integration scan", "timestamp": time_3},
                {"step": "Security Scan Complete", "agent": "Security Agent", "status": "completed", "message": "CRITICAL vulnerability detected!", "timestamp": time_3},
                {"step": "Summary Complete", "agent": "Summary Agent", "status": "completed", "message": "Workflow failed security check.", "timestamp": time_3}
            ],
            "review_id": rev_id_3
        }
        rev3 = {
            "id": rev_id_3,
            "workflow_id": wf_id_3,
            "pr_number": 445,
            "pr_title": "feat/stripe-integration",
            "repo_name": "Hrithik-GV/auth-service",
            "score": 45,
            "bug_count": 0,
            "security_issues": 1,
            "perf_issues": 0,
            "code_quality": "Poor",
            "findings": [
                {
                    "file_path": "billing/stripe_client.py",
                    "line_number": 12,
                    "severity": "critical",
                    "message": "Hardcoded Stripe secret API Key found in source code. Exposure of billing API keys can lead to financial losses.",
                    "suggestion": "stripe.api_key = os.getenv('STRIPE_SECRET_KEY')"
                }
            ],
            "summary": "### PulseReview Summary\n\n**CRITICAL SECURITY ALERT**\nA hardcoded Stripe secret key was detected. This must be fixed immediately prior to code merge.",
            "created_at": time_3
        }
        
        await db["workflows"].insert_one(wf1)
        await db["workflows"].insert_one(wf2)
        await db["workflows"].insert_one(wf3)
        
        await db["reviews"].insert_one(rev1)
        await db["reviews"].insert_one(rev2)
        await db["reviews"].insert_one(rev3)
        
        logger.info("Successfully seeded historical data.")
