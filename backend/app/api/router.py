from pathlib import Path
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.api import (
    HealthResponse,
    IngestRequest,
    IngestResponse,
    GraphResponse,
    ImpactResponse,
    TargetFunctionDetails,
    FunctionImpactNode,
)
from app.parser.extractor import extract_project_data
from app.graph.builder import build_graph
from app.graph.queries import get_dependents, get_dependencies
from app.graph.serializer import serialize_graph
from app.services.project_store import project_store
from app.llm.explainer import generate_impact_explanation
from app.utils.repo_cloner import is_github_url, clone_github_repo

api_router = APIRouter()

@api_router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check endpoint",
    tags=["Health"]
)
def health_check():
    """Returns the API health status and version."""
    return HealthResponse(status="ok", version="1.0.0")

@api_router.post(
    "/ingest",
    response_model=IngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest and parse a Python project directory or GitHub URL",
    tags=["Ingest"]
)
def ingest_project(request: IngestRequest):
    """
    Scans a local Python project directory or GitHub repository URL,
    parses AST symbols, builds a NetworkX call graph, and initializes an in-memory session.
    """
    path_input = request.path.strip()
    is_remote = is_github_url(path_input)

    if is_remote:
        cloned_dir, clone_error = clone_github_repo(path_input)
        if clone_error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=clone_error
            )
        resolved_path = Path(cloned_dir).resolve()
        display_path = path_input
    else:
        resolved_path = Path(path_input).resolve()
        if not resolved_path.exists() or not resolved_path.is_dir():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid project path: '{request.path}' is not a valid directory."
            )
        display_path = str(resolved_path)

    nodes, calls, imports, warnings, stats = extract_project_data(str(resolved_path))
    graph = build_graph(nodes, calls, imports)

    session = project_store.create_session(
        path=display_path,
        nodes=nodes,
        graph=graph,
        warnings=warnings,
        stats=stats
    )

    return IngestResponse(
        project_id=session.project_id,
        path=session.path,
        stats=session.stats,
        warnings=session.warnings
    )

@api_router.get(
    "/graph",
    response_model=GraphResponse,
    summary="Get serialized graph representation of an ingested project",
    tags=["Graph"]
)
def get_graph(project_id: str = Query(..., description="The unique project session ID")):
    """
    Returns the JSON-serialized node and edge lists of the project's dependency graph.
    """
    session = project_store.get_session(project_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project ID '{project_id}' not found."
        )

    serialized = serialize_graph(session.graph)
    return GraphResponse(
        project_id=project_id,
        nodes=serialized["nodes"],
        edges=serialized["edges"],
        warnings=session.warnings,
        stats=session.stats
    )

@api_router.get(
    "/impact/{function_id:path}",
    response_model=ImpactResponse,
    summary="Get blast-radius impact analysis for a specific function",
    tags=["Impact"]
)
def get_impact(
    function_id: str,
    project_id: str = Query(..., description="The unique project session ID")
):
    """
    Calculates direct and transitive dependents (what breaks if modified)
    and downstream dependencies (what this function calls), with an LLM-synthesized explanation.
    """
    session = project_store.get_session(project_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project ID '{project_id}' not found."
        )

    if function_id not in session.graph:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Function ID '{function_id}' not found in project graph."
        )

    node_data = session.graph.nodes[function_id]
    target_func = TargetFunctionDetails(
        id=function_id,
        name=node_data.get("name", function_id.split(".")[-1]),
        file=node_data.get("file", ""),
        line_number=node_data.get("line_number", 0),
        class_name=node_data.get("class_name"),
        is_async=node_data.get("is_async", False),
        docstring=node_data.get("docstring"),
    )

    raw_dependents = get_dependents(session.graph, function_id)
    raw_dependencies = get_dependencies(session.graph, function_id)

    dependents = [FunctionImpactNode(**d) for d in raw_dependents]
    dependencies = [FunctionImpactNode(**d) for d in raw_dependencies]

    explanation, explanation_status = generate_impact_explanation(
        target_function_id=function_id,
        target_function=target_func.model_dump(),
        dependents=raw_dependents,
        total_dependents=len(dependents),
    )

    return ImpactResponse(
        project_id=project_id,
        target_function_id=function_id,
        target_function=target_func,
        dependents=dependents,
        dependencies=dependencies,
        total_dependents=len(dependents),
        total_dependencies=len(dependencies),
        explanation=explanation,
        explanation_status=explanation_status,
    )
