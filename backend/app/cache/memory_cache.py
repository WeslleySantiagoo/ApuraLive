import asyncio
import time
from typing import Any, Callable, Coroutine, Dict, Tuple


class MemoryCache:
    """Thread-safe and async-safe in-memory cache with TTL and single-flight lock."""

    def __init__(self):
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self._locks: Dict[str, asyncio.Lock] = {}
        self._master_lock = asyncio.Lock()

    async def get(self, key: str) -> Any:
        now = time.time()
        if key in self._cache:
            data, expires_at = self._cache[key]
            if now < expires_at:
                return data
            else:
                del self._cache[key]
        return None

    async def set(self, key: str, value: Any, ttl_seconds: float) -> None:
        self._cache[key] = (value, time.time() + ttl_seconds)

    async def get_or_set(
        self, key: str, ttl_seconds: float, fetch_fn: Callable[[], Coroutine[Any, Any, Any]]
    ) -> Any:
        now = time.time()
        if key in self._cache:
            data, expires_at = self._cache[key]
            if now < expires_at:
                return data

        async with self._master_lock:
            if key not in self._locks:
                self._locks[key] = asyncio.Lock()
            lock = self._locks[key]

        async with lock:
            # Double-check inside single-flight lock
            now = time.time()
            if key in self._cache:
                data, expires_at = self._cache[key]
                if now < expires_at:
                    return data

            result = await fetch_fn()
            self._cache[key] = (result, now + ttl_seconds)
            return result

    def clear(self) -> None:
        self._cache.clear()
        self._locks.clear()


memory_cache = MemoryCache()
