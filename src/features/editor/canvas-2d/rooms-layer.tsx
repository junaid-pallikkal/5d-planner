"use client";

import React from "react";
import { Layer, Line, Text, Group } from "react-konva";
import { RoomData } from "@/types/project";
import { ViewportTransform, CoordinateService } from "@/lib/geometry/coordinates";
import { RoomDetectionService } from "@/lib/geometry/room-detection";

interface RoomsLayerProps {
  rooms: RoomData[];
  transform: ViewportTransform;
  selectedId: string | null;
  onSelectRoom: (id: string) => void;
}

export const RoomsLayer: React.FC<RoomsLayerProps> = ({
  rooms,
  transform,
  selectedId,
  onSelectRoom,
}) => {
  const baseScale = CoordinateService.PIXELS_PER_METER_DEFAULT;

  return (
    <Layer>
      {rooms.map((room) => {
        if (!room.polygon || room.polygon.length < 3) return null;

        // Flatten points to screen coordinates
        const flatPoints: number[] = [];
        room.polygon.forEach((pt) => {
          const screen = CoordinateService.worldToScreen(pt, transform, baseScale);
          flatPoints.push(screen.x, screen.y);
        });

        const centroid = RoomDetectionService.calculateCentroid(room.polygon);
        const centroidScreen = CoordinateService.worldToScreen(centroid, transform, baseScale);
        const isSelected = selectedId === room.id;

        return (
          <Group key={room.id}>
            <Line
              points={flatPoints}
              closed
              fill={room.color || "#3b82f6"}
              opacity={isSelected ? 0.25 : 0.1}
              stroke={isSelected ? "#3b82f6" : room.color || "#3b82f6"}
              strokeWidth={isSelected ? 1.5 : 0.8}
              dash={isSelected ? [4, 4] : undefined}
              onClick={() => onSelectRoom(room.id)}
              onTap={() => onSelectRoom(room.id)}
            />

            {/* Room Name & Area Tag */}
            <Group
              x={centroidScreen.x}
              y={centroidScreen.y}
              onClick={() => onSelectRoom(room.id)}
            >
              <Text
                text={room.name}
                fontSize={Math.max(10, Math.min(13, 11 * transform.scale))}
                fontFamily="sans-serif"
                fontStyle="600"
                fill="#f1f5f9"
                align="center"
                offsetX={50}
                offsetY={10}
                width={100}
                listening={false}
              />
              <Text
                text={`${room.area.toFixed(1)} m²`}
                fontSize={Math.max(8, Math.min(11, 9 * transform.scale))}
                fontFamily="monospace"
                fill="#94a3b8"
                align="center"
                offsetX={50}
                offsetY={-5}
                width={100}
                listening={false}
              />
            </Group>
          </Group>
        );
      })}
    </Layer>
  );
};
