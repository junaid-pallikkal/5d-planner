export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Line2D {
  start: Point2D;
  end: Point2D;
}

export interface Polygon2D {
  points: Point2D[];
}

export interface BoundingBox2D {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface WallThickness {
  interior: number; // e.g. 0.15m (150mm)
  exterior: number; // e.g. 0.25m (250mm)
  partition: number; // e.g. 0.10m (100mm)
}

export interface SnapResult {
  snapped: boolean;
  point: Point2D;
  snapType?: 'grid' | 'endpoint' | 'midpoint' | 'perpendicular' | 'intersection' | 'parallel';
  targetId?: string;
  distance?: number;
}

export interface WallIntersection {
  wallId: string;
  point: Point2D;
  parameter: number; // 0 to 1 along wall
}
