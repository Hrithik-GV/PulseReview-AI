import os
import json
import logging
import random
from datetime import datetime
import google.generativeai as genai
from database.mongodb import get_db

logger = logging.getLogger(__name__)

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
model_initialized = False

try:
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        model_initialized = True
        logger.info("Gemini API initialized successfully.")
    else:
        logger.warning("GEMINI_API_KEY not found in environment variables. Agents will run in mock/heuristic mode.")
except Exception as e:
    logger.error(f"Error initializing Gemini API: {e}. Falling back to mock mode.")

# Helper to log traces to DB
async def add_trace_step(workflow_id: str, step: str, agent: str, status: str, message: str):
    db = get_db()
    timestamp = datetime.utcnow().isoformat() + "Z"
    trace_step = {
        "step": step,
        "agent": agent,
        "status": status,
        "message": message,
        "timestamp": timestamp
    }
    await db["workflows"].update_one(
        {"id": workflow_id},
        {
            "$push": {"traces": trace_step}
        }
    )
    logger.info(f"[{workflow_id}] {agent} - {step}: {status} ({message})")

# Helper to update workflow overall status and progress
async def update_workflow_progress(workflow_id: str, progress: int, status: str = None):
    db = get_db()
    update_data = {"progress": progress}
    if status:
        update_data["status"] = status
    await db["workflows"].update_one(
        {"id": workflow_id},
        {"$set": update_data}
    )

# Standard prompts
PLANNER_PROMPT = """
You are the Lead Project Planner agent for PulseReview AI.
Your task is to analyze the Git diff of a Pull Request and plan which files need specialized code review.
You should output a JSON object with the following structure:
{
  "planned_reviews": [
    {
      "file_path": "string",
      "priority": "high" or "medium" or "low",
      "focus_areas": ["string"]
    }
  ],
  "global_instructions": "string"
}

Git Diff:
---
{diff}
---

Provide ONLY the JSON output. No other text.
"""

BUG_PROMPT = """
You are the Bug Detection Agent. Your job is to scan the Git diff and identify logical errors, edge cases, null pointer exceptions, unhandled failures, concurrency issues, or variable scope flaws.
For each bug found, create a finding. If no bugs are found, return an empty list.

Git Diff:
---
{diff}
---

Output a JSON array of findings. Each finding must match:
{
  "file_path": "string",
  "line_number": integer,
  "severity": "warning" or "high",
  "message": "detailed description of the bug and why it fails",
  "suggestion": "correct code block or instructions to fix it"
}

Provide ONLY the JSON array output. No other text.
"""

SECURITY_PROMPT = """
You are the Security Agent. Your job is to scan the Git diff and identify security vulnerabilities (OWASP Top 10, SQL injection, XSS, SSRF, hardcoded credentials, weak cryptography, broken access control).
For each vulnerability, create a finding. If none are found, return an empty list.

Git Diff:
---
{diff}
---

Output a JSON array of findings. Each finding must match:
{
  "file_path": "string",
  "line_number": integer,
  "severity": "high" or "critical",
  "message": "description of the vulnerability, threat model, and potential exploit",
  "suggestion": "secure code block or mitigation instructions"
}

Provide ONLY the JSON array output. No other text.
"""

PERFORMANCE_PROMPT = """
You are the Performance Profiler Agent. Your job is to scan the Git diff and identify performance bottlenecks (database N+1 queries, inefficient loops, redundant operations, resource/memory leaks, blocking operations).
For each performance issue, create a finding. If none are found, return an empty list.

Git Diff:
---
{diff}
---

Output a JSON array of findings. Each finding must match:
{
  "file_path": "string",
  "line_number": integer,
  "severity": "info" or "warning" or "high",
  "message": "performance impact description and cost analysis",
  "suggestion": "optimized code block or refactoring instructions"
}

Provide ONLY the JSON array output. No other text.
"""

QUALITY_PROMPT = """
You are the Code Quality Agent. Your job is to scan the Git diff and identify code smells, style issues, readability concerns, naming convention violations, documentation gaps, or high complexity.
For each quality issue, create a finding. If none are found, return an empty list.

Git Diff:
---
{diff}
---

Output a JSON array of findings. Each finding must match:
{
  "file_path": "string",
  "line_number": integer,
  "severity": "info" or "warning",
  "message": "readability/smell description and code standards violated",
  "suggestion": "cleaner code block or refactoring recommendation"
}

Provide ONLY the JSON array output. No other text.
"""

