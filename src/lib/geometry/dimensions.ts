import { UnitType } from '@/types/project';
import { Point2D } from '@/types/geometry';
import { Vector2DMath } from './vector2d';

export class DimensionService {
  /**
   * Formats distance in meters according to selected unit system.
   */
  static formatDistance(meters: number, unit: UnitType = 'metric_m'): string {
    if (meters < 0) meters = 0;

    switch (unit) {
      case 'metric_m':
        return `${meters.toFixed(2)} m`;

      case 'metric_mm':
        return `${Math.round(meters * 1000)} mm`;

      case 'imperial_ft_in': {
        const totalInches = meters * 39.3701;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${feet}'-${inches}"`;
      }

      default:
        return `${meters.toFixed(2)} m`;
    }
  }

  /**
   * Formats area in square meters according to unit system.
   */
  static formatArea(sqMeters: number, unit: UnitType = 'metric_m'): string {
    switch (unit) {
      case 'metric_m':
      case 'metric_mm':
        return `${sqMeters.toFixed(2)} m²`;

      case 'imperial_ft_in': {
        const sqFeet = sqMeters * 10.7639;
        return `${sqFeet.toFixed(1)} sq ft`;
      }

      default:
        return `${sqMeters.toFixed(2)} m²`;
    }
  }

  /**
   * Generates CAD dimension line geometry with witness lines, leader offset, and text position.
   */
  static computeDimensionLayout(
    start: Point2D,
    end: Point2D,
    offsetMeters: number = 0.4
  ) {
    const length = Vector2DMath.distance(start, end);
    const dir = Vector2DMath.normalize(Vector2DMath.subtract(end, start));
    const normal = { x: -dir.y, y: dir.x }; // Perpendicular

    const offsetVec = Vector2DMath.multiply(normal, offsetMeters);

    const dimStart = Vector2DMath.add(start, offsetVec);
    const dimEnd = Vector2DMath.add(end, offsetVec);
    const midPoint = Vector2DMath.midpoint(dimStart, dimEnd);

    const angle = (Math.atan2(dir.y, dir.x) * 180) / Math.PI;

    return {
      length,
      startWitness: { from: start, to: dimStart },
      endWitness: { from: end, to: dimEnd },
      dimLine: { start: dimStart, end: dimEnd },
      textPos: midPoint,
      angle: angle > 90 || angle < -90 ? angle + 180 : angle,
    };
  }
}
