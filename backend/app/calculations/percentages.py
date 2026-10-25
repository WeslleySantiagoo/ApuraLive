"""Module for percentage and margin calculations with zero-division safeguard."""


def safe_percentage(numerator: int | float, denominator: int | float, decimals: int = 2) -> float:
    if not denominator or denominator <= 0:
        return 0.0
    val = (numerator / denominator) * 100
    return round(val, decimals)


def calculate_vote_margin(leader_votes: int, runner_up_votes: int) -> int:
    return max(0, leader_votes - runner_up_votes)


def calculate_percentage_point_margin(leader_pct: float, runner_up_pct: float, decimals: int = 2) -> float:
    return round(leader_pct - runner_up_pct, decimals)
