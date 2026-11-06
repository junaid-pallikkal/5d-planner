<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 5D Architect — Agent Directives & Technical Specification

> **System Purpose:** Professional, high-performance, web-based architectural CAD and 3D visualization platform. Combines a precision 2D floor plan editor (Konva.js), real-time synchronized 3D architectural rendering (Three.js / React Three Fiber), local-first offline persistence (IndexedDB / Dexie.js), PostgreSQL/Prisma sync, and professional-grade multi-format export/import pipelines (PDF, SVG, DXF, GLTF/GLB, PNG/JPEG).  
> **Source Specification:** 5D Architect Next.js Professional Development Specification  
> **Target Audience:** AI Agents & Senior Software Engineers contributing to this codebase.

---

## 1. Core Operating Principles

1. **Inspect Before Changing:** Always inspect the repository and understand the existing configuration before editing or creating files. Never blow away working code.
2. **Incremental Delivery & Build Safety:** Build one vertical slice at a time. The dev server and production build (`npm run build`, `npx tsc --noEmit`) must remain green after every milestone.
3. **Verify, Never Guess:** Run TypeScript type checks, ESLint, and Vitest test suites directly. Never claim a task or feature is complete without verifying command output.
4. **Real Functionality, Zero Stubs or Fake Features:**
   - Every visible button, tool, menu item, slider, dialog, and panel must perform its intended architectural function.
   - Absolutely **NO placeholder alerts** (e.g. `alert("Coming soon")`), disabled stubs without implementation, or fake simulations.
   - All built-in architectural features must be completely accessible and functional out of the box with zero paywalls or subscription locks.
5. **Decoupled Geometry Services:**
   - Visual React/Konva/Three.js rendering must remain strictly separated from pure architectural geometry calculations.
   - Geometry logic (wall intersection, room polygon cycle detection, polygon area, snap calculations, coordinate transformations, collision detection) lives in pure TypeScript modules in `src/lib/geometry/` and must be fully unit-tested with Vitest.
6. **Real-Time Bi-Directional 2D/3D Synchronization:**
   - The single source of truth for the building model is the project document store (`project-store`).
   - Any wall moved, room resized, or door repositioned in the 2D canvas must update the document store, immediately reflecting in the 3D scene (walls extrude, openings punch through, textures recalculate) without manual refresh.
7. **Local-First Resilience & Zero Mandatory Paid Services:**
   - The application must be 100% functional offline using IndexedDB via Dexie.js.
   - Autosave changes locally, restore previous projects seamlessly on page refresh, and support full project export/import as JSON.
   - Server persistence via PostgreSQL and Prisma is an additive cloud sync feature, not a blocker for core offline CAD usability.
8. **WebGL & Canvas Memory Management:**
   - Properly dispose Three.js geometries, materials, and textures when objects or scenes are unmounted or regenerated.
   - Use dynamic client-side imports (`next/dynamic` with `ssr: false`) for all canvas and 3D editor components to prevent Server-Side Rendering (SSR) hydration crashes.
9. **Preserve Next.js Agent Rules:** The `<!-- BEGIN:nextjs-agent-rules -->` block at the top of this file is automatically maintained by Next.js tooling. Do not remove or alter it.

---

## 2. Technology Stack & Framework Conventions

