import { create } from 'zustand';
import { SelectionType, SelectionItem } from '@/types/editor';

interface SelectionState {
  selectedItems: SelectionItem[];
  selectedType: SelectionType;
  primaryId: string | null;

  select: (id: string, type: SelectionType, multi?: boolean) => void;
  deselect: (id: string) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedItems: [],
  selectedType: null,
  primaryId: null,

  select: (id: string, type: SelectionType, multi = false) => {
    set((state) => {
      if (multi) {
        const exists = state.selectedItems.some((item) => item.id === id);
        const newItems = exists
          ? state.selectedItems.filter((item) => item.id !== id)
          : [...state.selectedItems, { id, type }];
        return {
          selectedItems: newItems,
          selectedType: newItems.length > 0 ? newItems[newItems.length - 1].type : null,
          primaryId: newItems.length > 0 ? newItems[newItems.length - 1].id : null,
        };
      }
      return {
        selectedItems: [{ id, type }],
        selectedType: type,
        primaryId: id,
      };
    });
  },

  deselect: (id: string) => {
    set((state) => {
      const newItems = state.selectedItems.filter((item) => item.id !== id);
      return {
        selectedItems: newItems,
        selectedType: newItems.length > 0 ? newItems[newItems.length - 1].type : null,
        primaryId: newItems.length > 0 ? newItems[newItems.length - 1].id : null,
      };
    });
  },

  clearSelection: () => {
    set({
      selectedItems: [],
      selectedType: null,
      primaryId: null,
    });
  },

  isSelected: (id: string) => {
    return get().selectedItems.some((item) => item.id === id);
  },
}));
