import { Point2D, BoundingBox2D } from '@/types/geometry';
import { WallData, FurnitureData, RoomData } from '@/types/project';
import { Vector2DMath } from './vector2d';
import { WallMath } from './wall-math';

export class CollisionService {
  /**
   * Ray casting algorithm to check if a point is inside a polygon.
   */
  static isPointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
    const n = polygon.length;
    if (n < 3) return false;

    let inside = false;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;

      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Check if point is inside a wall rectangle (or within wall thickness).
   */
  static isPointOnWall(point: Point2D, wall: WallData, tolerance = 0.05): boolean {
    const dist = Vector2DMath.distanceToSegment(point, {
      start: wall.start,
      end: wall.end,
    });
    return dist <= wall.thickness / 2 + tolerance;
  }

  /**
   * Check if point is inside a 2D furniture bounding box.
   */
  static isPointOnFurniture(point: Point2D, furniture: FurnitureData): boolean {
    // 2D position is (x, z)
    const centerX = furniture.position.x;
    const centerY = furniture.position.z;
    const width = furniture.dimensions.width;
    const depth = furniture.dimensions.depth;
    const rot = furniture.rotation.y; // rotation around Y axis

    // Transform point to furniture local space
    const dx = point.x - centerX;
    const dy = point.y - centerY;

    const cos = Math.cos(-rot);
    const sin = Math.sin(-rot);

    const localX = cos * dx - sin * dy;
    const localY = sin * dx + cos * dy;

    return (
      Math.abs(localX) <= width / 2 &&
      Math.abs(localY) <= depth / 2
    );
  }

  /**
   * Check if two bounding boxes intersect.
   */
  static boundingBoxIntersect(a: BoundingBox2D, b: BoundingBox2D): boolean {
    return (
      a.minX <= b.maxX &&
      a.maxX >= b.minX &&
      a.minY <= b.maxY &&
      a.maxY >= b.minY
    );
  }
}
