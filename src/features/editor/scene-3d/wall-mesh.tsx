"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { WallData, DoorData, WindowData, MaterialDef } from "@/types/project";
import { WallMath } from "@/lib/geometry/wall-math";
import { Vector2DMath } from "@/lib/geometry/vector2d";

interface WallMeshProps {
  wall: WallData;
  doors: DoorData[];
  windows: WindowData[];
  elevation: number;
  materials: MaterialDef[];
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const WallMesh: React.FC<WallMeshProps> = ({
  wall,
  doors,
  windows,
  elevation,
  materials,
  isSelected,
  onSelect,
}) => {
  const length = WallMath.length(wall);
  const thickness = wall.thickness || 0.2;
  const height = wall.height || 2.8;

  // Material setup
  const materialDef = (materials || []).find((m) => m.id === wall.interiorMaterialId) || materials?.[0];
  const wallColor = isSelected ? "#3b82f6" : materialDef?.color || "#f8fafc";
  const roughness = materialDef?.roughness ?? 0.8;
  const metalness = materialDef?.metalness ?? 0.05;

  // Wall angle & position in 3D
  const angle = WallMath.angle(wall);
  const midPoint = Vector2DMath.midpoint(wall.start, wall.end);

  // Filter openings on this wall
  const wallDoors = (doors || []).filter((d) => d.wallId === wall.id);
  const wallWindows = (windows || []).filter((w) => w.wallId === wall.id);

  // If no openings, render solid box
  const hasOpenings = wallDoors.length > 0 || wallWindows.length > 0;

  // Geometry computation
  const wallSegments = useMemo(() => {
    if (!hasOpenings || length <= 0.5) {
      return [{ x: 0, y: height / 2, z: 0, w: length, h: height, d: thickness }];
    }

    // Sort all openings by position along wall
    interface OpeningItem {
      ratio: number;
      width: number;
      height: number;
      elevationFromFloor: number;
      type: 'door' | 'window';
    }

    const openings: OpeningItem[] = [
      ...wallDoors.map((d) => ({
        ratio: d.distanceRatio,
        width: d.width,
        height: d.height,
        elevationFromFloor: 0,
        type: 'door' as const,
      })),
      ...wallWindows.map((w) => ({
        ratio: w.distanceRatio,
        width: w.width,
        height: w.height,
        elevationFromFloor: w.elevationFromFloor,
        type: 'window' as const,
      })),
    ].sort((a, b) => a.ratio - b.ratio);

    const segments: { x: number; y: number; z: number; w: number; h: number; d: number }[] = [];
    let currentX = -length / 2;

    for (const op of openings) {
      const opCenterX = (op.ratio - 0.5) * length;
      const opStartX = Math.max(-length / 2, opCenterX - op.width / 2);
      const opEndX = Math.min(length / 2, opCenterX + op.width / 2);

      // 1. Wall segment before opening
      if (opStartX > currentX + 0.05) {
        const segW = opStartX - currentX;
        segments.push({
          x: currentX + segW / 2,
          y: height / 2,
          z: 0,
          w: segW,
          h: height,
          d: thickness,
        });
      }

      // 2. Lintel above opening (top of door/window to ceiling)
      const opTop = op.elevationFromFloor + op.height;
      if (height > opTop + 0.05) {
        const lintelH = height - opTop;
        segments.push({
          x: (opStartX + opEndX) / 2,
          y: opTop + lintelH / 2,
          z: 0,
          w: opEndX - opStartX,
          h: lintelH,
          d: thickness,
        });
      }

      // 3. Sill below window (floor to window sill)
      if (op.elevationFromFloor > 0.05) {
        segments.push({
          x: (opStartX + opEndX) / 2,
          y: op.elevationFromFloor / 2,
          z: 0,
          w: opEndX - opStartX,
          h: op.elevationFromFloor,
          d: thickness,
        });
      }

      currentX = opEndX;
    }

    // Remaining wall after last opening
    if (length / 2 > currentX + 0.05) {
      const segW = length / 2 - currentX;
      segments.push({
        x: currentX + segW / 2,
        y: height / 2,
        z: 0,
        w: segW,
        h: height,
        d: thickness,
      });
    }

    return segments;
  }, [hasOpenings, length, height, thickness, wallDoors, wallWindows]);

  return (
    <group
      position={[midPoint.x, elevation, midPoint.y]}
      rotation={[0, -angle, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(wall.id);
      }}
    >
      {wallSegments.map((seg, idx) => (
        <mesh
          key={idx}
          position={[seg.x, seg.y, seg.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[seg.w, seg.h, seg.d]} />
          <meshStandardMaterial
            color={wallColor}
            roughness={roughness}
            metalness={metalness}
          />
        </mesh>
      ))}
    </group>
  );
};
