from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.results import NormalizedElectionResult
from app.services.results_service import results_service

router = APIRouter(prefix="/api/v1/results", tags=["Results"])


@router.get("/brazil", response_model=NormalizedElectionResult)
async def get_brazil_results():
    return await results_service.get_brazil_results()


@router.get("/states", response_model=List[NormalizedElectionResult])
async def get_all_states():
    return await results_service.get_all_states_results()


@router.get("/state/{uf}", response_model=NormalizedElectionResult)
async def get_state_result(uf: str):
    if len(uf) != 2:
        raise HTTPException(status_code=400, detail="UF inválida")
    return await results_service.get_state_results(uf)


@router.get("/regions")
async def get_regions_result():
    return await results_service.get_regional_results()


@router.get("/municipality/{code}", response_model=NormalizedElectionResult)
async def get_municipality_result(code: str, state: str = Query(..., min_length=2, max_length=2)):
    return await results_service.get_municipality_results(state, code)
