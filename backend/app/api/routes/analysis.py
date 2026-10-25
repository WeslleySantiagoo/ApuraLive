from datetime import datetime, timezone
from fastapi import APIRouter
from typing import List

from app.calculations.irreversibility import evaluate_irreversibility
from app.calculations.percentages import safe_percentage
from app.schemas.analysis import IrreversibilityResponse, RankingItem
from app.services.geography_service import STATE_NAMES, get_region_for_state
from app.services.results_service import results_service

router = APIRouter(prefix="/api/v1/analysis", tags=["Analysis"])


@router.get("/irreversibility", response_model=IrreversibilityResponse)
async def get_irreversibility_analysis():
    br_result = await results_service.get_brazil_results()

    candidate_tuples = [
        (c.id, c.name, c.votes) for c in br_result.candidates
    ]

    r_bound = br_result.remaining_valid_votes_estimate
    assessment = evaluate_irreversibility(
        round_type=2,
        counted_valid_votes=br_result.total_valid_votes,
        candidate_votes=candidate_tuples,
        remaining_valid_votes_upper_bound=r_bound,
    )

    return IrreversibilityResponse(
        is_mathematically_irreversible=assessment.is_mathematically_irreversible,
        round_type=assessment.round_type,
        leader_candidate_id=assessment.leader_candidate_id,
        leader_candidate_name=assessment.leader_candidate_name,
        vote_difference=assessment.vote_difference,
        remaining_valid_votes_upper_bound=assessment.remaining_valid_votes_upper_bound,
        threshold_needed=assessment.threshold_needed,
        summary_text=assessment.summary_text,
        assessed_at=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/rankings", response_model=List[RankingItem])
async def get_state_rankings():
    states = await results_service.get_all_states_results()
    rankings: List[RankingItem] = []

    for s in states:
        if len(s.candidates) < 2:
            continue
        c1 = s.candidates[0]
        c2 = s.candidates[1]
        diff_v = c1.votes - c2.votes
        margin_pct = round(c1.percentage - c2.percentage, 2)

        rankings.append(
            RankingItem(
                scope_code=s.scope,
                scope_name=STATE_NAMES.get(s.scope, s.scope),
                region=get_region_for_state(s.scope) or "Brasil",
                leader_name=c1.name,
                leader_color=c1.color,
                leader_percentage=c1.percentage,
                runner_up_name=c2.name,
                runner_up_percentage=c2.percentage,
                margin_percentage=margin_pct,
                margin_votes=diff_v,
                total_valid_votes=s.total_valid_votes,
                sections_counted_percentage=s.sections.percentage,
            )
        )

    rankings.sort(key=lambda x: x.margin_votes, reverse=True)
    return rankings
