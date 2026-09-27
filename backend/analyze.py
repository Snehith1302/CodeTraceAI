import sys
import json
import argparse
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from app.parser.extractor import extract_project_data
from app.graph.builder import build_graph
from app.graph.queries import get_dependents, get_dependencies
from app.graph.serializer import serialize_graph

def main():
    parser = argparse.ArgumentParser(description="CodeTrace AI — Phase 1 CLI Verification Script")
    parser.add_argument(
        "project_path",
        nargs="?",
        default=str(Path(__file__).parent / "tests" / "sample_project"),
        help="Path to the Python project to analyze"
    )
    parser.add_argument(
        "--function",
        "-f",
        default="utils.helpers.validate_card",
        help="Function ID to perform blast-radius impact analysis on"
    )
    args = parser.parse_args()

    project_dir = Path(args.project_path).resolve()
    print("=" * 65)
    print(f"  CodeTrace AI — Phase 1 Engine Analysis")
    print("=" * 65)
    print(f"Target Directory: {project_dir}\n")

    if not project_dir.exists():
        print(f"Error: Directory '{project_dir}' does not exist.")
        sys.exit(1)

    print("1. Extracting AST symbols, calls, and imports...")
    nodes, calls, imports, warnings, stats = extract_project_data(str(project_dir))

    print(f"   - Files Scanned : {stats['files_scanned']}")
    print(f"   - Total Nodes   : {stats['total_nodes']}")
    print(f"   - Total Calls   : {stats['total_calls']}")
    print(f"   - Total Imports : {stats['total_imports']}")
    print(f"   - Warnings      : {stats['warnings_count']}")

    if warnings:
        print("\nWarnings / Skipped Files:")
        for w in warnings:
            print(f"   [!] {w['file']}: {w['warning']}")

    print("\n2. Building NetworkX Directed Graph...")
    graph = build_graph(nodes, calls, imports)
    print(f"   - Graph Nodes : {graph.number_of_nodes()}")
    print(f"   - Graph Edges : {graph.number_of_edges()}")

    print("\nExtracted Symbol Nodes:")
    for node_id in sorted(graph.nodes):
        data = graph.nodes[node_id]
        class_str = f" ({data['class_name']})" if data.get("class_name") else ""
        print(f"   • {node_id}{class_str}  [{data['file']}:L{data['line_number']}]")

    print("\nResolved Directed Edges (Caller -> Callee):")
    for u, v in sorted(graph.edges):
        print(f"   • {u}  --->  {v}")

    target_func = args.function
    print(f"\n3. Impact Analysis for function: '{target_func}'")
    
    if target_func not in graph:
        print(f"   Warning: '{target_func}' not found directly in graph.")
        matching = [n for n in graph.nodes if target_func in n]
        if matching:
            target_func = matching[0]
            print(f"   Using matching node: '{target_func}'")
        else:
            print("   Available nodes:", list(graph.nodes))
            sys.exit(0)

    dependents = get_dependents(graph, target_func)
    print(f"\n   What breaks if '{target_func}' is modified? ({len(dependents)} dependent(s)):")
    if not dependents:
        print("   (No callers found — safe to modify in isolation)")
    else:
        for dep in dependents:
            hop_str = f"[Hop {dep['hop_distance']}]"
            class_str = f" ({dep['class_name']})" if dep.get('class_name') else ""
            print(f"   {hop_str:<9} • {dep['id']}{class_str}  ({dep['file']}:L{dep['line_number']})")

    dependencies = get_dependencies(graph, target_func)
    print(f"\n   What does '{target_func}' call? ({len(dependencies)} downstream dependency/dependencies):")
    if not dependencies:
        print("   (Calls no other internal functions)")
    else:
        for dep in dependencies:
            hop_str = f"[Hop {dep['hop_distance']}]"
            print(f"   {hop_str:<9} • {dep['id']}  ({dep['file']}:L{dep['line_number']})")

    print("\n4. Graph JSON Output Preview (First 2 nodes & edges):")
    serialized = serialize_graph(graph)
    preview = {
        "nodes": serialized["nodes"][:2],
        "edges": serialized["edges"][:2],
        "total_nodes_count": len(serialized["nodes"]),
        "total_edges_count": len(serialized["edges"])
    }
    print(json.dumps(preview, indent=2))

    print("\n=" * 65)
    print("  Phase 1 Engine Analysis Completed Successfully!")
    print("=" * 65)

if __name__ == "__main__":
    main()
