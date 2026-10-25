from pydantic import BaseModel, Field
from typing import Optional, List


class CandidateResult(BaseModel):
    id: str
    number: str
    name: str
    color: str
    votes: int
    percentage: float
    is_elected: bool = False
    photo_url: Optional[str] = None


class SectionsProgress(BaseModel):
    total: int
    counted: int
    percentage: float


class VotesSummary(BaseModel):
    valid: int
    blank: int
    null_votes: int
    abstention: int
    total_electors: int


class NormalizedElectionResult(BaseModel):
    scope: str = "BR"  # BR, UF (ex: SP) or municipal code
    scope_name: Optional[str] = None
    updated_at: str
    source_updated_at: Optional[str] = None
    status: str = "available"  # available, waiting_publication, unavailable
    total_valid_votes: int
    sections: SectionsProgress
    votes_summary: Optional[VotesSummary] = None
    candidates: List[CandidateResult] = Field(default_factory=list)
    remaining_valid_votes_estimate: int = 0
