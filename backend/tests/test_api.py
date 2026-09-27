from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.project_store import project_store

client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_store():
    """Clear in-memory project store before each test."""
    project_store.clear()

@pytest.fixture
def sample_project_path():
    return str(Path(__file__).parent / "sample_project")

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"

def test_ingest_valid_project(sample_project_path):
    response = client.post("/ingest", json={"path": sample_project_path})
    assert response.status_code == 201
    data = response.json()

    assert "project_id" in data
    assert len(data["project_id"]) > 0
    assert data["path"] == str(Path(sample_project_path).resolve())
    assert data["stats"]["files_scanned"] >= 5
    assert data["stats"]["total_nodes"] >= 6

    # Verify syntax warning on broken_syntax.py is preserved
    assert len(data["warnings"]) == 1
    assert "broken_syntax.py" in data["warnings"][0]["file"]

def test_ingest_invalid_project_path():
    response = client.post("/ingest", json={"path": "/invalid/nonexistent/directory/path"})
    assert response.status_code == 400
    data = response.json()
    assert "Invalid project path" in data["detail"]

def test_get_graph_valid(sample_project_path):
    # Ingest project first
    ingest_res = client.post("/ingest", json={"path": sample_project_path})
    project_id = ingest_res.json()["project_id"]

    # Fetch graph
    response = client.get(f"/graph?project_id={project_id}")
    assert response.status_code == 200
    data = response.json()

    assert data["project_id"] == project_id
    assert len(data["nodes"]) >= 6
    assert len(data["edges"]) >= 3

    node_ids = {n["id"] for n in data["nodes"]}
    assert "utils.helpers.validate_card" in node_ids
    assert "services.payment.PaymentProcessor.process_payment" in node_ids

    # Verify warnings are included in graph response
    assert len(data["warnings"]) == 1
    assert "broken_syntax.py" in data["warnings"][0]["file"]

def test_get_graph_invalid_project_id():
    response = client.get("/graph?project_id=invalid_id_123")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()

def test_get_impact_valid(sample_project_path):
    ingest_res = client.post("/ingest", json={"path": sample_project_path})
    project_id = ingest_res.json()["project_id"]

    target_func = "utils.helpers.validate_card"
    response = client.get(f"/impact/{target_func}?project_id={project_id}")
    assert response.status_code == 200
    data = response.json()

    assert data["project_id"] == project_id
    assert data["target_function_id"] == target_func
    assert data["target_function"]["name"] == "validate_card"
    assert data["total_dependents"] >= 2
    
    # Check dependent hop hierarchy
    dep_map = {d["id"]: d["hop_distance"] for d in data["dependents"]}
    assert dep_map.get("services.payment.PaymentProcessor.process_payment") == 1
    assert dep_map.get("services.order.checkout_flow") == 2
    assert dep_map.get("main.run_main") == 3

def test_get_impact_invalid_project_id():
    response = client.get("/impact/utils.helpers.validate_card?project_id=nonexistent")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()

def test_get_impact_invalid_function_id(sample_project_path):
    ingest_res = client.post("/ingest", json={"path": sample_project_path})
    project_id = ingest_res.json()["project_id"]

    response = client.get(f"/impact/nonexistent.module.fake_function?project_id={project_id}")
    assert response.status_code == 404
    data = response.json()
    assert "Function ID 'nonexistent.module.fake_function' not found" in data["detail"]
