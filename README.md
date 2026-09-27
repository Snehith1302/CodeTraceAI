# CodeTrace AI — X-Ray Codebase Dependency Analyzer

> **"What breaks if I change this function?"** — CodeTrace AI combines static AST analysis, NetworkX graph traversal, and Claude AI synthesis to reveal the exact blast radius of code modifications through an interactive circuit-board visualizer.

---

## 📌 Problem Being Solved

Refactoring code in medium-to-large Python projects often carries hidden risks. Changing a utility function or core model method can trigger subtle bugs in distant, unexpected modules. Traditional IDE search tools list raw string occurrences without distinguishing between direct callers, transitive callers, or unaffected code.

**CodeTrace AI** solves this by statically parsing Python codebases into a directed dependency graph. Selecting any function immediately highlights every direct and transitive caller with hop distances, along with an AI-generated plain-English explanation of the architectural impact.

---

## ✨ Key Features

- **Static AST Parsing**: Analyzes Python function definitions, class methods, async functions, call expressions, and module imports using Python's standard `ast` module (no code execution for safety).
- **NetworkX Directed Graph Engine**: Builds a directed call graph (`Node A -> Node B` means Node A calls Node B) and computes exact reachability (`ancestors` / `descendants`) and BFS hop distances.
- **Circuit-Board X-Ray UI**: Dark-mode canvas built with React Flow, rendering target symbols in violet (`#7C3AED`), direct callers in amber (`#F59E0B`), transitive callers in faded amber, and active call paths with animated glowing edges.
- **Claude AI Explanation Layer**: Synthesizes structured static analysis results into a 3–5 sentence plain-English blast radius summary.
- **Positive Safe State**: Identifies functions with 0 callers as *"Safe to Modify in Isolation"*.
- **Graceful Error Handling**: Non-blocking alerts for syntax errors in scanned files, invalid repository paths, and unconfigured AI keys (static impact tracing remains 100% operational even without an API key).
- **GitHub & Local Repo Support**: Ingests local project directories or remote GitHub repository URLs (`https://github.com/user/repo`).

---

## 🏗 Architecture & Data Flow

```text
               User Provides Local Path or GitHub URL
                                 ↓
                    File Scanner & AST Walker
              (Parses .py files into AST Symbol Nodes)
                                 ↓
                      NetworkX DiGraph Engine
           (Builds Symbol Call Edges & Computes Hops)
                                 ↓
                     FastAPI REST API Layer
           (/ingest, /graph, /impact/{function_id})
                                 ↓
         ┌───────────────────────┴───────────────────────┐
         ↓                                               ↓
Deterministic Impact Data                      Claude AI Explanation Layer
 (Hop 1, Hop 2+, Dimmed Nodes)                 (Synthesizes Plain-English Summary)
         └───────────────────────┬───────────────────────┘
                                 ↓
                 React Flow X-Ray Visualization
               (Interactive Circuit-Board Canvas)
```

---

## 🛠 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Parsing** | Python `ast` | Static AST symbol & call extraction (zero code execution) |
| **Graph Engine** | NetworkX | Directed graph construction & shortest-path hop calculation |
| **Backend API** | FastAPI + Pydantic | RESTful API layer with Pydantic request/response validation |
| **AI Layer** | Anthropic Python SDK | Claude 3.5 Sonnet API for plain-English blast radius synthesis |
| **Frontend** | React 19 + Vite | Vite dev & build setup |
| **Graph Visualization** | `@xyflow/react` (React Flow) | Interactive canvas with custom nodes & animated call path edges |
| **Styling** | Tailwind CSS | X-ray dark mode visual design (`#0B0D12` base canvas) |

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
BACKEND_PORT=8000
FRONTEND_PORT=5173
MAX_FILES_PER_PROJECT=500
```

> **Note**: `ANTHROPIC_API_KEY` is optional for static graph visualization. If omitted or unconfigured, CodeTrace AI will gracefully display deterministic impact data with a non-blocking notification: *"AI explanation unavailable. Deterministic impact analysis is active."*

---

## 🚀 Quickstart & Setup

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI backend server
uvicorn app.main:app --reload --port 8000
```

Backend API documentation will be available at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```

Frontend application will open at: `http://localhost:5173`

---

## 🧪 Running Tests

### Backend Test Suite (`pytest`)

```bash
cd backend
.\venv\Scripts\python.exe -m pytest
```

Examines parsing accuracy, AST symbol extraction, NetworkX hop queries, FastAPI endpoint responses, prompt construction, and Anthropic API key fallbacks (20/20 tests passing).

### Frontend Production Build

```bash
cd frontend
npm run build
```

Verifies Vite production bundling and CSS token compilation.

---

## 🛡 Security Review & Safeguards

- **Zero Code Execution**: CodeTrace AI performs static analysis strictly via standard `ast.parse`. No `eval()`, `exec()`, or `importlib` execution occurs.
- **Backend Key Isolation**: `ANTHROPIC_API_KEY` is strictly accessed in the backend environment. It is never sent to the client, logged, or returned in API responses.
- **Directory Exclusion**: Virtualenv (`venv`, `.venv`), `node_modules`, `__pycache__`, `.git`, and build outputs are excluded from file scanning.
- **Safety Caps**: Enforces `MAX_FILES_PER_PROJECT` (default 500 files) to prevent resource exhaustion.

---

## ⚠️ Known Limitations (V1)

1. **Python Only**: V1 supports Python codebases. Multi-language support (JavaScript/TypeScript, Java, Go) is planned via Tree-sitter.
2. **Static Call Resolution**: Dynamic calls (e.g. `getattr(obj, func_name)()`) cannot be resolved statically.
3. **Star Imports**: `from module import *` imports are logged as warnings but cannot resolve individual symbol names without full runtime evaluation.
4. **In-Memory Sessions**: V1 stores graph sessions in-memory. Database persistence is out of scope for V1.

---

## 📄 License

MIT License. Developed for CodeTrace AI.