| Layer | Technology | Version / Package | Guidelines |
|---|---|---|---|
| **Framework** | Next.js (App Router) | `^15.1.7` | React Server Components by default. Interactive editors and canvas wrappers must be marked `'use client'`. Strictly adhere to Next.js 15 async APIs (`params`, `searchParams`, `cookies()`, `headers()` must be awaited). |
| **Language** | TypeScript | `^5.7.3` | Strict mode enabled (`strict: true`). Zero `any` policy. All entities, geometry types, and store states must have explicit TypeScript interfaces. |
| **Styling** | Tailwind CSS + `tailwindcss-animate` | `^3.4.17` | Clean utility classes, theme variables, architectural CAD dark/light palettes, high-contrast grid lines, and responsive layouts. |
| **UI Components** | shadcn/ui + Radix UI Primitives | `@radix-ui/react-*` | Accessible primitives: Dialog, DropdownMenu, Tooltip, Popover, Tabs, Select, ContextMenu, Slider, Switch, Accordion, ScrollArea. |
| **Icons & Motion** | Lucide React + Motion | `lucide-react`, `motion` | Clean CAD and architectural icons; smooth floating tool dock transitions, dialog reveals, and viewport HUD animations. |
| **Notifications** | Sonner | `sonner` | Toast feedback for project save, export completions, snap toggles, and warnings. |
| **Theming** | `next-themes` | `^0.4.4` | Dark mode (default CAD drafting table aesthetic) and light mode (blueprint / presentation aesthetic). |
| **2D Engine** | Konva.js & `react-konva` | `konva ^9.3.18`, `react-konva ^19.0.3` | Infinite canvas, stage panning/zooming, grid rendering, interactive wall lines, snap indicators, room polygons, dimension strings. |
| **3D Engine** | Three.js & React Three Fiber | `three ^0.173.0`, `@react-three/fiber ^9.0.0`, `@react-three/drei ^10.0.0` | Real-time 3D architectural rendering: wall extrusion with boolean cutouts, floor meshes, PBR materials, shadows, camera controls (Orbit / First-person). |
| **State Management**| Zustand | `^5.0.3` | Granular, decoupled stores (`project-store`, `editor-store`, `selection-store`, `history-store`, etc.) with selector-based subscriptions to prevent unnecessary re-renders. |
| **Local Database** | Dexie.js (IndexedDB) | `dexie ^4.0.11`, `dexie-react-hooks` | Local-first document persistence, project history, autosave drafts, and asset caching. |
| **Cloud Database** | PostgreSQL + Prisma ORM | `prisma ^6.3.1`, `@prisma/client` | Cloud project backup, versioning, shared projects, and catalog asset metadata. |
| **Validation** | Zod | `^3.24.1` | Project document schema validation, import JSON verification, and form field validation. |
| **Forms** | React Hook Form | `react-hook-form ^7.54.2`, `@hookform/resolvers` | Controlled forms for project settings, wall dimensions, material properties, and room tags. |
| **Exports** | jsPDF, FileSaver, Three.js Exporters | `jspdf ^2.5.2`, `file-saver ^2.0.5` | Multi-format export: PDF architectural sheets, DXF CAD files, GLTF/GLB 3D models, SVG vectors, PNG/JPEG renders. |
| **Testing** | Vitest + React Testing Library | `vitest ^3.0.5`, `@testing-library/react` | Fast unit testing of geometry algorithms, store reducers, and serialization logic. |

---

## 3. Project Directory Structure

