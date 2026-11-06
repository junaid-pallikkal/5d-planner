import { Point2D, Vector2D, Line2D, BoundingBox2D } from '@/types/geometry';

export class Vector2DMath {
  static distance(p1: Point2D, p2: Point2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.hypot(dx, dy);
  }

  static distanceSq(p1: Point2D, p2: Point2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return dx * dx + dy * dy;
  }

  static add(p: Point2D, v: Vector2D): Point2D {
    return { x: p.x + v.x, y: p.y + v.y };
  }

  static subtract(p1: Point2D, p2: Point2D): Vector2D {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
  }

  static multiply(v: Vector2D, scalar: number): Vector2D {
    return { x: v.x * scalar, y: v.y * scalar };
  }

  static length(v: Vector2D): number {
    return Math.hypot(v.x, v.y);
  }

  static normalize(v: Vector2D): Vector2D {
    const len = Math.hypot(v.x, v.y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
  }

  static dot(v1: Vector2D, v2: Vector2D): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  static cross(v1: Vector2D, v2: Vector2D): number {
    return v1.x * v2.y - v1.y * v2.x;
  }

  static angle(v: Vector2D): number {
    return Math.atan2(v.y, v.x);
  }

  static angleBetween(v1: Vector2D, v2: Vector2D): number {
    const dot = this.dot(v1, v2);
    const cross = this.cross(v1, v2);
    return Math.atan2(cross, dot);
  }

  static perpendicular(v: Vector2D, clockwise: boolean = true): Vector2D {
    return clockwise ? { x: v.y, y: -v.x } : { x: -v.y, y: v.x };
  }

  static lerp(p1: Point2D, p2: Point2D, t: number): Point2D {
    return {
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
    };
  }

  static midpoint(p1: Point2D, p2: Point2D): Point2D {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  }

  static closestPointOnSegment(point: Point2D, line: Line2D): { point: Point2D; ratio: number } {
    const lineVec = this.subtract(line.end, line.start);
    const lineLenSq = this.distanceSq(line.start, line.end);

    if (lineLenSq === 0) {
      return { point: { ...line.start }, ratio: 0 };
    }

    const pointVec = this.subtract(point, line.start);
    const t = Math.max(0, Math.min(1, this.dot(pointVec, lineVec) / lineLenSq));

    return {
      point: this.add(line.start, this.multiply(lineVec, t)),
      ratio: t,
    };
  }

  static distanceToSegment(point: Point2D, line: Line2D): number {
    const { point: closest } = this.closestPointOnSegment(point, line);
    return this.distance(point, closest);
  }

  static boundingBox(points: Point2D[]): BoundingBox2D {
    if (points.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }
    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;

    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
}
