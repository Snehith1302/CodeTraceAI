from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"

class IngestRequest(BaseModel):
    path: str = Field(..., description="Absolute or relative path to Python project directory")

class IngestWarning(BaseModel):
    file: str
    warning: str

class IngestStats(BaseModel):
    files_scanned: int
    files_skipped: int
    total_nodes: int
    total_calls: int
    total_imports: int
    warnings_count: int

class IngestResponse(BaseModel):
    project_id: str
    path: str
    stats: IngestStats
    warnings: List[IngestWarning]

class GraphNodeResponse(BaseModel):
    id: str
    name: str
    file: str
    line_number: int
    class_name: Optional[str] = None
    is_async: bool = False
    docstring: Optional[str] = None

class GraphEdgeResponse(BaseModel):
    source: str
    target: str
    edge_type: str = "calls"
    line_number: int = 0

class GraphResponse(BaseModel):
    project_id: str
    nodes: List[GraphNodeResponse]
    edges: List[GraphEdgeResponse]
    warnings: List[IngestWarning]
    stats: IngestStats

class FunctionImpactNode(BaseModel):
    id: str
    name: str
    file: str
    line_number: int
    class_name: Optional[str] = None
    hop_distance: int

class TargetFunctionDetails(BaseModel):
    id: str
    name: str
    file: str
    line_number: int
    class_name: Optional[str] = None
    is_async: bool = False
    docstring: Optional[str] = None

class ImpactResponse(BaseModel):
    project_id: str
    target_function_id: str
    target_function: TargetFunctionDetails
    dependents: List[FunctionImpactNode]
    dependencies: List[FunctionImpactNode]
    total_dependents: int
    total_dependencies: int
    explanation: Optional[str] = None
    explanation_status: Optional[str] = None
