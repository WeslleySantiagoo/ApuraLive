import asyncio
import pytest
from app.cache.memory_cache import MemoryCache


@pytest.mark.asyncio
async def test_cache_ttl_and_eviction():
    cache = MemoryCache()
    counter = 0

    async def fetch():
        nonlocal counter
        counter += 1
        return f"result-{counter}"

    # First fetch executes fetch_fn
    val1 = await cache.get_or_set("key1", 0.1, fetch)
    assert val1 == "result-1"
    assert counter == 1

    # Second fetch within TTL returns cached value
    val2 = await cache.get_or_set("key1", 0.1, fetch)
    assert val2 == "result-1"
    assert counter == 1

    # After TTL expires, fetch is executed again
    await asyncio.sleep(0.12)
    val3 = await cache.get_or_set("key1", 0.1, fetch)
    assert val3 == "result-2"
    assert counter == 2


@pytest.mark.asyncio
async def test_cache_single_flight_concurrency():
    cache = MemoryCache()
    counter = 0

    async def slow_fetch():
        nonlocal counter
        await asyncio.sleep(0.05)
        counter += 1
        return f"data-{counter}"

    # Trigger 10 concurrent requests for the exact same key
    tasks = [cache.get_or_set("shared-key", 2.0, slow_fetch) for _ in range(10)]
    results = await asyncio.gather(*tasks)

    # All 10 requests should receive the exact same value
    assert len(results) == 10
    assert all(r == "data-1" for r in results)
    # fetch was called exactly once despite 10 simultaneous requests
    assert counter == 1
