import { ProjectDocument, FloorData } from '@/types/project';
import { WallMath } from '../geometry/wall-math';

export class SvgExporter {
  static exportFloorToSvg(floor: FloorData, projectName: string): string {
    // Determine bounding box
    let minX = 0, minY = 0, maxX = 10, maxY = 10;
    const allPoints = [
      ...floor.walls.flatMap((w) => [w.start, w.end]),
      ...floor.rooms.flatMap((r) => r.polygon),
    ];

    if (allPoints.length > 0) {
      minX = Math.min(...allPoints.map((p) => p.x)) - 1;
      minY = Math.min(...allPoints.map((p) => p.y)) - 1;
      maxX = Math.max(...allPoints.map((p) => p.x)) + 1;
      maxY = Math.max(...allPoints.map((p) => p.y)) + 1;
    }

    const width = Math.max(12, maxX - minX);
    const height = Math.max(12, maxY - minY);
    const scale = 50; // 50px per meter
    const svgWidth = width * scale;
    const svgHeight = height * scale;

    const toSvgCoord = (x: number, y: number) => {
      return {
        x: (x - minX) * scale,
        y: (y - minY) * scale,
      };
    };

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">\n`;
    svg += `  <style>
    .wall { fill: #1e293b; stroke: #0f172a; stroke-width: 1.5; }
    .room { fill: #3b82f6; fill-opacity: 0.12; stroke: #3b82f6; stroke-dasharray: 4,4; stroke-width: 1; }
    .door { stroke: #ea580c; stroke-width: 2; fill: none; }
    .window { stroke: #0284c7; stroke-width: 3; stroke-linecap: round; }
    .text-room { font-family: sans-serif; font-size: 13px; font-weight: 600; fill: #1e293b; text-anchor: middle; }
    .text-dim { font-family: monospace; font-size: 11px; fill: #64748b; text-anchor: middle; }
  </style>\n`;

    // Background
    svg += `  <rect width="100%" height="100%" fill="#ffffff" />\n`;

    // Rooms
    for (const room of floor.rooms) {
      if (room.polygon.length < 3) continue;
      const pts = room.polygon.map((p) => {
        const sc = toSvgCoord(p.x, p.y);
        return `${sc.x},${sc.y}`;
      }).join(' ');
      svg += `  <polygon points="${pts}" class="room" />\n`;

      const cx = room.polygon.reduce((sum, p) => sum + p.x, 0) / room.polygon.length;
      const cy = room.polygon.reduce((sum, p) => sum + p.y, 0) / room.polygon.length;
      const centerSvg = toSvgCoord(cx, cy);
      svg += `  <text x="${centerSvg.x}" y="${centerSvg.y}" class="text-room">${room.name}</text>\n`;
      svg += `  <text x="${centerSvg.x}" y="${centerSvg.y + 16}" class="text-dim">${room.area} m²</text>\n`;
    }

    // Walls
    for (const wall of floor.walls) {
      const poly = WallMath.getWallPolygon(wall);
      const pts = poly.map((p) => {
        const sc = toSvgCoord(p.x, p.y);
        return `${sc.x},${sc.y}`;
      }).join(' ');
      svg += `  <polygon points="${pts}" class="wall" />\n`;
    }

    // Doors
    for (const door of floor.doors) {
      const parentWall = floor.walls.find((w) => w.id === door.wallId);
      if (!parentWall) continue;
      const pos = WallMath.pointAtRatio(parentWall, door.distanceRatio);
      const sc = toSvgCoord(pos.x, pos.y);
      svg += `  <circle cx="${sc.x}" cy="${sc.y}" r="${(door.width * scale) / 2}" class="door" />\n`;
    }

    // Windows
    for (const win of floor.windows) {
      const parentWall = floor.walls.find((w) => w.id === win.wallId);
      if (!parentWall) continue;
      const pos = WallMath.pointAtRatio(parentWall, win.distanceRatio);
      const sc = toSvgCoord(pos.x, pos.y);
      const normal = WallMath.normal(parentWall);
      const halfW = (win.width * scale) / 2;
      const dir = WallMath.direction(parentWall);
      const x1 = sc.x - dir.x * halfW;
      const y1 = sc.y - dir.y * halfW;
      const x2 = sc.x + dir.x * halfW;
      const y2 = sc.y + dir.y * halfW;
      svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="window" />\n`;
    }

    svg += `</svg>`;
    return svg;
  }

  static downloadSvg(project: ProjectDocument, floorId?: string) {
    const floor =
      project.floors.find((f) => f.id === floorId) ||
      project.floors.find((f) => f.id === project.activeFloorId) ||
      project.floors[0];

    const svgString = this.exportFloorToSvg(floor, project.name);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
