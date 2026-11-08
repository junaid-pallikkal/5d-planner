"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoofData, MaterialDef } from "@/types/project";

interface RoofMeshProps {
  roofs: RoofData[];
  materials?: MaterialDef[];
  selectedId?: string | null;
  onSelect?: (id: string, type: 'roof') => void;
}

export const RoofMesh: React.FC<RoofMeshProps> = ({
  roofs,
  materials,
  selectedId,
  onSelect,
}) => {
  if (!roofs || roofs.length === 0) return null;

  return (
    <group>
      {roofs.map((roof) => (
        <SingleRoofMesh
          key={roof.id}
          roof={roof}
          materials={materials}
          isSelected={selectedId === roof.id}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
};

interface SingleRoofMeshProps {
  roof: RoofData;
  materials?: MaterialDef[];
  isSelected: boolean;
  onSelect?: (id: string, type: 'roof') => void;
}

const SingleRoofMesh: React.FC<SingleRoofMeshProps> = ({
  roof,
  materials,
  isSelected,
  onSelect,
}) => {
  const {
    type = 'gable',
    polygon = [],
    pitch = 25,
    thickness = 0.25,
    fasciaDepth = 0.18,
    parapetHeight = 0.5,
    ridgeOrientation = 'longitudinal',
    elevationOffset = 2.8,
    color: customColor,
    hasSolarPanels = false,
    solarDensity = 0.6,
    showTrusses = false,
    hasGutters = true,
  } = roof;

  // Compute bounding box of polygon in X/Z world plane
  const bounds = useMemo(() => {
    if (!polygon || polygon.length < 3) {
      return { minX: 0, maxX: 8, minZ: 0, maxZ: 6, width: 8, depth: 6, centerX: 4, centerZ: 3 };
    }
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    polygon.forEach((pt) => {
      minX = Math.min(minX, pt.x);
      maxX = Math.max(maxX, pt.x);
      minZ = Math.min(minZ, pt.y);
      maxZ = Math.max(maxZ, pt.y);
    });
    return {
      minX,
      maxX,
      minZ,
      maxZ,
      width: Math.max(0.1, maxX - minX),
      depth: Math.max(0.1, maxZ - minZ),
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2,
    };
  }, [polygon]);

  // Primary roof color & finish
  const baseColor = customColor || (
    type === 'green' ? '#15803d' :
    type === 'flat' ? '#64748b' :
    type === 'gable' ? '#c2410c' :
    type === 'hip' ? '#1e293b' :
    type === 'shed' ? '#334155' :
    type === 'vaulted' ? '#0d9488' : '#78350f'
  );

  const displayColor = isSelected ? '#16a34a' : baseColor;

  // Procedural 3D Mesh Generation based on Civil Engineering Roof Taxonomy
  const { roofGeometry, infillGeometry, solarPositions, gutterPositions } = useMemo(() => {
    const { width, depth, minX, maxX, minZ, maxZ, centerX, centerZ } = bounds;
    const isLongitudinal = ridgeOrientation === 'longitudinal';
    const rad = (pitch * Math.PI) / 180;
    const tanP = Math.tan(rad);

    const geom = new THREE.BufferGeometry();
    const infillGeom = new THREE.BufferGeometry();
    const solarPoints: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
    const gutters: { start: [number, number, number]; end: [number, number, number] }[] = [];

    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    const infillVerts: number[] = [];

    const addQuad = (
      p1: [number, number, number],
      p2: [number, number, number],
      p3: [number, number, number],
      p4: [number, number, number]
    ) => {
      // Tri 1: p1, p2, p3
      vertices.push(...p1, ...p2, ...p3);
      // Tri 2: p1, p3, p4
      vertices.push(...p1, ...p3, ...p4);

      // Compute normal
      const vA = new THREE.Vector3(...p1);
      const vB = new THREE.Vector3(...p2);
      const vC = new THREE.Vector3(...p3);
      const cb = new THREE.Vector3().subVectors(vC, vB);
      const ab = new THREE.Vector3().subVectors(vA, vB);
      const norm = new THREE.Vector3().crossVectors(cb, ab).normalize();

      for (let i = 0; i < 6; i++) {
        normals.push(norm.x, norm.y, norm.z);
      }
      uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
    };

    const addTri = (
      p1: [number, number, number],
      p2: [number, number, number],
      p3: [number, number, number]
    ) => {
      vertices.push(...p1, ...p2, ...p3);
      const vA = new THREE.Vector3(...p1);
      const vB = new THREE.Vector3(...p2);
      const vC = new THREE.Vector3(...p3);
      const cb = new THREE.Vector3().subVectors(vC, vB);
      const ab = new THREE.Vector3().subVectors(vA, vB);
      const norm = new THREE.Vector3().crossVectors(cb, ab).normalize();
      for (let i = 0; i < 3; i++) {
        normals.push(norm.x, norm.y, norm.z);
      }
      uvs.push(0, 0, 1, 0, 0.5, 1);
    };

    const addInfillTri = (
      p1: [number, number, number],
      p2: [number, number, number],
      p3: [number, number, number]
    ) => {
      infillVerts.push(...p1, ...p2, ...p3);
    };

    // 1. GABLE ROOF (Dual slope meeting at central horizontal ridge)
    if (type === 'gable') {
      if (isLongitudinal) {
        // Ridge runs along X axis, slopes down to minZ and maxZ
        const halfSpan = depth / 2;
        const ridgeY = halfSpan * tanP;

        const e1: [number, number, number] = [minX, 0, minZ];
        const e2: [number, number, number] = [maxX, 0, minZ];
        const r1: [number, number, number] = [minX, ridgeY, centerZ];
        const r2: [number, number, number] = [maxX, ridgeY, centerZ];
        const e3: [number, number, number] = [maxX, 0, maxZ];
        const e4: [number, number, number] = [minX, 0, maxZ];

        // North slope (minZ to centerZ)
        addQuad(e1, e2, r2, r1);
        // South slope (centerZ to maxZ)
        addQuad(r1, r2, e3, e4);

        // Gable triangular vertical wall infills
        addInfillTri(e1, r1, e4);
        addInfillTri(e2, e3, r2);

        // Gutters at North and South eaves
        gutters.push({ start: e1, end: e2 });
        gutters.push({ start: e4, end: e3 });

        // Solar Panels on South slope
        if (hasSolarPanels) {
          const count = Math.max(1, Math.floor(width / 1.8 * solarDensity));
          for (let i = 0; i < count; i++) {
            const px = minX + (width / (count + 1)) * (i + 1);
            const pz = centerZ + halfSpan * 0.5;
            const py = ridgeY * 0.5;
            solarPoints.push({ pos: [px, py + 0.05, pz], rot: [rad, 0, 0] });
          }
        }
      } else {
        // Ridge runs along Z axis, slopes down to minX and maxX
        const halfSpan = width / 2;
        const ridgeY = halfSpan * tanP;

        const e1: [number, number, number] = [minX, 0, minZ];
        const e2: [number, number, number] = [minX, 0, maxZ];
        const r1: [number, number, number] = [centerX, ridgeY, minZ];
        const r2: [number, number, number] = [centerX, ridgeY, maxZ];
        const e3: [number, number, number] = [maxX, 0, maxZ];
        const e4: [number, number, number] = [maxX, 0, minZ];

        addQuad(e1, e2, r2, r1);
        addQuad(r1, r2, e3, e4);

        addInfillTri(e1, r1, e4);
        addInfillTri(e2, e3, r2);

        gutters.push({ start: e1, end: e2 });
        gutters.push({ start: e4, end: e3 });

        if (hasSolarPanels) {
          const count = Math.max(1, Math.floor(depth / 1.8 * solarDensity));
          for (let i = 0; i < count; i++) {
            const pz = minZ + (depth / (count + 1)) * (i + 1);
            const px = centerX + halfSpan * 0.5;
            const py = ridgeY * 0.5;
            solarPoints.push({ pos: [px, py + 0.05, pz], rot: [0, 0, -rad] });
          }
        }
      }
    }
    // 2. HIP ROOF (Four sloped facets meeting at a shortened ridge)
    else if (type === 'hip') {
      const minDimension = Math.min(width, depth);
      const halfSpan = minDimension / 2;
      const ridgeY = halfSpan * tanP;

      if (width >= depth) {
        // Longitudinal shortened ridge
        const ridgeOffset = (width - depth) / 2;
        const r1: [number, number, number] = [minX + halfSpan, ridgeY, centerZ];
        const r2: [number, number, number] = [maxX - halfSpan, ridgeY, centerZ];

        const c1: [number, number, number] = [minX, 0, minZ];
        const c2: [number, number, number] = [maxX, 0, minZ];
        const c3: [number, number, number] = [maxX, 0, maxZ];
        const c4: [number, number, number] = [minX, 0, maxZ];

        // North slope (Trapezoid)
        addQuad(c1, c2, r2, r1);
        // South slope (Trapezoid)
        addQuad(r1, r2, c3, c4);
        // West slope (Triangle)
        addTri(c1, r1, c4);
        // East slope (Triangle)
        addTri(c2, c3, r2);

        gutters.push({ start: c1, end: c2 });
        gutters.push({ start: c2, end: c3 });
        gutters.push({ start: c3, end: c4 });
        gutters.push({ start: c4, end: c1 });
      } else {
        // Transverse shortened ridge
        const r1: [number, number, number] = [centerX, ridgeY, minZ + halfSpan];
        const r2: [number, number, number] = [centerX, ridgeY, maxZ - halfSpan];

        const c1: [number, number, number] = [minX, 0, minZ];
        const c2: [number, number, number] = [maxX, 0, minZ];
        const c3: [number, number, number] = [maxX, 0, maxZ];
        const c4: [number, number, number] = [minX, 0, maxZ];

        addQuad(c1, r1, r2, c4);
        addQuad(c2, c3, r2, r1);
        addTri(c1, c2, r1);
        addTri(c4, r2, c3);

        gutters.push({ start: c1, end: c2 });
        gutters.push({ start: c2, end: c3 });
        gutters.push({ start: c3, end: c4 });
        gutters.push({ start: c4, end: c1 });
      }
    }
    // 3. SHED / MONO-PITCH ROOF (Single sloping plane)
    else if (type === 'shed') {
      const riseY = depth * tanP;
      const c1: [number, number, number] = [minX, 0, minZ];
      const c2: [number, number, number] = [maxX, 0, minZ];
      const c3: [number, number, number] = [maxX, riseY, maxZ];
      const c4: [number, number, number] = [minX, riseY, maxZ];

      addQuad(c1, c2, c3, c4);

      // Side triangular infills
      addInfillTri(c1, c4, [minX, 0, maxZ]);
      addInfillTri(c2, [maxX, 0, maxZ], c3);

      gutters.push({ start: c1, end: c2 });

      if (hasSolarPanels) {
        const countX = Math.max(1, Math.floor(width / 1.6 * solarDensity));
        const countZ = Math.max(1, Math.floor(depth / 2.0));
        for (let i = 0; i < countX; i++) {
          for (let j = 0; j < countZ; j++) {
            const px = minX + (width / (countX + 1)) * (i + 1);
            const pz = minZ + (depth / (countZ + 1)) * (j + 1);
            const py = (pz - minZ) * tanP;
            solarPoints.push({ pos: [px, py + 0.05, pz], rot: [rad, 0, 0] });
          }
        }
      }
    }
    // 4. MANSARD ROOF (French curb: steep lower pitch, shallow upper pitch)
    else if (type === 'mansard') {
      const curbOffset = Math.min(width, depth) * 0.22;
      const steepY = curbOffset * Math.tan((60 * Math.PI) / 180);
      const deckY = steepY + curbOffset * Math.tan((15 * Math.PI) / 180);

      const b1: [number, number, number] = [minX, 0, minZ];
      const b2: [number, number, number] = [maxX, 0, minZ];
      const b3: [number, number, number] = [maxX, 0, maxZ];
      const b4: [number, number, number] = [minX, 0, maxZ];

      const k1: [number, number, number] = [minX + curbOffset, steepY, minZ + curbOffset];
      const k2: [number, number, number] = [maxX - curbOffset, steepY, minZ + curbOffset];
      const k3: [number, number, number] = [maxX - curbOffset, steepY, maxZ - curbOffset];
      const k4: [number, number, number] = [minX + curbOffset, steepY, maxZ - curbOffset];

      // 4 Steep lower facets
      addQuad(b1, b2, k2, k1);
      addQuad(b2, b3, k3, k2);
      addQuad(b3, b4, k4, k3);
      addQuad(b4, b1, k1, k4);

      // Top flat/shallow deck
      addQuad(k1, k2, k3, k4);
      gutters.push({ start: b1, end: b2 }, { start: b2, end: b3 }, { start: b3, end: b4 }, { start: b4, end: b1 });
    }
    // 5. GAMBREL ROOF (Dutch Barn dual-angle slope)
    else if (type === 'gambrel') {
      const curbZ = depth * 0.25;
      const lowerY = curbZ * Math.tan((55 * Math.PI) / 180);
      const upperY = lowerY + (depth * 0.25) * Math.tan((25 * Math.PI) / 180);

      const e1: [number, number, number] = [minX, 0, minZ];
      const e2: [number, number, number] = [maxX, 0, minZ];
      const k1: [number, number, number] = [minX, lowerY, minZ + curbZ];
      const k2: [number, number, number] = [maxX, lowerY, minZ + curbZ];
      const r1: [number, number, number] = [minX, upperY, centerZ];
      const r2: [number, number, number] = [maxX, upperY, centerZ];
      const k3: [number, number, number] = [maxX, lowerY, maxZ - curbZ];
      const k4: [number, number, number] = [minX, lowerY, maxZ - curbZ];
      const e3: [number, number, number] = [maxX, 0, maxZ];
      const e4: [number, number, number] = [minX, 0, maxZ];

      addQuad(e1, e2, k2, k1);
      addQuad(k1, k2, r2, r1);
      addQuad(r1, r2, k3, k4);
      addQuad(k4, k3, e3, e4);

      // End Gambrel infills
      infillVerts.push(...e1, ...k1, ...r1, ...e1, ...r1, ...k4, ...e1, ...k4, ...e4);
      infillVerts.push(...e2, ...r2, ...k2, ...e2, ...k3, ...r2, ...e2, ...e3, ...k3);

      gutters.push({ start: e1, end: e2 }, { start: e4, end: e3 });
    }
    // 6. VAULTED BARREL ARCH ROOF
    else if (type === 'vaulted') {
      const segments = 12;
      const halfWidth = width / 2;
      const archHeight = halfWidth * 0.45;

      for (let i = 0; i < segments; i++) {
        const theta1 = (Math.PI * i) / segments;
        const theta2 = (Math.PI * (i + 1)) / segments;

        const x1 = centerX - halfWidth * Math.cos(theta1);
        const y1 = archHeight * Math.sin(theta1);
        const x2 = centerX - halfWidth * Math.cos(theta2);
        const y2 = archHeight * Math.sin(theta2);

        const p1: [number, number, number] = [x1, y1, minZ];
        const p2: [number, number, number] = [x1, y1, maxZ];
        const p3: [number, number, number] = [x2, y2, maxZ];
        const p4: [number, number, number] = [x2, y2, minZ];

        addQuad(p1, p2, p3, p4);
      }
    }
    // 7. FLAT & GREEN ROOF (Structural Slab + Parapet Wall + Drainage)
    else {
      // Flat deck top
      const p1: [number, number, number] = [minX, 0, minZ];
      const p2: [number, number, number] = [maxX, 0, minZ];
      const p3: [number, number, number] = [maxX, 0, maxZ];
      const p4: [number, number, number] = [minX, 0, maxZ];
      addQuad(p1, p2, p3, p4);

      // Solar array on flat roof
      if (hasSolarPanels && type === 'flat') {
        const countX = Math.max(1, Math.floor(width / 2.2));
        const countZ = Math.max(1, Math.floor(depth / 2.4));
        for (let i = 0; i < countX; i++) {
          for (let j = 0; j < countZ; j++) {
            const px = minX + 1.2 + i * 2.0;
            const pz = minZ + 1.2 + j * 2.2;
            if (px < maxX - 1.0 && pz < maxZ - 1.0) {
              solarPoints.push({ pos: [px, 0.25, pz], rot: [0.35, 0, 0] }); // 20 degree tilt
            }
          }
        }
      }
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    if (infillVerts.length > 0) {
      infillGeom.setAttribute('position', new THREE.Float32BufferAttribute(infillVerts, 3));
      infillGeom.computeVertexNormals();
    }

    return {
      roofGeometry: geom,
      infillGeometry: infillGeom,
      solarPositions: solarPoints,
      gutterPositions: gutters,
    };
  }, [bounds, type, pitch, ridgeOrientation, hasSolarPanels, solarDensity]);

  const { width, depth, minX, maxX, minZ, maxZ } = bounds;

  return (
    <group
      position={[0, elevationOffset, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(roof.id, 'roof');
      }}
    >
      {/* Primary Structural Roof Slopes */}
      <mesh geometry={roofGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={displayColor}
          roughness={type === 'green' ? 0.95 : 0.45}
          metalness={type === 'shed' || type === 'flat' ? 0.3 : 0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Triangular Gable Infill Walls */}
      {infillGeometry.attributes.position && (
        <mesh geometry={infillGeometry} castShadow receiveShadow>
          <meshStandardMaterial color="#f8fafc" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Parapet Walls for Flat & Green Eco-Roofs */}
      {(type === 'flat' || type === 'green') && parapetHeight > 0 && (
        <group position={[0, parapetHeight / 2, 0]}>
          {/* North Parapet */}
          <mesh position={[(minX + maxX) / 2, 0, minZ]} castShadow>
            <boxGeometry args={[width, parapetHeight, 0.2]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
          </mesh>
          {/* South Parapet */}
          <mesh position={[(minX + maxX) / 2, 0, maxZ]} castShadow>
            <boxGeometry args={[width, parapetHeight, 0.2]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
          </mesh>
          {/* West Parapet */}
          <mesh position={[minX, 0, (minZ + maxZ) / 2]} castShadow>
            <boxGeometry args={[0.2, parapetHeight, depth]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
          </mesh>
          {/* East Parapet */}
          <mesh position={[maxX, 0, (minZ + maxZ) / 2]} castShadow>
            <boxGeometry args={[0.2, parapetHeight, depth]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* Structural King Post Timber Trusses underneath */}
      {showTrusses && type === 'gable' && (
        <group position={[0, -0.05, 0]}>
          {[-width * 0.3, 0, width * 0.3].map((xOffset, idx) => (
            <group key={idx} position={[bounds.centerX + xOffset, 0, bounds.centerZ]}>
              {/* Bottom Tie Beam */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.15, 0.15, depth]} />
                <meshStandardMaterial color="#854d0e" roughness={0.8} />
              </mesh>
              {/* Vertical King Post */}
              <mesh position={[0, (depth / 4) * Math.tan((pitch * Math.PI) / 180), 0]}>
                <boxGeometry args={[0.12, (depth / 2) * Math.tan((pitch * Math.PI) / 180), 0.12]} />
                <meshStandardMaterial color="#854d0e" roughness={0.8} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* Solar Photovoltaic (PV) Panels Array */}
      {hasSolarPanels &&
        solarPositions.map((sp, idx) => (
          <group key={idx} position={sp.pos} rotation={sp.rot}>
            {/* Solar Cell Surface */}
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[1.6, 0.04, 1.0]} />
              <meshStandardMaterial
                color="#0f172a"
                roughness={0.2}
                metalness={0.85}
              />
            </mesh>
            {/* Aluminum Frame */}
            <mesh position={[0, -0.02, 0]}>
              <boxGeometry args={[1.64, 0.03, 1.04]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.3} />
            </mesh>
          </group>
        ))}

      {/* Architectural Rainwater Gutters along Eaves */}
      {hasGutters &&
        gutterPositions.map((g, idx) => {
          const dx = g.end[0] - g.start[0];
          const dz = g.end[2] - g.start[2];
          const len = Math.hypot(dx, dz);
          const mx = (g.start[0] + g.end[0]) / 2;
          const mz = (g.start[2] + g.end[2]) / 2;
          const my = (g.start[1] + g.end[1]) / 2 - 0.06;
          const ang = Math.atan2(dx, dz);

          return (
            <mesh key={idx} position={[mx, my, mz]} rotation={[0, ang + Math.PI / 2, 0]}>
              <cylinderGeometry args={[0.07, 0.07, len, 8, 1, false, 0, Math.PI]} />
              <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.7} />
            </mesh>
          );
        })}
    </group>
  );
};