SUMMARY_PROMPT = """
You are the Release Summary Agent. Your job is to aggregate all findings from the specialized agents (Bug Detection, Security, Performance, Code Quality) and generate a final review summary.
Calculate an overall score from 0 to 100 (where 100 means no issues, and issues deduct points based on severity).
Determine overall code quality ('Excellent', 'Good', 'Fair', 'Poor').
Determine the overall status ('Clean', 'Issues', 'Critical'). If there is any critical security issue, the status MUST be 'Critical'. If there are high severity issues, it should be 'Critical' or 'Issues'.

Findings list:
{findings}

Git Diff:
---
{diff}
---

Output a JSON object matching this structure:
{
  "score": integer,
  "code_quality": "Excellent" or "Good" or "Fair" or "Poor",
  "status": "Clean" or "Issues" or "Critical",
  "summary": "High-level markdown summary of the changes and overall quality, highlighting key findings."
}

Provide ONLY the JSON object. No other text.
"""

async def query_gemini(prompt: str) -> str:
    if not model_initialized:
        raise Exception("Gemini model not initialized")
    
    # Use Gemini 1.5 Flash as recommended in TRD
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    return response.text.strip()

# Heuristic mock generator for local/no-key testing
def generate_heuristic_findings(diff: str, agent_type: str) -> list:
    findings = []
    lines = diff.split("\n")
    
    # Detect files from diff
    current_file = "unknown_file.py"
    line_counter = 0
    
    for i, line in enumerate(lines):
        if line.startswith("+++ b/"):
            current_file = line.replace("+++ b/", "")
            line_counter = 0
        elif line.startswith("@@"):
            # Try parsing starting line number
            try:
                parts = line.split(" ")
                added_info = parts[2] # +line,count
                line_counter = int(added_info.split(",")[0].replace("+", ""))
            except Exception:
                line_counter = 1
        elif line.startswith("+") and not line.startswith("+++"):
            line_counter += 1
            content = line[1:].strip()
            
            # Simple keyword matching heuristics for super realistic mock data
            if agent_type == "bug":
                if "except:" in content or "except Exception:" in content:
                    findings.append({
                        "file_path": current_file,
                        "line_number": line_counter,
                        "severity": "warning",
                        "message": "Bare exception clause detected. This can silence unexpected errors and make debugging extremely difficult.",
                        "suggestion": "except ValueError as e:\n    logger.error(f'Failed to parse value: {e}')\n    raise"
                    })
                elif "==" in content and ("None" in content or "null" in content):
                    findings.append({
                        "file_path": current_file,
                        "line_number": line_counter,
                        "severity": "warning",
                        "message": "Potential null-pointer/None-type comparison without guard clause.",
                        "suggestion": "if obj is not None:"
                    })
            
            elif agent_type == "security":
                if "password" in content.lower() or "secret" in content.lower() or "apikey" in content.lower():
                    if "=" in content and any(q in content for q in ["'", '"']):
                        findings.append({
                            "file_path": current_file,
                            "line_number": line_counter,
                            "severity": "critical",
                            "message": "Hardcoded secret or credential detected in source code. This poses a major security risk.",
                            "suggestion": "import os\napi_key = os.getenv('API_KEY')"
                        })
                elif "execute" in content.lower() and "f\"" in content.lower() and "select" in content.lower():
                    findings.append({
                        "file_path": current_file,
                        "line_number": line_counter,
                        "severity": "critical",
                        "message": "Potential SQL Injection vulnerability due to raw string formatting in SQL execution.",
                        "suggestion": "cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))"
                    })
            
            elif agent_type == "performance":
                if "select_related" not in content and "prefetch_related" not in content and ".objects.all()" in content:
                    findings.append({
                        "file_path": current_file,
                        "line_number": line_counter,
                        "severity": "warning",
                        "message": "Potential N+1 database query. Accessing related fields on this queryset will trigger redundant database queries.",
                        "suggestion": "queryset = Book.objects.select_related('author').all()"
                    })
                elif "time.sleep" in content:
                    findings.append({
                        "file_path": current_file,
                        "line_number": line_counter,
                        "severity": "high",
                        "message": "Synchronous block blocking async event loop.",
                        "suggestion": "await asyncio.sleep(duration)"
                    })
            
            elif agent_type == "quality":
                if len(content) > 120:
                    findings.append({
                        "file_path": current_file,
                        "line_number": line_counter,
                        "severity": "info",
                        "message": "Line is too long (over 120 characters). Reduces code readability and violates PEP 8 recommendations.",
                        "suggestion": "Break line into multiple segments or extract sub-expressions."
                    })
                elif "todo" in content.lower() or "fixme" in content.lower():
                    findings.append({
                        "file_path": current_file,
                        "line_number": line_counter,
                        "severity": "info",
                        "message": "Unresolved placeholder comment (TODO/FIXME) merged into code.",
                        "suggestion": "Complete the work or track it as an issue before merging."
                    })
        elif not line.startswith("-"):
            line_counter += 1
            
    # Add at least one generic finding if empty to make the demo look good, or keep clean
    return findings

