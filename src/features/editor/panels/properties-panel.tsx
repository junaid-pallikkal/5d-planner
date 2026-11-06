"use client";

import React from "react";
import { useProjectStore } from "@/stores/project-store";
import { useSelectionStore } from "@/stores/selection-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Sliders, Box, Layers, Ruler } from "lucide-react";
import { WallMath } from "@/lib/geometry/wall-math";

export const PropertiesPanel: React.FC = () => {
  const floor = useProjectStore((s) => s.getCurrentFloor());
  const updateWall = useProjectStore((s) => s.updateWall);
  const deleteWall = useProjectStore((s) => s.deleteWall);
  const updateDoor = useProjectStore((s) => s.updateDoor);
  const deleteDoor = useProjectStore((s) => s.deleteDoor);
  const updateWindow = useProjectStore((s) => s.updateWindow);
  const deleteWindow = useProjectStore((s) => s.deleteWindow);
  const updateRoom = useProjectStore((s) => s.updateRoom);
  const updateFurniture = useProjectStore((s) => s.updateFurniture);
  const deleteFurniture = useProjectStore((s) => s.deleteFurniture);

  const primaryId = useSelectionStore((s) => s.primaryId);
  const selectedType = useSelectionStore((s) => s.selectedType);
  const clearSelection = useSelectionStore((s) => s.clearSelection);

  if (!primaryId || !selectedType) {
    return (
      <div className="p-4 flex flex-col items-center justify-center text-center h-64 text-muted-foreground select-none">
        <Box className="h-6 w-6 mb-2 opacity-30" />
        <p className="text-[11px] font-medium text-foreground">No Element Selected</p>
        <p className="text-[10px] text-muted-foreground/70 mt-1 max-w-[170px] leading-relaxed">
          Select any wall, room, door, or fixture to inspect and tune parameters.
        </p>
      </div>
    );
  }

  // 1. Wall Properties
  if (selectedType === 'wall') {
    const wall = (floor?.walls || []).find((w) => w.id === primaryId);
    if (!wall) return null;
    const length = WallMath.length(wall);

    return (
      <div className="p-3 flex flex-col space-y-3 select-none">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center space-x-1.5 text-xs font-semibold">
            <Ruler className="h-3.5 w-3.5 text-primary" />
            <span>Wall Segment</span>
          </div>
          <Button
            variant="ghost"
            size="cadIcon"
            onClick={() => {
              deleteWall(wall.id);
              clearSelection();
            }}
            className="text-muted-foreground hover:text-destructive h-6 w-6"
            title="Delete Wall"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        <div>
          <label className="text-[9px] text-muted-foreground uppercase font-mono">Length</label>
          <div className="text-xs font-mono font-semibold text-foreground mt-0.5">
            {length.toFixed(2)} m
          </div>
        </div>

        <div>
          <label className="text-[9px] text-muted-foreground uppercase font-mono">Thickness (m)</label>
          <Input
            type="number"
            step="0.05"
            min="0.05"
            max="1.0"
            value={wall.thickness}
            onChange={(e) => updateWall(wall.id, { thickness: parseFloat(e.target.value) || 0.2 })}
            className="h-7 text-xs font-mono mt-0.5 bg-muted/20 border-border/40"
          />
        </div>

        <div>
          <label className="text-[9px] text-muted-foreground uppercase font-mono">Height (m)</label>
          <Input
            type="number"
            step="0.1"
            min="1.0"
            max="8.0"
            value={wall.height}
            onChange={(e) => updateWall(wall.id, { height: parseFloat(e.target.value) || 2.8 })}
            className="h-7 text-xs font-mono mt-0.5 bg-muted/20 border-border/40"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="text-xs text-muted-foreground">Exterior Boundary</label>
          <input
            type="checkbox"
            checked={wall.isExterior}
            onChange={(e) => updateWall(wall.id, { isExterior: e.target.checked })}
            className="h-3.5 w-3.5 rounded accent-primary cursor-pointer"
          />
        </div>
      </div>
    );
  }

  // 2. Door Properties
  if (selectedType === 'door') {
    const door = (floor?.doors || []).find((d) => d.id === primaryId);
    if (!door) return null;

    return (
      <div className="p-3 flex flex-col space-y-3 select-none">
        <div className="flex items-center justify-between pb-2 border-b border-border/80">
          <span className="text-xs font-semibold">Door Opening</span>
          <Button
            variant="destructive"
            size="cadIcon"
            onClick={() => {
              deleteDoor(door.id);
              clearSelection();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase font-mono">Width (m)</label>
          <Input
            type="number"
            step="0.05"
            value={door.width}
            onChange={(e) => updateDoor(door.id, { width: parseFloat(e.target.value) || 0.9 })}
            className="h-7 text-xs font-mono mt-0.5"
          />
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase font-mono">Height (m)</label>
          <Input
            type="number"
            step="0.05"
            value={door.height}
            onChange={(e) => updateDoor(door.id, { height: parseFloat(e.target.value) || 2.1 })}
            className="h-7 text-xs font-mono mt-0.5"
          />
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase font-mono">Wall Position (0 - 1)</label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.01"
            value={door.distanceRatio}
            onChange={(e) => updateDoor(door.id, { distanceRatio: parseFloat(e.target.value) })}
            className="w-full accent-primary mt-1"
          />
        </div>
      </div>
    );
  }

  // 3. Window Properties
  if (selectedType === 'window') {
    const win = (floor?.windows || []).find((w) => w.id === primaryId);
    if (!win) return null;

    return (
      <div className="p-3 flex flex-col space-y-3 select-none">
        <div className="flex items-center justify-between pb-2 border-b border-border/80">
          <span className="text-xs font-semibold">Window Glazing</span>
          <Button
            variant="destructive"
            size="cadIcon"
            onClick={() => {
              deleteWindow(win.id);
              clearSelection();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase font-mono">Width (m)</label>
          <Input
            type="number"
            step="0.1"
            value={win.width}
            onChange={(e) => updateWindow(win.id, { width: parseFloat(e.target.value) || 1.2 })}
            className="h-7 text-xs font-mono mt-0.5"
          />
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase font-mono">Height (m)</label>
          <Input
            type="number"
            step="0.1"
            value={win.height}
            onChange={(e) => updateWindow(win.id, { height: parseFloat(e.target.value) || 1.4 })}
            className="h-7 text-xs font-mono mt-0.5"
          />
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase font-mono">Sill Elevation (m)</label>
          <Input
            type="number"
            step="0.05"
            value={win.elevationFromFloor}
            onChange={(e) => updateWindow(win.id, { elevationFromFloor: parseFloat(e.target.value) || 0.9 })}
            className="h-7 text-xs font-mono mt-0.5"
          />
        </div>
      </div>
    );
  }

  // 4. Room Properties
  if (selectedType === 'room') {
    const room = (floor?.rooms || []).find((r) => r.id === primaryId);
    if (!room) return null;

    return (
      <div className="p-3 flex flex-col space-y-3 select-none">
        <div className="flex items-center justify-between pb-2 border-b border-border/80">
          <span className="text-xs font-semibold">Room Space</span>
          <span className="text-[10px] font-mono text-primary font-bold">{room.area.toFixed(1)} m²</span>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase font-mono">Room Label</label>
          <Input
            value={room.name}
            onChange={(e) => updateRoom(room.id, { name: e.target.value })}
            className="h-7 text-xs mt-0.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 bg-muted/40 p-2 rounded">
          <div>
            <div className="text-[9px] text-muted-foreground">USABLE AREA</div>
            <div className="text-sm font-mono font-bold">{room.area.toFixed(1)} m²</div>
          </div>
          <div>
            <div className="text-[9px] text-muted-foreground">PERIMETER</div>
            <div className="text-sm font-mono font-bold">{room.perimeter.toFixed(1)} m</div>
          </div>
        </div>

        <div>
          <label className="text-[9px] text-muted-foreground uppercase font-mono">Accent Color</label>
          <div className="flex items-center space-x-1.5 mt-1">
            {['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'].map((c) => (
              <div
                key={c}
                onClick={() => updateRoom(room.id, { color: c })}
                className="w-4 h-4 rounded-full cursor-pointer transition-transform hover:scale-125 border border-white/20"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 5. Furniture Properties
  if (selectedType === 'furniture') {
    const item = (floor?.furniture || []).find((f) => f.id === primaryId);
    if (!item) return null;

    return (
      <div className="p-3 flex flex-col space-y-3 select-none">
        <div className="flex items-center justify-between pb-2 border-b border-border/80">
          <span className="text-xs font-semibold">{item.name}</span>
          <Button
            variant="destructive"
            size="cadIcon"
            onClick={() => {
              deleteFurniture(item.id);
              clearSelection();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <div>
            <label className="text-[9px] text-muted-foreground font-mono">W (m)</label>
            <Input
              type="number"
              step="0.05"
              value={item.dimensions.width}
              onChange={(e) =>
                updateFurniture(item.id, {
                  dimensions: { ...item.dimensions, width: parseFloat(e.target.value) || 0.5 },
                })
              }
              className="h-7 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground font-mono">D (m)</label>
            <Input
              type="number"
              step="0.05"
              value={item.dimensions.depth}
              onChange={(e) =>
                updateFurniture(item.id, {
                  dimensions: { ...item.dimensions, depth: parseFloat(e.target.value) || 0.5 },
                })
              }
              className="h-7 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground font-mono">H (m)</label>
            <Input
              type="number"
              step="0.05"
              value={item.dimensions.height}
              onChange={(e) =>
                updateFurniture(item.id, {
                  dimensions: { ...item.dimensions, height: parseFloat(e.target.value) || 0.5 },
                })
              }
              className="h-7 text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase font-mono">
            Rotation ({(item.rotation.y * (180 / Math.PI)).toFixed(0)}°)
          </label>
          <input
            type="range"
            min="0"
            max="360"
            step="15"
            value={Math.round((item.rotation.y * 180) / Math.PI) % 360}
            onChange={(e) =>
              updateFurniture(item.id, {
                rotation: { x: 0, y: (parseFloat(e.target.value) * Math.PI) / 180, z: 0 },
              })
            }
            className="w-full accent-primary mt-1"
          />
        </div>
      </div>
    );
  }

  return null;
};
