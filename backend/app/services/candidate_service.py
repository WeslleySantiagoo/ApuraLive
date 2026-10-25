from typing import Dict, Optional
from app.schemas.election import CandidateInfo

# Candidaturas e Paleta Neutra e Imparcial (Preto, Branco, Prata, Platina, Grafite)
# Sem vermelho, sem azul, sem verde, sem amarelo
DEFAULT_CANDIDATE_CONFIGS: Dict[str, Dict[str, str]] = {
    "13": {
        "expected_name_contains": "LULA",
        "color": "#F8FAFC",  # Branco Puro / Platina
        "name": "Luiz Inácio Lula da Silva",
        "ballot_name": "Lula",
        "party": "PT",
    },
    "22": {
        "expected_name_contains": "BOLSONARO",
        "color": "#94A3B8",  # Prata Metálico / Grafite Claro
        "name": "Flávio Bolsonaro",
        "ballot_name": "Flávio Bolsonaro",
        "party": "PL",
    },
}

FALLBACK_PALETTE = [
    "#CBD5E1",  # Slate 300
    "#64748B",  # Slate 500
    "#E2E8F0",  # Slate 200
    "#475569",  # Slate 600
    "#94A3B8",  # Slate 400
]


def resolve_candidate_color(number: str, name: str, fallback_index: int = 0) -> str:
    """Retorna cor elegante e neutra para identificação imparcial."""
    num_str = str(number).strip()
    norm_name = name.upper()

    if num_str in DEFAULT_CANDIDATE_CONFIGS:
        cfg = DEFAULT_CANDIDATE_CONFIGS[num_str]
        if cfg["expected_name_contains"] in norm_name:
            return cfg["color"]

    return FALLBACK_PALETTE[fallback_index % len(FALLBACK_PALETTE)]


def build_candidate_info(
    cand_id: str,
    number: str,
    name: str,
    ballot_name: str,
    party: str,
    vice_name: Optional[str] = None,
    photo_url: Optional[str] = None,
    fallback_index: int = 0,
) -> CandidateInfo:
    color = resolve_candidate_color(number, name, fallback_index)
    return CandidateInfo(
        id=cand_id,
        number=number,
        name=name,
        ballot_name=ballot_name,
        party=party,
        color=color,
        photo_url=photo_url,
        vice_name=vice_name,
    )
