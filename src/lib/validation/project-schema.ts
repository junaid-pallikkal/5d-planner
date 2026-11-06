import { z } from 'zod';

export const Point2DSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const Point3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const WallSchema = z.object({
  id: z.string(),
  floorId: z.string(),
  start: Point2DSchema,
  end: Point2DSchema,
  thickness: z.number().min(0.01).max(2.0),
  height: z.number().min(0.5).max(20.0),
  isExterior: z.boolean(),
  interiorMaterialId: z.string().optional(),
  exteriorMaterialId: z.string().optional(),
});

export const DoorSchema = z.object({
  id: z.string(),
  wallId: z.string(),
  floorId: z.string(),
  distanceRatio: z.number().min(0).max(1),
  width: z.number().positive(),
  height: z.number().positive(),
  type: z.enum(['single', 'double', 'sliding', 'pocket', 'bifold']),
  swingDirection: z.enum(['inward_left', 'inward_right', 'outward_left', 'outward_right']),
});

export const WindowSchema = z.object({
  id: z.string(),
  wallId: z.string(),
  floorId: z.string(),
  distanceRatio: z.number().min(0).max(1),
  width: z.number().positive(),
  height: z.number().positive(),
  elevationFromFloor: z.number().min(0),
  type: z.enum(['fixed', 'casement', 'sliding', 'awning', 'double_hung']),
});

export const RoomSchema = z.object({
  id: z.string(),
  floorId: z.string(),
  name: z.string(),
  type: z.string(),
  color: z.string(),
  polygon: z.array(Point2DSchema),
  area: z.number().min(0),
  perimeter: z.number().min(0),
  floorMaterialId: z.string().optional(),
  ceilingMaterialId: z.string().optional(),
  wallIds: z.array(z.string()),
});

export const FurnitureSchema = z.object({
  id: z.string(),
  floorId: z.string(),
  assetId: z.string(),
  name: z.string(),
  category: z.string(),
  position: Point3DSchema,
  rotation: Point3DSchema,
  scale: Point3DSchema,
  dimensions: z.object({
    width: z.number(),
    depth: z.number(),
    height: z.number(),
  }),
});

export const FloorSchema = z.object({
  id: z.string(),
  level: z.number(),
  name: z.string(),
  elevation: z.number(),
  height: z.number(),
  walls: z.array(WallSchema),
  doors: z.array(DoorSchema),
  windows: z.array(WindowSchema),
  rooms: z.array(RoomSchema),
  furniture: z.array(FurnitureSchema),
  roofs: z.array(z.any()).default([]),
  lights: z.array(z.any()).default([]),
  dimensions: z.array(z.any()).default([]),
});

export const ProjectDocumentSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number(),
  activeFloorId: z.string(),
  floors: z.array(FloorSchema),
  materials: z.array(z.any()),
  settings: z.any(),
  camera: z.any(),
});
