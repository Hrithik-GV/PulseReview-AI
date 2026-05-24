import os
import logging
from github import Github
from github.GithubException import GithubException

logger = logging.getLogger(__name__)

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
github_client = None

if GITHUB_TOKEN and GITHUB_TOKEN != "your_github_personal_access_token_here":
    try:
        github_client = Github(GITHUB_TOKEN)
        logger.info("GitHub service initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing GitHub client: {e}")
else:
    logger.warning("GITHUB_TOKEN not configured. GitHub service running in MOCK mode.")

MOCK_DIFF = """diff --git a/database/db_manager.py b/database/db_manager.py
index a1b2c3d..e5f6g7h 100644
--- a/database/db_manager.py
+++ b/database/db_manager.py
@@ -10,12 +10,25 @@ class DatabaseManager:
     def __init__(self):
         self.connection_string = "mongodb://admin:SuperSecretPassword123@localhost:27017"
         self.client = None
 
     def connect(self):
         try:
-            pass
+            # Raw connection without context manager
+            import pymongo
+            self.client = pymongo.MongoClient(self.connection_string)
+            logger.info("Connected successfully")
+        except:
+            print("Connection failed")
+
+    def get_user(self, user_id):
+        # Unsafe query syntax
+        db = self.client["users"]
+        query = f"SELECT * FROM users WHERE id = '{user_id}'"
+        results = db.command("sql_eval", query)
+        return results
+
+    def compute_all_stats(self):
+        # Inefficient sleeping inside synchronous loop
+        import time
+        for i in range(10):
+            time.sleep(1)
+        return "Done"
"""

async def get_pr_diff(repo_name: str, pr_number: int) -> str:
    """
    Fetches the git diff of a PR.
    Falls back to a realistic mock diff if GITHUB_TOKEN is not configured or fails.
    """
    if github_client:
        try:
            repo = github_client.get_repo(repo_name)
            pr = repo.get_pull(pr_number)
            # PyGithub supports getting diff via header
            pr_diff = pr.get_files()
            # For simplicity in this demo, compile all file patches into a single unified diff
            diff_str = ""
            for file in pr_diff:
                if file.patch:
                    diff_str += f"diff --git a/{file.filename} b/{file.filename}\n"
                    diff_str += f"--- a/{file.filename}\n"
                    diff_str += f"+++ b/{file.filename}\n"
                    diff_str += file.patch + "\n"
            if diff_str:
                return diff_str
        except GithubException as ge:
            logger.error(f"GitHub API Error fetching PR diff: {ge}")
        except Exception as e:
            logger.error(f"Error fetching PR diff: {e}")
            
    # Mock fallback
    logger.info("Returning high-fidelity mock diff for demo review.")
    return MOCK_DIFF

async def post_pr_review_comments(repo_name: str, pr_number: int, findings: list, summary: str):
    """
    Posts inline comments and a top-level review summary on GitHub.
    Succeeds silently in mock mode.
    """
    if github_client:
        try:
            repo = github_client.get_repo(repo_name)
            pr = repo.get_pull(pr_number)
            
            # Post top-level comment
            pr.create_issue_comment(summary)
            logger.info(f"Successfully posted top-level review comment on PR #{pr_number}")
            
            # Post inline comments
            # For simplicity, post them as individual comments or standard review
            for finding in findings:
                try:
                    # Create review comment needs commit SHA and position
                    commits = pr.get_commits()
                    latest_commit = commits[commits.totalCount - 1]
                    
                    comment_text = f"**PulseReview AI - {finding['severity'].upper()}**\n\n{finding['message']}\n\n```python\n# Suggestion:\n{finding['suggestion']}\n```"
                    
                    # Creating PR review comment
                    pr.create_review_comment(
                        body=comment_text,
                        commit_id=latest_commit,
                        path=finding['file_path'],
                        position=max(1, finding['line_number']) # position is index in diff, fallback line
                    )
                except Exception as e:
                    # Posting inline comment can be fragile due to diff positions, fallback to issue comments
                    pr.create_issue_comment(
                        f"**PulseReview AI Finding**\nFile: `{finding['file_path']}` (Line {finding['line_number']})\nSeverity: `{finding['severity']}`\n\n{finding['message']}\n\n**Suggestion:**\n{finding['suggestion']}"
                    )
            logger.info(f"Successfully posted {len(findings)} inline findings on PR #{pr_number}")
            return True
        except GithubException as ge:
            logger.error(f"GitHub API Error posting comments: {ge}")
        except Exception as e:
            logger.error(f"Error posting review comments: {e}")
            
    logger.info("Mock GitHub review comment posting completed successfully.")
    return True
