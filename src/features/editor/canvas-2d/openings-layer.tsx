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
              fill="#ffffff"
              stroke={isSelected ? "#16a34a" : "#d97706"}
              strokeWidth={isSelected ? 1.8 : 1}
            />

            {/* Door Leaf */}
            <Line
              points={[
                -doorWidthPx / 2,
                0,
                -doorWidthPx / 2,
                -doorWidthPx,
              ]}
              stroke={isSelected ? "#16a34a" : "#b45309"}
              strokeWidth={1.8}
            />

            {/* Swing Arc (Quarter Circle 90°) */}
            <Arc
              x={-doorWidthPx / 2}
              y={0}
              innerRadius={0}
              outerRadius={doorWidthPx}
              angle={90}
              rotation={270}
              stroke={isSelected ? "#16a34a" : "rgba(217, 119, 6, 0.5)"}
              strokeWidth={1}
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
              fill="#ffffff"
              stroke={isSelected ? "#16a34a" : "#059669"}
              strokeWidth={isSelected ? 2 : 1}
            />

            {/* Center Glazing Line */}
            <Line
              points={[-winWidthPx / 2, 0, winWidthPx / 2, 0]}
              stroke="#059669"
              strokeWidth={2}
            />

            {/* Double glazing secondary line */}
            <Line
              points={[-winWidthPx / 2, -2, winWidthPx / 2, -2]}
              stroke="#10b981"
              strokeWidth={1}
            />
          </Group>
        );
      })}
    </Layer>
  );
};