```text
5d planner/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx                     # Landing page & feature showcase
│   │   │   └── layout.tsx                   # Marketing navigation and footer
│   │   ├── (workspace)/
│   │   │   ├── layout.tsx                   # Workspace shell layout (topbar, project header)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                 # Project manager: local & cloud projects, templates, new project dialog
│   │   │   ├── editor/
│   │   │   │   └── [projectId]/
│   │   │   │       ├── page.tsx             # Main CAD studio: 2D Canvas, 3D Viewport, Split View
│   │   │   │       └── loading.tsx          # Studio loading skeleton
│   │   │   ├── templates/
│   │   │   │   └── page.tsx                 # Pre-built architectural floor plan templates (Studio, 2BHK, Villa, Office)
│   │   │   └── settings/
│   │   │       └── page.tsx                 # CAD preferences (units, grid spacing, graphics quality)
│   │   ├── api/
│   │   │   ├── projects/
│   │   │   │   ├── route.ts                 # List & create cloud projects
│   │   │   │   └── [projectId]/route.ts     # Get, update, delete project document
│   │   │   └── export/
│   │   │       └── route.ts                 # Server-side high-fidelity rendering/export fallbacks
│   │   ├── layout.tsx                       # Root layout (ThemeProvider, Sonner Toaster, Fonts)
│   │   └── globals.css                      # Tailwind theme, CAD canvas styles, CSS variables
│   │
│   ├── components/
│   │   ├── ui/                              # shadcn/ui primitives (button, dialog, slider, tabs, etc.)
│   │   ├── layout/                          # Editor header, top bar, status bar, zoom controls
│   │   ├── shared/                          # Color picker, number inputs with units, confirmation modals
│   │   └── error-boundary.tsx               # WebGL & Canvas error boundaries with fallback recovery
│   │
│   ├── features/
│   │   ├── editor/
│   │   │   ├── components/
│   │   │   │   ├── editor-container.tsx     # Viewport switcher (2D, 3D, Split-screen)
│   │   │   │   ├── editor-topbar.tsx        # Title, Undo/Redo, View mode toggle, Export dropdown, Save status
│   │   │   │   ├── editor-toolbar.tsx       # Tool palette (Select, Wall, Room, Door, Window, Furniture, Dimension, Pan)
│   │   │   │   ├── editor-statusbar.tsx     # Mouse coordinates, active tool, floor elevation, scale, snap indicators
│   │   │   │   └── property-inspector.tsx   # Contextual side panel for selected wall/room/door/furniture
│   │   │   ├── canvas-2d/
│   │   │   │   ├── canvas-stage.tsx         # Konva Stage & Layer management with infinite zoom/pan
│   │   │   │   ├── grid-layer.tsx           # Dynamic metric/imperial CAD grid & origin axes
│   │   │   │   ├── walls-layer.tsx          # Interactive wall segment rendering with thickness
│   │   │   │   ├── rooms-layer.tsx          # Detected room polygons, fills, room tags, and area labels
│   │   │   │   ├── openings-layer.tsx       # Doors (with swing arcs) and Windows embedded in walls
│   │   │   │   ├── furniture-layer.tsx      # Top-down 2D architectural furniture symbols
│   │   │   │   ├── dimensions-layer.tsx     # CAD dimension lines, extents, and measurement annotations
│   │   │   │   └── snapping-overlay.tsx     # Visual snap guide points, alignment guidelines, angle snaps
│   │   │   ├── scene-3d/
│   │   │   │   ├── scene-viewport.tsx       # R3F Canvas container with camera & lighting
│   │   │   │   ├── ground-plane.tsx         # Infinite ground mesh, terrain, outdoor grass/pavement
│   │   │   │   ├── walls-3d.tsx             # Procedural 3D wall meshes with extruded door/window cutouts
│   │   │   │   ├── floors-3d.tsx            # Procedural 3D room floor slabs and ceilings with PBR textures
│   │   │   │   ├── openings-3d.tsx          # 3D Door frames/panels and glass window panes
│   │   │   │   ├── furniture-3d.tsx         # 3D GLB/GLTF furniture model placement & transform gizmos
│   │   │   │   ├── environment-lighting.tsx # Sun light, shadows, ambient environment, interior fixtures
│   │   │   │   └── camera-controller.tsx    # Orbit controls, first-person walkthrough, isometric presets
│   │   │   └── panels/
│   │   │       ├── catalog-panel.tsx        # Furniture & fixture library browser (living, bedroom, kitchen, bath, office)
│   │   │       ├── materials-panel.tsx      # Texture library (hardwood, tiles, concrete, brick, paint, marble)
│   │   │       ├── layers-panel.tsx         # Layer visibility toggles (walls, doors, furniture, dimensions, text)
│   │   │       ├── floors-panel.tsx         # Multi-story level manager (Basement, Ground, First Floor, Roof)
│   │   │       └── export-modal.tsx         # Export configurations for PDF, DXF, GLTF, SVG, PNG
│   │   ├── architecture/
│   │   │   ├── wall-builder.ts              # Interactive wall placement state machine
│   │   │   ├── room-detector.ts             # Planar cycle detection algorithm for enclosed wall loops
│   │   │   ├── opening-manager.ts           # Door/window host-wall binding & opening geometry
│   │   │   └── floor-manager.ts             # Elevation offsets, story heights, ceiling slabs
│   │   ├── furniture/
│   │   │   ├── catalog-data.ts              # Built-in library of architectural furniture & fixtures
│   │   │   └── model-loader.ts              # GLTF/GLB loader with caching and procedural fallbacks
│   │   └── import-export/
│   │       ├── export-pdf.ts                # jsPDF architectural plan sheet generator with scale bar
│   │       ├── export-dxf.ts                # DXF AutoCAD-compatible layer exporter
│   │       ├── export-gltf.ts               # Three.js GLTFExporter integration
│   │       ├── export-svg.ts                # Clean SVG vector exporter
│   │       ├── export-image.ts              # Canvas / WebGL high-resolution PNG/JPEG snapshot
│   │       └── project-serializer.ts        # JSON project document serialization & Zod schema validator
│   │
│   ├── lib/
│   │   ├── geometry/
│   │   │   ├── points.ts                    # 2D/3D vector math, distances, angles, projections
│   │   │   ├── lines.ts                     # Line intersections, perpendicular offsets, segment clipping
│   │   │   ├── polygons.ts                  # Shoelace formula for area, point-in-polygon, centroid
│   │   │   ├── snapping.ts                  # Grid snap, endpoint snap, midpoint snap, perpendicular snap
│   │   │   ├── wall-mesh-builder.ts         # Three.js BufferGeometry generation with opening boolean cutouts
│   │   │   └── units.ts                     # Millimeters, meters, centimeters, feet-inches converters
│   │   ├── storage/
│   │   │   ├── dexie-db.ts                  # Dexie.js IndexedDB database configuration
│   │   │   └── autosave-manager.ts          # Debounced local saving & change detection
│   │   ├── database/
│   │   │   └── prisma.ts                    # PrismaClient singleton instance
│   │   ├── validations/
│   │   │   └── project-schema.ts            # Complete Zod schema for 5D Architect project document
│   │   └── utils.ts                         # cn utility, formatting helpers, unique ID generator
│   │
│   ├── stores/
│   │   ├── project-store.ts                 # Authoritative document model (walls, rooms, openings, items)
│   │   ├── editor-store.ts                  # Active tool, view mode (2D/3D/Split), grid & snap toggles
│   │   ├── selection-store.ts               # Selected element ID(s), selection type, active gizmo
│   │   ├── history-store.ts                 # Undo / Redo command stack with snapshot manager
│   │   ├── floor-store.ts                   # Multi-story levels, active floor elevation & height
│   │   ├── furniture-store.ts               # Catalog state, search query, selected asset preset
│   │   ├── material-store.ts                # Material library, selected texture, surface application
│   │   ├── camera-store.ts                  # 2D zoom/pan offset & 3D camera position/fov/mode
│   │   └── ui-store.ts                      # Side panels open/closed, active tab, modal dialog states
│   │
│   ├── types/
│   │   ├── project.ts                       # Complete ProjectDocument, Metadata, Settings interfaces
│   │   ├── architecture.ts                  # Wall, Room, Door, Window, FloorLevel types
│   │   ├── furniture.ts                     # CatalogItem, PlacedItem, Transform3D types
│   │   ├── material.ts                      # MaterialDef, TextureMap, PBRProperties types
│   │   └── editor.ts                        # ToolType, ViewMode, SnapSettings, SnapResult types
│   │
│   └── constants/
│       ├── default-project.ts               # Clean starter architectural project template
│       ├── cad-defaults.ts                  # Default wall thickness (200mm), ceiling height (2800mm), grid size
│       └── material-presets.ts              # Default PBR material definitions (wood, tile, plaster, glass)
│
├── prisma/
│   └── schema.prisma                        # PostgreSQL schema for cloud backup & user accounts
├── public/
│   ├── assets/
│   │   ├── models/                          # Default low-poly GLTF furniture assets
│   │   ├── textures/                        # Seamless PBR textures (diffuse, normal, roughness)
│   │   └── templates/                       # Architectural floor plan thumbnail previews
├── tests/
│   ├── geometry/
│   │   ├── snapping.test.ts                 # Tests for endpoint, midpoint, and angle snapping
│   │   ├── polygons.test.ts                 # Tests for room cycle detection and area calculations
│   │   └── lines.test.ts                    # Tests for wall intersections and segment splits
│   ├── stores/
│   │   └── project-store.test.ts            # Tests for wall creation, deletion, and undo/redo
│   └── serialization/
│       └── project-schema.test.ts           # Tests for project JSON validation & backwards compatibility
├── package.json
├── tsconfig.json
└── README.md
```

