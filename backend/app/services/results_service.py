from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.cache.memory_cache import memory_cache
from app.calculations.percentages import safe_percentage
from app.config import settings
from app.schemas.results import (
    CandidateResult,
    NormalizedElectionResult,
    SectionsProgress,
    VotesSummary,
)
from app.services.candidate_service import resolve_candidate_color
from app.services.geography_service import STATE_NAMES, get_region_for_state
from app.services.tse_client import tse_client


class ResultsService:
    """Service responsible for querying TSE files (EA14, EA15, EA20),

    normalizing fields according to technical specifications,
    and maintaining short in-memory cache with single-flight locks.
    """

    def _normalize_tse_ea20(
        self, raw_data: Optional[Dict[str, Any]], scope: str
    ) -> NormalizedElectionResult:
        now_iso = datetime.now(timezone.utc).isoformat()

        if not raw_data:
            return NormalizedElectionResult(
                scope=scope.upper(),
                scope_name=STATE_NAMES.get(scope.upper(), scope.upper()),
                updated_at=now_iso,
                source_updated_at=None,
                status="waiting_publication",
                total_valid_votes=0,
                sections=SectionsProgress(total=0, counted=0, percentage=0.0),
                candidates=[],
                remaining_valid_votes_estimate=0,
            )

        # TSE EA20 official JSON structure:
        # dg: date, hg: time, s: total sections, st: totalized sections, pst: % totalized
        # vvc: valid votes, vb: blank votes, vn: null votes, a: abstention, e: electors
        # cand: candidate array -> n: number, nm: name, v: votes, pvp: % valid votes, e: elected flag ('S')
        source_date = raw_data.get("dg")
        source_time = raw_data.get("hg")
        source_ts = f"{source_date}T{source_time}" if source_date and source_time else None

        sec_total = int(raw_data.get("s", 0) or 0)
        sec_counted = int(raw_data.get("st", 0) or 0)
        sec_pct = float(str(raw_data.get("pst", "0")).replace(",", ".") or 0.0)

        total_valid = int(raw_data.get("vvc", 0) or 0)
        total_blank = int(raw_data.get("vb", 0) or 0)
        total_null = int(raw_data.get("vn", 0) or 0)
        abstention = int(raw_data.get("a", 0) or 0)
        electors = int(raw_data.get("e", 0) or 0)

        votes_summary = VotesSummary(
            valid=total_valid,
            blank=total_blank,
            null_votes=total_null,
            abstention=abstention,
            total_electors=electors,
        )

        candidates_raw = raw_data.get("cand", [])
        candidates: List[CandidateResult] = []

        for idx, c in enumerate(candidates_raw):
            num = str(c.get("n", "")).strip()
            name = str(c.get("nm", f"Candidato {num}")).strip()
            votes = int(c.get("v", 0) or 0)
            pct_val = float(str(c.get("pvp", "0")).replace(",", ".") or 0.0)
            is_elected = str(c.get("e", "")).upper() == "S"

            color = resolve_candidate_color(num, name, idx)
            candidates.append(
                CandidateResult(
                    id=num,
                    number=num,
                    name=name,
                    color=color,
                    votes=votes,
                    percentage=pct_val,
                    is_elected=is_elected,
                    photo_url=None,
                )
            )

        candidates.sort(key=lambda x: x.votes, reverse=True)

        # Upper bound calculation for remaining valid votes (R)
        # Conservative bound: total electors minus current counted votes, or proportional to pending sections
        pending_sections = max(0, sec_total - sec_counted)
        if sec_total > 0 and sec_counted > 0:
            avg_valid_per_section = total_valid / sec_counted
            r_estimate = int(pending_sections * avg_valid_per_section * 1.05)  # 5% conservative margin
        elif electors > 0:
            r_estimate = max(0, electors - (total_valid + total_blank + total_null))
        else:
            r_estimate = 0

        return NormalizedElectionResult(
            scope=scope.upper(),
            scope_name=STATE_NAMES.get(scope.upper(), scope.upper()),
            updated_at=now_iso,
            source_updated_at=source_ts,
            status="available",
            total_valid_votes=total_valid,
            sections=SectionsProgress(total=sec_total, counted=sec_counted, percentage=sec_pct),
            votes_summary=votes_summary,
            candidates=candidates,
            remaining_valid_votes_estimate=r_estimate,
        )

    async def get_brazil_results(self) -> NormalizedElectionResult:
        cache_key = "results:brazil"

        async def fetch():
            # Official path for presidential results (EA20) in BR:
            # /dados/br/br-c0001-e002026-u.json (where c0001 is Presidente, e002026 is election code)
            path = f"dados/br/br-c0001-{settings.TSE_ELECTION_CODE}-u.json"
            raw = await tse_client.get_json(path)
            return self._normalize_tse_ea20(raw, "BR")

        return await memory_cache.get_or_set(cache_key, settings.CACHE_TTL_NATIONAL, fetch)

    async def get_state_results(self, uf: str) -> NormalizedElectionResult:
        clean_uf = uf.lower()
        cache_key = f"results:state:{clean_uf}"

        async def fetch():
            path = f"dados/{clean_uf}/{clean_uf}-c0001-{settings.TSE_ELECTION_CODE}-u.json"
            raw = await tse_client.get_json(path)
            return self._normalize_tse_ea20(raw, uf.upper())

        return await memory_cache.get_or_set(cache_key, settings.CACHE_TTL_STATE, fetch)

    async def get_all_states_results(self) -> List[NormalizedElectionResult]:
        # Collect results for all 27 Brazilian federation units
        ufs = [uf for uf in STATE_NAMES.keys() if uf != "ZZ"]
        results: List[NormalizedElectionResult] = []
        for uf in ufs:
            res = await self.get_state_results(uf)
            results.append(res)
        return results

    async def get_regional_results(self) -> Dict[str, Any]:
        cache_key = "results:regions"

        async def fetch():
            states = await self.get_all_states_results()
            regional_aggregates: Dict[str, Any] = {
                "Norte": {"total_valid": 0, "sections_total": 0, "sections_counted": 0, "candidates": {}},
                "Nordeste": {"total_valid": 0, "sections_total": 0, "sections_counted": 0, "candidates": {}},
                "Centro-Oeste": {"total_valid": 0, "sections_total": 0, "sections_counted": 0, "candidates": {}},
                "Sudeste": {"total_valid": 0, "sections_total": 0, "sections_counted": 0, "candidates": {}},
                "Sul": {"total_valid": 0, "sections_total": 0, "sections_counted": 0, "candidates": {}},
            }

            for st in states:
                region = get_region_for_state(st.scope)
                if region not in regional_aggregates:
                    continue

                agg = regional_aggregates[region]
                agg["total_valid"] += st.total_valid_votes
                agg["sections_total"] += st.sections.total
                agg["sections_counted"] += st.sections.counted

                for cand in st.candidates:
                    if cand.id not in agg["candidates"]:
                        agg["candidates"][cand.id] = {
                            "id": cand.id,
                            "name": cand.name,
                            "number": cand.number,
                            "color": cand.color,
                            "votes": 0,
                        }
                    agg["candidates"][cand.id]["votes"] += cand.votes

            # Calculate percentages
            output: Dict[str, Any] = {}
            for reg, val in regional_aggregates.items():
                tot = val["total_valid"]
                cand_list = []
                for _, cinfo in val["candidates"].items():
                    cinfo["percentage"] = safe_percentage(cinfo["votes"], tot)
                    cand_list.append(cinfo)
                cand_list.sort(key=lambda x: x["votes"], reverse=True)

                sec_pct = safe_percentage(val["sections_counted"], val["sections_total"])
                output[reg] = {
                    "region": reg,
                    "total_valid_votes": tot,
                    "sections_total": val["sections_total"],
                    "sections_counted": val["sections_counted"],
                    "sections_percentage": sec_pct,
                    "candidates": cand_list,
                }
            return output

        return await memory_cache.get_or_set(cache_key, settings.CACHE_TTL_STATE, fetch)

    async def get_municipality_results(self, state: str, city_code: str) -> NormalizedElectionResult:
        clean_uf = state.lower()
        clean_city = str(city_code).strip()
        cache_key = f"results:municipality:{clean_uf}:{clean_city}"

        async def fetch():
            path = f"dados/{clean_uf}/{clean_city}/c0001-{settings.TSE_ELECTION_CODE}-u.json"
            raw = await tse_client.get_json(path)
            return self._normalize_tse_ea20(raw, f"{state.upper()}-{clean_city}")

        return await memory_cache.get_or_set(cache_key, settings.CACHE_TTL_MUNICIPALITY, fetch)


results_service = ResultsService()

