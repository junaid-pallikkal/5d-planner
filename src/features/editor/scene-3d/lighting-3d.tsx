"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { LightData, ProjectSettings } from "@/types/project";

interface Lighting3DProps {
  settings: ProjectSettings;
  lights: LightData[];
}

export const Lighting3D: React.FC<Lighting3DProps> = ({ settings, lights }) => {
  // Convert sun azimuth & altitude angles to Cartesian 3D position
  const sunPosition = useMemo(() => {
    const azimuthRad = ((settings.sunAzimuth || 135) * Math.PI) / 180;
    const altitudeRad = ((settings.sunAltitude || 45) * Math.PI) / 180;
    const distance = 30;

    const y = Math.sin(altitudeRad) * distance;
    const x = Math.cos(altitudeRad) * Math.sin(azimuthRad) * distance;
    const z = Math.cos(altitudeRad) * Math.cos(azimuthRad) * distance;

    return new THREE.Vector3(x, y, z);
  }, [settings.sunAzimuth, settings.sunAltitude]);

  return (
    <>
      {/* Directional Sun */}
      <directionalLight
        position={sunPosition}
        intensity={1.2}
        color="#fffbf2"
        castShadow={settings.shadowsEnabled}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0005}
      />

      {/* Hemispherical Ambient Light (Sky tone + Ground bounce) */}
      <hemisphereLight
        args={["#93c5fd", "#1e293b", 0.6]}
      />

      {/* Secondary fill light */}
      <directionalLight
        position={[-sunPosition.x * 0.5, 10, -sunPosition.z * 0.5]}
        intensity={0.3}
        color="#e0f2fe"
      />

      {/* Custom project point lights */}
      {(lights || []).map((l) => (
        <pointLight
          key={l.id}
          position={[l.position.x, l.position.y, l.position.z]}
          intensity={l.intensity}
          color={l.color}
          distance={l.distance || 10}
          decay={l.decay || 2}
          castShadow={l.castShadow && settings.shadowsEnabled}
        />
      ))}
    </>
  );
};
