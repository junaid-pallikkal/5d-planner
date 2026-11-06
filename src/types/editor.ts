import { Point2D } from './geometry';

export type ToolMode =
  | 'select'
  | 'pan'
  | 'wall'
  | 'door'
  | 'window'
  | 'room'
  | 'furniture'
  | 'dimension'
  | 'measure'
  | 'material_picker'
  | 'eraser';

export type ViewMode = '2d' | '3d' | 'split';

export type SelectionType = 'wall' | 'door' | 'window' | 'room' | 'furniture' | 'dimension' | 'roof' | 'light' | null;

export interface SelectionItem {
  id: string;
  type: SelectionType;
}

export interface TransformGizmoState {
  isDragging: boolean;
  isRotating: boolean;
  isResizing: boolean;
  handle: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | 'rot' | null;
  startPoint: Point2D | null;
}

export interface HistoryCommand {
  id: string;
  description: string;
  timestamp: number;
  undo: () => void;
  redo: () => void;
}
