"use client";

import React from "react";
import { Layer, Line, Text, Group } from "react-konva";
import { DimensionData, UnitType } from "@/types/project";
import { ViewportTransform, CoordinateService } from "@/lib/geometry/coordinates";
import { DimensionService } from "@/lib/geometry/dimensions";

interface DimensionsLayerProps {
  dimensions: DimensionData[];
  transform: ViewportTransform;
  selectedId: string | null;
  unit?: UnitType;
  onSelectDimension?: (id: string) => void;
}

export const DimensionsLayer: React.FC<DimensionsLayerProps> = ({
  dimensions,
  transform,
  selectedId,
  unit = "metric_m",
  onSelectDimension,
}) => {
  const baseScale = CoordinateService.PIXELS_PER_METER_DEFAULT;

  return (
    <Layer>
      {dimensions.map((dim) => {
        const layout = DimensionService.computeDimensionLayout(
          dim.start,
          dim.end,
          dim.offset || 0.4
        );

        const p1 = CoordinateService.worldToScreen(layout.dimLine.start, transform, baseScale);
        const p2 = CoordinateService.worldToScreen(layout.dimLine.end, transform, baseScale);
        const w1Start = CoordinateService.worldToScreen(layout.startWitness.from, transform, baseScale);
        const w2Start = CoordinateService.worldToScreen(layout.endWitness.from, transform, baseScale);
        const textPos = CoordinateService.worldToScreen(layout.textPos, transform, baseScale);

        const isSelected = selectedId === dim.id;
        const color = isSelected ? "#2563eb" : "#f59e0b";
        const labelText = dim.text || DimensionService.formatDistance(layout.length, unit);

        return (
          <Group
            key={dim.id}
            onClick={() => onSelectDimension?.(dim.id)}
            onTap={() => onSelectDimension?.(dim.id)}
          >
            {/* Witness line 1 */}
            <Line
              points={[w1Start.x, w1Start.y, p1.x, p1.y]}
              stroke={color}
              strokeWidth={0.6}
              dash={[2, 2]}
              opacity={0.6}
            />
            {/* Witness line 2 */}
            <Line
              points={[w2Start.x, w2Start.y, p2.x, p2.y]}
              stroke={color}
              strokeWidth={0.6}
              dash={[2, 2]}
              opacity={0.6}
            />
            {/* Main dimension line */}
            <Line
              points={[p1.x, p1.y, p2.x, p2.y]}
              stroke={color}
              strokeWidth={0.8}
            />

            {/* 45-degree architectural slash ticks at ends */}
            <Line
              points={[p1.x - 3, p1.y + 3, p1.x + 3, p1.y - 3]}
              stroke={color}
              strokeWidth={1.2}
            />
            <Line
              points={[p2.x - 3, p2.y + 3, p2.x + 3, p2.y - 3]}
              stroke={color}
              strokeWidth={1.2}
            />

            {/* Dimension Text */}
            <Text
              x={textPos.x}
              y={textPos.y - 11}
              text={labelText}
              fontSize={9}
              fontFamily="monospace"
              fontStyle="500"
              fill={color}
              align="center"
              offsetX={35}
              width={70}
              listening={false}
            />
          </Group>
        );
      })}
    </Layer>
  );
};
