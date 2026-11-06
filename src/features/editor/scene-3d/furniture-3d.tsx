"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { FurnitureData } from "@/types/project";
import { TransformControls } from "@react-three/drei";

interface Furniture3DProps {
  furniture: FurnitureData[];
  elevation: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdateTransform?: (id: string, pos: { x: number; y: number; z: number }, rotY: number) => void;
}

export const Furniture3D: React.FC<Furniture3DProps> = ({
  furniture,
  elevation,
  selectedId,
  onSelect,
  onUpdateTransform,
}) => {
  return (
    <group position={[0, elevation, 0]}>
      {furniture.map((item) => {
        const isSelected = selectedId === item.id;
        return (
          <FurnitureItem3D
            key={item.id}
            item={item}
            isSelected={isSelected}
            onSelect={onSelect}
            onUpdateTransform={onUpdateTransform}
          />
        );
      })}
    </group>
  );
};

interface ItemProps {
  item: FurnitureData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdateTransform?: (id: string, pos: { x: number; y: number; z: number }, rotY: number) => void;
}

const FurnitureItem3D: React.FC<ItemProps> = ({
  item,
  isSelected,
  onSelect,
  onUpdateTransform,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { width, depth, height } = item.dimensions;

  return (
    <>
      <group
        ref={groupRef}
        position={[item.position.x, item.position.y, item.position.z]}
        rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
        scale={[item.scale.x, item.scale.y, item.scale.z]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}
      >
        {/* Render category models */}
        {renderProceduralModel(item, width, depth, height, isSelected)}
      </group>

      {/* 3D Transform Gizmo when selected */}
      {isSelected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode="translate"
          size={0.6}
          onMouseUp={() => {
            if (groupRef.current) {
              const pos = groupRef.current.position;
              const rot = groupRef.current.rotation;
              onUpdateTransform?.(
                item.id,
                { x: pos.x, y: pos.y, z: pos.z },
                rot.y
              );
            }
          }}
        />
      )}
    </>
  );
};

function renderProceduralModel(
  item: FurnitureData,
  w: number,
  d: number,
  h: number,
  isSelected: boolean
) {
  const highlightColor = isSelected ? "#3b82f6" : null;

  switch (item.category) {
    case 'seating':
      return (
        <group position={[0, h / 2, 0]}>
          {/* Main Seat Cushion */}
          <mesh position={[0, -h * 0.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h * 0.35, d]} />
            <meshStandardMaterial
              color={highlightColor || "#334155"}
              roughness={0.8}
            />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, h * 0.25, -d * 0.35]} castShadow>
            <boxGeometry args={[w, h * 0.5, d * 0.28]} />
            <meshStandardMaterial
              color={highlightColor || "#1e293b"}
              roughness={0.8}
            />
          </mesh>
          {/* Armrests */}
          <mesh position={[-w * 0.46, h * 0.05, 0]} castShadow>
            <boxGeometry args={[w * 0.08, h * 0.45, d]} />
            <meshStandardMaterial
              color={highlightColor || "#1e293b"}
              roughness={0.8}
            />
          </mesh>
          <mesh position={[w * 0.46, h * 0.05, 0]} castShadow>
            <boxGeometry args={[w * 0.08, h * 0.45, d]} />
            <meshStandardMaterial
              color={highlightColor || "#1e293b"}
              roughness={0.8}
            />
          </mesh>
        </group>
      );

    case 'tables':
      return (
        <group position={[0, h / 2, 0]}>
          {/* Table Top */}
          <mesh position={[0, h * 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, 0.04, d]} />
            <meshStandardMaterial
              color={highlightColor || "#5c4033"}
              roughness={0.4}
            />
          </mesh>
          {/* 4 Table Legs */}
          {[-w * 0.45, w * 0.45].map((x) =>
            [-d * 0.45, d * 0.45].map((z) => (
              <mesh key={`${x}_${z}`} position={[x, -0.02, z]} castShadow>
                <cylinderGeometry args={[0.025, 0.025, h * 0.9, 12]} />
                <meshStandardMaterial
                  color={highlightColor || "#1e293b"}
                  roughness={0.3}
                  metalness={0.5}
                />
              </mesh>
            ))
          )}
        </group>
      );

    case 'beds':
      return (
        <group position={[0, h / 2, 0]}>
          {/* Bed Base */}
          <mesh position={[0, -h * 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h * 0.3, d]} />
            <meshStandardMaterial
              color={highlightColor || "#475569"}
              roughness={0.7}
            />
          </mesh>
          {/* Mattress */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[w * 0.96, h * 0.28, d * 0.94]} />
            <meshStandardMaterial
              color={highlightColor || "#f1f5f9"}
              roughness={0.9}
            />
          </mesh>
          {/* Headboard */}
          <mesh position={[0, h * 0.2, -d * 0.46]} castShadow>
            <boxGeometry args={[w, h * 0.65, 0.08]} />
            <meshStandardMaterial
              color={highlightColor || "#1e293b"}
              roughness={0.6}
            />
          </mesh>
          {/* Pillows */}
          <mesh position={[-w * 0.25, h * 0.18, -d * 0.3]} castShadow>
            <boxGeometry args={[w * 0.38, 0.12, d * 0.2]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </mesh>
          <mesh position={[w * 0.25, h * 0.18, -d * 0.3]} castShadow>
            <boxGeometry args={[w * 0.38, 0.12, d * 0.2]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </mesh>
        </group>
      );

    case 'bathroom':
      return (
        <group position={[0, h / 2, 0]}>
          {/* Oval Tub / Basin */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[w * 0.45, w * 0.38, h, 24]} />
            <meshStandardMaterial
              color={highlightColor || "#ffffff"}
              roughness={0.15}
            />
          </mesh>
          {/* Chrome Tap */}
          <mesh position={[0, h * 0.6, -d * 0.35]}>
            <cylinderGeometry args={[0.015, 0.015, 0.2, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      );

    case 'lighting':
      return (
        <group position={[0, h / 2, 0]}>
          {/* Floor lamp base & pole */}
          <mesh position={[0, -h * 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, h, 12]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Shade */}
          <mesh position={[0, h * 0.45, 0]} castShadow>
            <sphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial
              color={highlightColor || "#fffbeb"}
              emissive="#fef08a"
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>
      );

    case 'decor':
      return (
        <group position={[0, h / 2, 0]}>
          {/* Ceramic Pot */}
          <mesh position={[0, -h * 0.25, 0]} castShadow>
            <cylinderGeometry args={[w * 0.35, w * 0.25, h * 0.5, 16]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.5} />
          </mesh>
          {/* Plant foliage cluster */}
          <mesh position={[0, h * 0.2, 0]} castShadow>
            <sphereGeometry args={[w * 0.4, 12, 12]} />
            <meshStandardMaterial
              color={highlightColor || "#15803d"}
              roughness={0.7}
            />
          </mesh>
        </group>
      );

    default:
      return (
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            color={highlightColor || "#475569"}
            roughness={0.6}
          />
        </mesh>
      );
  }
}
