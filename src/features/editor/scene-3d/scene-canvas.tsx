"use client";

import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useProjectStore } from "@/stores/project-store";
import { useSelectionStore } from "@/stores/selection-store";
import { useCameraStore } from "@/stores/camera-store";
import { WallMesh } from "./wall-mesh";
import { FloorMesh } from "./floor-mesh";
import { Openings3D } from "./openings-3d";
import { Furniture3D } from "./furniture-3d";
import { Lighting3D } from "./lighting-3d";
import { CameraController } from "./camera-controller";
import { Button } from "@/components/ui/button";
import { GltfExporterService } from "@/lib/export/gltf-exporter";
import {
  Compass,
  Eye,
  Box,
  Layers,
  Download,
  Maximize2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const SceneCanvas: React.FC = () => {
  const sceneRef = useRef<THREE.Group>(null);
  const project = useProjectStore((s) => s.project);
  const activeFloor = useProjectStore((s) => s.getCurrentFloor());
  const updateFurniture = useProjectStore((s) => s.updateFurniture);

  const selectedPrimaryId = useSelectionStore((s) => s.primaryId);
  const select = useSelectionStore((s) => s.select);
  const clearSelection = useSelectionStore((s) => s.clearSelection);

  const cameraMode = useCameraStore((s) => s.mode);
  const setCameraMode = useCameraStore((s) => s.setMode);

  // Export 3D scene to GLTF/GLB
  const handleExportGLTF = async () => {
    if (!sceneRef.current) return;
    try {
      await GltfExporterService.exportSceneToGltf(
        sceneRef.current,
        `${project.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.glb`,
        true
      );
    } catch (err) {
      console.error('Failed to export GLB model:', err);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#F1F5F9]">
      {/* 3D Viewport Controls Floating Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-1 glass-dock p-1 rounded-xl">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={cameraMode === 'orbit' ? 'activeCad' : 'ghost'}
              size="cadIcon"
              onClick={() => setCameraMode('orbit')}
            >
              <Compass className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Orbit Camera</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={cameraMode === 'first_person' ? 'activeCad' : 'ghost'}
              size="cadIcon"
              onClick={() => setCameraMode('first_person')}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Walkthrough (WASD)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={cameraMode === 'isometric' ? 'activeCad' : 'ghost'}
              size="cadIcon"
              onClick={() => setCameraMode('isometric')}
            >
              <Box className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Isometric</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={cameraMode === 'top_down' ? 'activeCad' : 'ghost'}
              size="cadIcon"
              onClick={() => setCameraMode('top_down')}
            >
              <Layers className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Top-Down Plan</TooltipContent>
        </Tooltip>

        <div className="h-3 w-[1px] bg-border/60 my-auto mx-0.5" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="cadIcon"
              onClick={handleExportGLTF}
              className="text-muted-foreground hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export 3D GLB Model</TooltipContent>
        </Tooltip>
      </div>

      {/* R3F Canvas */}
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: [10, 12, 12], fov: 45 }}
        onPointerMissed={() => clearSelection()}
      >
        <color attach="background" args={["#f1f5f9"]} />
        <fog attach="fog" args={["#f1f5f9", 25, 75]} />
        <CameraController />
        <Lighting3D
          settings={project?.settings || { sunAzimuth: 135, sunAltitude: 45, shadowsEnabled: true }}
          lights={activeFloor?.lights || []}
        />

        {/* 3D Scene Hierarchy */}
        <group ref={sceneRef}>
          {/* Architectural Ground Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <planeGeometry args={[120, 120]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} metalness={0.02} />
          </mesh>

          {/* Ground Grid Helper */}
          <gridHelper args={[50, 50, "#16a34a", "#cbd5e1"]} position={[0, -0.01, 0]} />

          {/* Render All Floors (Multi-Floor Architecture) */}
          {(project?.floors || []).map((floor) => {
            const elevation = floor.elevation || 0;
            return (
              <group key={floor.id} position={[0, elevation, 0]}>
                {/* 3D Floor Slabs */}
                <FloorMesh
                  rooms={floor.rooms || []}
                  elevation={0}
                  materials={project?.materials || []}
                  selectedId={selectedPrimaryId}
                  onSelectRoom={(id) => select(id, 'room')}
                />

                {/* 3D Walls with real openings */}
                {(floor.walls || []).map((wall) => (
                  <WallMesh
                    key={wall.id}
                    wall={wall}
                    doors={floor.doors || []}
                    windows={floor.windows || []}
                    elevation={0}
                    materials={project?.materials || []}
                    isSelected={selectedPrimaryId === wall.id}
                    onSelect={(id) => select(id, 'wall')}
                  />
                ))}

                {/* 3D Doors & Windows */}
                <Openings3D
                  doors={floor.doors || []}
                  windows={floor.windows || []}
                  walls={floor.walls || []}
                  elevation={0}
                  selectedId={selectedPrimaryId}
                  onSelect={(id, type) => select(id, type)}
                />

                {/* 3D Furniture */}
                <Furniture3D
                  furniture={floor.furniture || []}
                  elevation={0}
                  selectedId={selectedPrimaryId}
                  onSelect={(id) => select(id, 'furniture')}
                  onUpdateTransform={(id, pos, rotY) => {
                    updateFurniture(id, {
                      position: pos,
                      rotation: { x: 0, y: rotY, z: 0 },
                    });
                  }}
                />
              </group>
            );
          })}
        </group>
      </Canvas>
    </div>
  );
};
