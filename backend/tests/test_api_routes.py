from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_election_endpoints():
    res = client.get("/api/v1/election")
    assert res.status_code == 200
    data = res.json()
    assert data["year"] == 2026
    assert data["office"] == "Presidente"
    assert len(data["candidates"]) >= 2
    # Check configured candidates colors
    lula = next((c for c in data["candidates"] if "Lula" in c["name"]), None)
    assert lula is not None
    assert lula["color"] == "#E53935"

    bolsonaro = next((c for c in data["candidates"] if "Bolsonaro" in c["name"]), None)
    assert bolsonaro is not None
    assert bolsonaro["color"] == "#2563EB"


def test_results_endpoints():
    res = client.get("/api/v1/results/brazil")
    assert res.status_code == 200
    data = res.json()
    assert data["scope"] == "BR"
    # In live mode when TSE hasn't opened polls, status is waiting_publication
    assert data["status"] in ["available", "waiting_publication"]


def test_irreversibility_endpoint():
    res = client.get("/api/v1/analysis/irreversibility")
    assert res.status_code == 200
    data = res.json()
    assert "is_mathematically_irreversible" in data
    assert "summary_text" in data