async def run_autonomous_review(workflow_id: str, repo_name: str, pr_number: int, pr_title: str, diff: str):
    logger.info(f"Starting autonomous multi-agent review for Workflow ID: {workflow_id}")
    db = get_db()
    
    # Initial status: Running
    await update_workflow_progress(workflow_id, 5, "Running")
    
    # 1. PLANNER AGENT
    await add_trace_step(workflow_id, "Initializing", "Planner Agent", "running", "Analyzing PR changed files and structure...")
    planner_result = None
    if model_initialized:
        try:
            res = await query_gemini(PLANNER_PROMPT.replace("{diff}", diff))
            planner_result = json.loads(res)
            msg = f"Plan created: {len(planner_result.get('planned_reviews', []))} files queued."
        except Exception as e:
            logger.error(f"Planner agent failed: {e}")
            
    if not planner_result:
        # Heuristic fallback
        planner_result = {
            "planned_reviews": [{"file_path": "main.py", "priority": "high", "focus_areas": ["general_review"]}],
            "global_instructions": "Heuristic fallback planning complete."
        }
        msg = "Planner running in heuristic mode. Basic review plan scheduled."
        
    await add_trace_step(workflow_id, "Planning Complete", "Planner Agent", "completed", msg)
    await update_workflow_progress(workflow_id, 20)
    
    all_findings = []
    
    # 2. BUG DETECTION AGENT
    await add_trace_step(workflow_id, "Detecting Bugs", "Bug Detection Agent", "running", "Scanning diff for logical flaws and edge cases...")
    bug_findings = None
    if model_initialized:
        try:
            res = await query_gemini(BUG_PROMPT.replace("{diff}", diff))
            bug_findings = json.loads(res)
        except Exception as e:
            logger.error(f"Bug Detection agent failed: {e}")
            
    if bug_findings is None:
        bug_findings = generate_heuristic_findings(diff, "bug")
        
    all_findings.extend(bug_findings)
    await add_trace_step(workflow_id, "Bug Scan Complete", "Bug Detection Agent", "completed", f"Found {len(bug_findings)} bugs.")
    await update_workflow_progress(workflow_id, 40)
    
    # 3. SECURITY AGENT
    await add_trace_step(workflow_id, "Scanning Security", "Security Agent", "running", "Checking for credentials, injection vectors, and vulnerability risks...")
    security_findings = None
    if model_initialized:
        try:
            res = await query_gemini(SECURITY_PROMPT.replace("{diff}", diff))
            security_findings = json.loads(res)
        except Exception as e:
            logger.error(f"Security agent failed: {e}")
            
    if security_findings is None:
        security_findings = generate_heuristic_findings(diff, "security")
        
    all_findings.extend(security_findings)
    await add_trace_step(workflow_id, "Security Scan Complete", "Security Agent", "completed", f"Found {len(security_findings)} vulnerabilities.")
    await update_workflow_progress(workflow_id, 60)
    
    # 4. PERFORMANCE AGENT
    await add_trace_step(workflow_id, "Profiling Performance", "Performance Agent", "running", "Analyzing N+1 queries, loops, and memory hotspots...")
    perf_findings = None
    if model_initialized:
        try:
            res = await query_gemini(PERFORMANCE_PROMPT.replace("{diff}", diff))
            perf_findings = json.loads(res)
        except Exception as e:
            logger.error(f"Performance agent failed: {e}")
            
    if perf_findings is None:
        perf_findings = generate_heuristic_findings(diff, "performance")
        
    all_findings.extend(perf_findings)
    await add_trace_step(workflow_id, "Performance Scan Complete", "Performance Agent", "completed", f"Found {len(perf_findings)} performance bottlenecks.")
    await update_workflow_progress(workflow_id, 80)
    
    # 5. CODE QUALITY AGENT
    await add_trace_step(workflow_id, "Reviewing Code Quality", "Code Quality Agent", "running", "Scanning style guidelines, complexity, and doc comments...")
    quality_findings = None
    if model_initialized:
        try:
            res = await query_gemini(QUALITY_PROMPT.replace("{diff}", diff))
            quality_findings = json.loads(res)
        except Exception as e:
            logger.error(f"Code Quality agent failed: {e}")
            
    if quality_findings is None:
        quality_findings = generate_heuristic_findings(diff, "quality")
        
    all_findings.extend(quality_findings)
    await add_trace_step(workflow_id, "Quality Scan Complete", "Code Quality Agent", "completed", f"Found {len(quality_findings)} code smells.")
    await update_workflow_progress(workflow_id, 90)
    
    # 6. SUMMARY AGENT
    await add_trace_step(workflow_id, "Summarizing Findings", "Summary Agent", "running", "Aggregating review scores and comments...")
    summary_result = None
    if model_initialized:
        try:
            res = await query_gemini(SUMMARY_PROMPT.replace("{findings}", json.dumps(all_findings)).replace("{diff}", diff))
            summary_result = json.loads(res)
        except Exception as e:
            logger.error(f"Summary agent failed: {e}")
            
    if not summary_result:
        # Generate smart heuristic summary
        has_critical = any(f["severity"] == "critical" for f in all_findings)
        has_high = any(f["severity"] == "high" for f in all_findings)
        
        status = "Clean"
        score = 100
        quality = "Excellent"
        
        if has_critical:
            status = "Critical"
            score = max(30, 100 - len(all_findings) * 15)
            quality = "Poor"
        elif has_high or len(all_findings) > 0:
            status = "Issues"
            score = max(55, 100 - len(all_findings) * 8)
            quality = "Good" if score > 80 else "Fair"
            
        summary_result = {
            "score": score,
            "code_quality": quality,
            "status": status,
            "summary": f"### Heuristic PulseReview Summary\n\nAutomated analysis discovered **{len(all_findings)}** issues in this Pull Request.\n\n- **Score:** {score}/100\n- **Status:** {status}\n- **Code Quality:** {quality}\n\n" + \
                       "\n".join([f"- **[{f['severity'].upper()}]** `{f['file_path']}:L{f['line_number']}`: {f['message']}" for f in all_findings[:5]])
        }
        
    # Create the completed review in db
    review_id = "rev_" + workflow_id.split("_")[1]
    
    # Separate findings count
    bug_count = sum(1 for f in all_findings if f.get("severity") in ["warning", "high"] and "bug" in f.get("message", "").lower())
    sec_count = sum(1 for f in all_findings if f.get("severity") in ["high", "critical"] and ("security" in f.get("message", "").lower() or "secret" in f.get("message", "").lower() or "sql" in f.get("message", "").lower()))
    perf_count = len(all_findings) - bug_count - sec_count
    
    review_doc = {
        "id": review_id,
        "workflow_id": workflow_id,
        "pr_number": pr_number,
        "pr_title": pr_title,
        "repo_name": repo_name,
        "score": summary_result["score"],
        "bug_count": max(0, bug_count),
        "security_issues": max(0, sec_count),
        "perf_issues": max(0, perf_count),
        "code_quality": summary_result["code_quality"],
        "findings": all_findings,
        "summary": summary_result["summary"],
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    await db["reviews"].insert_one(review_doc)
    
    # Finalize the workflow status
    await db["workflows"].update_one(
        {"id": workflow_id},
        {
            "$set": {
                "status": summary_result["status"],
                "progress": 100,
                "completed_at": datetime.utcnow().isoformat() + "Z",
                "review_id": review_id
            }
        }
    )
    
    await add_trace_step(workflow_id, "Review Complete", "Summary Agent", "completed", f"Workflow execution finished successfully. Status: {summary_result['status']}.")
    logger.info(f"Autonomous review completed for Workflow: {workflow_id}")
    return review_doc
