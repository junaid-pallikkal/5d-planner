"use client";

import React from "react";
import { Layer, Line, Circle, Text, Group } from "react-konva";
import { Point2D, SnapResult } from "@/types/geometry";
import { ViewportTransform, CoordinateService } from "@/lib/geometry/coordinates";
import { Vector2DMath } from "@/lib/geometry/vector2d";
import { DimensionService } from "@/lib/geometry/dimensions";

interface DraftingOverlayProps {
  wallDraftStart: Point2D | null;
  wallDraftCurrent: Point2D | null;
  measureDraftStart: Point2D | null;
  measureDraftEnd: Point2D | null;
  activeSnap: SnapResult | null;
  transform: ViewportTransform;
}

export const DraftingOverlay: React.FC<DraftingOverlayProps> = ({
  wallDraftStart,
  wallDraftCurrent,
  measureDraftStart,
  measureDraftEnd,
  activeSnap,
  transform,
}) => {
  const baseScale = CoordinateService.PIXELS_PER_METER_DEFAULT;

  return (
    <Layer listening={false}>
      {/* Wall Drafting Preview */}
      {wallDraftStart && wallDraftCurrent && (
        <Group>
          {(() => {
            const p1 = CoordinateService.worldToScreen(wallDraftStart, transform, baseScale);
            const p2 = CoordinateService.worldToScreen(wallDraftCurrent, transform, baseScale);
            const distMeters = Vector2DMath.distance(wallDraftStart, wallDraftCurrent);
            const mid = Vector2DMath.midpoint(p1, p2);

            return (
              <>
                {/* Thickened preview */}
                <Line
                  points={[p1.x, p1.y, p2.x, p2.y]}
                  stroke="#3b82f6"
                  strokeWidth={0.2 * transform.scale * baseScale}
                  opacity={0.5}
                />
                {/* Centerline */}
                <Line
                  points={[p1.x, p1.y, p2.x, p2.y]}
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dash={[4, 4]}
                />
                {/* Length callout */}
                <Group x={mid.x} y={mid.y - 18}>
                  <Text
                    text={DimensionService.formatDistance(distMeters)}
                    fontSize={11}
                    fontFamily="monospace"
                    fontStyle="bold"
                    fill="#3b82f6"
                    align="center"
                    offsetX={40}
                    width={80}
                  />
                </Group>
              </>
            );
          })()}
        </Group>
      )}

      {/* Measure Tool Preview */}
      {measureDraftStart && measureDraftEnd && (
        <Group>
          {(() => {
            const p1 = CoordinateService.worldToScreen(measureDraftStart, transform, baseScale);
            const p2 = CoordinateService.worldToScreen(measureDraftEnd, transform, baseScale);
            const dist = Vector2DMath.distance(measureDraftStart, measureDraftEnd);
            const mid = Vector2DMath.midpoint(p1, p2);

            return (
              <>
                <Line
                  points={[p1.x, p1.y, p2.x, p2.y]}
                  stroke="#10b981"
                  strokeWidth={1.5}
                />
                <Circle x={p1.x} y={p1.y} radius={3} fill="#10b981" />
                <Circle x={p2.x} y={p2.y} radius={3} fill="#10b981" />
                <Group x={mid.x} y={mid.y - 18}>
                  <Text
                    text={`Dist: ${dist.toFixed(2)}m`}
                    fontSize={11}
                    fontFamily="monospace"
                    fontStyle="bold"
                    fill="#10b981"
                    align="center"
                    offsetX={45}
                    width={90}
                  />
                </Group>
              </>
            );
          })()}
        </Group>
      )}

      {/* Snap Magnetic Target Indicator */}
      {activeSnap && activeSnap.snapped && (
        <Group>
          {(() => {
            const sc = CoordinateService.worldToScreen(activeSnap.point, transform, baseScale);
            return (
              <>
                <Circle
                  x={sc.x}
                  y={sc.y}
                  radius={7}
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="rgba(16, 185, 129, 0.2)"
                />
                {activeSnap.snapType && (
                  <Text
                    x={sc.x + 10}
                    y={sc.y - 6}
                    text={activeSnap.snapType.toUpperCase()}
                    fontSize={9}
                    fontFamily="monospace"
                    fill="#10b981"
                  />
                )}
              </>
            );
          })()}
        </Group>
      )}
    </Layer>
  );
};
