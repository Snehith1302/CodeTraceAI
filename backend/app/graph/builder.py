import networkx as nx
from typing import List, Dict, Set, Optional, Tuple
from app.parser.models import FunctionNode, RawCall, RawImport

def build_graph(
    nodes: List[FunctionNode],
    calls: List[RawCall],
    imports: List[RawImport]
) -> nx.DiGraph:
    """
    Constructs a NetworkX DiGraph from extracted FunctionNode objects and RawCall edges,
    using best-effort static symbol resolution.
    
    Node A -> Node B means Node A calls Node B (or Node A depends on Node B).
    """
    G = nx.DiGraph()

    # Maps for resolution
    node_by_id: Dict[str, FunctionNode] = {}
    name_to_ids: Dict[str, List[str]] = {}
    module_func_to_id: Dict[str, str] = {}
    class_method_to_ids: Dict[str, List[str]] = {}

    for node in nodes:
        node_by_id[node.id] = node
        G.add_node(
            node.id,
            name=node.name,
            file=node.file,
            line_number=node.line_number,
            class_name=node.class_name,
            is_async=node.is_async,
            docstring=node.docstring,
        )

        name_to_ids.setdefault(node.name, []).append(node.id)

        # module + function name mapping
        mod = node.id.rsplit(".", 1)[0] if "." in node.id else ""
        if node.class_name:
            # mod is module.ClassName
            mod_actual = mod.rsplit(".", 1)[0] if "." in mod else ""
            module_func_to_id[f"{mod_actual}.{node.name}"] = node.id
            class_method_to_ids.setdefault(f"{node.class_name}.{node.name}", []).append(node.id)
        else:
            module_func_to_id[f"{mod}.{node.name}"] = node.id

    # Helper function to get caller's module from caller_id
    def get_caller_module(caller_id: str) -> Tuple[str, Optional[str]]:
        caller_node = node_by_id.get(caller_id)
        if not caller_node:
            parts = caller_id.split(".")
            return (".".join(parts[:-1]), None)
        mod_parts = caller_node.id.split(".")
        if caller_node.class_name:
            mod_name = ".".join(mod_parts[:-2])
        else:
            mod_name = ".".join(mod_parts[:-1])
        return (mod_name, caller_node.class_name)

    # Process calls to add directed edges
    for call in calls:
        caller_id = call.caller_id
        callee_name = call.callee_name
        if not caller_id or not callee_name or caller_id not in G:
            continue

        caller_module, caller_class = get_caller_module(caller_id)
        target_id: Optional[str] = None

        # 1. Exact node ID match
        if callee_name in G:
            target_id = callee_name

        # 2. Self method call: self.method_name or cls.method_name
        elif (callee_name.startswith("self.") or callee_name.startswith("cls.")) and caller_class:
            method_name = callee_name.split(".", 1)[1]
            key = f"{caller_class}.{method_name}"
            matches = class_method_to_ids.get(key, [])
            if matches:
                same_mod = [m for m in matches if m.startswith(caller_module)]
                target_id = same_mod[0] if same_mod else matches[0]

        # 3. Same module function call
        elif f"{caller_module}.{callee_name}" in module_func_to_id:
            target_id = module_func_to_id[f"{caller_module}.{callee_name}"]

        # 4. Same module class method call
        elif f"{caller_module}.{callee_name}" in G:
            target_id = f"{caller_module}.{callee_name}"

        # 5. Method call on instance (e.g. processor.process_payment or obj.method)
        elif "." in callee_name:
            parts = callee_name.split(".")
            method_or_func = parts[-1]
            if method_or_func in name_to_ids:
                candidates = name_to_ids[method_or_func]
                if len(candidates) == 1:
                    target_id = candidates[0]
                else:
                    # Prefer candidate in imported modules or same package
                    same_pkg = [c for c in candidates if caller_module and c.startswith(caller_module.split(".")[0])]
                    target_id = same_pkg[0] if same_pkg else candidates[0]
            else:
                mod_qualified = f"{caller_module}.{callee_name}"
                if mod_qualified in G:
                    target_id = mod_qualified

        # 6. Unqualified short name fallback
        if not target_id and callee_name in name_to_ids:
            candidates = name_to_ids[callee_name]
            if len(candidates) == 1:
                target_id = candidates[0]
            else:
                same_mod_candidates = [c for c in candidates if caller_module and c.startswith(caller_module.split(".")[0])]
                if same_mod_candidates:
                    target_id = same_mod_candidates[0]
                else:
                    target_id = candidates[0]

        # Add directed edge if resolved and not a self-call loop
        if target_id and target_id in G and target_id != caller_id:
            G.add_edge(caller_id, target_id, edge_type="calls", line_number=call.line_number)

    return G
