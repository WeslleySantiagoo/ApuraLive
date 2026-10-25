from typing import Dict, List
from app.calculations.percentages import safe_percentage


def simulate_scenario(
    current_counted_valid: int,
    current_candidate_votes: Dict[str, int],  # candidate_id -> current_votes
    remaining_valid_votes: int,
    hypothetical_distribution: Dict[str, float],  # candidate_id -> percentage (0 to 100)
) -> Dict[str, any]:
    """Simulates hypothetical distribution of remaining valid votes.

    Ensures that hypothetical votes strictly do not exceed the remaining votes bound.
    """
    total_pct = sum(hypothetical_distribution.values())
    if total_pct > 100.01:
        raise ValueError("A soma percentual dos votos hipotéticos não pode exceder 100%.")

    projected_votes: Dict[str, int] = {}
    total_projected_valid = current_counted_valid + remaining_valid_votes

    for cid, cur_v in current_candidate_votes.items():
        pct = hypothetical_distribution.get(cid, 0.0)
        added_v = int(remaining_valid_votes * (pct / 100.0))
        projected_votes[cid] = cur_v + added_v

    results: List[Dict[str, any]] = []
    for cid, final_v in projected_votes.items():
        pct = safe_percentage(final_v, total_projected_valid)
        results.append({"candidate_id": cid, "projected_votes": final_v, "projected_percentage": pct})

    results.sort(key=lambda x: x["projected_votes"], reverse=True)
    return {
        "status": "simulated",
        "total_projected_valid": total_projected_valid,
        "remaining_valid_votes_distributed": remaining_valid_votes,
        "candidates": results,
    }
