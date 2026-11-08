"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useProjectStore } from "@/stores/project-store";
import { useSelectionStore } from "@/stores/selection-store";
import { useCameraStore } from "@/stores/camera-store";
import { WallMesh } from "./wall-mesh";
import { FloorMesh } from "./floor-mesh";
import { RoofMesh } from "./roof-mesh";
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
  Crosshair,
  Target,
  RotateCcw,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

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
  const setFocusPoint = useCameraStore((s) => s.setFocusPoint);
  const resetCamera = useCameraStore((s) => s.resetCamera);

  // Compute building bounding center across all floors
  const getBuildingCenter = useCallback(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    (project?.floors || []).forEach((floor) => {
      (floor.walls || []).forEach((w) => {
        minX = Math.min(minX, w.start.x, w.end.x);
        maxX = Math.max(maxX, w.start.x, w.end.x);
        minY = Math.min(minY, w.start.y, w.end.y);
        maxY = Math.max(maxY, w.start.y, w.end.y);
      });
    });

    if (minX === Infinity) {
      return { x: 4, y: 1.0, z: 3.5 };
    }

    return {
      x: (minX + maxX) / 2,
      y: 1.0,
      z: (minY + maxY) / 2,
    };
  }, [project?.floors]);

  // Focus camera on entire building envelope
  const handleFocusBuilding = useCallback(() => {
    const center = getBuildingCenter();
    setFocusPoint(center, {
      x: center.x + 12,
      y: center.y + 11,
      z: center.z + 12,
    });
    toast.success("Focused on building envelope");
  }, [getBuildingCenter, setFocusPoint]);

  // Focus camera on selected architectural element
  const handleFocusSelection = useCallback(() => {
    if (!selectedPrimaryId) return;

    let targetPt: { x: number; y: number; z: number } | null = null;

    for (const floor of project?.floors || []) {
      const elevation = floor.elevation || 0;

      // Wall?
      const wall = floor.walls.find((w) => w.id === selectedPrimaryId);
      if (wall) {
        targetPt = {
          x: (wall.start.x + wall.end.x) / 2,
          y: elevation + (wall.height || 2.8) / 2,
          z: (wall.start.y + wall.end.y) / 2,
        };
        break;
      }

      // Room?
      const room = floor.rooms.find((r) => r.id === selectedPrimaryId);
      if (room && room.polygon.length > 0) {
        const cx = room.polygon.reduce((acc, p) => acc + p.x, 0) / room.polygon.length;
        const cz = room.polygon.reduce((acc, p) => acc + p.y, 0) / room.polygon.length;
        targetPt = { x: cx, y: elevation + 0.5, z: cz };
        break;
      }

      // Furniture?
      const item = floor.furniture.find((f) => f.id === selectedPrimaryId);
      if (item) {
        targetPt = {
          x: item.position.x,
          y: elevation + 0.5,
          z: item.position.z,
        };
        break;
      }

      // Roof?
      const roof = floor.roofs?.find((rf) => rf.id === selectedPrimaryId);
      if (roof && roof.polygon && roof.polygon.length > 0) {
        const cx = roof.polygon.reduce((acc, p) => acc + p.x, 0) / roof.polygon.length;
        const cz = roof.polygon.reduce((acc, p) => acc + p.y, 0) / roof.polygon.length;
        targetPt = { x: cx, y: elevation + (roof.elevationOffset || 2.8) + 1.0, z: cz };
        break;
      }
    }

    if (targetPt) {
      setFocusPoint(targetPt);
      toast.success("Focused on selected object");
    }
  }, [selectedPrimaryId, project?.floors, setFocusPoint]);

  // Press 'F' key to focus on selection or building
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "f" || e.key === "F") {
        if (selectedPrimaryId) {
          handleFocusSelection();
        } else {
          handleFocusBuilding();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPrimaryId, handleFocusSelection, handleFocusBuilding]);

  // Export 3D scene to GLTF/GLB
  const handleExportGLTF = async () => {
    if (!sceneRef.current) return;
    try {
      await GltfExporterService.exportSceneToGltf(
        sceneRef.current,
        `${project.name.toLowerCase().replace(/[^a-z0-9]/gi, "_")}.glb`,
        true
      );
    } catch (err) {
      console.error("Failed to export GLB model:", err);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#F1F5F9]">
      {/* 3D Viewport Controls Floating Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-1 glass-dock p-1 rounded-xl shadow-sm border border-[#E5E7EB]">
        {/* Orbit Mode */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={cameraMode === "orbit" ? "activeCad" : "ghost"}
              size="cadIcon"
              onClick={() => setCameraMode("orbit")}
            >
              <Compass className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Orbit Camera</TooltipContent>
        </Tooltip>

        {/* Walkthrough Mode */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={cameraMode === "first_person" ? "activeCad" : "ghost"}
              size="cadIcon"
              onClick={() => setCameraMode("first_person")}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Walkthrough (WASD)</TooltipContent>
        </Tooltip>

        {/* Isometric Mode */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={cameraMode === "isometric" ? "activeCad" : "ghost"}
              size="cadIcon"
              onClick={() => setCameraMode("isometric")}
            >
              <Box className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Isometric View</TooltipContent>
        </Tooltip>

        {/* Top-Down Mode */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={cameraMode === "top_down" ? "activeCad" : "ghost"}
              size="cadIcon"
              onClick={() => setCameraMode("top_down")}
            >
              <Layers className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Top-Down Plan</TooltipContent>
        </Tooltip>

        <div className="h-3.5 w-[1px] bg-[#E5E7EB] my-auto mx-1" />

        {/* Focus Building Envelope */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="cadIcon"
              onClick={handleFocusBuilding}
              className="text-[#6B7280] hover:text-[#16A34A]"
            >
              <Crosshair className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Focus Entire Building (F)</TooltipContent>
        </Tooltip>

        {/* Focus Selected Item */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={selectedPrimaryId ? "default" : "ghost"}
              size="cadIcon"
              disabled={!selectedPrimaryId}
              onClick={handleFocusSelection}
              className={
                selectedPrimaryId
                  ? "bg-[#16A34A] text-white hover:bg-[#15803D]"
                  : "text-[#6B7280] opacity-40 cursor-not-allowed"
              }
            >
              <Target className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {selectedPrimaryId ? "Focus Selected Object" : "Select an object to focus"}
          </TooltipContent>
        </Tooltip>

        {/* Reset Camera */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="cadIcon"
              onClick={() => {
                const center = getBuildingCenter();
                resetCamera(center);
                toast.success("Camera reset");
              }}
              className="text-[#6B7280] hover:text-[#202124]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset View</TooltipContent>
        </Tooltip>

        <div className="h-3.5 w-[1px] bg-[#E5E7EB] my-auto mx-1" />

        {/* Export 3D Model */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="cadIcon"
              onClick={handleExportGLTF}
              className="text-[#6B7280] hover:text-[#202124]"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export 3D GLB Model</TooltipContent>
        </Tooltip>
      </div>

      {/* Navigation Hint Pill */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none hidden sm:flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg border border-[#E5E7EB] shadow-sm text-[11px] font-mono text-[#6B7280]">
        <span className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          <span>Double-Click: Focus Point</span>
        </span>
        <span className="text-[#E5E7EB]">|</span>
        <span>Right-Click: Pan</span>
        <span className="text-[#E5E7EB]">|</span>
        <span>Scroll: Zoom</span>
      </div>

      {/* R3F Canvas */}
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: [12, 12, 12], fov: 45 }}
        onPointerMissed={() => clearSelection()}
      >
        <color attach="background" args={["#f1f5f9"]} />
        <fog attach="fog" args={["#f1f5f9", 30, 95]} />
        <CameraController />
        <Lighting3D
          settings={project?.settings || { sunAzimuth: 135, sunAltitude: 45, shadowsEnabled: true }}
          lights={activeFloor?.lights || []}
        />

        {/* 3D Scene Hierarchy */}
        <group ref={sceneRef}>
          {/* Architectural Ground Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <planeGeometry args={[140, 140]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} metalness={0.02} />
          </mesh>

          {/* Ground Grid Helper */}
          <gridHelper args={[60, 60, "#16a34a", "#cbd5e1"]} position={[0, -0.01, 0]} />

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
                  onSelectRoom={(id) => select(id, "room")}
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
                    onSelect={(id) => select(id, "wall")}
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
                  onSelect={(id) => select(id, "furniture")}
                  onUpdateTransform={(id, pos, rotY) => {
                    updateFurniture(id, {
                      position: pos,
                      rotation: { x: 0, y: rotY, z: 0 },
                    });
                  }}
                />

                {/* 3D Parametric Civil Engineering Roofs */}
                <RoofMesh
                  roofs={floor.roofs || []}
                  materials={project?.materials || []}
                  selectedId={selectedPrimaryId}
                  onSelect={(id) => select(id, "roof")}
                />
              </group>
            );
          })}
        </group>
      </Canvas>
    </div>
  );
};
