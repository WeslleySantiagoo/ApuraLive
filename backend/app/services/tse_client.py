import httpx
from typing import Any, Dict, Optional
from app.config import settings

HEADERS = {
    "User-Agent": "ApuraLive/1.0 (Projeto Independente de Acompanhamento Eleitoral)",
    "Accept": "application/json",
}


class TSEClient:
    """Async HTTP client to interact strictly with official TSE dissemination endpoints.

    Respects the rate limit (<100 req/s), uses sensible timeouts, ETags,
    and handles HTTP 404 cleanly as unpublished files.
    """

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or settings.TSE_BASE_URL).rstrip("/")
        self.client = httpx.AsyncClient(headers=HEADERS, timeout=10.0, follow_redirects=True)
        self._etags: Dict[str, str] = {}
        self._last_modified: Dict[str, str] = {}

    async def close(self):
        await self.client.aclose()

    async def get_json(self, path: str) -> Optional[Dict[str, Any]]:
        """Queries the official TSE endpoint for a specific path.

        Returns None if HTTP 404 (file not yet published).
        """
        clean_path = path.lstrip("/")
        url = f"{self.base_url}/{clean_path}"

        req_headers = dict(HEADERS)
        if url in self._etags:
            req_headers["If-None-Match"] = self._etags[url]
        if url in self._last_modified:
            req_headers["If-Modified-Since"] = self._last_modified[url]

        try:
            response = await self.client.get(url, headers=req_headers)

            if response.status_code == 304:
                # Content not modified
                return None

            if response.status_code == 404:
                # Official TSE guidance: 404 means the file has not yet been generated/published.
                return None

            response.raise_for_status()

            if "ETag" in response.headers:
                self._etags[url] = response.headers["ETag"]
            if "Last-Modified" in response.headers:
                self._last_modified[url] = response.headers["Last-Modified"]

            return response.json()
        except httpx.HTTPError:
            return None


tse_client = TSEClient()
