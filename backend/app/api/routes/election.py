from fastapi import APIRouter
from app.schemas.election import ElectionConfig
from app.services.candidate_service import build_candidate_info

router = APIRouter(prefix="/api/v1", tags=["Election"])


@router.get("/election", response_model=ElectionConfig)
async def get_election_config():
    # 2026 presidential election configured targets
    candidates = [
        build_candidate_info(
            cand_id="13",
            number="13",
            name="Luiz Inácio Lula da Silva",
            ballot_name="Lula",
            party="PT",
            vice_name="Geraldo Alckmin",
            fallback_index=0,
        ),
        build_candidate_info(
            cand_id="22",
            number="22",
            name="Flávio Bolsonaro",
            ballot_name="Flávio Bolsonaro",
            party="PL",
            vice_name=None,
            fallback_index=1,
        ),
    ]
    return ElectionConfig(
        year=2026,
        round_type=2,
        office="Presidente",
        code="ele2026",
        status="scheduled",
        candidates=candidates,
    )


@router.get("/candidates")
async def get_candidates():
    cfg = await get_election_config()
    return {"candidates": cfg.candidates}

