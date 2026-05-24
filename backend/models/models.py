from pydantic import BaseModel, Field
from typing import List, Optional

class Repository(BaseModel):
    id: str
    name: str
    owner: str
    health_score: int = 100
    prs_count: int = 0
    active: bool = True
    connected_at: str

class TraceStep(BaseModel):
    step: str
    agent: str
    status: str  # 'pending', 'running', 'completed', 'failed'
    message: str
    timestamp: str

class Workflow(BaseModel):
    id: str
    repo_name: str
    pr_number: int
    pr_title: str
    status: str  # 'Pending', 'Running', 'Clean', 'Issues', 'Critical'
    progress: int = 0
    agents: List[str] = Field(default_factory=list)
    created_at: str
    completed_at: Optional[str] = None
    traces: List[TraceStep] = Field(default_factory=list)
    review_id: Optional[str] = None

class ReviewFinding(BaseModel):
    file_path: str
    line_number: int
    severity: str  # 'info', 'warning', 'high', 'critical'
    message: str
    suggestion: str

class Review(BaseModel):
    id: str
    workflow_id: str
    pr_number: int
    pr_title: str
    repo_name: str
    score: int = 100
    bug_count: int = 0
    security_issues: int = 0
    perf_issues: int = 0
    code_quality: str = "Excellent"  # 'Excellent', 'Good', 'Fair', 'Poor'
    findings: List[ReviewFinding] = Field(default_factory=list)
    summary: str
    created_at: str
