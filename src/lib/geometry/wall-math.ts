import { Point2D, Line2D } from '@/types/geometry';
import { WallData } from '@/types/project';
import { Vector2DMath } from './vector2d';

export class WallMath {
  static length(wall: Pick<WallData, 'start' | 'end'>): number {
    return Vector2DMath.distance(wall.start, wall.end);
  }

  static direction(wall: Pick<WallData, 'start' | 'end'>): { x: number; y: number } {
    const vec = Vector2DMath.subtract(wall.end, wall.start);
    return Vector2DMath.normalize(vec);
  }

  static normal(wall: Pick<WallData, 'start' | 'end'>): { x: number; y: number } {
    const dir = this.direction(wall);
    return { x: -dir.y, y: dir.x };
  }

  static angle(wall: Pick<WallData, 'start' | 'end'>): number {
    return Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
  }

  /**
   * Generates the 4 corner points of a wall rectangle representing its thickness in 2D.
   */
  static getWallPolygon(wall: WallData): Point2D[] {
    const normal = this.normal(wall);
    const halfThickness = wall.thickness / 2;
    const offset = { x: normal.x * halfThickness, y: normal.y * halfThickness };

    return [
      { x: wall.start.x + offset.x, y: wall.start.y + offset.y },
      { x: wall.end.x + offset.x, y: wall.end.y + offset.y },
      { x: wall.end.x - offset.x, y: wall.end.y - offset.y },
      { x: wall.start.x - offset.x, y: wall.start.y - offset.y },
    ];
  }

  /**
   * Calculates the intersection point of two line segments, if any.
   */
  static segmentIntersection(line1: Line2D, line2: Line2D): Point2D | null {
    const { start: p1, end: p2 } = line1;
    const { start: p3, end: p4 } = line2;

    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(denom) < 1e-9) return null; // parallel or coincident

    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y),
      };
    }

    return null;
  }

  /**
   * Check if two points are approximately coincident within tolerance.
   */
  static arePointsEqual(p1: Point2D, p2: Point2D, tolerance = 0.05): boolean {
    return Vector2DMath.distance(p1, p2) <= tolerance;
  }

  /**
   * Calculate position on wall from distanceRatio (0 to 1).
   */
  static pointAtRatio(wall: WallData, ratio: number): Point2D {
    return Vector2DMath.lerp(wall.start, wall.end, Math.max(0, Math.min(1, ratio)));
  }

  /**
   * Calculate ratio (0 to 1) along wall closest to given point.
   */
  static ratioAtPoint(wall: WallData, point: Point2D): number {
    const { ratio } = Vector2DMath.closestPointOnSegment(point, {
      start: wall.start,
      end: wall.end,
    });
    return ratio;
  }
}
