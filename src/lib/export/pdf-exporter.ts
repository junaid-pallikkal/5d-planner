import { jsPDF } from 'jspdf';
import { ProjectDocument, FloorData } from '@/types/project';
import { WallMath } from '../geometry/wall-math';

export class PdfExporter {
  static async exportFloorPlanPdf(project: ProjectDocument, floorId?: string) {
    const floor =
      project.floors.find((f) => f.id === floorId) ||
      project.floors.find((f) => f.id === project.activeFloorId) ||
      project.floors[0];

    // Landscape A4 sheet (297mm x 210mm)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 297;
    const pageHeight = 210;

    // Outer border & Architectural Title Block
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.8);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Inner sheet frame
    doc.setLineWidth(0.3);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    // Title Block (Bottom Right)
    const tbWidth = 100;
    const tbHeight = 35;
    const tbX = pageWidth - 12 - tbWidth;
    const tbY = pageHeight - 12 - tbHeight;

    doc.rect(tbX, tbY, tbWidth, tbHeight);
    doc.line(tbX, tbY + 12, tbX + tbWidth, tbY + 12);
    doc.line(tbX, tbY + 24, tbX + tbWidth, tbY + 24);
    doc.line(tbX + 50, tbY + 12, tbX + 50, tbY + tbHeight);

    // Project metadata text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(project.name.toUpperCase(), tbX + 5, tbY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`SHEET: ${floor.name.toUpperCase()}`, tbX + 5, tbY + 18);
    doc.text(`SCALE: 1:100 (METRIC)`, tbX + 5, tbY + 22);

    doc.text(`DATE: ${new Date().toLocaleDateString()}`, tbX + 55, tbY + 18);
    doc.text(`PLATFORM: 5D ARCHITECT`, tbX + 55, tbY + 22);
    doc.text(`STATUS: SCHEMATIC DESIGN`, tbX + 5, tbY + 30);

    // Calculate bounding box of walls
    let minX = 0, minY = 0, maxX = 10, maxY = 8;
    const pts = floor.walls.flatMap((w) => [w.start, w.end]);
    if (pts.length > 0) {
      minX = Math.min(...pts.map((p) => p.x));
      minY = Math.min(...pts.map((p) => p.y));
      maxX = Math.max(...pts.map((p) => p.x));
      maxY = Math.max(...pts.map((p) => p.y));
    }

    const modelW = Math.max(8, maxX - minX);
    const modelH = Math.max(6, maxY - minY);

    // Drawing viewport area on sheet
    const viewX = 20;
    const viewY = 25;
    const viewW = 160;
    const viewH = 140;

    const scale = Math.min(viewW / modelW, viewH / modelH) * 0.85;
    const offsetX = viewX + (viewW - modelW * scale) / 2 - minX * scale;
    const offsetY = viewY + (viewH - modelH * scale) / 2 - minY * scale;

    const toMm = (x: number, y: number) => ({
      x: offsetX + x * scale,
      y: offsetY + y * scale,
    });

    // Draw Rooms (Fill lightly)
    doc.setFillColor(241, 245, 249);
    for (const room of floor.rooms) {
      if (room.polygon.length < 3) continue;
      const polyMm = room.polygon.map((p) => toMm(p.x, p.y));
      const first = polyMm[0];
      const rest = polyMm.slice(1).map((p) => [p.x - first.x, p.y - first.y]);

      // Room label
      const cx = room.polygon.reduce((sum, p) => sum + p.x, 0) / room.polygon.length;
      const cy = room.polygon.reduce((sum, p) => sum + p.y, 0) / room.polygon.length;
      const cMm = toMm(cx, cy);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(room.name, cMm.x, cMm.y, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`${room.area} m²`, cMm.x, cMm.y + 4, { align: 'center' });
    }

    // Draw Walls
    doc.setDrawColor(15, 23, 42);
    doc.setFillColor(30, 41, 59);

    for (const wall of floor.walls) {
      const p1 = toMm(wall.start.x, wall.start.y);
      const p2 = toMm(wall.end.x, wall.end.y);
      doc.setLineWidth(wall.thickness * scale * 0.9);
      doc.line(p1.x, p1.y, p2.x, p2.y);
    }

    // Schedule / Table of Areas (Right side)
    const scheduleX = 190;
    const scheduleY = 25;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ROOM SCHEDULE', scheduleX, scheduleY);

    doc.setFontSize(8);
    doc.setLineWidth(0.2);
    doc.line(scheduleX, scheduleY + 2, scheduleX + 90, scheduleY + 2);

    let rowY = scheduleY + 7;
    doc.text('Room', scheduleX, rowY);
    doc.text('Type', scheduleX + 45, rowY);
    doc.text('Area (m²)', scheduleX + 75, rowY);

    rowY += 4;
    doc.line(scheduleX, rowY, scheduleX + 90, rowY);

    doc.setFont('helvetica', 'normal');
    let totalArea = 0;
    for (const room of floor.rooms) {
      rowY += 5;
      doc.text(room.name.substring(0, 20), scheduleX, rowY);
      doc.text(room.type.toUpperCase(), scheduleX + 45, rowY);
      doc.text(`${room.area.toFixed(1)}`, scheduleX + 75, rowY);
      totalArea += room.area;
    }

    rowY += 4;
    doc.line(scheduleX, rowY, scheduleX + 90, rowY);
    rowY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL USABLE AREA', scheduleX, rowY);
    doc.text(`${totalArea.toFixed(1)} m²`, scheduleX + 75, rowY);

    // Save PDF
    doc.save(`${project.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_plan.pdf`);
  }
}
