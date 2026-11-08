"use client";

import React from "react";
import { Layer, Group, Line, Text, Arrow } from "react-konva";
import { RoofData } from "@/types/project";
import { ViewportTransform, CoordinateService } from "@/lib/geometry/coordinates";

interface RoofLayerProps {
  roofs: RoofData[];
  transform: ViewportTransform;
  selectedId: string | null;
  onSelectRoof?: (id: string) => void;
  visible?: boolean;
}

export const RoofLayer: React.FC<RoofLayerProps> = ({
  roofs,
  transform,
  selectedId,
  onSelectRoof,
  visible = true,
}) => {
  if (!visible || !roofs || roofs.length === 0) return null;
  const baseScale = CoordinateService.PIXELS_PER_METER_DEFAULT;

  return (
    <Layer>
      {roofs.map((roof) => {
        if (roof.type === 'none' || !roof.polygon || roof.polygon.length < 3) return null;
        const isSelected = selectedId === roof.id;

        // Convert polygon vertices to screen coordinates
        const flatPoints: number[] = [];
        roof.polygon.forEach((pt) => {
          const sc = CoordinateService.worldToScreen(pt, transform, baseScale);
          flatPoints.push(sc.x, sc.y);
        });

        // Compute bounding box in screen coords
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let i = 0; i < flatPoints.length; i += 2) {
          minX = Math.min(minX, flatPoints[i]);
          maxX = Math.max(maxX, flatPoints[i]);
          minY = Math.min(minY, flatPoints[i + 1]);
          maxY = Math.max(maxY, flatPoints[i + 1]);
        }
        const midX = (minX + maxX) / 2;
        const midY = (minY + maxY) / 2;

        const isLongitudinal = roof.ridgeOrientation !== 'transverse';

        return (
          <Group
            key={roof.id}
            onClick={() => onSelectRoof?.(roof.id)}
            onTap={() => onSelectRoof?.(roof.id)}
          >
            {/* Eaves Boundary Outline */}
            <Line
              points={flatPoints}
              closed
              fill={roof.color ? `${roof.color}15` : "rgba(22, 163, 74, 0.08)"}
              stroke={isSelected ? "#16a34a" : "#475569"}
              strokeWidth={isSelected ? 2 : 1.2}
              dash={isSelected ? undefined : [6, 4]}
            />

            {/* Architectural Ridge Line for Gable / Gambrel / Mansard */}
            {roof.type === 'gable' && (
              isLongitudinal ? (
                <Line
                  points={[minX, midY, maxX, midY]}
                  stroke={isSelected ? "#16a34a" : "#1e293b"}
                  strokeWidth={2}
                />
              ) : (
                <Line
                  points={[midX, minY, midX, maxY]}
                  stroke={isSelected ? "#16a34a" : "#1e293b"}
                  strokeWidth={2}
                />
              )
            )}

            {/* Hip Lines for Hip Roof */}
            {roof.type === 'hip' && (
              <>
                <Line
                  points={[minX + (maxX - minX) * 0.2, midY, maxX - (maxX - minX) * 0.2, midY]}
                  stroke={isSelected ? "#16a34a" : "#1e293b"}
                  strokeWidth={2}
                />
                <Line points={[minX, minY, minX + (maxX - minX) * 0.2, midY]} stroke="#1e293b" strokeWidth={1.5} />
                <Line points={[minX, maxY, minX + (maxX - minX) * 0.2, midY]} stroke="#1e293b" strokeWidth={1.5} />
                <Line points={[maxX, minY, maxX - (maxX - minX) * 0.2, midY]} stroke="#1e293b" strokeWidth={1.5} />
                <Line points={[maxX, maxY, maxX - (maxX - minX) * 0.2, midY]} stroke="#1e293b" strokeWidth={1.5} />
              </>
            )}

            {/* Single Slope Arrow for Shed Roof */}
            {roof.type === 'shed' && (
              <Arrow
                points={[midX, maxY - 20, midX, minY + 20]}
                pointerLength={8}
                pointerWidth={8}
                fill="#16a34a"
                stroke="#16a34a"
                strokeWidth={1.5}
              />
            )}

            {/* Roof Tag & Engineering Callout */}
            <Group x={midX} y={midY - 14}>
              <Text
                text={`${roof.name || roof.type.toUpperCase() + ' ROOF'} (${roof.pitch.toFixed(0)}°)`}
                fontSize={10}
                fontFamily="monospace"
                fontStyle="bold"
                fill="#202124"
                align="center"
                offsetX={60}
                width={120}
              />
              <Text
                text={`Overhang: ${roof.overhang * 1000}mm`}
                y={12}
                fontSize={8}
                fontFamily="monospace"
                fill="#6B7280"
                align="center"
                offsetX={50}
                width={100}
              />
            </Group>
          </Group>
        );
      })}
    </Layer>
  );
};
