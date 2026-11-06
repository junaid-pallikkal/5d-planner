import { describe, it, expect } from 'vitest';
import { ProjectDocumentSchema } from '@/lib/validation/project-schema';
import { TEMPLATE_MINIMALIST_VILLA } from '@/constants/templates';
import { DxfExporter } from '@/lib/export/dxf-exporter';
import { SvgExporter } from '@/lib/export/svg-exporter';

describe('Project Serialization & Exports', () => {
  it('validates the built-in architectural template with Zod schema', () => {
    const result = ProjectDocumentSchema.safeParse(TEMPLATE_MINIMALIST_VILLA);
    expect(result.success).toBe(true);
  });

  it('generates valid AutoCAD DXF ASCII content with required sections and layers', () => {
    const dxf = DxfExporter.exportFloorToDxf(
      TEMPLATE_MINIMALIST_VILLA.floors[0],
      TEMPLATE_MINIMALIST_VILLA.name
    );

    expect(dxf).toContain('SECTION');
    expect(dxf).toContain('HEADER');
    expect(dxf).toContain('AC1009'); // AutoCAD R12 standard
    expect(dxf).toContain('WALLS');
    expect(dxf).toContain('DOORS');
    expect(dxf).toContain('WINDOWS');
    expect(dxf).toContain('POLYLINE');
    expect(dxf).toContain('EOF');
  });

  it('generates standard vector SVG with styles, polygons, and room texts', () => {
    const svg = SvgExporter.exportFloorToSvg(
      TEMPLATE_MINIMALIST_VILLA.floors[0],
      TEMPLATE_MINIMALIST_VILLA.name
    );

    expect(svg).toContain('<svg');
    expect(svg).toContain('class="wall"');
    expect(svg).toContain('class="room"');
    expect(svg).toContain('class="door"');
    expect(svg).toContain('</svg>');
  });
});
