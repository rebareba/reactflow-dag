# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install (uses pnpm workspace)
pnpm install

# Dev server on port 3333 (serves example/ app with HMR)
pnpm start

# Production build → dist/ (TypeScript declarations + Webpack UMD bundle)
pnpm build

# Lint and auto-fix
pnpm lint
pnpm fix
```

There is no test suite (the `test` script is a stub). The build outputs type declarations via `tsc --emitDeclarationOnly` and a UMD library bundle (`ReactflowDag`) via Webpack — peer dependencies (react, react-dom, antd, ahooks, @ant-design/icons, react-router-dom) are externalized in the production bundle.

Commit messages follow conventional commits (`commitlint` with `@commitlint/config-conventional`), enforced via Husky.

## Architecture

This is a **React Flow v11 wrapper** that provides a data-driven DAG (directed acyclic graph) component for business flow visualizations. It is published as an npm library.

**Entry point** (`src/index.ts`):
- Default export: `DagFlow` component
- Named exports: `ELEMENT_TYPES`, `LAYOUT_DIRECTION`, `NODE_STATUS`, `STATUS_COLORS` (from constants), plus everything from `dagUtils`

**Core component** — `src/components/DagFlow.tsx`:
- Exposed via `forwardRef`; the imperative handle provides `getNodes()`, `getLinks()`, `fitView()`, `zoomIn()`, `zoomOut()`, `clearPositionCache()`, `expandNode(id)`, `unexpandNode(id)`
- Accepts data in two forms: raw arrays (`initialNodes`/`initialEdges`) or business-data arrays (`nodeList`/`links`) paired with `nodeParse`/`linkParse` transform callbacks
- On data changes, auto-layouts nodes using `dagre` via `getLayoutedElements()` — but only when graph structure (node count or hidden state) actually changes
- Persists manual node positions to `localStorage` keyed by `flowId`; position cache is preferred over dagre layout on re-render when the graph structure hasn't changed
- Wires up edge reconnect: if a connection is re-dragged but not connected to a new target, the edge is removed
- Supports `running` mode (nodes non-draggable, delete key disabled), drag-and-drop onto the canvas, and custom `buildMenu` for per-node dropdown menus
- Node selection: debounced click fires `onNodeSelect`, double-click cancels the debounce and fires `onDoubleClick`. `canUnSelectNode` controls whether clicking the pane deselects

**Custom node** — `src/components/CustomNode.tsx` (`type: 'statusNode'`):
- Renders icon area (with status-based background color), label, optional subtitle (`data.type`), `innerTipList` badges, and a dropdown `MoreOutlined` menu built via the `buildMenu` callback
- Status colors defined in constants map to border color; `NODE_STATUS.RUNNING` triggers a dashed SVG border animation
- Handles are position-aware (Top/Bottom/Left/Right) and distributed evenly across the edge; multiple source/target anchors supported via `data.sourceAnchors` / `data.targetAnchors`

**Custom edge** — `src/components/CustomEdge.tsx` (`type: 'editable'`):
- Renders a bezier edge with a delete button (`CloseCircleOutlined`) that appears on hover when `data.showDelete` is true
- Delete callback invokes the parent's edge removal logic (which may prompt an async confirmation via `onConnectionRemove`)

**Layout engine** — `src/components/dagUtils.ts`:
- `getLayoutedElements(nodes, edges, options, getPositionCache)`: runs dagre layout on visible (non-hidden) nodes, dynamically calculates node width from label text using a Canvas measurement, respects position cache and manual positions
- `getDescendants(nodeId, nodes, edges)`: recursively collects downstream node and edge IDs for expand/collapse
- `isGraphStructureChanged(prevNodes, nextNodes)`: compares node count and hidden state to decide whether to re-layout

**Constants** (`src/constants.ts`):
- `LAYOUT_DIRECTION`: `LR` (left-to-right) and `TB` (top-to-bottom)
- `LAYOUT_DEFAULTS`: default flow ID, direction, node dimensions, rank/node separation, background gap
- `ELEMENT_TYPES`: ReactFlow node/edge type identifiers
- `NODE_STATUS` + `STATUS_COLORS`: seven states (TO_CONFIG, CONFIGURED, RUNNING, SUCCESS, FAILED, DEFAULT, IDLE) mapped to colors
- `ACTIVE_STYLE` / `DEFAULT_STYLE`: edge highlight animation styles

**Build system** (`webpack.config.js`):
- **Dev mode** (`NODE_ENV !== 'production'`): entry is `example/index.tsx`, serves via webpack-dev-server with HMR and HtmlWebpackPlugin
- **Prod mode**: entry is `src/index.ts`, outputs UMD library (`ReactflowDag`) to `dist/`, externalizes all peer dependencies, extracts CSS via `mini-css-extract-plugin`
- TypeScript handled via `thread-loader` → `babel-loader` chain (not ts-loader); Babel uses `@babel/preset-typescript`
- CSS pipeline: `css-loader` (with CSS Modules auto-detection via `.module.css`) → `postcss-loader` (Tailwind + autoprefixer); dev uses `style-loader`, prod uses `MiniCssExtractPlugin.loader`

**Styling**: Tailwind (with `preflight: false` to avoid clashing with the host app's base styles) + hand-authored CSS in `DagFlow.css`. Naming convention uses BEM-like classes (`.custom-node-wrapper`, `.node-icon-area`, etc.).
