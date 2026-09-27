import ast
from typing import Optional, List
from app.parser.models import FunctionNode, RawCall, RawImport, ParseResult

def _get_call_name(node: ast.AST) -> Optional[str]:
    """Recursively extracts a readable string name for a call node expression."""
    if isinstance(node, ast.Name):
        return node.id
    elif isinstance(node, ast.Attribute):
        value_name = _get_call_name(node.value)
        if value_name:
            return f"{value_name}.{node.attr}"
        return node.attr
    elif isinstance(node, ast.Call):
        func_name = _get_call_name(node.func)
        return f"{func_name}()" if func_name else None
    return None

class CodeASTVisitor(ast.NodeVisitor):
    def __init__(self, file_path: str, module_name: str):
        self.file_path = file_path
        self.module_name = module_name
        self.nodes: List[FunctionNode] = []
        self.calls: List[RawCall] = []
        self.imports: List[RawImport] = []
        
        self.class_scope_stack: List[str] = []
        self.function_scope_stack: List[str] = []

    def visit_ClassDef(self, node: ast.ClassDef):
        self.class_scope_stack.append(node.name)
        self.generic_visit(node)
        self.class_scope_stack.pop()

    def _visit_function(self, node: ast.AST, is_async: bool):
        func_name = node.name
        class_name = self.class_scope_stack[-1] if self.class_scope_stack else None

        # Build fully qualified node ID
        if class_name:
            node_id = f"{self.module_name}.{class_name}.{func_name}"
        else:
            node_id = f"{self.module_name}.{func_name}"

        docstring = ast.get_docstring(node)

        func_node = FunctionNode(
            id=node_id,
            name=func_name,
            file=self.file_path,
            line_number=node.lineno,
            class_name=class_name,
            is_async=is_async,
            docstring=docstring,
        )
        self.nodes.append(func_node)

        self.function_scope_stack.append(node_id)
        self.generic_visit(node)
        self.function_scope_stack.pop()

    def visit_FunctionDef(self, node: ast.FunctionDef):
        self._visit_function(node, is_async=False)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        self._visit_function(node, is_async=True)

    def visit_Call(self, node: ast.Call):
        if self.function_scope_stack:
            caller_id = self.function_scope_stack[-1]
            callee_name = _get_call_name(node.func)
            if callee_name:
                self.calls.append(
                    RawCall(
                        caller_id=caller_id,
                        callee_name=callee_name,
                        line_number=node.lineno,
                    )
                )
        self.generic_visit(node)

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            self.imports.append(
                RawImport(
                    module=alias.name,
                    imported_symbol=None,
                    alias=alias.asname,
                )
            )

    def visit_ImportFrom(self, node: ast.ImportFrom):
        module = node.module or ""
        for alias in node.names:
            self.imports.append(
                RawImport(
                    module=module,
                    imported_symbol=alias.name,
                    alias=alias.asname,
                )
            )

def parse_file_ast(file_path: str, module_name: str, source_code: str) -> ParseResult:
    """
    Parses source code into an AST and extracts function definitions, calls, and imports.
    If a syntax error occurs, catches it gracefully and returns a warning.
    """
    try:
        tree = ast.parse(source_code, filename=file_path)
    except SyntaxError as e:
        return ParseResult(
            file_path=file_path,
            module_name=module_name,
            warning=f"SyntaxError in {file_path}:{e.lineno} - {e.msg}",
        )
    except Exception as e:
        return ParseResult(
            file_path=file_path,
            module_name=module_name,
            warning=f"Parse error in {file_path}: {str(e)}",
        )

    visitor = CodeASTVisitor(file_path=file_path, module_name=module_name)
    visitor.visit(tree)

    return ParseResult(
        file_path=file_path,
        module_name=module_name,
        nodes=visitor.nodes,
        calls=visitor.calls,
        imports=visitor.imports,
    )
