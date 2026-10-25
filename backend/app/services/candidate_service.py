from typing import Dict, Optional
from app.schemas.election import CandidateInfo

4# Candidaturas e Identificação Visual Oficial
# Lula: Vermelho #E53935
# Flávio Bolsonaro: Azul #2563EB
DEFAULT_CANDIDATE_CONFIGS: Dict[str, Dict[str, str]] = {
    "13": {
        "expected_name_contains": "LULA",
        "color": "#E53935",  # Vermelho oficial PT/Lula
        "name": "Luiz Inácio Lula da Silva",
        "ballot_name": "Lula",
        "party": "PT",
        "photo_url": "/candidates/lula.jpg",
    },
    "22": {
        "expected_name_contains": "BOLSONARO",
        "color": "#2563EB",  # Azul oficial PL/Flávio Bolsonaro
        "name": "Flávio Bolsonaro",
        "ballot_name": "Flávio Bolsonaro",
        "party": "PL",
        "photo_url": "/candidates/flavio-bolsonaro.jpg",
    },
}

FALLBACK_PALETTE = [
    "#94A3B8",  # Slate 400
    "#CBD5E1",  # Slate 300
    "#64748B",  # Slate 500
    "#E2E8F0",  # Slate 200
    "#475569",  # Slate 600
]


def resolve_candidate_color(number: str, name: str, fallback_index: int = 0) -> str:
    """Retorna a cor oficial do candidato configurado."""
    num_str = str(number).strip()
    norm_name = name.upper()

    if num_str in DEFAULT_CANDIDATE_CONFIGS:
        cfg = DEFAULT_CANDIDATE_CONFIGS[num_str]
        if cfg["expected_name_contains"] in norm_name:
            return cfg["color"]

    return FALLBACK_PALETTE[fallback_index % len(FALLBACK_PALETTE)]


def resolve_candidate_photo(number: str, name: str, provided_photo: Optional[str] = None) -> Optional[str]:
    """Retorna foto oficial disponível para o candidato."""
    if provided_photo:
        return provided_photo

    num_str = str(number).strip()
    norm_name = name.upper()
    if num_str in DEFAULT_CANDIDATE_CONFIGS:
        cfg = DEFAULT_CANDIDATE_CONFIGS[num_str]
        if cfg["expected_name_contains"] in norm_name:
            return cfg.get("photo_url")

    return None


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
    resolved_photo = resolve_candidate_photo(number, name, photo_url)
    return CandidateInfo(
        id=cand_id,
        number=number,
        name=name,
        ballot_name=ballot_name,
        party=party,
        color=color,
        photo_url=resolved_photo,
        vice_name=vice_name,
    )
