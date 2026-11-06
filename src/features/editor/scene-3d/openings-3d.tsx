"use client";

import React from "react";
import { DoorData, WindowData, WallData } from "@/types/project";
import { WallMath } from "@/lib/geometry/wall-math";

interface Openings3DProps {
  doors: DoorData[];
  windows: WindowData[];
  walls: WallData[];
  elevation: number;
  selectedId: string | null;
  onSelect: (id: string, type: 'door' | 'window') => void;
}

export const Openings3D: React.FC<Openings3DProps> = ({
  doors,
  windows,
  walls,
  elevation,
  selectedId,
  onSelect,
}) => {
  return (
    <group position={[0, elevation, 0]}>
      {/* 3D Doors */}
      {(doors || []).map((door) => {
        const wall = (walls || []).find((w) => w.id === door.wallId);
        if (!wall) return null;

        const pos = WallMath.pointAtRatio(wall, door.distanceRatio);
        const angle = WallMath.angle(wall);
        const isSelected = selectedId === door.id;

        return (
          <group
            key={door.id}
            position={[pos.x, 0, pos.y]}
            rotation={[0, -angle, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(door.id, 'door');
            }}
          >
            {/* Outer Door Frame Trim */}
            <mesh position={[0, door.height / 2, 0]}>
              <boxGeometry args={[door.width + 0.08, door.height + 0.04, wall.thickness + 0.02]} />
              <meshStandardMaterial
                color={isSelected ? "#16a34a" : "#334155"}
                roughness={0.4}
              />
            </mesh>

            {/* Door Leaf (Timber Panel) */}
            <mesh position={[0, door.height / 2, 0]} castShadow>
              <boxGeometry args={[door.width - 0.04, door.height - 0.04, 0.04]} />
              <meshStandardMaterial
                color={isSelected ? "#16a34a" : "#5c4033"}
                roughness={0.5}
              />
            </mesh>

            {/* Brass / Silver Door Handle */}
            <mesh position={[door.width * 0.38, 1.0, 0.035]}>
              <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
              <meshStandardMaterial
                color="#d4af37"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
          </group>
        );
      })}

      {/* 3D Windows */}
      {(windows || []).map((win) => {
        const wall = (walls || []).find((w) => w.id === win.wallId);
        if (!wall) return null;

        const pos = WallMath.pointAtRatio(wall, win.distanceRatio);
        const angle = WallMath.angle(wall);
        const isSelected = selectedId === win.id;
        const centerY = win.elevationFromFloor + win.height / 2;

        return (
          <group
            key={win.id}
            position={[pos.x, centerY, pos.y]}
            rotation={[0, -angle, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(win.id, 'window');
            }}
          >
            {/* Window Frame (Matte Black Aluminum) */}
            <mesh>
              <boxGeometry args={[win.width, win.height, wall.thickness + 0.01]} />
              <meshStandardMaterial
                color={isSelected ? "#16a34a" : "#1e293b"}
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>

            {/* Translucent Double Glazing Glass Pane */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[win.width - 0.08, win.height - 0.08, 0.02]} />
              <meshPhysicalMaterial
                color="#bbf7d0"
                transmission={0.9}
                opacity={0.4}
                transparent
                roughness={0.05}
                ior={1.5}
                thickness={0.02}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
