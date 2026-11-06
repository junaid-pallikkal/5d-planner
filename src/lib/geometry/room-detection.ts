import { Point2D } from '@/types/geometry';
import { WallData, RoomData } from '@/types/project';
import { Vector2DMath } from './vector2d';

interface GraphNode {
  id: string;
  point: Point2D;
  edges: DirectedEdge[];
}

interface DirectedEdge {
  from: string;
  to: string;
  wallId: string;
  angle: number;
}

export class RoomDetectionService {
  /**
   * Calculates signed area of a polygon using Shoelace formula.
   * Positive = Counter-Clockwise (interior room if traversed left-handed)
   * Negative = Clockwise
   */
  static calculateSignedArea(polygon: Point2D[]): number {
    const n = polygon.length;
    if (n < 3) return 0;

    let area = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += polygon[i].x * polygon[j].y;
      area -= polygon[j].x * polygon[i].y;
    }
    return area / 2;
  }

  /**
   * Calculates absolute area in square meters.
   */
  static calculateArea(polygon: Point2D[]): number {
    return Math.abs(this.calculateSignedArea(polygon));
  }

  /**
   * Calculates perimeter of polygon in meters.
   */
  static calculatePerimeter(polygon: Point2D[]): number {
    const n = polygon.length;
    if (n < 2) return 0;

    let perimeter = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      perimeter += Vector2DMath.distance(polygon[i], polygon[j]);
    }
    return perimeter;
  }

  /**
   * Calculates centroid of polygon.
   */
  static calculateCentroid(polygon: Point2D[]): Point2D {
    const n = polygon.length;
    if (n === 0) return { x: 0, y: 0 };
    if (n === 1) return { ...polygon[0] };
    if (n === 2) return Vector2DMath.midpoint(polygon[0], polygon[1]);

    let signedArea = 0;
    let cx = 0;
    let cy = 0;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const factor = polygon[i].x * polygon[j].y - polygon[j].x * polygon[i].y;
      signedArea += factor;
      cx += (polygon[i].x + polygon[j].x) * factor;
      cy += (polygon[i].y + polygon[j].y) * factor;
    }

    signedArea /= 2;
    if (Math.abs(signedArea) < 1e-5) {
      // Degenerate fallback: arithmetic average
      const sum = polygon.reduce(
        (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
        { x: 0, y: 0 }
      );
      return { x: sum.x / n, y: sum.y / n };
    }

    const area6 = 6 * signedArea;
    return {
      x: cx / area6,
      y: cy / area6,
    };
  }

  /**
   * Automatically detects all enclosed rooms from a set of walls.
   */
  static detectRooms(walls: WallData[], floorId: string): RoomData[] {
    if (walls.length < 3) return [];

    const nodesMap = new Map<string, GraphNode>();
    const nodeCoords: { id: string; point: Point2D }[] = [];
    const tolerance = 0.08; // 8cm tolerance for vertex merging

    // 1. Collect and merge vertices
    const getOrCreateNodeId = (pt: Point2D): string => {
      for (const node of nodeCoords) {
        if (Vector2DMath.distance(pt, node.point) <= tolerance) {
          return node.id;
        }
      }
      const newId = `node_${nodeCoords.length + 1}`;
      nodeCoords.push({ id: newId, point: { ...pt } });
      nodesMap.set(newId, { id: newId, point: { ...pt }, edges: [] });
      return newId;
    };

    // 2. Build graph half-edges
    for (const wall of walls) {
      if (Vector2DMath.distance(wall.start, wall.end) < 0.1) continue; // ignore zero-length walls

      const u = getOrCreateNodeId(wall.start);
      const v = getOrCreateNodeId(wall.end);

      if (u === v) continue;

      const pU = nodesMap.get(u)!.point;
      const pV = nodesMap.get(v)!.point;

      const angleUV = Math.atan2(pV.y - pU.y, pV.x - pU.x);
      const angleVU = Math.atan2(pU.y - pV.y, pU.x - pV.x);

      nodesMap.get(u)!.edges.push({
        from: u,
        to: v,
        wallId: wall.id,
        angle: angleUV,
      });

      nodesMap.get(v)!.edges.push({
        from: v,
        to: u,
        wallId: wall.id,
        angle: angleVU,
      });
    }

    // 3. Sort outgoing edges counter-clockwise around each vertex
    for (const node of nodesMap.values()) {
      node.edges.sort((a, b) => a.angle - b.angle);
    }

    // 4. Find all minimal cycles using the left-turn rule
    const visitedHalfEdges = new Set<string>(); // "from->to"
    const cycles: { points: Point2D[]; wallIds: string[] }[] = [];

    for (const node of nodesMap.values()) {
      for (const edge of node.edges) {
        const edgeKey = `${edge.from}->${edge.to}`;
        if (visitedHalfEdges.has(edgeKey)) continue;

        // Trace cycle
        const cyclePoints: Point2D[] = [];
        const cycleWallIds: string[] = [];
        let currFrom = edge.from;
        let currTo = edge.to;
        let currWallId = edge.wallId;
        let isClosed = false;

        const pathEdges: string[] = [];

        for (let step = 0; step < 50; step++) {
          const key = `${currFrom}->${currTo}`;
          if (visitedHalfEdges.has(key)) break;

          visitedHalfEdges.add(key);
          pathEdges.push(key);

          const fromNode = nodesMap.get(currFrom)!;
          cyclePoints.push(fromNode.point);
          cycleWallIds.push(currWallId);

          if (currTo === edge.from && cyclePoints.length >= 3) {
            isClosed = true;
            break;
          }

          const toNode = nodesMap.get(currTo);
          if (!toNode || toNode.edges.length === 0) break;

          // Find incoming edge angle in reverse (from currTo back to currFrom)
          const inAngle = Math.atan2(
            fromNode.point.y - toNode.point.y,
            fromNode.point.x - toNode.point.x
          );

          // Find edge immediately counter-clockwise (next left-turn)
          const edges = toNode.edges;
          let nextEdge: DirectedEdge | null = null;

          // Find edge with angle closest to inAngle in CCW order
          let bestDelta = Infinity;
          for (const e of edges) {
            if (e.to === currFrom && edges.length > 1) continue; // avoid immediate backtrack if possible

            let delta = e.angle - inAngle;
            while (delta <= 0) delta += 2 * Math.PI;
            while (delta > 2 * Math.PI) delta -= 2 * Math.PI;

            if (delta < bestDelta) {
              bestDelta = delta;
              nextEdge = e;
            }
          }

          if (!nextEdge) {
            nextEdge = edges[0];
          }

          currFrom = nextEdge.from;
          currTo = nextEdge.to;
          currWallId = nextEdge.wallId;
        }

        if (isClosed && cyclePoints.length >= 3) {
          // Check signed area. In counter-clockwise traversal, interior faces have positive signed area
          const signedArea = this.calculateSignedArea(cyclePoints);
          if (signedArea > 0.5) {
            // Valid interior room (area > 0.5 m^2)
            cycles.push({
              points: cyclePoints,
              wallIds: Array.from(new Set(cycleWallIds)),
            });
          }
        }
      }
    }

    // Default room names generator
    const roomTypes: RoomData['type'][] = ['living', 'bedroom', 'kitchen', 'bathroom', 'dining', 'office'];
    const colors = ['#16a34a', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#059669'];

    return cycles.map((c, idx) => {
      const type = roomTypes[idx % roomTypes.length];
      const area = this.calculateArea(c.points);
      const perimeter = this.calculatePerimeter(c.points);

      return {
        id: `room_${floorId}_${idx + 1}`,
        floorId,
        name: `Room ${idx + 1}`,
        type,
        color: colors[idx % colors.length],
        polygon: c.points,
        area: Math.round(area * 100) / 100,
        perimeter: Math.round(perimeter * 100) / 100,
        wallIds: c.wallIds,
      };
    });
  }
}
