import { create } from 'zustand';
import {
  ProjectDocument,
  ProjectSettings,
  WallData,
  DoorData,
  WindowData,
  RoomData,
  FurnitureData,
  LightData,
  DimensionData,
  RoofData,
  RoofType,
  FloorData,
} from '@/types/project';
import { TEMPLATE_MINIMALIST_VILLA } from '@/constants/templates';
import { RoomDetectionService } from '@/lib/geometry/room-detection';
import { ProjectStorageService } from '@/lib/storage/project-storage';
import { useHistoryStore } from './history-store';

interface ProjectState {
  project: ProjectDocument;
  isSaving: boolean;
  lastSavedAt: string | null;

  // Initialization & Settings
  setProject: (doc: ProjectDocument, pushHistory?: boolean) => void;
  updateSettings: (settings: Partial<ProjectSettings>) => void;
  updateMetadata: (name: string, description?: string) => void;

  // Floors
  setActiveFloorId: (floorId: string) => void;
  addFloor: (name: string, elevation: number, height?: number) => void;
  addUpperFloor: (options?: {
    name?: string;
    height?: number;
    copyWallsFromFloorId?: string;
    copyOnlyExterior?: boolean;
  }) => string;
  duplicateFloor: (floorId: string) => string;
  updateFloor: (floorId: string, updates: Partial<FloorData>) => void;
  deleteFloor: (floorId: string) => void;
  getCurrentFloor: () => FloorData;

  // Walls
  addWall: (wall: Omit<WallData, 'id' | 'floorId'>) => string;
  updateWall: (id: string, updates: Partial<WallData>) => void;
  deleteWall: (id: string) => void;

  // Doors
  addDoor: (door: Omit<DoorData, 'id' | 'floorId'>) => string;
  updateDoor: (id: string, updates: Partial<DoorData>) => void;
  deleteDoor: (id: string) => void;

  // Windows
  addWindow: (win: Omit<WindowData, 'id' | 'floorId'>) => string;
  updateWindow: (id: string, updates: Partial<WindowData>) => void;
  deleteWindow: (id: string) => void;

  // Rooms
  recalculateRooms: () => void;
  updateRoom: (id: string, updates: Partial<RoomData>) => void;

  // Furniture
  addFurniture: (item: Omit<FurnitureData, 'id' | 'floorId'>) => string;
  updateFurniture: (id: string, updates: Partial<FurnitureData>) => void;
  deleteFurniture: (id: string) => void;

  // Lights
  addLight: (light: Omit<LightData, 'id' | 'floorId'>) => string;
  updateLight: (id: string, updates: Partial<LightData>) => void;
  deleteLight: (id: string) => void;

  // Dimensions
  addDimension: (dim: Omit<DimensionData, 'id' | 'floorId'>) => string;
  deleteDimension: (id: string) => void;

  // Roofs
  addRoof: (roof: Omit<RoofData, 'id' | 'floorId'>, floorId?: string) => string;
  updateRoof: (id: string, updates: Partial<RoofData>, floorId?: string) => void;
  deleteRoof: (id: string, floorId?: string) => void;
  generateAutoRoof: (type?: RoofType, options?: Partial<RoofData>, floorId?: string) => string;

  // Persistence
  saveNow: () => Promise<void>;
}