---

## 4. Architectural Document Model & Schema

All spatial elements use an internal precision standard of **millimeters (mm)** stored as floating-point numbers in a cartesian coordinate system:
- **2D Canvas Plane:** $X$ = Horizontal axis (left-to-right), $Y$ = Vertical axis (top-to-bottom or CAD cartesian).
- **3D World Space:** $X$ = Width, $Y$ = Vertical height (Elevation / Ceiling), $Z$ = Depth ($1\text{m} = 1000\text{mm}$).

### Core TypeScript Entities (`src/types/`)

```typescript
export interface Point2D {
  x: number; // in millimeters
  y: number; // in millimeters
}

export interface Wall {
  id: string;
  floorId: string;
  start: Point2D;
  end: Point2D;
  thickness: number; // e.g. 200 mm for exterior, 100 mm for interior
  height: number;    // e.g. 2800 mm
  materialId?: string;
  interiorMaterialId?: string;
  exteriorMaterialId?: string;
}

export interface Opening {
  id: string;
  wallId: string;
  type: 'DOOR' | 'WINDOW' | 'OPENING';
  offset: number;     // Distance from wall.start in mm
  width: number;      // e.g. 900 mm for door, 1200 mm for window
  height: number;     // e.g. 2100 mm for door, 1400 mm for window
  elevation: number;  // Distance above floor level (0 for doors, 900 mm for windows)
  hingeSide?: 'LEFT' | 'RIGHT';
  swingDirection?: 'INWARD' | 'OUTWARD';
  style?: string;     // Single door, double door, sliding, casement
}

export interface Room {
  id: string;
  floorId: string;
  name: string;       // e.g. "Living Room", "Master Bedroom", "Kitchen"
  type: 'LIVING' | 'BEDROOM' | 'KITCHEN' | 'BATHROOM' | 'OFFICE' | 'BALCONY' | 'CORRIDOR' | 'CUSTOM';
  boundaryWallIds: string[];
  polygon: Point2D[]; // Ordered polygon vertices in mm
  areaSqMeters: number;
  areaSqFeet: number;
  floorMaterialId: string;
  ceilingMaterialId?: string;
}

export interface PlacedFurniture {
  id: string;
  floorId: string;
  catalogItemId: string;
  name: string;
  position: { x: number; y: number; z: number }; // x, z on floor; y elevation in mm
  rotation: { x: number; y: number; z: number }; // Euler angles in degrees
  scale: { x: number; y: number; z: number };    // Scale multiplier (1.0 default)
  dimensions: { width: number; depth: number; height: number }; // in mm
  materialOverrides?: Record<string, string>;
}

export interface FloorLevel {
  id: string;
  name: string;        // "Ground Floor", "Level 1", etc.
  levelIndex: number;  // 0, 1, 2...
  elevation: number;   // Height from ground datum (0 mm, 3000 mm, etc.)
  height: number;      // Story height (e.g. 3000 mm)
  slabThickness: number; // e.g. 200 mm
}

export interface ProjectSettings {
  unit: 'METRIC_M' | 'METRIC_MM' | 'IMPERIAL_FT';
  gridSize: number;       // e.g. 100 mm or 500 mm
  gridSnap: boolean;
  angleSnap: boolean;     // 15°, 45°, 90° snaps
  objectSnap: boolean;    // Snap to endpoints, midpoints, perpendiculars
  wallSnapTolerance: number; // Snap distance in pixels (e.g. 15px)
  defaultWallThickness: number;
  defaultWallHeight: number;
}

export interface ProjectDocument {
  id: string;
  title: string;
  description?: string;
  version: number;
  schemaVersion: '1.0.0';
  createdAt: string;
  updatedAt: string;
  settings: ProjectSettings;
  floors: FloorLevel[];
  activeFloorId: string;
  walls: Wall[];
  openings: Opening[];
  rooms: Room[];
  furniture: PlacedFurniture[];
  materials: MaterialDef[];
}
```

