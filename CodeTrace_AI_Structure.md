# CodeTrace AI — Project Structure & Technical Spec

## 1. Project Overview

**Name:** CodeTrace AI
**One-liner:** A lightweight Python code dependency analyzer that answers "what breaks if I change this function?" — combining static analysis, graph traversal, and an LLM-generated plain-English explanation, shown through an interactive dependency graph UI.

**Scope for v1:** Python projects only (single-repo, local folder or GitHub URL).

**Core value proposition:** Instead of manually tracing calls through a codebase before refactoring, the developer picks a function and instantly sees every downstream dependent, plus a written explanation of the blast radius.

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Parsing | Python `ast` module (stdlib) | No third-party parser needed for v1 |
| Graph engine | NetworkX | Directed graph, built-in traversal (ancestors/descendants) |
| Backend API | FastAPI | Async, auto-generates OpenAPI docs |
| LLM explanation | Claude API (Anthropic) | Thin layer — only explains, doesn't compute the graph |
| Frontend | React + Vite + Tailwind | Matches stack already used on the GraphRAG capstone |
| Graph rendering | react-flow (preferred) or vis-network | Interactive node/edge canvas with click-to-highlight |
| Repo ingestion | GitPython (for cloning GitHub URLs) or direct folder path | Local folder path is simplest for v1 |

---

## 3. Folder Structure

```
codetrace-ai/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entrypoint
│   │   ├── config.py              # env vars, settings
│   │   ├── parser/
│   │   │   ├── ast_walker.py      # walks .py files, builds raw call/import data
│   │   │   ├── extractor.py       # extracts FunctionDef, ClassDef, Call, Import nodes
│   │   │   └── models.py          # dataclasses: FunctionNode, EdgeType, etc.
│   │   ├── graph/
│   │   │   ├── builder.py         # turns extracted data into a NetworkX DiGraph
│   │   │   ├── queries.py         # ancestors/descendants, "what breaks" logic
│   │   │   └── serializer.py      # graph -> JSON for frontend consumption
│   │   ├── llm/
│   │   │   ├── explainer.py       # calls Claude API with dependency chain -> explanation
│   │   │   └── prompts.py         # prompt templates
│   │   ├── api/
│   │   │   ├── routes_ingest.py   # POST /ingest — accepts repo path/URL
│   │   │   ├── routes_graph.py    # GET /graph — returns full graph JSON
│   │   │   └── routes_impact.py   # GET /impact/{function_id} — returns affected nodes + explanation
│   │   └── utils/
│   │       └── file_scanner.py    # walks directory, filters .py files, skips venv/__pycache__
│   ├── tests/
│   │   ├── test_ast_walker.py
│   │   ├── test_graph_queries.py
│   │   └── sample_project/        # small dummy Python project used for testing
│   ├── requirements.txt
│   └── Dockerfile (optional)
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── GraphCanvas.jsx     # react-flow graph rendering
│   │   │   ├── NodeDetailPanel.jsx # shows selected function's info + LLM explanation
│   │   │   ├── SearchBar.jsx       # search/select a function to analyze
│   │   │   ├── ImpactList.jsx      # list view of affected functions (alt to graph)
│   │   │   └── UploadRepo.jsx      # input: local path or GitHub URL
│   │   ├── hooks/
│   │   │   └── useGraphData.js     # fetches /graph and /impact from backend
│   │   ├── styles/
│   │   │   └── tailwind.css
│   │   └── utils/
│   │       └── graphFormat.js      # transforms backend JSON -> react-flow node/edge format
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 4. Data Flow

```
1. User provides a folder path or GitHub URL
        ↓
2. Backend scans all .py files (file_scanner.py)
        ↓
3. AST walker parses each file into FunctionDef / ClassDef / Call / Import nodes
        ↓
4. Graph builder constructs a directed graph:
   node = function/module, edge = "calls" or "imports"
        ↓
5. Graph is serialized to JSON and sent to frontend on /graph
        ↓
6. User clicks a function node in the UI
        ↓
7. Frontend calls /impact/{function_id}
        ↓
8. Backend traverses graph (ancestors = "who depends on this")
        ↓
9. Dependency chain is sent to Claude API -> plain-English explanation
        ↓
10. Frontend highlights affected nodes on the graph + shows explanation in side panel
```

---

## 5. Core Modules — Behavior Spec

### 5.1 `ast_walker.py`
- Input: path to a `.py` file
- Output: list of raw AST nodes of interest (`FunctionDef`, `AsyncFunctionDef`, `ClassDef`, `Call`, `Import`, `ImportFrom`)
- Must track **which function a call happens inside** (i.e., the enclosing scope), so calls can be attributed correctly as edges.

### 5.2 `extractor.py`
- Converts raw AST nodes into clean data objects:
  - `FunctionNode(id, name, file, line_number, class_name=None)`
  - `Edge(source_id, target_id, edge_type="calls" | "imports")`
- Handles both module-level functions and class methods (methods get a qualified id like `ClassName.method_name`).

### 5.3 `builder.py`
- Takes all `FunctionNode` and `Edge` objects across the whole project.
- Builds a single `networkx.DiGraph()`.
- Deduplicates nodes; resolves function names to their defining module where possible (best-effort — don't over-engineer resolution for dynamic/aliased imports in v1).

### 5.4 `queries.py`
- `get_dependents(graph, function_id)` → uses `nx.ancestors()` to return everything that (directly or transitively) calls this function.
- `get_dependencies(graph, function_id)` → uses `nx.descendants()` to return everything this function calls.
- Returns results annotated with **hop distance** (1 hop = direct caller, 2 hops = caller's caller, etc.) via BFS layers.

### 5.5 `explainer.py`
- Input: the function name + its list of dependents (with hop distance and file paths).
- Prompt Claude to produce a short (3–5 sentence) plain-English summary of the blast radius — no restating of the raw list, actual synthesis (e.g., "this touches the checkout and invoicing flow").
- Keep this call stateless — one request per impact query, no conversation history needed.

---

## 6. API Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/ingest` | Accepts `{ path or repo_url }`, triggers parsing + graph build, returns a `project_id` |
| GET | `/graph?project_id=` | Returns the full graph as `{ nodes: [...], edges: [...] }` |
| GET | `/impact/{function_id}?project_id=` | Returns `{ dependents: [...], explanation: "..." }` |
| GET | `/health` | Basic liveness check |

---

## 7. Build Phases (recommended order)

1. **Phase 1 — Core engine (no UI):** AST walker → extractor → graph builder, tested via a CLI script (`python analyze.py ./sample_project`) that prints dependents of a given function.
2. **Phase 2 — API layer:** Wrap Phase 1 in FastAPI endpoints (`/ingest`, `/graph`, `/impact`).
3. **Phase 3 — Frontend skeleton:** React app that calls `/graph` and renders nodes/edges with react-flow, no interactivity yet.
4. **Phase 4 — Interactivity:** Click a node → call `/impact/{id}` → highlight affected nodes + show details panel.
5. **Phase 5 — LLM explanation:** Wire in Claude API call inside `/impact`, display explanation text in the UI.
6. **Phase 6 — Polish:** Search bar, loading states, error handling for malformed repos, README with GIF demo.

---

## 8. Known Limitations (v1, disclose in README)

- Python only — no multi-language support (documented as future work: Tree-sitter integration).
- Dynamic calls (e.g., `getattr(obj, "method_name")()`) are not resolved — only statically visible calls are tracked.
- Star imports (`from module import *`) are flagged but not fully resolved to individual symbols.
