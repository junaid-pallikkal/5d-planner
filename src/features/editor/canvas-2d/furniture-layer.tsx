"use client";

import React from "react";
import { Layer, Rect, Circle, Line, Group, Text } from "react-konva";
import { FurnitureData } from "@/types/project";
import { ViewportTransform, CoordinateService } from "@/lib/geometry/coordinates";

interface FurnitureLayerProps {
  furniture: FurnitureData[];
  transform: ViewportTransform;
  selectedId: string | null;
  onSelectFurniture: (id: string) => void;
  onUpdateFurniturePos: (id: string, pos: { x: number; y: number; z: number }) => void;
  onUpdateFurnitureRot: (id: string, rotY: number) => void;
}

export const FurnitureLayer: React.FC<FurnitureLayerProps> = ({
  furniture,
  transform,
  selectedId,
  onSelectFurniture,
  onUpdateFurniturePos,
  onUpdateFurnitureRot,
}) => {
  const baseScale = CoordinateService.PIXELS_PER_METER_DEFAULT;
  const pixelsPerMeter = transform.scale * baseScale;

  return (
    <Layer>
      {furniture.map((item) => {
        // CAD 2D position: x -> screen.x, z -> screen.y
        const screenPos = CoordinateService.worldToScreen(
          { x: item.position.x, y: item.position.z },
          transform,
          baseScale
        );
        const wPx = item.dimensions.width * pixelsPerMeter;
        const dPx = item.dimensions.depth * pixelsPerMeter;
        const rotDeg = (item.rotation.y * 180) / Math.PI;
        const isSelected = selectedId === item.id;

        return (
          <Group
            key={item.id}
            x={screenPos.x}
            y={screenPos.y}
            rotation={rotDeg}
            draggable
            onClick={() => onSelectFurniture(item.id)}
            onTap={() => onSelectFurniture(item.id)}
            onDragEnd={(e) => {
              const newWorld = CoordinateService.screenToWorld(
                { x: e.target.x(), y: e.target.y() },
                transform,
                baseScale
              );
              onUpdateFurniturePos(item.id, {
                x: Math.round(newWorld.x * 20) / 20, // snap to 5cm
                y: item.position.y,
                z: Math.round(newWorld.y * 20) / 20,
              });
            }}
          >
            {/* Base Furniture Rect */}
            <Rect
              x={-wPx / 2}
              y={-dPx / 2}
              width={wPx}
              height={dPx}
              cornerRadius={3}
              fill="#ffffff"
              stroke={isSelected ? "#2563eb" : "#94a3b8"}
              strokeWidth={isSelected ? 2 : 1}
              shadowBlur={isSelected ? 6 : 2}
              shadowColor={isSelected ? "rgba(37, 99, 235, 0.3)" : "rgba(0, 0, 0, 0.05)"}
            />

            {/* Architectural Furniture Details by Category */}
            {item.category === 'beds' && (
              <>
                {/* Bed Pillows */}
                <Rect
                  x={-wPx * 0.4}
                  y={-dPx * 0.45}
                  width={wPx * 0.35}
                  height={dPx * 0.25}
                  cornerRadius={2}
                  fill="#f1f5f9"
                  stroke="#cbd5e1"
                  strokeWidth={1}
                />
                <Rect
                  x={wPx * 0.05}
                  y={-dPx * 0.45}
                  width={wPx * 0.35}
                  height={dPx * 0.25}
                  cornerRadius={2}
                  fill="#f1f5f9"
                  stroke="#cbd5e1"
                  strokeWidth={1}
                />
                {/* Blanket Fold Line */}
                <Line
                  points={[-wPx * 0.45, -dPx * 0.1, wPx * 0.45, -dPx * 0.1]}
                  stroke="#94a3b8"
                  strokeWidth={1}
                />
              </>
            )}

            {item.category === 'seating' && (
              <>
                {/* Backrest */}
                <Rect
                  x={-wPx / 2}
                  y={dPx * 0.2}
                  width={wPx}
                  height={dPx * 0.3}
                  cornerRadius={2}
                  fill="#f1f5f9"
                  stroke="#cbd5e1"
                  strokeWidth={1}
                />
              </>
            )}

            {item.category === 'bathroom' && (
              <Circle
                x={0}
                y={0}
                radius={Math.min(wPx, dPx) * 0.35}
                stroke="#94a3b8"
                strokeWidth={1}
              />
            )}

            {/* Furniture Label */}
            <Text
              text={item.name}
              x={-wPx / 2}
              y={-6}
              width={wPx}
              align="center"
              fontSize={Math.max(8, Math.min(10, 9 * transform.scale))}
              fill="#202124"
              listening={false}
            />

            {/* Selected Rotation Knob */}
            {isSelected && (
              <Group
                y={-dPx / 2 - 16}
                draggable
                onDragMove={(e) => {
                  const angle = Math.atan2(e.target.y(), e.target.x()) + Math.PI / 2;
                  onUpdateFurnitureRot(item.id, angle);
                }}
              >
                <Line points={[0, 0, 0, 16]} stroke="#2563eb" strokeWidth={1.5} />
                <Circle radius={5} fill="#2563eb" stroke="#ffffff" strokeWidth={1.5} />
              </Group>
            )}
          </Group>
        );
      })}
    </Layer>
  );
};
