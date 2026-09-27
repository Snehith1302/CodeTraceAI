# CodeTrace AI — UI Design Spec

## 1. Design Concept

Most dependency-graph tools look like generic node-link diagrams on a white background — dense, technical, uninviting. CodeTrace AI's UI concept is **"X-ray view of your codebase"**: a dark, focused canvas where the code graph feels like something you're scanning and diagnosing, not just staring at.

**Core metaphor:** the graph is a living circuit. Selecting a function "lights up" its dependency path like tracing current through a circuit board, with everything else dimmed. This makes the "blast radius" visually obvious instead of just listed in text.

## 2. Visual Identity

**Theme:** Dark mode by default (this is a developer tool — dark canvases make graph edges and highlight colors pop far more than light mode).

**Color palette:**
| Role | Color | Use |
|---|---|---|
| Background | `#0B0D12` (near-black, slightly blue) | Canvas base |
| Surface / panels | `#151821` | Side panels, cards |
| Default node | `#2A2F3C` with `#4B5265` border | Unselected functions |
| Selected node | `#7C3AED` (violet) | The function currently being inspected |
| Direct dependent (1 hop) | `#F59E0B` (amber) | Immediate callers |
| Transitive dependent (2+ hops) | `#F59E0B` at 40% opacity | Fades with distance — visually shows "ripple" |
| Edge (default) | `#3A3F4D` | Calls/imports not on the active path |
| Edge (active path) | `#7C3AED` glowing/animated | The traced dependency chain |
| Text primary | `#E5E7EB` | |
| Text secondary | `#9CA3AF` | |
| Accent / CTA | `#22D3EE` (cyan) | Buttons, search highlight |

**Typography:**
- UI text: **Inter** (clean, standard for dev tools)
- Code/function names: **JetBrains Mono** or **Fira Code** — monospace, reinforces "this is code," and ligatures give it a slightly technical polish.

## 3. Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Top bar: Logo | Repo input/switcher | Search  | ⚙        │
├───────────────┬─────────────────────────────┬───────────┤
│               │                             │           │
│  Left rail:   │      Main canvas            │  Right    │
│  file tree /  │   (graph, pan/zoom,         │  panel:   │
│  function     │    react-flow)              │  selected │
│  list         │                             │  node     │
│  (collapsible)│                             │  details +│
│               │                             │  LLM      │
│               │                             │  explan.  │
├───────────────┴─────────────────────────────┴───────────┘
│  Bottom strip: hop-distance legend, node/edge count       │
└─────────────────────────────────────────────────────────┘
```

- **Left rail:** searchable, collapsible list of all functions grouped by file — an alternate way to select a node besides clicking the graph directly (helps on large graphs where a node might be off-screen).
- **Main canvas:** the react-flow graph. Unselected state shows the full graph in muted tones. On selection, non-relevant nodes/edges dim to ~15% opacity, and the active path animates (a subtle pulsing glow along edges, like current flowing).
- **Right panel:** shows the selected function's name, file, line number, a "Dependents (N)" count, and below it the LLM-generated plain-English explanation in a readable card — not just a dumped list.

## 4. Key Interactions

1. **Hover a node** → tooltip shows function name + file path, edges connected to it brighten slightly (cheap affordance, no API call).
2. **Click a node** → triggers `/impact/{id}` call, canvas re-renders with the "circuit trace" animation, right panel populates.
3. **Search bar** → typing filters the left rail list in real time; selecting a result also pans/zooms the canvas to that node (use react-flow's `fitView` on a specific node).
4. **"Reset view" button** → clears selection, returns graph to default dimmed-nothing state.
5. **Loading state** → while the LLM explanation is being generated, show a skeleton/shimmer in the right panel with a short label like "Tracing impact…" rather than a generic spinner.

## 5. Unique Differentiators (what makes this not-a-generic-dashboard)

- **Circuit/X-ray visual language** instead of the typical flat gray node-link diagram most dependency tools default to.
- **Distance-based fading** (amber intensity drops with hop count) gives an intuitive, at-a-glance sense of "how far" an effect ripples — most tools just show a flat list with no visual sense of proximity.
- **Explanation-as-card, not explanation-as-paragraph-dump** — the right panel is designed like a diagnostic report (function name, dependents count as a badge, then a short synthesized explanation), which reads more like a tool output than an AI chat response.
- **Monospace for code identifiers, sans-serif for everything else** — a small detail, but it visually separates "this is a UI label" from "this is an actual symbol from your code," which most hobby projects skip.

## 6. Empty / Error States

- **No project loaded:** centered illustration-style placeholder (simple SVG circuit board icon) + the repo/path input, so the first screen isn't just a blank canvas.
- **Parse errors:** a small non-blocking toast — "3 files skipped due to syntax errors" — with a clickable link to see which files, rather than failing the whole analysis silently or loudly.
- **No dependents found:** right panel shows "No other functions currently depend on this — safe to modify in isolation," styled as a positive/green state rather than a generic empty state.
