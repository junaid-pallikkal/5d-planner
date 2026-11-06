import { create } from 'zustand';
import { ProjectDocument } from '@/types/project';

interface HistoryState {
  past: ProjectDocument[];
  future: ProjectDocument[];
  pushSnapshot: (doc: ProjectDocument) => void;
  undo: (current: ProjectDocument) => ProjectDocument | null;
  redo: (current: ProjectDocument) => ProjectDocument | null;
  clearHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const MAX_HISTORY = 30;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  pushSnapshot: (doc: ProjectDocument) => {
    // Deep clone to prevent accidental mutations
    const clone = JSON.parse(JSON.stringify(doc)) as ProjectDocument;
    set((state) => {
      const updatedPast = [...state.past, clone].slice(-MAX_HISTORY);
      return {
        past: updatedPast,
        future: [], // clear redo stack on new action
        canUndo: true,
        canRedo: false,
      };
    });
  },

  undo: (current: ProjectDocument) => {
    const { past, future } = get();
    if (past.length === 0) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const newFuture = [JSON.parse(JSON.stringify(current)), ...future].slice(0, MAX_HISTORY);

    set({
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: true,
    });

    return previous;
  },

  redo: (current: ProjectDocument) => {
    const { past, future } = get();
    if (future.length === 0) return null;

    const next = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past, JSON.parse(JSON.stringify(current))].slice(-MAX_HISTORY);

    set({
      past: newPast,
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });

    return next;
  },

  clearHistory: () => {
    set({ past: [], future: [], canUndo: false, canRedo: false });
  },
}));
