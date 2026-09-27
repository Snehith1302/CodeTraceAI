import networkx as nx
from typing import Dict, Any, List

def serialize_graph(graph: nx.DiGraph) -> Dict[str, List[Dict[str, Any]]]:
    """
    Serializes a NetworkX DiGraph into JSON-compatible node and edge lists.
    """
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []

    for node_id, data in graph.nodes(data=True):
        nodes.append({
            "id": node_id,
            "name": data.get("name", node_id.split(".")[-1]),
            "file": data.get("file", ""),
            "line_number": data.get("line_number", 0),
            "class_name": data.get("class_name"),
            "is_async": data.get("is_async", False),
            "docstring": data.get("docstring"),
        })

    for u, v, data in graph.edges(data=True):
        edges.append({
            "source": u,
            "target": v,
            "edge_type": data.get("edge_type", "calls"),
            "line_number": data.get("line_number", 0),
        })

    return {
        "nodes": nodes,
        "edges": edges,
    }
