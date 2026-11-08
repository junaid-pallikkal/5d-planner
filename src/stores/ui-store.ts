import { create } from 'zustand';

export type ActivePanel =
  | 'catalog'
  | 'properties'
  | 'materials'
  | 'roof'
  | 'layers'
  | 'settings'
  | 'ai'
  | 'lighting'
  | null;

interface UIState {
  activePanel: ActivePanel;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  exportModalOpen: boolean;
  importModalOpen: boolean;
  newProjectModalOpen: boolean;
  aiModalOpen: boolean;
  shortcutsModalOpen: boolean;

  setActivePanel: (panel: ActivePanel) => void;
  togglePanel: (panel: ActivePanel) => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setImportModalOpen: (open: boolean) => void;
  setNewProjectModalOpen: (open: boolean) => void;
  setAiModalOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activePanel: 'catalog',
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  exportModalOpen: false,
  importModalOpen: false,
  newProjectModalOpen: false,
  aiModalOpen: false,
  shortcutsModalOpen: false,

  setActivePanel: (activePanel) =>
    set({
      activePanel,
      rightSidebarOpen: activePanel !== null,
    }),

  togglePanel: (panel) =>
    set((state) => {
      if (state.activePanel === panel && state.rightSidebarOpen) {
        return { rightSidebarOpen: false, activePanel: null };
      }
      return { activePanel: panel, rightSidebarOpen: true };
    }),

  setLeftSidebarOpen: (leftSidebarOpen) => set({ leftSidebarOpen }),
  setRightSidebarOpen: (rightSidebarOpen) => set({ rightSidebarOpen }),
  setExportModalOpen: (exportModalOpen) => set({ exportModalOpen }),
  setImportModalOpen: (importModalOpen) => set({ importModalOpen }),
  setNewProjectModalOpen: (newProjectModalOpen) => set({ newProjectModalOpen }),
  setAiModalOpen: (aiModalOpen) => set({ aiModalOpen }),
  setShortcutsModalOpen: (shortcutsModalOpen) => set({ shortcutsModalOpen }),
}));