// Debounce timer for local autosave
let autosaveTimeout: NodeJS.Timeout | null = null;
const scheduleAutosave = (doc: ProjectDocument, setSaving: (saving: boolean) => void) => {
  if (autosaveTimeout) clearTimeout(autosaveTimeout);
  setSaving(true);
  autosaveTimeout = setTimeout(async () => {
    await ProjectStorageService.saveProject(doc);
    setSaving(false);
  }, 1200);
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: TEMPLATE_MINIMALIST_VILLA,
  isSaving: false,
  lastSavedAt: null,

  setProject: (doc, pushHistory = true) => {
    if (pushHistory) {
      useHistoryStore.getState().pushSnapshot(get().project);
    }
    set({ project: doc, lastSavedAt: new Date().toLocaleTimeString() });
    scheduleAutosave(doc, (saving) => set({ isSaving: saving }));
  },

  updateSettings: (settings) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const updated: ProjectDocument = {
      ...current,
      settings: { ...current.settings, ...settings },
    };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  updateMetadata: (name, description) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const updated: ProjectDocument = {
      ...current,
      name,
      description: description !== undefined ? description : current.description,
    };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  setActiveFloorId: (floorId) => {
    set((state) => ({
      project: { ...state.project, activeFloorId: floorId },
    }));
  },

  addFloor: (name, elevation, height = 2.8) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const newFloorId = `floor_${Date.now()}`;
    const newLevel = current.floors.length;
    const newFloor: FloorData = {
      id: newFloorId,
      level: newLevel,
      name,
      elevation,
      height,
      walls: [],
      doors: [],
      windows: [],
      rooms: [],
      furniture: [],
      roofs: [],
      lights: [
        {
          id: `light_${newFloorId}_ambient`,
          floorId: newFloorId,
          type: 'ambient',
          position: { x: 5, y: elevation + 2.5, z: 5 },
          intensity: 0.6,
          color: '#ffffff',
          castShadow: false,
        },
      ],
      dimensions: [],
    };

    const updated: ProjectDocument = {
      ...current,
      floors: [...current.floors, newFloor],
      activeFloorId: newFloorId,
    };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  addUpperFloor: (options) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const floors = current.floors || [];
    const highestFloor = floors.reduce(
      (prev, curr) => (curr.elevation >= prev.elevation ? curr : prev),
      floors[0]
    );

    const nextElevation = highestFloor
      ? Number((highestFloor.elevation + (highestFloor.height || 2.8)).toFixed(2))
      : 0;

    const newFloorId = `floor_${Date.now()}`;
    const levelNumber = floors.length;
    const defaultName = `Level ${levelNumber}`;
    const storyHeight = options?.height || 2.8;

    let newWalls: WallData[] = [];
    if (options?.copyWallsFromFloorId) {
      const sourceFloor = floors.find((f) => f.id === options.copyWallsFromFloorId);
      if (sourceFloor) {
        const sourceWalls = options.copyOnlyExterior
          ? sourceFloor.walls.filter((w) => w.isExterior)
          : sourceFloor.walls;

        newWalls = sourceWalls.map((w, idx) => ({
          ...w,
          id: `w_lvl${levelNumber}_${Date.now()}_${idx}`,
          floorId: newFloorId,
          height: storyHeight,
        }));
      }
    }

    const newFloor: FloorData = {
      id: newFloorId,
      level: levelNumber,
      name: options?.name || defaultName,
      elevation: nextElevation,
      height: storyHeight,
      walls: newWalls,
      doors: [],
      windows: [],
      rooms: [],
      furniture: [],
      roofs: [],
      lights: [
        {
          id: `light_${newFloorId}_ambient`,
          floorId: newFloorId,
          type: 'ambient',
          position: { x: 5, y: nextElevation + storyHeight - 0.3, z: 5 },
          intensity: 0.6,
          color: '#ffffff',
          castShadow: false,
        },
      ],
      dimensions: [],
    };

    const updated: ProjectDocument = {
      ...current,
      floors: [...floors, newFloor],
      activeFloorId: newFloorId,
    };

    set({ project: updated });

    if (newWalls.length >= 3) {
      setTimeout(() => {
        get().recalculateRooms();
      }, 50);
    }

    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
    return newFloorId;
  },

  duplicateFloor: (floorId) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const sourceFloor = current.floors.find((f) => f.id === floorId);
    if (!sourceFloor) return '';

    const highestFloor = current.floors.reduce(
      (prev, curr) => (curr.elevation >= prev.elevation ? curr : prev),
      current.floors[0]
    );

    const nextElevation = Number((highestFloor.elevation + (highestFloor.height || 2.8)).toFixed(2));
    const newFloorId = `floor_${Date.now()}`;
    const levelNumber = current.floors.length;

    // Clone walls with map
    const wallIdMap = new Map<string, string>();
    const clonedWalls = sourceFloor.walls.map((w, idx) => {
      const newId = `w_dup_${Date.now()}_${idx}`;
      wallIdMap.set(w.id, newId);
      return {
        ...w,
        id: newId,
        floorId: newFloorId,
      };
    });

    const clonedDoors = sourceFloor.doors.map((d, idx) => ({
      ...d,
      id: `d_dup_${Date.now()}_${idx}`,
      floorId: newFloorId,
      wallId: wallIdMap.get(d.wallId) || d.wallId,
    }));

    const clonedWindows = sourceFloor.windows.map((win, idx) => ({
      ...win,
      id: `win_dup_${Date.now()}_${idx}`,
      floorId: newFloorId,
      wallId: wallIdMap.get(win.wallId) || win.wallId,
    }));

    const clonedRooms = sourceFloor.rooms.map((r, idx) => ({
      ...r,
      id: `r_dup_${Date.now()}_${idx}`,
      floorId: newFloorId,
      wallIds: r.wallIds.map((wId) => wallIdMap.get(wId) || wId),
    }));

    const clonedFurniture = sourceFloor.furniture.map((f, idx) => ({
      ...f,
      id: `furn_dup_${Date.now()}_${idx}`,
      floorId: newFloorId,
    }));

    const newFloor: FloorData = {
      id: newFloorId,
      level: levelNumber,
      name: `${sourceFloor.name} (Copy)`,
      elevation: nextElevation,
      height: sourceFloor.height,
      walls: clonedWalls,
      doors: clonedDoors,
      windows: clonedWindows,
      rooms: clonedRooms,
      furniture: clonedFurniture,
      roofs: [],
      lights: [
        {
          id: `light_${newFloorId}_ambient`,
          floorId: newFloorId,
          type: 'ambient',
          position: { x: 5, y: nextElevation + 2.5, z: 5 },
          intensity: 0.6,
          color: '#ffffff',
          castShadow: false,
        },
      ],
      dimensions: [],
    };

    const updated: ProjectDocument = {
      ...current,
      floors: [...current.floors, newFloor],
      activeFloorId: newFloorId,
    };

    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
    return newFloorId;
  },

  updateFloor: (floorId, updates) => {
    const current = get().project;
    const updatedFloors = current.floors.map((f) =>
      f.id === floorId ? { ...f, ...updates } : f
    );
    const updated: ProjectDocument = {
      ...current,
      floors: updatedFloors,
    };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  deleteFloor: (floorId) => {
    const current = get().project;
    if (current.floors.length <= 1) return; // Keep at least one floor

    useHistoryStore.getState().pushSnapshot(current);
    const updatedFloors = current.floors.filter((f) => f.id !== floorId);
    const activeFloorId =
      current.activeFloorId === floorId ? updatedFloors[0].id : current.activeFloorId;

    const updated: ProjectDocument = {
      ...current,
      floors: updatedFloors,
      activeFloorId,
    };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  getCurrentFloor: () => {
    const { project } = get();
    const found = project?.floors?.find((f) => f.id === project.activeFloorId) || project?.floors?.[0];
    if (found) return found;

    return {
      id: "floor_default",
      level: 0,
      name: "Ground Floor",
      elevation: 0,
      height: 2.8,
      walls: [],
      doors: [],
      windows: [],
      rooms: [],
      furniture: [],
      roofs: [],
      lights: [],
      dimensions: [],
    };
  },

  // Wall mutations
  addWall: (wallData) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const floorId = current.activeFloorId;
    const newId = `wall_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newWall: WallData = {
      id: newId,
      floorId,
      ...wallData,
    };

    const updatedFloors = current.floors.map((floor) => {
      if (floor.id !== floorId) return floor;
      const newWalls = [...floor.walls, newWall];
      // Auto recalculate enclosed rooms
      const newRooms = RoomDetectionService.detectRooms(newWalls, floorId);
      return {
        ...floor,
        walls: newWalls,
        rooms: newRooms.length > 0 ? newRooms : floor.rooms,
      };
    });

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
    return newId;
  },

  updateWall: (id, updates) => {
    const current = get().project;
    const floorId = current.activeFloorId;

    const updatedFloors = current.floors.map((floor) => {
      if (floor.id !== floorId) return floor;
      const newWalls = floor.walls.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      );
      // Auto recalculate enclosed rooms if endpoints moved
      const newRooms =
        updates.start || updates.end
          ? RoomDetectionService.detectRooms(newWalls, floorId)
          : floor.rooms;
      return {
        ...floor,
        walls: newWalls,
        rooms: newRooms.length > 0 ? newRooms : floor.rooms,
      };
    });

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  deleteWall: (id) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const floorId = current.activeFloorId;
    const updatedFloors = current.floors.map((floor) => {
      if (floor.id !== floorId) return floor;
      const newWalls = floor.walls.filter((w) => w.id !== id);
      // Delete doors & windows attached to this wall
      const newDoors = floor.doors.filter((d) => d.wallId !== id);
      const newWindows = floor.windows.filter((win) => win.wallId !== id);
      const newRooms = RoomDetectionService.detectRooms(newWalls, floorId);

      return {
        ...floor,
        walls: newWalls,
        doors: newDoors,
        windows: newWindows,
        rooms: newRooms,
      };
    });

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  // Door mutations
  addDoor: (doorData) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const floorId = current.activeFloorId;
    const newId = `door_${Date.now()}`;
    const newDoor: DoorData = { id: newId, floorId, ...doorData };

    const updatedFloors = current.floors.map((f) =>
      f.id === floorId ? { ...f, doors: [...f.doors, newDoor] } : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
    return newId;
  },

  updateDoor: (id, updates) => {
    const current = get().project;
    const floorId = current.activeFloorId;

    const updatedFloors = current.floors.map((f) =>
      f.id === floorId
        ? {
            ...f,
            doors: f.doors.map((d) => (d.id === id ? { ...d, ...updates } : d)),
          }
        : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  deleteDoor: (id) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const floorId = current.activeFloorId;
    const updatedFloors = current.floors.map((f) =>
      f.id === floorId
        ? { ...f, doors: f.doors.filter((d) => d.id !== id) }
        : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  // Window mutations
  addWindow: (winData) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const floorId = current.activeFloorId;
    const newId = `win_${Date.now()}`;
    const newWindow: WindowData = { id: newId, floorId, ...winData };

    const updatedFloors = current.floors.map((f) =>
      f.id === floorId ? { ...f, windows: [...f.windows, newWindow] } : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
    return newId;
  },

  updateWindow: (id, updates) => {
    const current = get().project;
    const floorId = current.activeFloorId;

    const updatedFloors = current.floors.map((f) =>
      f.id === floorId
        ? {
            ...f,
            windows: f.windows.map((w) => (w.id === id ? { ...w, ...updates } : w)),
          }
        : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  deleteWindow: (id) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const floorId = current.activeFloorId;
    const updatedFloors = current.floors.map((f) =>
      f.id === floorId
        ? { ...f, windows: f.windows.filter((w) => w.id !== id) }
        : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  // Room mutations
  recalculateRooms: () => {
    const current = get().project;
    const floorId = current.activeFloorId;

    const updatedFloors = current.floors.map((floor) => {
      if (floor.id !== floorId) return floor;
      const detected = RoomDetectionService.detectRooms(floor.walls, floorId);
      return { ...floor, rooms: detected };
    });

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  updateRoom: (id, updates) => {
    const current = get().project;
    const floorId = current.activeFloorId;

    const updatedFloors = current.floors.map((f) =>
      f.id === floorId
        ? {
            ...f,
            rooms: f.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
          }
        : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  // Furniture mutations
  addFurniture: (itemData) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const floorId = current.activeFloorId;
    const newId = `furn_${Date.now()}`;
    const newItem: FurnitureData = { id: newId, floorId, ...itemData };

    const updatedFloors = current.floors.map((f) =>
      f.id === floorId ? { ...f, furniture: [...f.furniture, newItem] } : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
    return newId;
  },

  updateFurniture: (id, updates) => {
    const current = get().project;
    const floorId = current.activeFloorId;

    const updatedFloors = current.floors.map((f) =>
      f.id === floorId
        ? {
            ...f,
            furniture: f.furniture.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          }
        : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  deleteFurniture: (id) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const floorId = current.activeFloorId;
    const updatedFloors = current.floors.map((f) =>
      f.id === floorId
        ? { ...f, furniture: f.furniture.filter((item) => item.id !== id) }
        : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  // Light mutations
  addLight: (lightData) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const floorId = current.activeFloorId;
    const newId = `light_${Date.now()}`;
    const newLight: LightData = { id: newId, floorId, ...lightData };

    const updatedFloors = current.floors.map((f) =>
      f.id === floorId ? { ...f, lights: [...f.lights, newLight] } : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
    return newId;
  },

  updateLight: (id, updates) => {
    const current = get().project;
    const floorId = current.activeFloorId;

    const updatedFloors = current.floors.map((f) =>
      f.id === floorId
        ? {
            ...f,
            lights: f.lights.map((l) => (l.id === id ? { ...l, ...updates } : l)),
          }
        : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  deleteLight: (id) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const floorId = current.activeFloorId;
    const updatedFloors = current.floors.map((f) =>
      f.id === floorId
        ? { ...f, lights: f.lights.filter((l) => l.id !== id) }
        : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  // Dimension mutations
  addDimension: (dimData) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const floorId = current.activeFloorId;
    const newId = `dim_${Date.now()}`;
    const newDim: DimensionData = { id: newId, floorId, ...dimData };

    const updatedFloors = current.floors.map((f) =>
      f.id === floorId ? { ...f, dimensions: [...f.dimensions, newDim] } : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
    return newId;
  },

  deleteDimension: (id) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const floorId = current.activeFloorId;
    const updatedFloors = current.floors.map((f) =>
      f.id === floorId
        ? { ...f, dimensions: f.dimensions.filter((d) => d.id !== id) }
        : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  // Roof mutations
  addRoof: (roofData, floorId) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const targetFloorId = floorId || current.activeFloorId;
    const newId = `roof_${Date.now()}`;
    const newRoof: RoofData = {
      id: newId,
      floorId: targetFloorId,
      type: roofData.type,
      polygon: roofData.polygon,
      name: roofData.name || `${roofData.type.toUpperCase()} Roof`,
      pitch: roofData.pitch ?? 25,
      overhang: roofData.overhang ?? 0.5,
      thickness: roofData.thickness ?? 0.25,
      fasciaDepth: roofData.fasciaDepth ?? 0.18,
      parapetHeight: roofData.parapetHeight,
      elevationOffset: roofData.elevationOffset,
      ridgeOrientation: roofData.ridgeOrientation ?? 'longitudinal',
      hasGutters: roofData.hasGutters ?? true,
      hasSolarPanels: roofData.hasSolarPanels ?? false,
      solarDensity: roofData.solarDensity ?? 0.6,
      showTrusses: roofData.showTrusses ?? false,
      trussType: roofData.trussType ?? 'none',
      drainageSlope: roofData.drainageSlope ?? 1.5,
      color: roofData.color,
      materialId: roofData.materialId,
    };

    const updatedFloors = current.floors.map((f) =>
      f.id === targetFloorId
        ? { ...f, roofs: [...(f.roofs || []), newRoof] }
        : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
    return newId;
  },

  updateRoof: (id, updates, floorId) => {
    const current = get().project;
    const targetFloorId = floorId || current.activeFloorId;

    const updatedFloors = current.floors.map((f) =>
      f.id === targetFloorId
        ? {
            ...f,
            roofs: (f.roofs || []).map((r) => (r.id === id ? { ...r, ...updates } : r)),
          }
        : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  deleteRoof: (id, floorId) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const targetFloorId = floorId || current.activeFloorId;
    const updatedFloors = current.floors.map((f) =>
      f.id === targetFloorId
        ? { ...f, roofs: (f.roofs || []).filter((r) => r.id !== id) }
        : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
  },

  generateAutoRoof: (type = 'gable', options = {}, floorId) => {
    const current = get().project;
    useHistoryStore.getState().pushSnapshot(current);

    const targetFloorId = floorId || current.activeFloorId;
    const floor = current.floors.find((f) => f.id === targetFloorId) || current.floors[0];

    // Compute bounding footprint of building envelope from walls or rooms
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const walls = floor?.walls || [];
    const rooms = floor?.rooms || [];

    if (walls.length > 0) {
      walls.forEach((w) => {
        minX = Math.min(minX, w.start.x, w.end.x);
        maxX = Math.max(maxX, w.start.x, w.end.x);
        minY = Math.min(minY, w.start.y, w.end.y);
        maxY = Math.max(maxY, w.start.y, w.end.y);
      });
    } else if (rooms.length > 0) {
      rooms.forEach((r) => {
        (r.polygon || []).forEach((pt) => {
          minX = Math.min(minX, pt.x);
          maxX = Math.max(maxX, pt.x);
          minY = Math.min(minY, pt.y);
          maxY = Math.max(maxY, pt.y);
        });
      });
    } else {
      minX = 0; maxX = 8; minY = 0; maxY = 6;
    }

    const overhang = options.overhang ?? (type === 'flat' || type === 'green' ? 0.2 : 0.5);
    const polygon = [
      { x: minX - overhang, y: minY - overhang },
      { x: maxX + overhang, y: minY - overhang },
      { x: maxX + overhang, y: maxY + overhang },
      { x: minX - overhang, y: maxY + overhang },
    ];

    const defaultPitch =
      type === 'flat' || type === 'green' ? 1.5 :
      type === 'shed' ? 12 :
      type === 'mansard' ? 55 :
      type === 'gambrel' ? 50 :
      type === 'vaulted' ? 22 :
      type === 'hip' ? 25 : 30;

    const defaultThickness =
      type === 'green' ? 0.35 :
      type === 'flat' ? 0.28 : 0.22;

    const defaultParapet =
      type === 'flat' ? 0.6 :
      type === 'green' ? 0.5 : 0;

    const defaultColor =
      type === 'green' ? '#15803d' :
      type === 'flat' ? '#64748b' :
      type === 'gable' ? '#c2410c' :
      type === 'hip' ? '#1e293b' :
      type === 'shed' ? '#334155' :
      type === 'vaulted' ? '#0d9488' : '#78350f';

    const newId = `roof_${Date.now()}`;
    const newRoof: RoofData = {
      id: newId,
      floorId: targetFloorId,
      name: `${type.toUpperCase()} Roof`,
      type,
      pitch: defaultPitch,
      overhang,
      thickness: defaultThickness,
      fasciaDepth: 0.18,
      parapetHeight: defaultParapet,
      ridgeOrientation: (maxX - minX) >= (maxY - minY) ? 'longitudinal' : 'transverse',
      elevationOffset: floor?.height || 2.8,
      polygon,
      color: defaultColor,
      hasSolarPanels: type === 'shed' || type === 'flat',
      solarDensity: 0.7,
      showTrusses: type === 'gable',
      trussType: type === 'gable' ? 'king_post' : 'none',
      hasGutters: type !== 'flat' && type !== 'green',
      drainageSlope: 1.5,
      ...options,
    };

    const updatedFloors = current.floors.map((f) =>
      f.id === targetFloorId
        ? { ...f, roofs: [newRoof] }
        : f
    );

    const updated: ProjectDocument = { ...current, floors: updatedFloors };
    set({ project: updated });
    scheduleAutosave(updated, (saving) => set({ isSaving: saving }));
    return newId;
  },

  saveNow: async () => {
    set({ isSaving: true });
    await ProjectStorageService.saveProject(get().project);
    set({ isSaving: false, lastSavedAt: new Date().toLocaleTimeString() });
  },
}));
