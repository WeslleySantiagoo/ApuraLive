from pydantic import BaseModel, Field
from typing import Optional, List


class CandidateInfo(BaseModel):
    id: str
    number: str
    name: str
    ballot_name: str
    party: str
    coalition: Optional[str] = None
    color: str
    photo_url: Optional[str] = None
    status: str = "deferido"
    vice_name: Optional[str] = None


class ElectionConfig(BaseModel):
    year: int = 2026
    round_type: int = 2  # 1 or 2
    office: str = "Presidente"
    code: str = "ele2026"
    status: str = "scheduled"  # scheduled, counting, finished
    candidates: List[CandidateInfo] = Field(default_factory=list)

