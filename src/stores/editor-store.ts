import { create } from 'zustand';
import { ToolMode, ViewMode } from '@/types/editor';
import { CatalogAsset } from '@/constants/furniture-catalog';
import { DoorType, WindowType } from '@/types/project';
import { Point2D } from '@/types/geometry';

interface EditorState {
  tool: ToolMode;
  viewMode: ViewMode;
  selectedAsset: CatalogAsset | null;
  selectedDoorType: DoorType;
  selectedWindowType: WindowType;

  // 2D Viewport Pan & Zoom
  pan: Point2D;
  zoom: number; // 1.0 = 100%

  // Drawing state
  wallDraftStart: Point2D | null;
  wallDraftCurrent: Point2D | null;
  measureDraftStart: Point2D | null;
  measureDraftEnd: Point2D | null;

  // Actions
  setTool: (tool: ToolMode) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedAsset: (asset: CatalogAsset | null) => void;
  setSelectedDoorType: (type: DoorType) => void;
  setSelectedWindowType: (type: WindowType) => void;
  setPan: (pan: Point2D) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  setWallDraft: (start: Point2D | null, current: Point2D | null) => void;
  setMeasureDraft: (start: Point2D | null, end: Point2D | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  tool: 'select',
  viewMode: 'split',
  selectedAsset: null,
  selectedDoorType: 'single',
  selectedWindowType: 'sliding',

  pan: { x: 300, y: 250 },
  zoom: 1.0,

  wallDraftStart: null,
  wallDraftCurrent: null,
  measureDraftStart: null,
  measureDraftEnd: null,

  setTool: (tool) => set({ tool }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedAsset: (selectedAsset) => set({ selectedAsset, tool: 'furniture' }),
  setSelectedDoorType: (selectedDoorType) => set({ selectedDoorType, tool: 'door' }),
  setSelectedWindowType: (selectedWindowType) => set({ selectedWindowType, tool: 'window' }),

  setPan: (pan) => set({ pan }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(zoom, 5.0)) }),
  zoomIn: () => set((state) => ({ zoom: Math.min(state.zoom * 1.2, 5.0) })),
  zoomOut: () => set((state) => ({ zoom: Math.max(state.zoom / 1.2, 0.1) })),
  resetView: () => set({ pan: { x: 300, y: 250 }, zoom: 1.0 }),

  setWallDraft: (start, current) => set({ wallDraftStart: start, wallDraftCurrent: current }),
  setMeasureDraft: (start, end) => set({ measureDraftStart: start, measureDraftEnd: end }),
}));
