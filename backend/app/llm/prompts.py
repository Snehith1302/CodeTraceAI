from typing import List, Dict, Any

SYSTEM_PROMPT = """You are an expert software architect analyzing code dependency graphs.
Your job is to provide a concise, plain-English summary (3 to 5 sentences maximum) of the blast radius when a specific function in a codebase is modified.

CRITICAL CONSTRAINTS:
1. Base your explanation STRICTLY on the provided static analysis data (target function details and dependent functions list with hop distances).
2. Do NOT invent, assume, or fabricate any dependencies, functions, or file paths that are not explicitly present in the provided context.
3. Do NOT simply output or repeat the raw list of functions. Synthesize the architectural impact in plain English (e.g., explain what flows/modules are affected, such as payment validation, checkout, or main execution).
4. Keep the explanation concise, professional, and actionable for a developer refactoring this function.
"""

def build_impact_prompt(
    target_function_id: str,
    target_function: Dict[str, Any],
    dependents: List[Dict[str, Any]],
    total_dependents: int,
) -> str:
    """Constructs a structured prompt for Claude based on deterministic static analysis results."""
    
    target_name = target_function.get("name", target_function_id)
    target_file = target_function.get("file", "unknown")
    target_line = target_function.get("line_number", 0)
    class_name = target_function.get("class_name")
    docstring = target_function.get("docstring")

    class_str = f" (Class: {class_name})" if class_name else ""
    docstring_str = f"\nDocstring: {docstring.strip()}" if docstring else ""

    if not dependents:
        return f"""Target Function: '{target_name}'{class_str}
File: {target_file} (Line {target_line}){docstring_str}
Total Downstream Dependents: 0

The static analysis engine determined that 0 other functions call or depend on '{target_name}'.
Please provide a short 2-3 sentence confirmation for the developer explaining why this function is safe to modify in isolation."""

    formatted_dependents = []
    for dep in dependents:
        c_str = f" (class {dep['class_name']})" if dep.get("class_name") else ""
        formatted_dependents.append(
            f"- [Hop {dep.get('hop_distance', 1)}] {dep['id']}{c_str} in file '{dep.get('file', '')}' (L{dep.get('line_number', 0)})"
        )

    dependents_list_str = "\n".join(formatted_dependents)
    direct_count = sum(1 for d in dependents if d.get("hop_distance") == 1)

    return f"""Target Function: '{target_name}'{class_str}
File: {target_file} (Line {target_line}){docstring_str}

Deterministic Impact Analysis Summary:
- Direct Callers (Hop 1): {direct_count}
- Total Blast Radius (All Hops): {total_dependents}

Callers & Dependents List:
{dependents_list_str}

Please generate a concise 3-5 sentence plain-English explanation summarizing the blast radius and architectural impact if '{target_name}' is modified."""
