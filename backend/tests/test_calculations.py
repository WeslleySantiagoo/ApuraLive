import pytest
from app.calculations.irreversibility import evaluate_irreversibility
from app.calculations.percentages import safe_percentage, calculate_vote_margin


def test_safe_percentage():
    assert safe_percentage(50, 100) == 50.0
    assert safe_percentage(1, 3, decimals=2) == 33.33
    assert safe_percentage(10, 0) == 0.0  # protection against zero division
    assert safe_percentage(0, 100) == 0.0


def test_calculate_vote_margin():
    assert calculate_vote_margin(600000, 400000) == 200000
    assert calculate_vote_margin(400000, 600000) == 0


def test_irreversibility_second_round_strictly_won():
    # Diff = 200k, R = 150k -> D > R
    cands = [("cand_a", "Candidato A", 600000), ("cand_b", "Candidato B", 400000)]
    res = evaluate_irreversibility(
        round_type=2,
        counted_valid_votes=1000000,
        candidate_votes=cands,
        remaining_valid_votes_upper_bound=150000,
    )
    assert res.is_mathematically_irreversible is True
    assert res.votes_needed_to_win == 0
    assert res.vote_difference == 200000
    assert res.leader_candidate_id == "cand_a"


def test_irreversibility_second_round_votes_needed():
    # A = 520k, B = 480k -> Diff = 40k. R = 100k.
    # Diff < R. Votes needed: floor((100k - 40k) / 2) + 1 = 30,001 votes.
    cands = [("cand_a", "Candidato A", 520000), ("cand_b", "Candidato B", 480000)]
    res = evaluate_irreversibility(
        round_type=2,
        counted_valid_votes=1000000,
        candidate_votes=cands,
        remaining_valid_votes_upper_bound=100000,
    )
    assert res.is_mathematically_irreversible is False
    assert res.votes_needed_to_win == 30001
    assert "Faltam" in res.summary_text
