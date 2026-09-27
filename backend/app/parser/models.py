from dataclasses import dataclass, field
from typing import Optional, List

@dataclass
class FunctionNode:
    id: str
    name: str
    file: str
    line_number: int
    class_name: Optional[str] = None
    is_async: bool = False
    docstring: Optional[str] = None

@dataclass
class RawCall:
    caller_id: str
    callee_name: str
    line_number: int

@dataclass
class RawImport:
    module: str
    imported_symbol: Optional[str] = None
    alias: Optional[str] = None

@dataclass
class ParseResult:
    file_path: str
    module_name: str
    nodes: List[FunctionNode] = field(default_factory=list)
    calls: List[RawCall] = field(default_factory=list)
    imports: List[RawImport] = field(default_factory=list)
    warning: Optional[str] = None
