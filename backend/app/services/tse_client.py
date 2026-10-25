import httpx
from typing import Any, Dict, Optional
from app.config import settings

HEADERS = {
    "User-Agent": "ApuraLive/1.0 (Projeto Independente de Acompanhamento Eleitoral)",
    "Accept": "application/json",
}


class TSEClient:
    """Async HTTP client to interact strictly with official TSE dissemination endpoints.

    Caches the last successfully fetched content per URL so that when TSE returns 304 (Not Modified),
    the cached content is preserved and returned rather than None!
    In case of temporary network timeout or rate limits (429/503), returns the last valid response
    to prevent UI flickering and data blanking.
    """

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or settings.TSE_BASE_URL).rstrip("/")
        self.client = httpx.AsyncClient(headers=HEADERS, timeout=10.0, follow_redirects=True)
        self._etags: Dict[str, str] = {}
        self._last_modified: Dict[str, str] = {}
        self._last_valid_data: Dict[str, Dict[str, Any]] = {}

    async def close(self):
        await self.client.aclose()

    async def get_json(self, path: str) -> Optional[Dict[str, Any]]:
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
                # 304 Not Modified: The file has not changed on TSE servers!
                # Return the last valid data we saved for this URL
                return self._last_valid_data.get(url)

            if response.status_code == 404:
                # 404: not yet generated or not found
                return self._last_valid_data.get(url)

            if response.status_code in (429, 500, 502, 503, 504):
                # Rate limit or temporary TSE CDN glitch: fallback to last valid data
                return self._last_valid_data.get(url)

            response.raise_for_status()

            if "ETag" in response.headers:
                self._etags[url] = response.headers["ETag"]
            if "Last-Modified" in response.headers:
                self._last_modified[url] = response.headers["Last-Modified"]

            data = response.json()
            self._last_valid_data[url] = data
            return data
        except Exception:
            # Fallback to last valid cached data on any network or parsing glitch
            return self._last_valid_data.get(url)


tse_client = TSEClient()
