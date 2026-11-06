import { create } from 'zustand';
import { MaterialDef } from '@/types/project';
import { DEFAULT_MATERIALS } from '@/constants/default-materials';

interface MaterialStoreState {
  materials: MaterialDef[];
  activeMaterialId: string;
  selectedCategory: string;

  setMaterials: (materials: MaterialDef[]) => void;
  setActiveMaterialId: (id: string) => void;
  setSelectedCategory: (cat: string) => void;
  addMaterial: (mat: MaterialDef) => void;
  updateMaterial: (id: string, updates: Partial<MaterialDef>) => void;
}

export const useMaterialStore = create<MaterialStoreState>((set) => ({
  materials: DEFAULT_MATERIALS,
  activeMaterialId: DEFAULT_MATERIALS[0].id,
  selectedCategory: 'all',

  setMaterials: (materials) => set({ materials }),
  setActiveMaterialId: (activeMaterialId) => set({ activeMaterialId }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  addMaterial: (mat) =>
    set((state) => ({ materials: [...state.materials, mat] })),

  updateMaterial: (id, updates) =>
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
}));
