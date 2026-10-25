from typing import Dict, Optional, Tuple
from app.schemas.election import CandidateInfo

# Default expected project candidates configuration
DEFAULT_CANDIDATE_CONFIGS: Dict[str, Dict[str, str]] = {
    "13": {
        "expected_name_contains": "LULA",
        "color": "#E53935",
        "name": "Luiz Inácio Lula da Silva",
        "ballot_name": "Lula",
        "party": "PT",
    },
    "22": {
        "expected_name_contains": "BOLSONARO",
        "color": "#2563EB",
        "name": "Flávio Bolsonaro",
        "ballot_name": "Flávio Bolsonaro",
        "party": "PL",
    },
}

FALLBACK_PALETTE = [
    "#10B981",  # Emerald
    "#F59E0B",  # Amber
    "#8B5CF6",  # Purple
    "#06B6D4",  # Cyan
    "#EC4899",  # Pink
    "#64748B",  # Slate
]


def resolve_candidate_color(number: str, name: str, fallback_index: int = 0) -> str:
    """Matches candidate to configured colors if verified; otherwise assigns distinct palette color."""
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
