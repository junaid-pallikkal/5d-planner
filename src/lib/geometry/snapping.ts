import { Point2D, SnapResult } from '@/types/geometry';
import { WallData } from '@/types/project';
import { Vector2DMath } from './vector2d';

export interface SnapOptions {
  gridSize?: number;
  snapToGrid?: boolean;
  snapToEndpoints?: boolean;
  snapToMidpoints?: boolean;
  snapToWalls?: boolean;
  snapAngles?: boolean;
  angleIncrementDeg?: number; // e.g. 15 or 45 degrees
  threshold?: number; // distance in meters for magnetic snapping
  referencePoint?: Point2D; // for angle snapping relative to an active start point
}

export class SnappingService {
  /**
   * Snaps a world point to the nearest grid increment.
   */
  static snapToGrid(point: Point2D, gridSize: number = 0.5): Point2D {
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
    };
  }

  /**
   * Snaps an angle from reference point to nearest increment (e.g. 0, 45, 90, 180 degrees).
   */
  static snapAngle(
    point: Point2D,
    ref: Point2D,
    incrementDeg: number = 45
  ): Point2D {
    const dx = point.x - ref.x;
    const dy = point.y - ref.y;
    const length = Math.hypot(dx, dy);

    if (length === 0) return { ...point };

    const rawAngle = Math.atan2(dy, dx);
    const incrementRad = (incrementDeg * Math.PI) / 180;
    const snappedAngle = Math.round(rawAngle / incrementRad) * incrementRad;

    return {
      x: ref.x + Math.cos(snappedAngle) * length,
      y: ref.y + Math.sin(snappedAngle) * length,
    };
  }

  /**
   * Comprehensive snap computation considering existing walls, endpoints, midpoints, angles and grid.
   */
  static snap(
    rawPoint: Point2D,
    existingWalls: WallData[] = [],
    options: SnapOptions = {}
  ): SnapResult {
    const {
      gridSize = 0.5,
      snapToGrid = true,
      snapToEndpoints = true,
      snapToMidpoints = true,
      snapToWalls = true,
      snapAngles = false,
      angleIncrementDeg = 45,
      threshold = 0.25, // 25cm magnetic snap radius
      referencePoint,
    } = options;

    let candidatePoint = { ...rawPoint };

    // 1. Angle snapping if reference point is active (e.g., drawing a wall from start)
    if (snapAngles && referencePoint) {
      candidatePoint = this.snapAngle(candidatePoint, referencePoint, angleIncrementDeg);
    }

    // 2. High priority: Check existing wall endpoints
    if (snapToEndpoints) {
      let closestDist = threshold;
      let endpointSnap: SnapResult | null = null;

      for (const wall of existingWalls) {
        const distStart = Vector2DMath.distance(candidatePoint, wall.start);
        if (distStart < closestDist) {
          closestDist = distStart;
          endpointSnap = {
            snapped: true,
            point: { ...wall.start },
            snapType: 'endpoint',
            targetId: wall.id,
            distance: distStart,
          };
        }

        const distEnd = Vector2DMath.distance(candidatePoint, wall.end);
        if (distEnd < closestDist) {
          closestDist = distEnd;
          endpointSnap = {
            snapped: true,
            point: { ...wall.end },
            snapType: 'endpoint',
            targetId: wall.id,
            distance: distEnd,
          };
        }
      }

      if (endpointSnap) {
        return endpointSnap;
      }
    }

    // 3. Medium priority: Wall midpoints
    if (snapToMidpoints) {
      let closestDist = threshold;
      let midpointSnap: SnapResult | null = null;

      for (const wall of existingWalls) {
        const mid = Vector2DMath.midpoint(wall.start, wall.end);
        const dist = Vector2DMath.distance(candidatePoint, mid);
        if (dist < closestDist) {
          closestDist = dist;
          midpointSnap = {
            snapped: true,
            point: mid,
            snapType: 'midpoint',
            targetId: wall.id,
            distance: dist,
          };
        }
      }

      if (midpointSnap) {
        return midpointSnap;
      }
    }

    // 4. Wall edge / perpendicular projection snap
    if (snapToWalls) {
      let closestDist = threshold;
      let edgeSnap: SnapResult | null = null;

      for (const wall of existingWalls) {
        const { point: closest, ratio } = Vector2DMath.closestPointOnSegment(
          candidatePoint,
          { start: wall.start, end: wall.end }
        );
        const dist = Vector2DMath.distance(candidatePoint, closest);

        // Only snap to intermediate edge points (endpoints are handled above)
        if (dist < closestDist && ratio > 0.05 && ratio < 0.95) {
          closestDist = dist;
          edgeSnap = {
            snapped: true,
            point: closest,
            snapType: 'perpendicular',
            targetId: wall.id,
            distance: dist,
          };
        }
      }

      if (edgeSnap) {
        return edgeSnap;
      }
    }

    // 5. Fallback: Grid snap
    if (snapToGrid) {
      const gridPoint = this.snapToGrid(candidatePoint, gridSize);
      return {
        snapped: true,
        point: gridPoint,
        snapType: 'grid',
      };
    }

    return {
      snapped: false,
      point: candidatePoint,
    };
  }
}
