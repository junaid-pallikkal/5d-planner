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

  saveNow: async () => {
    set({ isSaving: true });
    await ProjectStorageService.saveProject(get().project);
    set({ isSaving: false, lastSavedAt: new Date().toLocaleTimeString() });
  },
}));
