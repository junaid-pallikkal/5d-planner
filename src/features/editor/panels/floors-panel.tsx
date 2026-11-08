"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/stores/project-store";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  Check,
  Building,
  ArrowUp,
  X,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

export const FloorsPanel: React.FC = () => {
  const project = useProjectStore((s) => s.project);
  const activeFloor = useProjectStore((s) => s.getCurrentFloor());
  const setActiveFloorId = useProjectStore((s) => s.setActiveFloorId);
  const addUpperFloor = useProjectStore((s) => s.addUpperFloor);
  const duplicateFloor = useProjectStore((s) => s.duplicateFloor);
  const updateFloor = useProjectStore((s) => s.updateFloor);
  const deleteFloor = useProjectStore((s) => s.deleteFloor);
  const setActivePanel = useUIStore((s) => s.setActivePanel);

  // Add upper story form state
  const [newStoryName, setNewStoryName] = useState(`Level ${project.floors.length}`);
  const [newStoryHeight, setNewStoryHeight] = useState(2.8);
  const [copyWalls, setCopyWalls] = useState(true);
  const [copyOnlyExterior, setCopyOnlyExterior] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Editing state for floor name/height
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editHeight, setEditHeight] = useState(2.8);

  const handleCreateUpperStory = () => {
    const sourceFloorId = copyWalls && activeFloor ? activeFloor.id : undefined;

    const newId = addUpperFloor({
      name: newStoryName.trim() || `Level ${project.floors.length}`,
      height: Number(newStoryHeight) || 2.8,
      copyWallsFromFloorId: sourceFloorId,
      copyOnlyExterior,
    });

    toast.success(`Created story "${newStoryName}" with elevation`);
    setIsAdding(false);
    setNewStoryName(`Level ${project.floors.length + 1}`);
  };

  const handleStartEdit = (f: { id: string; name: string; height?: number }) => {
    setEditingFloorId(f.id);
    setEditName(f.name);
    setEditHeight(f.height || 2.8);
  };

  const handleSaveEdit = (floorId: string) => {
    updateFloor(floorId, {
      name: editName.trim() || "Untitled Level",
      height: Number(editHeight) || 2.8,
    });
    setEditingFloorId(null);
    toast.success("Story settings updated");
  };

  // Sort floors from highest elevation down to ground (Revit / BIM architectural stack)
  const sortedFloors = [...(project.floors || [])].sort(
    (a, b) => (b.elevation || 0) - (a.elevation || 0)
  );

  return (
    <div className="flex flex-col h-full bg-white select-none text-[#202124]">
      {/* Header */}
      <div className="h-12 border-b border-[#E5E7EB] px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-[#16A34A]" />
          <h2 className="font-semibold text-xs tracking-tight uppercase text-[#202124]">
            Stories & Levels (BIM)
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActivePanel(null)}
          className="h-7 w-7 p-0 text-[#6B7280] hover:text-[#202124]"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Action: Add Upper Story */}
        {!isAdding ? (
          <Button
            onClick={() => {
              setNewStoryName(`Level ${project.floors.length}`);
              setIsAdding(true);
            }}
            className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs h-8 space-x-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Upper Story</span>
          </Button>
        ) : (
          <div className="p-3.5 rounded-xl border border-[#16A34A]/40 bg-[#F0FDF4]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#15803D] flex items-center space-x-1">
                <ArrowUp className="h-3.5 w-3.5" />
                <span>Build New Upper Floor</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="h-5 w-5 p-0 text-[#6B7280] hover:text-[#202124]"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] uppercase font-mono text-[#6B7280]">
                  Story Name
                </label>
                <Input
                  value={newStoryName}
                  onChange={(e) => setNewStoryName(e.target.value)}
                  placeholder="e.g. First Floor / Level 1"
                  className="h-7 text-xs bg-white border-[#E5E7EB]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-[#6B7280]">
                  Story Height (m)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="2.0"
                  max="6.0"
                  value={newStoryHeight}
                  onChange={(e) => setNewStoryHeight(parseFloat(e.target.value) || 2.8)}
                  className="h-7 text-xs bg-white border-[#E5E7EB] font-mono"
                />
              </div>

              {/* Duplicate Walls Checkbox */}
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center space-x-2 text-xs cursor-pointer text-[#202124]">
                  <input
                    type="checkbox"
                    checked={copyWalls}
                    onChange={(e) => setCopyWalls(e.target.checked)}
                    className="rounded border-[#E5E7EB] text-[#16A34A] focus:ring-[#16A34A]"
                  />
                  <span className="font-medium">Trace lower floor walls</span>
                </label>

                {copyWalls && (
                  <div className="pl-6 space-y-1">
                    <label className="flex items-center space-x-1.5 text-[11px] cursor-pointer text-[#6B7280]">
                      <input
                        type="radio"
                        name="wallCopyType"
                        checked={copyOnlyExterior}
                        onChange={() => setCopyOnlyExterior(true)}
                        className="text-[#16A34A] focus:ring-[#16A34A]"
                      />
                      <span>Exterior perimeter footprint only</span>
                    </label>
                    <label className="flex items-center space-x-1.5 text-[11px] cursor-pointer text-[#6B7280]">
                      <input
                        type="radio"
                        name="wallCopyType"
                        checked={!copyOnlyExterior}
                        onChange={() => setCopyOnlyExterior(false)}
                        className="text-[#16A34A] focus:ring-[#16A34A]"
                      />
                      <span>All structural & interior walls</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Button
                size="sm"
                onClick={handleCreateUpperStory}
                className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs h-7 space-x-1"
              >
                <Plus className="h-3 w-3" />
                <span>Build Story</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="text-xs h-7 px-2.5 border-[#E5E7EB]"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Stories Vertical Stack */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#6B7280] px-1">
            <span>Elevation Hierarchy</span>
            <span>Total: {project.floors.length} Floors</span>
          </div>

          <div className="space-y-2 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-[#E5E7EB]">
            {sortedFloors.map((floor) => {
              const isActive = floor.id === activeFloor?.id;
              const isEditing = editingFloorId === floor.id;
              const wallCount = floor.walls?.length || 0;
              const roomCount = floor.rooms?.length || 0;

              return (
                <div
                  key={floor.id}
                  className={`relative pl-8 pr-3 py-3 rounded-xl border transition-all ${
                    isActive
                      ? "border-[#16A34A] bg-[#F0FDF4]/40 shadow-sm"
                      : "border-[#E5E7EB] bg-white hover:border-[#16A34A]/40"
                  }`}
                >
                  {/* Story Elevation Dot / Marker */}
                  <div
                    className={`absolute left-2.5 top-5 w-2.5 h-2.5 rounded-full border-2 transform -translate-x-1/2 transition-colors ${
                      isActive
                        ? "bg-[#16A34A] border-white ring-2 ring-[#16A34A]"
                        : "bg-white border-[#94A3B8]"
                    }`}
                  />

                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-6 text-xs bg-white"
                      />
                      <div className="flex items-center space-x-2">
                        <label className="text-[10px] font-mono text-[#6B7280]">Height:</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={editHeight}
                          onChange={(e) => setEditHeight(parseFloat(e.target.value) || 2.8)}
                          className="h-6 w-20 text-xs bg-white font-mono"
                        />
                        <span className="text-[10px] font-mono text-[#6B7280]">m</span>
                      </div>
                      <div className="flex items-center space-x-1.5 pt-1">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(floor.id)}
                          className="h-6 px-2 text-[11px] bg-[#16A34A] text-white"
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingFloorId(null)}
                          className="h-6 px-2 text-[11px]"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-[#202124]">
                            {floor.name}
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-mono font-bold bg-[#16A34A] text-white px-1.5 py-0.2 rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono font-bold text-[#16A34A]">
                          +{(floor.elevation || 0).toFixed(2)}m
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-[#6B7280]">
                        <span>H: {(floor.height || 2.8).toFixed(2)}m</span>
                        <span>{wallCount} Walls · {roomCount} Rooms</span>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-[#E5E7EB]/60 flex items-center justify-between">
                        {!isActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveFloorId(floor.id);
                              toast.info(`Switched active drafting floor to ${floor.name}`);
                            }}
                            className="h-6 px-2 text-[10px] border-[#E5E7EB] hover:border-[#16A34A] hover:text-[#16A34A] space-x-1"
                          >
                            <Eye className="h-2.5 w-2.5" />
                            <span>Draft Here</span>
                          </Button>
                        ) : (
                          <div className="text-[10px] font-mono text-[#16A34A] flex items-center space-x-1">
                            <Check className="h-3 w-3" />
                            <span>Current Canvas</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit story name & height"
                            onClick={() => handleStartEdit(floor)}
                            className="h-6 w-6 p-0 text-[#6B7280] hover:text-[#202124]"
                          >
                            <SlidersHorizontal className="h-3 w-3" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            title="Duplicate Story to Level Above"
                            onClick={() => {
                              const newId = duplicateFloor(floor.id);
                              if (newId) {
                                toast.success(`Duplicated ${floor.name} to upper level`);
                              }
                            }}
                            className="h-6 w-6 p-0 text-[#6B7280] hover:text-[#16A34A]"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>

                          {project.floors.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete Story"
                              onClick={() => {
                                deleteFloor(floor.id);
                                toast.success(`Deleted ${floor.name}`);
                              }}
                              className="h-6 w-6 p-0 text-[#6B7280] hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