---

## 5. 2D Design Engine Specifications (Konva.js)

### Canvas Architecture & Coordinates
1. **Virtual Stage Navigation:**
   - Implement infinite pan with Middle Mouse Button drag or `Space + Left Mouse Drag`.
   - Implement smooth zoom centered on mouse cursor with Mouse Wheel (`0.1x` to `20.0x` zoom range).
   - Display a dynamic visual CAD grid that automatically sub-divides into minor (100mm) and major (1000mm) lines as zoom changes.
2. **Interactive Wall Tool:**
   - Click to start wall point $P_1$, mouse move to preview wall with live dimension tag, click to set $P_2$.
   - Continuous chain drawing: $P_2$ automatically becomes start of next segment until `Escape` or double-click.
   - Live snapping: Snaps to existing wall endpoints, wall midpoints, grid intersections, and ortho angles (0°, 45°, 90°).
   - When a new wall terminates on an existing wall line, compute the intersection and split the target wall cleanly.
3. **Automated Room Detection (Cycle Detection):**
   - Automatically find all minimal closed planar cycles formed by intersecting wall segments using planar graph cycle detection.
   - For every closed loop found:
     - Compute polygon area using the Shoelace formula:
       $$\text{Area} = \frac{1}{2} \left| \sum_{i=0}^{n-1} (x_i y_{i+1} - x_{i+1} y_i) \right|$$
     - Convert $\text{mm}^2$ to $\text{m}^2$ ($\div 1,000,000$) and $\text{sq\ ft}$ ($\times 10.7639$).
     - Calculate visual centroid for room label positioning.
     - Allow user to name rooms, change room category, and assign floor materials.
