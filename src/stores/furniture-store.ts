import { create } from 'zustand';
import { FURNITURE_CATALOG, CatalogAsset } from '@/constants/furniture-catalog';

interface FurnitureStoreState {
  searchQuery: string;
  selectedCategory: string;
  catalog: CatalogAsset[];

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  getFilteredCatalog: () => CatalogAsset[];
}

export const useFurnitureStore = create<FurnitureStoreState>((set, get) => ({
  searchQuery: '',
  selectedCategory: 'all',
  catalog: FURNITURE_CATALOG,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  getFilteredCatalog: () => {
    const { searchQuery, selectedCategory, catalog } = get();
    return catalog.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesQuery =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  },
}));
