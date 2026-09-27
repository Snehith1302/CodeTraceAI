import networkx as nx
from typing import List, Dict, Any, Optional

def get_dependents(graph: nx.DiGraph, function_id: str) -> List[Dict[str, Any]]:
    """
    Returns all functions that depend on (call) the specified function_id directly or transitively.
    
    Includes hop_distance:
    - 1 hop: direct caller (calls function_id)
    - 2+ hops: transitive caller (calls a caller of function_id)
    
    Sorted by hop_distance ascending, then function ID.
    """
    if function_id not in graph:
        return []

    ancestors = nx.ancestors(graph, function_id)
    dependents: List[Dict[str, Any]] = []

    for anc in ancestors:
        try:
            # Shortest path from ancestor 'anc' to target 'function_id'
            path_len = nx.shortest_path_length(graph, source=anc, target=function_id)
        except nx.NetworkXNoPath:
            continue

        node_data = graph.nodes[anc]
        dependents.append({
            "id": anc,
            "name": node_data.get("name", anc.split(".")[-1]),
            "file": node_data.get("file", ""),
            "line_number": node_data.get("line_number", 0),
            "class_name": node_data.get("class_name"),
            "hop_distance": path_len,
        })

    dependents.sort(key=lambda x: (x["hop_distance"], x["id"]))
    return dependents

def get_dependencies(graph: nx.DiGraph, function_id: str) -> List[Dict[str, Any]]:
    """
    Returns all functions that the specified function_id calls directly or transitively.
    """
    if function_id not in graph:
        return []

    descendants = nx.descendants(graph, function_id)
    dependencies: List[Dict[str, Any]] = []

    for desc in descendants:
        try:
            path_len = nx.shortest_path_length(graph, source=function_id, target=desc)
        except nx.NetworkXNoPath:
            continue

        node_data = graph.nodes[desc]
        dependencies.append({
            "id": desc,
            "name": node_data.get("name", desc.split(".")[-1]),
            "file": node_data.get("file", ""),
            "line_number": node_data.get("line_number", 0),
            "class_name": node_data.get("class_name"),
            "hop_distance": path_len,
        })

    dependencies.sort(key=lambda x: (x["hop_distance"], x["id"]))
    return dependencies
