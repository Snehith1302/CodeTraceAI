from pathlib import Path
from typing import List, Tuple, Dict, Any
from app.utils.file_scanner import scan_python_files
from app.parser.models import FunctionNode, RawCall, RawImport
from app.parser.ast_walker import parse_file_ast

def path_to_module_name(rel_path: Path) -> str:
    """Converts a relative file path (e.g. services/payment.py) to a Python module name."""
    parts = list(rel_path.parts)
    if not parts:
        return "root"

    # Remove extension from last part
    if parts[-1].endswith(".py"):
        parts[-1] = parts[-1][:-3]

    # Handle __init__.py
    if parts[-1] == "__init__":
        parts.pop()

    if not parts:
        return "root"

    return ".".join(parts)

def extract_project_data(
    project_path: str,
    max_files: int = None
) -> Tuple[List[FunctionNode], List[RawCall], List[RawImport], List[Dict[str, Any]], Dict[str, Any]]:
    """
    Scans and extracts all AST symbols, calls, imports, and warnings across a Python project.
    
    Returns:
        (nodes, calls, imports, warnings, stats)
    """
    root_path = Path(project_path).resolve()
    scanned_files, skipped_files = scan_python_files(str(root_path), max_files=max_files)

    all_nodes: List[FunctionNode] = []
    all_calls: List[RawCall] = []
    all_imports: List[RawImport] = []
    warnings: List[Dict[str, Any]] = []

    for skipped in skipped_files:
        warnings.append({
            "file": str(skipped).replace("\\", "/"),
            "warning": "Skipped due to MAX_FILES_PER_PROJECT limit cap."
        })

    for rel_path in scanned_files:
        full_path = root_path / rel_path
        posix_rel_path = str(rel_path).replace("\\", "/")
        module_name = path_to_module_name(rel_path)

        try:
            with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                source_code = f.read()
        except Exception as e:
            warnings.append({
                "file": posix_rel_path,
                "warning": f"Failed to read file: {str(e)}"
            })
            continue

        result = parse_file_ast(posix_rel_path, module_name, source_code)

        if result.warning:
            warnings.append({
                "file": posix_rel_path,
                "warning": result.warning
            })
        
        all_nodes.extend(result.nodes)
        all_calls.extend(result.calls)
        all_imports.extend(result.imports)

    stats = {
        "files_scanned": len(scanned_files),
        "files_skipped": len(skipped_files),
        "total_nodes": len(all_nodes),
        "total_calls": len(all_calls),
        "total_imports": len(all_imports),
        "warnings_count": len(warnings),
    }

    return all_nodes, all_calls, all_imports, warnings, stats
