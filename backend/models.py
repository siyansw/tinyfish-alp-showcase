from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any


class IssueSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TechnicalFailure(BaseModel):
    """Category 1: Technical Failures"""
    error_type: str = Field(..., description="Type of technical error")
    element: str = Field(..., description="The problematic element")
    location: str = Field(..., description="Where it appears on the page")
    expected_behavior: str = Field(..., description="What it should do")
    actual_behavior: str = Field(..., description="What actually happens")
    transaction_impact: str = Field(..., description="How this causes agent to fail/abandon")
    severity: IssueSeverity


class ContextualError(BaseModel):
    """Category 2: Contextual Errors"""
    error_type: str = Field(..., description="Type of contextual error")
    content: str = Field(..., description="The problematic content")
    location: str = Field(..., description="Where it appears")
    why_wrong: str = Field(..., description="Context/explanation")
    agent_confusion: str = Field(..., description="How agent misinterprets")
    severity: IssueSeverity


class CompetitiveGap(BaseModel):
    """Category 3: Competitive Gaps"""
    gap_type: str = Field(..., description="Type of competitive gap")
    missing_element: str = Field(..., description="What's missing")
    location: str = Field(..., description="Where it should be")
    competitor_standard: str = Field(..., description="What competitors provide")
    agent_impact: str = Field(..., description="How agent tries to work around")
    severity: IssueSeverity


class AuditResult(BaseModel):
    """Complete audit result from TinyFish"""
    url: str
    audit_date: datetime
    technical_failures: List[TechnicalFailure] = Field(default_factory=list)
    contextual_errors: List[ContextualError] = Field(default_factory=list)
    competitive_gaps: List[CompetitiveGap] = Field(default_factory=list)
    enrichment: Optional[Dict[str, Any]] = Field(default=None, description="External enrichment data (news, incidents, etc.)")

    @property
    def total_issues(self) -> int:
        return len(self.technical_failures) + len(self.contextual_errors) + len(self.competitive_gaps)

    @property
    def critical_count(self) -> int:
        return sum(1 for issue in self.all_issues if issue.severity == IssueSeverity.CRITICAL)

    @property
    def high_count(self) -> int:
        return sum(1 for issue in self.all_issues if issue.severity == IssueSeverity.HIGH)

    @property
    def medium_count(self) -> int:
        return sum(1 for issue in self.all_issues if issue.severity == IssueSeverity.MEDIUM)

    @property
    def low_count(self) -> int:
        return sum(1 for issue in self.all_issues if issue.severity == IssueSeverity.LOW)

    @property
    def risk_score(self) -> int:
        """Calculate 0-100 risk score (higher = worse)"""
        # Weight: critical=25, high=10, medium=5, low=2
        score = (
            sum(25 for i in self.all_issues if i.severity == IssueSeverity.CRITICAL) +
            sum(10 for i in self.all_issues if i.severity == IssueSeverity.HIGH) +
            sum(5 for i in self.all_issues if i.severity == IssueSeverity.MEDIUM) +
            sum(2 for i in self.all_issues if i.severity == IssueSeverity.LOW)
        )
        return min(100, score)  # Cap at 100

    @property
    def all_issues(self):
        return self.technical_failures + self.contextual_errors + self.competitive_gaps


class AuditRequest(BaseModel):
    url: str = Field(..., description="URL to audit")


class AuditResponse(BaseModel):
    audit_id: str
    status: str = "completed"
    result: AuditResult
