from dataclasses import dataclass
from typing import List, Optional, Tuple


@dataclass
class IrreversibilityAssessment:
    is_mathematically_irreversible: bool
    round_type: int  # 1 or 2
    leader_candidate_id: Optional[str]
    leader_candidate_name: Optional[str]
    vote_difference: int
    remaining_valid_votes_upper_bound: int
    threshold_needed: float
    summary_text: str


def evaluate_irreversibility(
    round_type: int,
    counted_valid_votes: int,
    candidate_votes: List[Tuple[str, str, int]],  # (id, name, votes) sorted descending
    remaining_valid_votes_upper_bound: int,
) -> IrreversibilityAssessment:
    """Evaluates whether the election result is mathematically irreversible.

    2nd Round:
      D = V_A - V_B
      Condition: D > R
      Where R is the strict upper bound of remaining valid votes from uncounted sections.
      If D == R, a tie is mathematically possible, hence D > R is strictly required.

    1st Round:
      Leader must have strictly more than half of maximum possible final valid votes:
      V_A > (V_counted_valid + R) / 2
    """
    if not candidate_votes:
        return IrreversibilityAssessment(
            is_mathematically_irreversible=False,
            round_type=round_type,
            leader_candidate_id=None,
            leader_candidate_name=None,
            vote_difference=0,
            remaining_valid_votes_upper_bound=remaining_valid_votes_upper_bound,
            threshold_needed=0.0,
            summary_text="Sem votos computados no momento.",
        )

    leader_id, leader_name, leader_votes = candidate_votes[0]
    runner_up_votes = candidate_votes[1][2] if len(candidate_votes) > 1 else 0
    diff = leader_votes - runner_up_votes
    r = max(0, remaining_valid_votes_upper_bound)

    if round_type == 2:
        is_won = diff > r
        if is_won:
            summary = (
                f"Matematicamente definido: {leader_name} possui vantagem de {diff:,} votos, "
                f"superior ao teto de votos válidos restantes ({r:,})."
            )
        elif diff == r and r > 0:
            summary = (
                f"Disputa em aberto: vantagem ({diff:,}) é exatamente igual aos votos restantes ({r:,}), "
                f"permitindo empate em caso de 100% dos votos pendentes ao 2º colocado."
            )
        elif r == 0:
            summary = f"Apuração 100% concluída. {leader_name} eleito com vantagem de {diff:,} votos."
        else:
            summary = (
                f"Disputa em aberto: diferença ({diff:,}) é inferior aos votos restantes possíveis ({r:,})."
            )

        return IrreversibilityAssessment(
            is_mathematically_irreversible=is_won,
            round_type=2,
            leader_candidate_id=leader_id,
            leader_candidate_name=leader_name,
            vote_difference=diff,
            remaining_valid_votes_upper_bound=r,
            threshold_needed=float(r),
            summary_text=summary,
        )
    else:
        # 1st round
        total_possible_valid = counted_valid_votes + r
        threshold = total_possible_valid / 2.0
        is_won_first_round = leader_votes > threshold

        if is_won_first_round:
            summary = (
                f"Matematicamente definido no 1º turno: {leader_name} tem {leader_votes:,} votos, "
                f"superando 50% do total máximo de votos válidos possíveis ({threshold:,.1f})."
            )
        elif r == 0:
            if leader_votes > (counted_valid_votes / 2.0):
                summary = f"Apuração concluída: {leader_name} venceu no 1º turno com mais de 50% dos votos válidos."
            else:
                summary = "Apuração concluída: nenhum candidato alcançou maioria absoluta; haverá 2º turno."
        else:
            summary = (
                f"1º Turno em aberto: líder possui {leader_votes:,} votos. "
                f"Patamar de garantia matemática atual: {threshold:,.1f} votos."
            )

        return IrreversibilityAssessment(
            is_mathematically_irreversible=is_won_first_round,
            round_type=1,
            leader_candidate_id=leader_id,
            leader_candidate_name=leader_name,
            vote_difference=diff,
            remaining_valid_votes_upper_bound=r,
            threshold_needed=threshold,
            summary_text=summary,
        )
