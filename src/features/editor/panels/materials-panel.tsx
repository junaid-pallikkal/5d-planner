"use client";

import React from "react";
import { useMaterialStore } from "@/stores/material-store";
import { useProjectStore } from "@/stores/project-store";
import { useSelectionStore } from "@/stores/selection-store";
import { MaterialDef } from "@/types/project";
import { Palette, Check } from "lucide-react";
import { toast } from "sonner";

export const MaterialsPanel: React.FC = () => {
  const materials = useMaterialStore((s) => s.materials);
  const activeMaterialId = useMaterialStore((s) => s.activeMaterialId);
  const setActiveMaterialId = useMaterialStore((s) => s.setActiveMaterialId);

  const primaryId = useSelectionStore((s) => s.primaryId);
  const selectedType = useSelectionStore((s) => s.selectedType);
  const updateWall = useProjectStore((s) => s.updateWall);
  const updateRoom = useProjectStore((s) => s.updateRoom);

  const handleApplyMaterial = (mat: MaterialDef) => {
    setActiveMaterialId(mat.id);

    if (selectedType === 'wall' && primaryId) {
      updateWall(primaryId, { interiorMaterialId: mat.id });
      toast.success(`Applied ${mat.name} to Wall`);
    } else if (selectedType === 'room' && primaryId) {
      updateRoom(primaryId, { floorMaterialId: mat.id });
      toast.success(`Applied ${mat.name} to Room Flooring`);
    } else {
      toast.info(`Active material: ${mat.name}`);
    }
  };

  return (
    <div className="p-3 flex flex-col h-full select-none">
      <div className="flex items-center justify-between pb-2 border-b border-border/40 mb-3">
        <div className="flex items-center space-x-1.5 text-xs font-semibold">
          <Palette className="h-3.5 w-3.5 text-primary" />
          <span>Materials & Textures</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/60">{materials.length} presets</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {materials.map((mat) => {
          const isActive = activeMaterialId === mat.id;
          return (
            <div
              key={mat.id}
              onClick={() => handleApplyMaterial(mat)}
              className={`flex items-center space-x-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                isActive
                  ? "border-primary/50 bg-primary/10 shadow-sm"
                  : "border-border/40 bg-card/40 hover:border-border hover:bg-card"
              }`}
            >
              {/* Material color swatch */}
              <div
                className="w-7 h-7 rounded-md border border-white/20 shadow-inner flex items-center justify-center shrink-0"
                style={{ backgroundColor: mat.color }}
              >
                {isActive && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[11px] font-medium text-foreground truncate">
                  {mat.name}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">
                  {mat.category} · {(mat.roughness * 100).toFixed(0)}% Rough
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
