"use client";

import React from "react";
import { Layer, Line, Circle, Group } from "react-konva";
import { WallData } from "@/types/project";
import { ViewportTransform, CoordinateService } from "@/lib/geometry/coordinates";
import { WallMath } from "@/lib/geometry/wall-math";

interface WallsLayerProps {
  walls: WallData[];
  transform: ViewportTransform;
  selectedId: string | null;
  onSelectWall: (id: string) => void;
  onEndpointDrag?: (wallId: string, which: 'start' | 'end', newPos: { x: number; y: number }) => void;
}

export const WallsLayer: React.FC<WallsLayerProps> = ({
  walls,
  transform,
  selectedId,
  onSelectWall,
  onEndpointDrag,
}) => {
  const baseScale = CoordinateService.PIXELS_PER_METER_DEFAULT;

  return (
    <Layer>
      {walls.map((wall) => {
        const poly = WallMath.getWallPolygon(wall);
        const screenPoly: number[] = [];
        poly.forEach((pt) => {
          const sc = CoordinateService.worldToScreen(pt, transform, baseScale);
          screenPoly.push(sc.x, sc.y);
        });

        const startScreen = CoordinateService.worldToScreen(wall.start, transform, baseScale);
        const endScreen = CoordinateService.worldToScreen(wall.end, transform, baseScale);
        const isSelected = selectedId === wall.id;

        return (
          <Group key={wall.id}>
            {/* Thickened Wall Body */}
            <Line
              points={screenPoly}
              closed
              fill={wall.isExterior ? "#1e293b" : "#334155"}
              stroke={isSelected ? "#2563eb" : "#0f172a"}
              strokeWidth={isSelected ? 2 : 1}
              onClick={() => onSelectWall(wall.id)}
              onTap={() => onSelectWall(wall.id)}
            />

            {/* Wall Centerline */}
            <Line
              points={[startScreen.x, startScreen.y, endScreen.x, endScreen.y]}
              stroke={isSelected ? "#2563eb" : "rgba(100, 116, 139, 0.4)"}
              strokeWidth={0.8}
              dash={[3, 3]}
              listening={false}
            />

            {/* Selection Endpoint Grips for Resizing / Moving */}
            {isSelected && (
              <>
                <Circle
                  x={startScreen.x}
                  y={startScreen.y}
                  radius={6}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth={2}
                  draggable
                  onDragMove={(e) => {
                    const stage = e.target.getStage();
                    if (!stage) return;
                    const pos = CoordinateService.screenToWorld(
                      { x: e.target.x(), y: e.target.y() },
                      transform,
                      baseScale
                    );
                    onEndpointDrag?.(wall.id, 'start', pos);
                  }}
                />
                <Circle
                  x={endScreen.x}
                  y={endScreen.y}
                  radius={6}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth={2}
                  draggable
                  onDragMove={(e) => {
                    const stage = e.target.getStage();
                    if (!stage) return;
                    const pos = CoordinateService.screenToWorld(
                      { x: e.target.x(), y: e.target.y() },
                      transform,
                      baseScale
                    );
                    onEndpointDrag?.(wall.id, 'end', pos);
                  }}
                />
              </>
            )}
          </Group>
        );
      })}
    </Layer>
  );
};
