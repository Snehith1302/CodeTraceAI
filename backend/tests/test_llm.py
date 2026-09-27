from pathlib import Path
from unittest.mock import patch, MagicMock
import pytest
from app.llm.prompts import build_impact_prompt, SYSTEM_PROMPT
from app.llm.explainer import generate_impact_explanation
from fastapi.testclient import TestClient
from app.main import app
from app.services.project_store import project_store
from anthropic import APIError

client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_store():
    project_store.clear()

@pytest.fixture
def sample_project_path():
    return str(Path(__file__).parent / "sample_project")

def test_build_impact_prompt_with_dependents():
    target_func = {
        "name": "validate_card",
        "file": "utils/helpers.py",
        "line_number": 1,
        "class_name": None,
        "docstring": "Validates card numbers.",
    }
    dependents = [
        {
            "id": "services.payment.PaymentProcessor.process_payment",
            "name": "process_payment",
            "file": "services/payment.py",
            "line_number": 6,
            "class_name": "PaymentProcessor",
            "hop_distance": 1,
        },
        {
            "id": "services.order.checkout_flow",
            "name": "checkout_flow",
            "file": "services/order.py",
            "line_number": 4,
            "class_name": None,
            "hop_distance": 2,
        },
    ]

    prompt = build_impact_prompt("utils.helpers.validate_card", target_func, dependents, 2)

    assert "Target Function: 'validate_card'" in prompt
    assert "Direct Callers (Hop 1): 1" in prompt
    assert "Total Blast Radius (All Hops): 2" in prompt
    assert "process_payment" in prompt
    assert "checkout_flow" in prompt

def test_build_impact_prompt_zero_dependents():
    target_func = {
        "name": "run_main",
        "file": "main.py",
        "line_number": 4,
        "class_name": None,
        "docstring": None,
    }
    prompt = build_impact_prompt("main.run_main", target_func, [], 0)

    assert "Target Function: 'run_main'" in prompt
    assert "Total Downstream Dependents: 0" in prompt
    assert "safe to modify in isolation" in prompt

def test_generate_impact_explanation_missing_api_key():
    explanation, status_msg = generate_impact_explanation(
        target_function_id="test_func",
        target_function={"name": "test_func", "file": "test.py", "line_number": 1},
        dependents=[],
        total_dependents=0,
        api_key_override="",
    )

    assert explanation is None
    assert "unavailable" in status_msg.lower()
    assert "not configured" in status_msg.lower()

def test_generate_impact_explanation_mocked_success():
    target_func = {"name": "validate_card", "file": "utils/helpers.py", "line_number": 1}
    dependents = [
        {"id": "process_payment", "name": "process_payment", "file": "services/payment.py", "line_number": 6, "hop_distance": 1}
    ]

    mock_block = MagicMock()
    mock_block.text = "Modifying validate_card affects process_payment in the payment service module."
    mock_response = MagicMock()
    mock_response.content = [mock_block]

    with patch("app.llm.explainer.Anthropic") as MockAnthropic:
        mock_client = MagicMock()
        mock_client.messages.create.return_value = mock_response
        MockAnthropic.return_value = mock_client

        explanation, status_msg = generate_impact_explanation(
            target_function_id="utils.helpers.validate_card",
            target_function=target_func,
            dependents=dependents,
            total_dependents=1,
            api_key_override="sk-ant-test-key-12345",
        )

        assert status_msg == "success"
        assert explanation == "Modifying validate_card affects process_payment in the payment service module."

def test_generate_impact_explanation_api_error():
    target_func = {"name": "validate_card", "file": "utils/helpers.py", "line_number": 1}

    mock_api_error = APIError(
        message="Invalid API Key",
        request=MagicMock(),
        body={"error": {"type": "authentication_error", "message": "Invalid API Key"}}
    )

    with patch("app.llm.explainer.Anthropic") as MockAnthropic:
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = mock_api_error
        MockAnthropic.return_value = mock_client

        explanation, status_msg = generate_impact_explanation(
            target_function_id="utils.helpers.validate_card",
            target_function=target_func,
            dependents=[],
            total_dependents=0,
            api_key_override="sk-ant-invalid-key",
        )

        assert explanation is None
        assert "unavailable" in status_msg.lower()

def test_impact_endpoint_returns_deterministic_data_when_llm_fails(sample_project_path):
    ingest_res = client.post("/ingest", json={"path": sample_project_path})
    project_id = ingest_res.json()["project_id"]

    target_func = "utils.helpers.validate_card"
    response = client.get(f"/impact/{target_func}?project_id={project_id}")
    assert response.status_code == 200
    data = response.json()

    assert data["project_id"] == project_id
    assert data["target_function_id"] == target_func
    assert data["total_dependents"] >= 2
    assert len(data["dependents"]) >= 2
    assert data["explanation"] is None
    assert "explanation_status" in data
    assert "unavailable" in data["explanation_status"].lower()
