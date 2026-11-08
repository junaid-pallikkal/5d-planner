import { Point2D, Point3D } from './geometry';

export type { Point2D, Point3D };

export type UnitType = 'metric_m' | 'metric_mm' | 'imperial_ft_in';

export interface ProjectSettings {
  unit: UnitType;
  gridSize: number; // in meters (default 0.5)
  gridSnap: boolean;
  angleSnap: boolean;
  angleSnapIncrement: number; // in degrees (default 15 or 45)
  objectSnap: boolean;
  wallThicknessDefault: number; // default 0.20m
  wallHeightDefault: number; // default 2.80m
  ceilingHeightDefault: number; // default 2.80m
  theme: 'dark' | 'light' | 'blueprint';
  sunAzimuth: number; // 0-360 deg
  sunAltitude: number; // 0-90 deg
  shadowsEnabled: boolean;
  showDimensions: boolean;
  showRulers: boolean;
  showGrid: boolean;
}

export interface WallData {
  id: string;
  floorId: string;
  start: Point2D;
  end: Point2D;
  thickness: number; // meters
  height: number; // meters
  isExterior: boolean;
  interiorMaterialId?: string;
  exteriorMaterialId?: string;
}

export type DoorType = 'single' | 'double' | 'sliding' | 'pocket' | 'bifold';
export type SwingDirection = 'inward_left' | 'inward_right' | 'outward_left' | 'outward_right';

export interface DoorData {
  id: string;
  wallId: string;
  floorId: string;
  distanceRatio: number; // 0 to 1 position along wall length
  width: number; // meters (e.g. 0.9m)
  height: number; // meters (e.g. 2.1m)
  type: DoorType;
  swingDirection: SwingDirection;
  doorMaterialId?: string;
  frameMaterialId?: string;
}

export type WindowType = 'fixed' | 'casement' | 'sliding' | 'awning' | 'double_hung';

export interface WindowData {
  id: string;
  wallId: string;
  floorId: string;
  distanceRatio: number; // 0 to 1 position along wall length
  width: number; // meters (e.g. 1.2m)
  height: number; // meters (e.g. 1.4m)
  elevationFromFloor: number; // sill height, e.g. 0.9m
  type: WindowType;
  frameMaterialId?: string;
  glassMaterialId?: string;
}

export interface RoomData {
  id: string;
  floorId: string;
  name: string;
  type: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'dining' | 'office' | 'hallway' | 'balcony' | 'garage' | 'other';
  color: string;
  polygon: Point2D[];
  area: number; // square meters
  perimeter: number; // meters
  floorMaterialId?: string;
  ceilingMaterialId?: string;
  wallIds: string[];
}

export interface FurnitureData {
  id: string;
  floorId: string;
  assetId: string;
  name: string;
  category: 'seating' | 'tables' | 'beds' | 'storage' | 'kitchen' | 'bathroom' | 'lighting' | 'decor' | 'plants' | 'office';
  position: Point3D; // x, y (elevation/height), z (2D Y maps to 3D Z)
  rotation: Point3D; // Euler angles in radians (e.g. y-axis rotation for 2D orientation)
  scale: Point3D;
  dimensions: {
    width: number; // x axis
    depth: number; // z axis
    height: number; // y axis
  };
  materialOverrides?: Record<string, string>;
  modelUrl?: string;
}

export type RoofType =
  | 'none'
  | 'flat'
  | 'gable'
  | 'hip'
  | 'shed'
  | 'mansard'
  | 'gambrel'
  | 'vaulted'
  | 'green';

export interface RoofData {
  id: string;
  floorId: string;
  type: RoofType;
  name?: string;
  pitch: number; // degrees (e.g. 0 to 60)
  overhang: number; // meters (e.g. 0.3 to 0.8)
  thickness: number; // meters (structural rafter/slab depth, e.g. 0.25)
  fasciaDepth: number; // meters (eaves fascia depth, e.g. 0.18)
  parapetHeight?: number; // meters for flat / green roofs (e.g. 0.5 to 1.0)
  ridgeOrientation?: 'longitudinal' | 'transverse';
  elevationOffset?: number; // meters above floor level (defaults to floor ceiling height)
  polygon: Point2D[]; // perimeter polygon in world coordinates (meters)
  materialId?: string;
  color?: string;
  hasSolarPanels?: boolean;
  solarDensity?: number; // 0.2 to 1.0
  showTrusses?: boolean;
  trussType?: 'none' | 'king_post' | 'queen_post' | 'fink';
  hasGutters?: boolean;
  drainageSlope?: number; // % slope for flat roofs (e.g. 1.5% to 2.0%)
}

export type LightType = 'sun' | 'ambient' | 'point' | 'spot';

export interface LightData {
  id: string;
  floorId: string;
  type: LightType;
  position: Point3D;
  intensity: number;
  color: string;
  castShadow: boolean;
  distance?: number;
  decay?: number;
}

export interface DimensionData {
  id: string;
  floorId: string;
  start: Point2D;
  end: Point2D;
  offset: number;
  text?: string;
  calculatedLength: number;
}

export interface FloorData {
  id: string;
  level: number;
  name: string;
  elevation: number; // vertical height offset from ground
  height: number; // ceiling height for this floor
  walls: WallData[];
  doors: DoorData[];
  windows: WindowData[];
  rooms: RoomData[];
  furniture: FurnitureData[];
  roofs: RoofData[];
  lights: LightData[];
  dimensions: DimensionData[];
}

export interface MaterialDef {
  id: string;
  name: string;
  category: 'flooring' | 'walls' | 'wood' | 'metal' | 'glass' | 'concrete' | 'tiles' | 'fabric';
  color: string;
  roughness: number;
  metalness: number;
  textureUrl?: string;
  bumpUrl?: string;
  repeat?: [number, number];
}

export interface CameraState {
  mode: 'orbit' | 'first_person' | 'isometric' | 'top_down';
  position: Point3D;
  target: Point3D;
  zoom: number;
}

export interface ProjectDocument {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  activeFloorId: string;
  floors: FloorData[];
  materials: MaterialDef[];
  settings: ProjectSettings;
  camera: CameraState;
}
