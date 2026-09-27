# CodeTrace AI — Requirements Document

## 1. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | System shall accept a local folder path or GitHub repository URL as input for analysis. |
| FR-2 | System shall recursively scan all `.py` files in the provided project, excluding `venv`, `.venv`, `__pycache__`, and `node_modules` directories. |
| FR-3 | System shall parse each file into an AST and extract function definitions, class definitions, method definitions, function calls, and import statements. |
| FR-4 | System shall build a directed dependency graph where nodes represent functions/modules and edges represent "calls" or "imports" relationships. |
| FR-5 | System shall allow the user to select any function node and view all functions that depend on it (direct and transitive), with hop distance shown. |
| FR-6 | System shall generate a plain-English explanation of the impact of changing a selected function, using an LLM. |
| FR-7 | System shall render the dependency graph as an interactive, clickable visualization in the browser. |
| FR-8 | System shall allow searching/filtering functions by name in the UI. |
| FR-9 | System shall persist the last analyzed project's graph for the duration of a session (in-memory is acceptable for v1; no database required). |
| FR-10 | System shall handle and report parsing errors gracefully (e.g., a file with a syntax error should be skipped with a warning, not crash the whole analysis). |

## 2. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Analysis of a project with up to ~200 Python files should complete within 10 seconds. |
| NFR-2 | The graph visualization should remain responsive (smooth pan/zoom) for graphs with up to ~500 nodes. |
| NFR-3 | LLM explanation calls should have a visible loading state in the UI (target response under 5 seconds). |
| NFR-4 | The system should not require any paid infrastructure beyond the LLM API key to run locally. |
| NFR-5 | Code should be modular enough that a future contributor could swap the Python `ast` parser for Tree-sitter without rewriting the graph or UI layers. |
| NFR-6 | No user code is ever executed — analysis is purely static (AST-based), for safety. |

## 3. Backend Dependencies (`requirements.txt`)

```
fastapi
uvicorn[standard]
networkx
pydantic
python-multipart
anthropic
gitpython
python-dotenv
```

## 4. Frontend Dependencies (`package.json` — key packages)

```
react
react-dom
vite
tailwindcss
reactflow
axios
lucide-react
```

## 5. Environment Variables

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Required for the LLM explanation layer |
| `BACKEND_PORT` | Default: 8000 |
| `FRONTEND_PORT` | Default: 5173 |
| `MAX_FILES_PER_PROJECT` | Safety cap on analysis size, default: 500 |

## 6. Setup Instructions

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Environment file (`.env` in backend/):**
```
ANTHROPIC_API_KEY=your_key_here
```

## 7. Out of Scope for v1

- Multi-language support (JavaScript, Java, etc.)
- User authentication / multi-user accounts
- Persistent database storage of past analyses
- Real-time collaborative graph viewing
- CI/CD integration (e.g., running on every PR)
