"use client";

import React from "react";
import { Layer, Line, Arc, Rect, Group } from "react-konva";
import { DoorData, WindowData, WallData } from "@/types/project";
import { ViewportTransform, CoordinateService } from "@/lib/geometry/coordinates";
import { WallMath } from "@/lib/geometry/wall-math";

interface OpeningsLayerProps {
  doors: DoorData[];
  windows: WindowData[];
  walls: WallData[];
  transform: ViewportTransform;
  selectedId: string | null;
  onSelectOpening: (id: string, type: 'door' | 'window') => void;
  onMoveOpening?: (id: string, type: 'door' | 'window', newRatio: number) => void;
}

export const OpeningsLayer: React.FC<OpeningsLayerProps> = ({
  doors,
  windows,
  walls,
  transform,
  selectedId,
  onSelectOpening,
  onMoveOpening,
}) => {
  const baseScale = CoordinateService.PIXELS_PER_METER_DEFAULT;
  const pixelsPerMeter = transform.scale * baseScale;

  return (
    <Layer>
      {/* Doors */}
      {doors.map((door) => {
        const wall = walls.find((w) => w.id === door.wallId);
        if (!wall) return null;

        const pos = WallMath.pointAtRatio(wall, door.distanceRatio);
        const screenPos = CoordinateService.worldToScreen(pos, transform, baseScale);
        const wallAngleDeg = (WallMath.angle(wall) * 180) / Math.PI;
        const doorWidthPx = door.width * pixelsPerMeter;
        const isSelected = selectedId === door.id;

        return (
          <Group
            key={door.id}
            x={screenPos.x}
            y={screenPos.y}
            rotation={wallAngleDeg}
            onClick={() => onSelectOpening(door.id, 'door')}
            onTap={() => onSelectOpening(door.id, 'door')}
          >
            {/* Cutout background matching floor */}
            <Rect
              x={-doorWidthPx / 2}
              y={(-wall.thickness * pixelsPerMeter) / 2}
              width={doorWidthPx}
              height={wall.thickness * pixelsPerMeter}
              fill="#0d111a"
              stroke={isSelected ? "#3b82f6" : "#f97316"}
              strokeWidth={isSelected ? 1.5 : 0.8}
            />

            {/* Door Leaf */}
            <Line
              points={[
                -doorWidthPx / 2,
                0,
                -doorWidthPx / 2,
                -doorWidthPx,
              ]}
              stroke={isSelected ? "#60a5fa" : "#fb923c"}
              strokeWidth={1.5}
            />

            {/* Swing Arc (Quarter Circle 90°) */}
            <Arc
              x={-doorWidthPx / 2}
              y={0}
              innerRadius={0}
              outerRadius={doorWidthPx}
              angle={90}
              rotation={270}
              stroke={isSelected ? "#60a5fa" : "rgba(251, 146, 60, 0.35)"}
              strokeWidth={0.8}
              dash={[3, 3]}
            />
          </Group>
        );
      })}

      {/* Windows */}
      {windows.map((win) => {
        const wall = walls.find((w) => w.id === win.wallId);
        if (!wall) return null;

        const pos = WallMath.pointAtRatio(wall, win.distanceRatio);
        const screenPos = CoordinateService.worldToScreen(pos, transform, baseScale);
        const wallAngleDeg = (WallMath.angle(wall) * 180) / Math.PI;
        const winWidthPx = win.width * pixelsPerMeter;
        const isSelected = selectedId === win.id;

        return (
          <Group
            key={win.id}
            x={screenPos.x}
            y={screenPos.y}
            rotation={wallAngleDeg}
            onClick={() => onSelectOpening(win.id, 'window')}
            onTap={() => onSelectOpening(win.id, 'window')}
          >
            {/* Window Frame Cutout */}
            <Rect
              x={-winWidthPx / 2}
              y={(-wall.thickness * pixelsPerMeter) / 2}
              width={winWidthPx}
              height={wall.thickness * pixelsPerMeter}
              fill="#0f172a"
              stroke={isSelected ? "#2563eb" : "#38bdf8"}
              strokeWidth={isSelected ? 2 : 1}
            />

            {/* Center Glazing Line */}
            <Line
              points={[-winWidthPx / 2, 0, winWidthPx / 2, 0]}
              stroke="#0ea5e9"
              strokeWidth={2}
            />

            {/* Double glazing secondary line */}
            <Line
              points={[-winWidthPx / 2, -2, winWidthPx / 2, -2]}
              stroke="#38bdf8"
              strokeWidth={1}
            />
          </Group>
        );
      })}
    </Layer>
  );
};
