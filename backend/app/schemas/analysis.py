from pydantic import BaseModel
from typing import Optional, List


class IrreversibilityResponse(BaseModel):
    is_mathematically_irreversible: bool
    round_type: int
    leader_candidate_id: Optional[str] = None
    leader_candidate_name: Optional[str] = None
    vote_difference: int
    remaining_valid_votes_upper_bound: int
    threshold_needed: float
    summary_text: str
    assessed_at: str


class RankingItem(BaseModel):
    scope_code: str
    scope_name: str
    region: str
    leader_name: str
    leader_color: str
    leader_percentage: float
    runner_up_name: str
    runner_up_percentage: float
    margin_percentage: float
    margin_votes: int
    total_valid_votes: int
    sections_counted_percentage: float

