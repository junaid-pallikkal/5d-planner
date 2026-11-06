"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoomData, MaterialDef } from "@/types/project";

interface FloorMeshProps {
  rooms: RoomData[];
  elevation: number;
  materials: MaterialDef[];
  selectedId: string | null;
  onSelectRoom: (id: string) => void;
}

export const FloorMesh: React.FC<FloorMeshProps> = ({
  rooms,
  elevation,
  materials,
  selectedId,
  onSelectRoom,
}) => {
  return (
    <group position={[0, elevation, 0]}>
      {rooms.map((room) => {
        if (!room.polygon || room.polygon.length < 3) return null;

        // Create shape in 2D (x, y in Three.js Shape corresponds to X, Z in 3D)
        const shape = new THREE.Shape();
        shape.moveTo(room.polygon[0].x, room.polygon[0].y);
        for (let i = 1; i < room.polygon.length; i++) {
          shape.lineTo(room.polygon[i].x, room.polygon[i].y);
        }
        shape.closePath();

        const materialDef = materials.find((m) => m.id === room.floorMaterialId) || materials[3];
        const isSelected = selectedId === room.id;
        const color = isSelected ? "#3b82f6" : materialDef?.color || "#c29b68";

        return (
          <mesh
            key={room.id}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            receiveShadow
            onClick={(e) => {
              e.stopPropagation();
              onSelectRoom(room.id);
            }}
          >
            <shapeGeometry args={[shape]} />
            <meshStandardMaterial
              color={color}
              roughness={materialDef?.roughness ?? 0.4}
              metalness={materialDef?.metalness ?? 0.05}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
};
