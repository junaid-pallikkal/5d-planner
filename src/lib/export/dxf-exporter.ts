import { ProjectDocument, FloorData } from '@/types/project';
import { WallMath } from '../geometry/wall-math';

export class DxfExporter {
  /**
   * Generates standard AutoCAD DXF Release 12 / 2000 ASCII format text.
   */
  static exportFloorToDxf(floor: FloorData, projectName: string): string {
    const lines: string[] = [];

    // Header section
    lines.push('0', 'SECTION', '2', 'HEADER');
    lines.push('9', '$ACADVER', '1', 'AC1009'); // AutoCAD R12 standard DXF
    lines.push('9', '$INSUNITS', '70', '6'); // 6 = Meters
    lines.push('0', 'ENDSEC');

    // Tables section (Layers)
    lines.push('0', 'SECTION', '2', 'TABLES');
    lines.push('0', 'TABLE', '2', 'LAYER', '70', '5');

    const addLayer = (name: string, color: number) => {
      lines.push('0', 'LAYER', '2', name, '70', '0', '62', color.toString(), '6', 'CONTINUOUS');
    };

    addLayer('WALLS', 7); // White / Black
    addLayer('DOORS', 1); // Red
    addLayer('WINDOWS', 4); // Cyan
    addLayer('DIMENSIONS', 2); // Yellow
    addLayer('ROOMS', 3); // Green
    addLayer('FURNITURE', 5); // Blue

    lines.push('0', 'ENDTAB');
    lines.push('0', 'ENDSEC');

    // Entities section
    lines.push('0', 'SECTION', '2', 'ENTITIES');

    // Export Walls as 2D Polylines / Lines
    for (const wall of floor.walls) {
      const poly = WallMath.getWallPolygon(wall);
      lines.push('0', 'POLYLINE', '8', 'WALLS', '66', '1', '70', '1'); // 70=1 closed polyline
      for (const pt of poly) {
        lines.push('0', 'VERTEX', '8', 'WALLS', '10', pt.x.toFixed(4), '20', pt.y.toFixed(4), '30', '0.0');
      }
      lines.push('0', 'SEQEND');
    }

    // Export Doors
    for (const door of floor.doors) {
      const parentWall = floor.walls.find((w) => w.id === door.wallId);
      if (!parentWall) continue;
      const pt = WallMath.pointAtRatio(parentWall, door.distanceRatio);
      lines.push('0', 'POINT', '8', 'DOORS', '10', pt.x.toFixed(4), '20', pt.y.toFixed(4), '30', '0.0');
    }

    // Export Windows
    for (const win of floor.windows) {
      const parentWall = floor.walls.find((w) => w.id === win.wallId);
      if (!parentWall) continue;
      const pt = WallMath.pointAtRatio(parentWall, win.distanceRatio);
      lines.push('0', 'POINT', '8', 'WINDOWS', '10', pt.x.toFixed(4), '20', pt.y.toFixed(4), '30', '0.0');
    }

    // Export Dimensions
    for (const dim of floor.dimensions) {
      lines.push('0', 'LINE', '8', 'DIMENSIONS');
      lines.push('10', dim.start.x.toFixed(4), '20', dim.start.y.toFixed(4), '30', '0.0');
      lines.push('11', dim.end.x.toFixed(4), '21', dim.end.y.toFixed(4), '31', '0.0');
    }

    // Export Room Labels (TEXT entity)
    for (const room of floor.rooms) {
      if (room.polygon.length < 3) continue;
      const cx = room.polygon.reduce((acc, p) => acc + p.x, 0) / room.polygon.length;
      const cy = room.polygon.reduce((acc, p) => acc + p.y, 0) / room.polygon.length;

      lines.push('0', 'TEXT', '8', 'ROOMS');
      lines.push('10', cx.toFixed(4), '20', cy.toFixed(4), '30', '0.0');
      lines.push('40', '0.25'); // text height (0.25m)
      lines.push('1', `${room.name} (${room.area}m²)`);
    }

    lines.push('0', 'ENDSEC');
    lines.push('0', 'EOF');

    return lines.join('\n');
  }

  static downloadDxf(project: ProjectDocument, floorId?: string) {
    const floor =
      project.floors.find((f) => f.id === floorId) ||
      project.floors.find((f) => f.id === project.activeFloorId) ||
      project.floors[0];

    const dxfString = this.exportFloorToDxf(floor, project.name);
    const blob = new Blob([dxfString], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_${floor.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.dxf`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
