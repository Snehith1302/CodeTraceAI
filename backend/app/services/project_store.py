import uuid
import networkx as nx
from typing import Dict, Optional, List, Any
from dataclasses import dataclass
from app.parser.models import FunctionNode

@dataclass
class ProjectSession:
    project_id: str
    path: str
    nodes: List[FunctionNode]
    graph: nx.DiGraph
    warnings: List[Dict[str, Any]]
    stats: Dict[str, Any]

class ProjectStore:
    """In-memory store for project sessions in V1."""
    def __init__(self):
        self._projects: Dict[str, ProjectSession] = {}

    def create_session(
        self,
        path: str,
        nodes: List[FunctionNode],
        graph: nx.DiGraph,
        warnings: List[Dict[str, Any]],
        stats: Dict[str, Any]
    ) -> ProjectSession:
        project_id = uuid.uuid4().hex[:12]
        session = ProjectSession(
            project_id=project_id,
            path=path,
            nodes=nodes,
            graph=graph,
            warnings=warnings,
            stats=stats
        )
        self._projects[project_id] = session
        return session

    def get_session(self, project_id: str) -> Optional[ProjectSession]:
        return self._projects.get(project_id)

    def clear(self):
        self._projects.clear()

project_store = ProjectStore()
