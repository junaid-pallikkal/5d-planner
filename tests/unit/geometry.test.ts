import { describe, it, expect } from 'vitest';
import { Vector2DMath } from '@/lib/geometry/vector2d';
import { WallMath } from '@/lib/geometry/wall-math';
import { SnappingService } from '@/lib/geometry/snapping';
import { RoomDetectionService } from '@/lib/geometry/room-detection';
import { DimensionService } from '@/lib/geometry/dimensions';
import { WallData } from '@/types/project';

describe('Geometry Services', () => {
  it('calculates vector distances and midpoints accurately', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 3, y: 4 };

    expect(Vector2DMath.distance(p1, p2)).toBe(5);
    expect(Vector2DMath.midpoint(p1, p2)).toEqual({ x: 1.5, y: 2 });
  });

  it('computes wall length and 2D thickened polygon', () => {
    const wall: WallData = {
      id: 'w1',
      floorId: 'f1',
      start: { x: 0, y: 0 },
      end: { x: 4, y: 0 },
      thickness: 0.2,
      height: 2.8,
      isExterior: true,
    };

    expect(WallMath.length(wall)).toBe(4);
    const poly = WallMath.getWallPolygon(wall);
    expect(poly.length).toBe(4);
    // Wall along X-axis: normal points along Y-axis (+0.1 and -0.1)
    expect(poly[0]).toEqual({ x: 0, y: 0.1 });
    expect(poly[1]).toEqual({ x: 4, y: 0.1 });
    expect(poly[2]).toEqual({ x: 4, y: -0.1 });
    expect(poly[3]).toEqual({ x: 0, y: -0.1 });
  });

  it('snaps to grid and endpoints', () => {
    const point = { x: 1.08, y: 2.45 };
    const snappedGrid = SnappingService.snapToGrid(point, 0.5);
    expect(snappedGrid).toEqual({ x: 1.0, y: 2.5 });

    const existingWall: WallData = {
      id: 'w1',
      floorId: 'f1',
      start: { x: 0, y: 0 },
      end: { x: 5, y: 0 },
      thickness: 0.2,
      height: 2.8,
      isExterior: true,
    };

    const snapResult = SnappingService.snap(
      { x: 5.08, y: 0.05 },
      [existingWall],
      { threshold: 0.2 }
    );
    expect(snapResult.snapped).toBe(true);
    expect(snapResult.snapType).toBe('endpoint');
    expect(snapResult.point).toEqual({ x: 5, y: 0 });
  });

  it('automatically detects closed rooms and computes accurate area', () => {
    // 4 walls forming a 4m x 5m rectangular room (Area = 20 m²)
    const walls: WallData[] = [
      { id: 'w1', floorId: 'f1', start: { x: 0, y: 0 }, end: { x: 4, y: 0 }, thickness: 0.2, height: 2.8, isExterior: true },
      { id: 'w2', floorId: 'f1', start: { x: 4, y: 0 }, end: { x: 4, y: 5 }, thickness: 0.2, height: 2.8, isExterior: true },
      { id: 'w3', floorId: 'f1', start: { x: 4, y: 5 }, end: { x: 0, y: 5 }, thickness: 0.2, height: 2.8, isExterior: true },
      { id: 'w4', floorId: 'f1', start: { x: 0, y: 5 }, end: { x: 0, y: 0 }, thickness: 0.2, height: 2.8, isExterior: true },
    ];

    const rooms = RoomDetectionService.detectRooms(walls, 'f1');
    expect(rooms.length).toBe(1);
    expect(rooms[0].area).toBe(20);
    expect(rooms[0].perimeter).toBe(18);
  });

  it('formats dimensions correctly across unit systems', () => {
    expect(DimensionService.formatDistance(3.5, 'metric_m')).toBe('3.50 m');
    expect(DimensionService.formatDistance(3.5, 'metric_mm')).toBe('3500 mm');
    expect(DimensionService.formatArea(20, 'metric_m')).toBe('20.00 m²');
  });
});
