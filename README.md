# 5D Architect

> **Production-Quality Architectural CAD & 3D BIM Platform**  
> Precision 2D floor plan editor, real-time parametric 3D BIM engine, local-first offline persistence (IndexedDB), and multi-format industry exports.

---

## Highlights

- **2D Architectural Drafting Engine**: Infinite canvas (Konva.js), metric & imperial hairline rulers, magnetic snapping (grid, endpoints, midpoints, angles), continuous wall drawing with thickness, door swing arcs, window glazing, top-down furniture symbols, and CAD dimension witness lines.
- **Independent Geometry Services**: Pure TypeScript geometry modules for wall intersections, planar graph room cycle detection (left-turn rule), Shoelace polygon area calculation, and coordinate transformations.
- **Real-Time 3D BIM Engine**: Powered by Three.js & React Three Fiber. Walls parametrically split to form physical 3D cutouts for doors and windows. Real floor slabs with PBR materials, procedural furniture assemblies, 3D transform gizmos, and multi-floor level stacking.
- **Heliodon Solar Study**: Directional sun light parameterized with live azimuth (0°–360°) and altitude (10°–85°) angles for architectural solar and shadow simulations.
- **Multiple Camera Projections**: Smooth orbit camera with damping, top-down orthographic view, axonometric isometric projection, and first-person walkthrough at eye level (1.65m) with WASD movement.
- **Local-First & 100% Free**: IndexedDB via Dexie.js for offline project storage with debounced autosaving, zero paywalls, zero subscriptions, and complete project export/import (`.5darch` / JSON).
- **Universal Multi-Format Export**:
  - **AutoCAD DXF**: Standard R12 ASCII layered DXF (`WALLS`, `DOORS`, `WINDOWS`, `DIMENSIONS`, `ROOMS`).
  - **PDF Blueprint**: Professional landscape A4 architectural sheet with title block and room schedule.
  - **Scalable SVG**: Vector 2D floor plan with styles and dimensions.
  - **3D GLTF / GLB**: Binary 3D BIM model for Blender, Unreal Engine, Revit, or Rhino.
- **Architectural AI Copilot**: Instant BIM quantity audit (gross wall length, usable area, glazing ratio) and parametric generative extensions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, React 19) |
| **Language** | TypeScript (Strict mode enabled) |
| **Styling** | Tailwind CSS, Custom Obsidian Dark & Blueprint Light theme |
| **2D Engine** | Konva.js & `react-konva` |
| **3D Engine** | Three.js, `@react-three/fiber`, `@react-three/drei` |
| **State** | Zustand (with selectors and undo/redo snapshots) |
| **Storage** | Dexie.js (IndexedDB) for local-first persistence |
| **Database** | PostgreSQL & Prisma ORM for cloud backup |
| **Validation**| Zod schema validation |
| **Testing** | Vitest (Geometry, serialization, and state test suites) |

---

## Keyboard Shortcuts

| Key | Function |
|---|---|
| `V` | Select / Move tool |
| `H` | Pan canvas |
| `W` | Draw Wall |
| `Shift + W` | Insert Window |
| `D` | Insert Door |
| `M` | Add CAD Dimension line |
| `Shift + M` | Measure distance & angles |
| `F` | Toggle Furniture Catalog |
| `T` | Toggle Materials & PBR Textures |
| `Ctrl + Z` | Undo last action |
| `Ctrl + Y` | Redo action |
| `ESC` | Cancel active drafting / Deselect |
| `Scroll Wheel` | Smooth zoom centered on cursor |
| `Middle Click` | Pan canvas |