4. **Door & Window Placement:**
   - Doors and windows must automatically snap and bind to the nearest wall segment when hovered over a wall.
   - Compute relative distance `offset` from wall start point $P_1$.
   - Restrict placement so opening extent (`offset` to `offset + width`) does not exceed wall length.
   - Render 2D architectural door swings with 90° arc paths and flip controls for swing direction (inward/outward, left/right).
   - Render windows with standard architectural triple-line CAD symbols.
5. **Architectural Annotations & Dimensions:**
   - Automatic dimension strings on all selected walls showing clear, legible dimension numbers.
   - Dimension extension lines, ticks, and arrows complying with architectural drawing standards.
   - Dimension values dynamically format according to project unit settings (e.g. `4.25 m`, `4250 mm`, or `13' - 11"`).

---

## 6. 3D Architectural Engine Specifications (Three.js / R3F)

### Procedural Geometry Generation
1. **Real 3D Wall Generation with Openings:**
   - Never use simple rectangular boxes that clip through doors and windows.
   - For each wall containing doors or windows:
     - Generate extruded wall geometry using Three.js `Shape` and `ExtrudeGeometry`, or split into segmented vertical/horizontal wall panels around openings:
       - Bottom panel (under window sill: from $y = 0$ to $y = \text{elevation}$)
       - Top lintel panel (above opening: from $y = \text{elevation} + \text{height}$ to $y = \text{wallHeight}$)
       - Side jamb panels (flanking the left and right sides of the opening)
     - Maintain crisp mitered or capped corner joints where intersecting walls meet.
2. **Floor & Ceiling Slabs:**
   - Construct Three.js `ShapeGeometry` from the 2D room boundary polygon coordinates.
   - Apply automatic UV coordinates mapped to real-world scale (e.g. 1 texture repeat = 1000mm) so materials do not stretch across different room dimensions.
   - Support independent floor and ceiling slab thicknesses with PBR material shaders.
3. **Lighting & Shadows:**
   - Realistic directional sunlight with high-resolution shadow mapping (`mapSize: 2048x2048`, soft shadows).
   - Hemispheric ambient sky/ground light for balanced ambient lighting without black shadow blowouts.
   - Interior ceiling lights and spot lights toggleable for day/night presentation modes.
4. **Camera Controls & Navigation Modes:**
   - **Orbit Mode:** Smooth orbital rotation, pan, and zoom around the building centroid for presentation overviews.
   - **First-Person Walkthrough Mode:** WASD / Arrow keys for walking navigation, mouse look, collision with floor datum, and eye-level height fixed at 1650 mm.
   - **Isometric Presets:** Instant camera buttons for Top (Plan), North, South, East, West elevations.
5. **Lifecycle & Memory Management:**
   - Always call `.dispose()` on unused `BufferGeometry`, `Material`, and `Texture` instances.
   - Use dynamic client-side loading:
     ```typescript
     const Scene3D = dynamic(() => import('@/features/editor/scene-3d/scene-viewport'), {
       ssr: false,
       loading: () => <EditorLoadingSkeleton />
     });
     ```

---

## 7. State Management Architecture (Zustand)

State must be divided into dedicated, single-responsibility stores located in `src/stores/`:

### Store Breakdown

