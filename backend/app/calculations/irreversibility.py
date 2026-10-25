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
    votes_needed_to_win: int  # Quantos votos faltam para o líder garantir a vitória matemática
    target_threshold: int     # Patamar de votos que garante matematicamente a vitória
    summary_text: str


def evaluate_irreversibility(
    round_type: int,
    counted_valid_votes: int,
    candidate_votes: List[Tuple[str, str, int]],  # (id, name, votes) sorted descending
    remaining_valid_votes_upper_bound: int,
) -> IrreversibilityAssessment:
    """Avaliação de garantia matemática com foco no líder.

    2º Turno:
      Condição de vitória matemática: D > R, ou seja, V_A - V_B > R.
      O número mínimo de votos que o líder A precisa ter para garantir a vitória é:
      T = floor((V_A + V_B + R) / 2) + 1.
      Portanto, os votos que faltam para o líder garantir matematicamente a vitória são:
      Faltam = max(0, T - V_A) = max(0, ceil((R - D + 1) / 2)).
      Quando Faltam == 0, a vitória está matematicamente assegurada!
    """
    if not candidate_votes:
        return IrreversibilityAssessment(
            is_mathematically_irreversible=False,
            round_type=round_type,
            leader_candidate_id=None,
            leader_candidate_name=None,
            vote_difference=0,
            remaining_valid_votes_upper_bound=remaining_valid_votes_upper_bound,
            votes_needed_to_win=0,
            target_threshold=0,
            summary_text="Aguardando contagem de votos.",
        )

    leader_id, leader_name, leader_votes = candidate_votes[0]
    runner_up_votes = candidate_votes[1][2] if len(candidate_votes) > 1 else 0
    diff = leader_votes - runner_up_votes
    r = max(0, remaining_valid_votes_upper_bound)

    if round_type == 2:
        is_won = diff > r

        # Votos que faltam para o líder atingir a barreira de irreversibilidade
        if is_won:
            votes_needed = 0
            target_threshold = leader_votes
            summary = (
                f"{leader_name} já atingiu a marca matemática de vitória irreversível! "
                f"A vantagem atual é de {diff:,} votos, superior aos {r:,} votos ainda por apurar."
            )
        else:
            # Fórmula exata: para V_A + x - (V_B + (R - x)) > 0  =>  2x > R - (V_A - V_B)  =>  x >= floor((R - diff) / 2) + 1
            votes_needed = max(1, ((r - diff) // 2) + 1)
            target_threshold = leader_votes + votes_needed
            summary = (
                f"{leader_name} está na liderança. Faltam {votes_needed:,} votos "
                f"para alcançar a vitória matematicamente garantida."
            )

        return IrreversibilityAssessment(
            is_mathematically_irreversible=is_won,
            round_type=2,
            leader_candidate_id=leader_id,
            leader_candidate_name=leader_name,
            vote_difference=diff,
            remaining_valid_votes_upper_bound=r,
            votes_needed_to_win=votes_needed,
            target_threshold=target_threshold,
            summary_text=summary,
        )
    else:
        # 1st round
        total_possible = counted_valid_votes + r
        target_threshold = (total_possible // 2) + 1
        is_won = leader_votes >= target_threshold
        votes_needed = max(0, target_threshold - leader_votes)

        if is_won:
            summary = f"{leader_name} atingiu a maioria absoluta matemática no 1º turno."
        else:
            summary = f"{leader_name} lidera. Faltam {votes_needed:,} votos para liquidar a disputa no 1º turno."

        return IrreversibilityAssessment(
            is_mathematically_irreversible=is_won,
            round_type=1,
            leader_candidate_id=leader_id,
            leader_candidate_name=leader_name,
            vote_difference=diff,
            remaining_valid_votes_upper_bound=r,
            votes_needed_to_win=votes_needed,
            target_threshold=target_threshold,
            summary_text=summary,
        )
