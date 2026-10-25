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
    assert calculate_vote_margin(400000, 600000) == 0  # runner-up cannot have negative margin


def test_irreversibility_second_round_strictly_won():
    # Candidates: A (600k), B (400k) -> Diff = 200k. Remaining R = 150k.
    # D > R (200k > 150k) => mathematically irreversible!
    cands = [("cand_a", "Candidato A", 600000), ("cand_b", "Candidato B", 400000)]
    res = evaluate_irreversibility(
        round_type=2,
        counted_valid_votes=1000000,
        candidate_votes=cands,
        remaining_valid_votes_upper_bound=150000,
    )
    assert res.is_mathematically_irreversible is True
    assert res.vote_difference == 200000
    assert res.leader_candidate_id == "cand_a"


def test_irreversibility_second_round_exact_tie_possible():
    # Diff = 100k, R = 100k -> D == R, strictly NOT won because tie is possible.
    cands = [("cand_a", "Candidato A", 600000), ("cand_b", "Candidato B", 500000)]
    res = evaluate_irreversibility(
        round_type=2,
        counted_valid_votes=1100000,
        candidate_votes=cands,
        remaining_valid_votes_upper_bound=100000,
    )
    assert res.is_mathematically_irreversible is False
    assert "Disputa em aberto" in res.summary_text or "empate" in res.summary_text


def test_irreversibility_first_round():
    # Counted = 800k, R = 100k -> Total possible valid = 900k. 50% threshold = 450k.
    # Leader has 500k -> 500k > 450k => won in 1st round!
    cands = [
        ("cand_a", "Candidato A", 500000),
        ("cand_b", "Candidato B", 250000),
        ("cand_c", "Candidato C", 50000),
    ]
    res = evaluate_irreversibility(
        round_type=1,
        counted_valid_votes=800000,
        candidate_votes=cands,
        remaining_valid_votes_upper_bound=100000,
    )
    assert res.is_mathematically_irreversible is True
    assert res.leader_candidate_name == "Candidato A"

