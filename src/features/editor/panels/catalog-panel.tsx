"use client";

import React from "react";
import { useFurnitureStore } from "@/stores/furniture-store";
import { useEditorStore } from "@/stores/editor-store";
import { CatalogAsset } from "@/constants/furniture-catalog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Armchair, Table, Bed, Box, Utensils, Bath, Lightbulb, Flower2, Laptop } from "lucide-react";
import { toast } from "sonner";

export const CatalogPanel: React.FC = () => {
  const searchQuery = useFurnitureStore((s) => s.searchQuery);
  const setSearchQuery = useFurnitureStore((s) => s.setSearchQuery);
  const selectedCategory = useFurnitureStore((s) => s.selectedCategory);
  const setSelectedCategory = useFurnitureStore((s) => s.setSelectedCategory);
  const getFilteredCatalog = useFurnitureStore((s) => s.getFilteredCatalog);

  const setSelectedAsset = useEditorStore((s) => s.setSelectedAsset);

  const filteredAssets = getFilteredCatalog();

  const categories: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All', icon: null },
    { id: 'seating', label: 'Seating', icon: <Armchair className="h-2.5 w-2.5" /> },
    { id: 'tables', label: 'Tables', icon: <Table className="h-2.5 w-2.5" /> },
    { id: 'beds', label: 'Beds', icon: <Bed className="h-2.5 w-2.5" /> },
    { id: 'storage', label: 'Storage', icon: <Box className="h-2.5 w-2.5" /> },
    { id: 'kitchen', label: 'Kitchen', icon: <Utensils className="h-2.5 w-2.5" /> },
    { id: 'bathroom', label: 'Bath', icon: <Bath className="h-2.5 w-2.5" /> },
    { id: 'office', label: 'Office', icon: <Laptop className="h-2.5 w-2.5" /> },
    { id: 'lighting', label: 'Lights', icon: <Lightbulb className="h-2.5 w-2.5" /> },
    { id: 'decor', label: 'Decor', icon: <Flower2 className="h-2.5 w-2.5" /> },
  ];

  const handleSelectAsset = (asset: CatalogAsset) => {
    setSelectedAsset(asset);
    toast.info(`Selected "${asset.name}" — Click canvas to place`);
  };

  return (
    <div className="flex flex-col h-full select-none">
      <div className="p-3 border-b border-border/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Architectural Catalog
          </span>
          <span className="text-[10px] font-mono text-muted-foreground/60">
            {filteredAssets.length} items
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search fixtures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-7 bg-muted/30 border-border/40 focus:border-primary/50"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-none">
          {categories.map((c) => (
            <Button
              key={c.id}
              variant={selectedCategory === c.id ? "activeCad" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(c.id)}
              className="h-5 px-2 text-[10px] whitespace-nowrap space-x-1 rounded-full"
            >
              {c.icon}
              <span>{c.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Asset Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => handleSelectAsset(asset)}
            className="group relative flex flex-col items-center justify-between p-2.5 rounded-lg border border-border/40 bg-card/40 hover:border-primary/50 hover:bg-card transition-all cursor-pointer shadow-sm"
          >
            <div className="w-full h-14 rounded bg-muted/30 flex flex-col items-center justify-center mb-1.5 group-hover:bg-primary/5 transition-colors">
              <Armchair className="h-5 w-5 text-muted-foreground/70 group-hover:text-primary transition-colors" />
              <span className="text-[8px] font-mono text-muted-foreground/60 mt-1">
                {asset.dimensions.width}m × {asset.dimensions.depth}m
              </span>
            </div>

            <span className="text-[11px] font-medium text-foreground text-center line-clamp-1">
              {asset.name}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">
              {asset.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