| Store Name | Responsibility | Key State & Actions |
|---|---|---|
| `project-store` | Single source of truth for building document | `project: ProjectDocument`, `addWall()`, `updateWall()`, `deleteWall()`, `addOpening()`, `updateOpening()`, `deleteOpening()`, `setRooms()`, `addFurniture()`, `updateFurniture()`, `loadProject()`, `resetProject()`. |
| `editor-store` | CAD tool state & viewport controls | `activeTool: ToolType`, `viewMode: '2D' \| '3D' \| 'SPLIT'`, `snapSettings: SnapSettings`, `showGrid: boolean`, `showDimensions: boolean`, `unit: UnitType`, `setActiveTool()`, `setViewMode()`, `toggleSnap()`. |
| `selection-store`| Selected entities & transform state | `selectedIds: string[]`, `selectedType: 'WALL' \| 'ROOM' \| 'OPENING' \| 'FURNITURE' \| null`, `select()`, `deselect()`, `clearSelection()`. |
| `history-store` | Command pattern Undo / Redo engine | `past: ProjectSnapshot[]`, `future: ProjectSnapshot[]`, `undo()`, `redo()`, `pushState()`, `canUndo`, `canRedo`. |
| `floor-store` | Multi-story building levels | `floors: FloorLevel[]`, `activeFloorId: string`, `addFloor()`, `setActiveFloor()`, `updateFloorHeight()`. |
| `furniture-store`| Catalog items, filters, and drag-drop | `catalog: CatalogItem[]`, `selectedCategory: string`, `searchQuery: string`, `activeItemToPlace: CatalogItem \| null`. |
| `material-store` | PBR material definitions & active swatch | `materials: MaterialDef[]`, `activeMaterialId: string`, `assignMaterialToSurface()`. |
| `camera-store` | Viewport transformation coordinates | `zoom: number`, `panOffset: Point2D`, `camera3DPosition: Vector3`, `cameraMode: 'ORBIT' \| 'FPS'`. |
| `ui-store` | Editor side panels & dialog states | `isLeftSidebarOpen: boolean`, `isRightInspectorOpen: boolean`, `activeTab: string`, `exportModalOpen: boolean`, `newProjectModalOpen: boolean`. |

### History & Undo/Redo Engine
- Snapshot the document model before any destructive or structural mutation (wall split, deletion, repositioning).
- Keep a maximum of 50 history steps to balance deep undo capability with memory efficiency.
- Support standard keybindings: `Ctrl+Z` (Undo), `Ctrl+Y` / `Ctrl+Shift+Z` (Redo).

---

## 8. Local-First Persistence & Storage Architecture

### Dexie.js (IndexedDB) Schema (`src/lib/storage/dexie-db.ts`)

```typescript
import Dexie, { type Table } from 'dexie';
import type { ProjectDocument } from '@/types/project';

export interface LocalProjectRecord {
  id: string;
  title: string;
  updatedAt: string;
  document: ProjectDocument;
  thumbnailDataUrl?: string;
}

export class FiveDArchitectDatabase extends Dexie {
  projects!: Table<LocalProjectRecord, string>;
  projectSnapshots!: Table<{ id: string; projectId: string; timestamp: number; data: string }, string>;

  constructor() {
    super('FiveDArchitectDB');
    this.version(1).stores({
      projects: 'id, title, updatedAt',
      projectSnapshots: 'id, projectId, timestamp',
    });
  }
}

export const db = new FiveDArchitectDatabase();
```

### Autosave Strategy
- Debounce local IndexedDB writes by **1000ms** after every user edit.
- Display a non-intrusive indicator in the top bar: `All changes saved locally` or `Saving...`.
- If an unexpected browser crash or refresh occurs, the editor immediately reloads the active project from IndexedDB without data loss.

---

## 9. File Import & Export Pipeline

The application must support the following production-grade export formats:

1. **PDF Architectural Sheet (`export-pdf.ts`):**
   - Uses `jspdf`.
   - Generates an A3 or A4 landscape architectural plan sheet.
   - Includes: Professional title block (Project Title, Date, Scale, Sheet Number), north arrow, legend, dimensioned 2D floor plan drawing, and room schedule table with areas ($m^2$ and $sq\ ft$).
2. **AutoCAD DXF Exporter (`export-dxf.ts`):**
   - Generates standard ASCII DXF format compatible with AutoCAD, Rhino, and Revit.
   - Organized into clean CAD layers: `WALLS`, `DOORS`, `WINDOWS`, `ROOMS`, `FURNITURE`, `DIMENSIONS`.
3. **3D GLTF / GLB Exporter (`export-gltf.ts`):**
   - Exports the live 3D Three.js scene (walls, floors, furniture, materials) via Three.js `GLTFExporter`.
   - Supports opening directly in Blender, Unity, Unreal Engine, or web 3D viewers.
4. **Scalable Vector Graphics (SVG) (`export-svg.ts`):**
   - Clean vector graphic export with stroked wall outlines, hatch fills for walls, and crisp text annotations.
