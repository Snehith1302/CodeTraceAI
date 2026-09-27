import os
from pathlib import Path
import pytest
from app.parser.extractor import extract_project_data
from app.graph.builder import build_graph
from app.graph.queries import get_dependents, get_dependencies
from app.graph.serializer import serialize_graph

@pytest.fixture
def sample_project_path():
    return str(Path(__file__).parent / "sample_project")

def test_extract_and_build_graph(sample_project_path):
    nodes, calls, imports, warnings, stats = extract_project_data(sample_project_path)

    # Verify files scanned and warning on broken_syntax.py
    assert stats["files_scanned"] >= 5
    assert len(warnings) == 1
    assert "broken_syntax.py" in warnings[0]["file"]

    # Build NetworkX Graph
    graph = build_graph(nodes, calls, imports)
    assert len(graph.nodes) >= 6

    # Test graph contains expected nodes
    node_ids = set(graph.nodes)
    assert "utils.helpers.validate_card" in node_ids
    assert "services.payment.PaymentProcessor.process_payment" in node_ids
    assert "services.order.checkout_flow" in node_ids
    assert "main.run_main" in node_ids

def test_dependents_and_hop_distance(sample_project_path):
    nodes, calls, imports, warnings, stats = extract_project_data(sample_project_path)
    graph = build_graph(nodes, calls, imports)

    # What breaks if validate_card changes?
    target_id = "utils.helpers.validate_card"
    dependents = get_dependents(graph, target_id)

    assert len(dependents) >= 2

    # Map by function ID for assertions
    dep_map = {d["id"]: d["hop_distance"] for d in dependents}

    # PaymentProcessor.process_payment calls validate_card directly (hop 1)
    assert dep_map.get("services.payment.PaymentProcessor.process_payment") == 1

    # checkout_flow calls process_payment (hop 2)
    assert dep_map.get("services.order.checkout_flow") == 2

    # run_main calls checkout_flow (hop 3)
    assert dep_map.get("main.run_main") == 3

def test_dependencies_and_serializer(sample_project_path):
    nodes, calls, imports, warnings, stats = extract_project_data(sample_project_path)
    graph = build_graph(nodes, calls, imports)

    # What does checkout_flow call?
    target_id = "services.order.checkout_flow"
    dependencies = get_dependencies(graph, target_id)
    assert len(dependencies) >= 2

    serialized = serialize_graph(graph)
    assert "nodes" in serialized
    assert "edges" in serialized
    assert len(serialized["nodes"]) == len(graph.nodes)
    assert len(serialized["edges"]) == len(graph.edges)