5. **High-Resolution PNG / JPEG Render:**
   - 2D canvas export via Konva's `stage.toDataURL({ pixelRatio: 3 })`.
   - 3D render snapshot via Three.js WebGL canvas capture with anti-aliasing.
6. **Project JSON Backup:**
   - Complete serialized `ProjectDocument` with schema versioning.
   - Full drag-and-drop JSON project restoration with strict Zod validation.

---

## 10. UI/UX Design System Guidelines

1. **Aesthetic Direction:**
   - Professional architectural CAD workstation aesthetic.
   - Dark theme workspace background (`#0f172a` slate / `#121316` neutral) that highlights blueprint vectors and prevents eye fatigue.
   - Light theme workspace with crisp engineering grid and blueprint lines.
   - Minimalist toolbars with subtle translucent borders (`border-border/40 backdrop-blur-md`).
2. **Floating CAD Tool Dock:**
   - Top-center or left-docked quick-access tool palette with active state highlights and keyboard shortcut tooltips.
   - Tooltips on every tool displaying name and shortcut (e.g. `Wall Tool (W)`, `Select Tool (V)`, `Door Tool (D)`).
3. **CAD Keyboard Shortcuts:**
   - `V` or `Escape`: Select / Transform Tool
   - `W`: Wall Drawing Tool
   - `D`: Door Tool
   - `N`: Window Tool
   - `F`: Furniture Catalog Panel
   - `M`: Material Swatches Panel
   - `R`: Room Tool
   - `Space + Drag`: Pan Viewport
   - `Ctrl + Z`: Undo
   - `Ctrl + Shift + Z` / `Ctrl + Y`: Redo
   - `Delete` / `Backspace`: Delete Selected Entity
   - `Tab`: Switch View Mode (2D / 3D / Split)
   - `1` / `2` / `3`: Top / 3D Perspective / Split View

---

## 11. Phased Implementation Roadmap

When building or expanding 5D Architect, execute in strict sequence through these phases:

```text
[Phase 1: Project Foundation & CAD Shell]
   │
   ▼
[Phase 2: 2D Geometry Engine & Floor Plan Canvas]
   │
   ▼
[Phase 3: 3D Architectural Scene & Procedural Generation]
   │
   ▼
[Phase 4: Real-Time 2D/3D Synchronization]
   │
   ▼
[Phase 5: Furniture Catalog & PBR Materials]
   │
   ▼
[Phase 6: Multi-Story Levels & Architectural Tools]
   │
   ▼
[Phase 7: Multi-Format Export & Project Import]
   │
   ▼
[Phase 8: Polish, Test Coverage, Performance & Verification]
```

### Phase Details:
- **Phase 1 (Foundation):** Setup types, Zustand stores, Dexie IndexedDB database, CAD top bar, status bar, and workspace layout.
- **Phase 2 (2D Canvas):** Konva stage, infinite pan/zoom, grid, wall drawing state machine, snapping, room cycle detection, area calculations, door/window 2D placements.
- **Phase 3 (3D Engine):** Three.js scene, camera controls (orbit/walkthrough), procedural wall extrusion with opening cutouts, floor slab geometry, PBR lighting and shadows.
- **Phase 4 (Synchronization):** Wire 2D canvas edits directly into the shared project store; ensure immediate procedural re-generation in the 3D scene without stutter.
- **Phase 5 (Assets & Materials):** Furniture placement (2D symbol + 3D GLTF), material swatches (wood, tile, concrete, glass), surface assignment.
- **Phase 6 (Multi-Story):** Floor level manager (Ground, First, Roof), ceiling slabs, floor elevation offsetting.
- **Phase 7 (Exports & Serialization):** PDF architectural sheet generation, DXF exporter, GLTF/GLB download, JSON backup/restore, PNG snapshots.
- **Phase 8 (Verification):** Vitest test suite for geometry and store reducers, TypeScript zero-error verification, production build verification (`npm run build`).

---

## 12. Verification & Quality Commands

Always run and verify these commands before marking any architectural milestone complete:

```bash
# 1. Typecheck the entire project with strict compiler settings
npx tsc --noEmit

# 2. Run unit and integration tests (geometry, stores, schemas)
npm run test

# 3. Run ESLint to catch syntax and styling issues
npm run lint

# 4. Verify Next.js production build succeeds with no SSR hydration failures
npm run build
```
