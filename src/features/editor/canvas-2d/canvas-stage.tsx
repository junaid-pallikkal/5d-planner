"use client";

import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Stage } from "react-konva";
import type Konva from "konva";
import { useProjectStore } from "@/stores/project-store";
import { useEditorStore } from "@/stores/editor-store";
import { useSelectionStore } from "@/stores/selection-store";
import { GridLayer } from "./grid-layer";
import { RoomsLayer } from "./rooms-layer";
import { WallsLayer } from "./walls-layer";
import { OpeningsLayer } from "./openings-layer";
import { FurnitureLayer } from "./furniture-layer";
import { RoofLayer } from "./roof-layer";
import { DimensionsLayer } from "./dimensions-layer";
import { DraftingOverlay } from "./drafting-overlay";
import { Rulers } from "./rulers";
import { CoordinateService } from "@/lib/geometry/coordinates";
import { SnappingService } from "@/lib/geometry/snapping";
import { Vector2DMath } from "@/lib/geometry/vector2d";
import { WallMath } from "@/lib/geometry/wall-math";
import { Point2D, SnapResult } from "@/types/geometry";

export const CanvasStage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [activeSnap, setActiveSnap] = useState<SnapResult | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Store subscriptions
  const project = useProjectStore((s) => s.project);
  const activeFloor = useProjectStore((s) => s.getCurrentFloor());
  const walls = activeFloor?.walls || [];
  const rooms = activeFloor?.rooms || [];
  const doors = activeFloor?.doors || [];
  const windows = activeFloor?.windows || [];
  const furniture = activeFloor?.furniture || [];
  const roofs = activeFloor?.roofs || [];
  const dimensionsList = activeFloor?.dimensions || [];
  const addWall = useProjectStore((s) => s.addWall);
  const updateWall = useProjectStore((s) => s.updateWall);
  const addDoor = useProjectStore((s) => s.addDoor);
  const addWindow = useProjectStore((s) => s.addWindow);
  const addFurniture = useProjectStore((s) => s.addFurniture);
  const updateFurniture = useProjectStore((s) => s.updateFurniture);
  const addDimension = useProjectStore((s) => s.addDimension);

  const tool = useEditorStore((s) => s.tool);
  const pan = useEditorStore((s) => s.pan);
  const zoom = useEditorStore((s) => s.zoom);
  const setPan = useEditorStore((s) => s.setPan);
  const setZoom = useEditorStore((s) => s.setZoom);
  const selectedAsset = useEditorStore((s) => s.selectedAsset);
  const selectedDoorType = useEditorStore((s) => s.selectedDoorType);
  const selectedWindowType = useEditorStore((s) => s.selectedWindowType);

  const wallDraftStart = useEditorStore((s) => s.wallDraftStart);
  const wallDraftCurrent = useEditorStore((s) => s.wallDraftCurrent);
  const setWallDraft = useEditorStore((s) => s.setWallDraft);
  const measureDraftStart = useEditorStore((s) => s.measureDraftStart);
  const measureDraftEnd = useEditorStore((s) => s.measureDraftEnd);
  const setMeasureDraft = useEditorStore((s) => s.setMeasureDraft);

  const selectedPrimaryId = useSelectionStore((s) => s.primaryId);
  const select = useSelectionStore((s) => s.select);
  const clearSelection = useSelectionStore((s) => s.clearSelection);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const viewportTransform = { x: pan.x, y: pan.y, scale: zoom };
  const baseScale = CoordinateService.PIXELS_PER_METER_DEFAULT;

  // Zoom on wheel (centered at mouse pointer)
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const scaleBy = 1.1;
      const oldZoom = zoom;
      const newZoom = e.evt.deltaY < 0 ? oldZoom * scaleBy : oldZoom / scaleBy;
      const clampedZoom = Math.max(0.1, Math.min(newZoom, 5.0));

      const mousePointTo = {
        x: (pointer.x - pan.x) / (oldZoom * baseScale),
        y: (pointer.y - pan.y) / (oldZoom * baseScale),
      };

      const newPan = {
        x: pointer.x - mousePointTo.x * clampedZoom * baseScale,
        y: pointer.y - mousePointTo.y * clampedZoom * baseScale,
      };

      setZoom(clampedZoom);
      setPan(newPan);
    },
    [pan, zoom, setPan, setZoom, baseScale]
  );

  // Get snapped world coordinate for pointer
  const getSnappedWorldPoint = useCallback(
    (screenPt: Point2D, refPoint?: Point2D): { worldPoint: Point2D; snap: SnapResult } => {
      const rawWorld = CoordinateService.screenToWorld(screenPt, viewportTransform, baseScale);
      const snap = SnappingService.snap(rawWorld, walls, {
        gridSize: project?.settings?.gridSize || 0.5,
        snapToGrid: project?.settings?.gridSnap ?? true,
        snapToEndpoints: project?.settings?.objectSnap ?? true,
        snapToMidpoints: project?.settings?.objectSnap ?? true,
        snapToWalls: project?.settings?.objectSnap ?? true,
        snapAngles: (project?.settings?.angleSnap ?? true) && !!refPoint,
        angleIncrementDeg: project?.settings?.angleSnapIncrement || 45,
        referencePoint: refPoint,
      });

      return {
        worldPoint: snap.snapped ? snap.point : rawWorld,
        snap,
      };
    },
    [viewportTransform, baseScale, walls, project?.settings]
  );

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      setCursorPos(pointer);

      // Pan drag handling
      if (isPanning) {
        const dx = pointer.x - panStartRef.current.x;
        const dy = pointer.y - panStartRef.current.y;
        setPan({ x: pan.x + dx, y: pan.y + dy });
        panStartRef.current = pointer;
        return;
      }

      // Snapping & drafting feedback
      const { worldPoint, snap } = getSnappedWorldPoint(
        pointer,
        wallDraftStart || measureDraftStart || undefined
      );
      setActiveSnap(snap);

      if (tool === 'wall' && wallDraftStart) {
        setWallDraft(wallDraftStart, worldPoint);
      } else if (tool === 'measure' && measureDraftStart) {
        setMeasureDraft(measureDraftStart, worldPoint);
      }
    },
    [
      isPanning,
      pan,
      setPan,
      tool,
      wallDraftStart,
      measureDraftStart,
      setWallDraft,
      setMeasureDraft,
      getSnappedWorldPoint,
    ]
  );

  // Mouse down / click handler
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Middle click, Pan tool, or Spacebar drag initiates viewport pan
      if (e.evt.button === 1 || tool === 'pan' || isSpaceDown) {
        setIsPanning(true);
        panStartRef.current = pointer;
        return;
      }

      if (e.evt.button !== 0) return; // left click only for actions

      const { worldPoint } = getSnappedWorldPoint(
        pointer,
        wallDraftStart || measureDraftStart || undefined
      );

      // Tool: Wall Drawing
      if (tool === 'wall') {
        if (!wallDraftStart) {
          // First point: start wall
          setWallDraft(worldPoint, worldPoint);
        } else {
          // Second point: create wall
          if (Vector2DMath.distance(wallDraftStart, worldPoint) >= 0.2) {
            addWall({
              start: wallDraftStart,
              end: worldPoint,
              thickness: project.settings.wallThicknessDefault || 0.2,
              height: project.settings.wallHeightDefault || 2.8,
              isExterior: true,
            });
            // Continue chaining from this point
            setWallDraft(worldPoint, worldPoint);
          }
        }
      }
      // Tool: Measure
      else if (tool === 'measure') {
        if (!measureDraftStart) {
          setMeasureDraft(worldPoint, worldPoint);
        } else {
          setMeasureDraft(null, null); // clear on second click
        }
      }
      // Tool: Dimension
      else if (tool === 'dimension') {
        if (!measureDraftStart) {
          setMeasureDraft(worldPoint, worldPoint);
        } else {
          addDimension({
            start: measureDraftStart,
            end: worldPoint,
            offset: 0.4,
            calculatedLength: Vector2DMath.distance(measureDraftStart, worldPoint),
          });
          setMeasureDraft(null, null);
        }
      }
      // Tool: Place Door
      else if (tool === 'door') {
        // Find nearest wall
        let closestWall = null;
        let minRatio = 0.5;
        let minDist = 0.5;

        for (const wall of walls) {
          const { point, ratio } = Vector2DMath.closestPointOnSegment(worldPoint, {
            start: wall.start,
            end: wall.end,
          });
          const dist = Vector2DMath.distance(worldPoint, point);
          if (dist < minDist) {
            minDist = dist;
            closestWall = wall;
            minRatio = ratio;
          }
        }

        if (closestWall) {
          addDoor({
            wallId: closestWall.id,
            distanceRatio: minRatio,
            width: 0.9,
            height: 2.1,
            type: selectedDoorType || 'single',
            swingDirection: 'inward_right',
          });
        }
      }
      // Tool: Place Window
      else if (tool === 'window') {
        let closestWall = null;
        let minRatio = 0.5;
        let minDist = 0.5;

        for (const wall of walls) {
          const { point, ratio } = Vector2DMath.closestPointOnSegment(worldPoint, {
            start: wall.start,
            end: wall.end,
          });
          const dist = Vector2DMath.distance(worldPoint, point);
          if (dist < minDist) {
            minDist = dist;
            closestWall = wall;
            minRatio = ratio;
          }
        }

        if (closestWall) {
          addWindow({
            wallId: closestWall.id,
            distanceRatio: minRatio,
            width: 1.2,
            height: 1.4,
            elevationFromFloor: 0.9,
            type: selectedWindowType || 'sliding',
          });
        }
      }
      // Tool: Place Furniture
      else if (tool === 'furniture' && selectedAsset) {
        addFurniture({
          assetId: selectedAsset.id,
          name: selectedAsset.name,
          category: selectedAsset.category,
          position: { x: worldPoint.x, y: 0, z: worldPoint.y },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: selectedAsset.dimensions,
        });
      }
      // Tool: Select (clicking blank canvas clears selection)
      else if (tool === 'select') {
        if (e.target === stage) {
          clearSelection();
        }
      }
    },
    [
      tool,
      wallDraftStart,
      measureDraftStart,
      selectedAsset,
      selectedDoorType,
      selectedWindowType,
      walls,
      project?.settings,
      addWall,
      addDoor,
      addWindow,
      addFurniture,
      addDimension,
      setWallDraft,
      setMeasureDraft,
      clearSelection,
      getSnappedWorldPoint,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Spacebar pan and Escape key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpaceDown(true);
      }
      if (e.key === 'Escape') {
        setWallDraft(null, null);
        setMeasureDraft(null, null);
        clearSelection();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceDown(false);
        if (tool !== 'pan') {
          setIsPanning(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [tool, setWallDraft, setMeasureDraft, clearSelection]);

  const cursorStyle = useMemo(() => {
    if (isPanning) return 'grabbing';
    if (isSpaceDown || tool === 'pan') return 'grab';
    if (tool === 'wall' || tool === 'measure' || tool === 'dimension' || tool === 'roof') return 'crosshair';
    if (tool === 'door' || tool === 'window') return 'crosshair';
    return 'default';
  }, [isPanning, isSpaceDown, tool]);

  const cursorWorld = useMemo(() => {
    if (!cursorPos) return null;
    return CoordinateService.screenToWorld(cursorPos, viewportTransform, baseScale);
  }, [cursorPos, viewportTransform, baseScale]);

  const draftingMetrics = useMemo(() => {
    if (!wallDraftStart || !wallDraftCurrent) return null;
    const len = Vector2DMath.distance(wallDraftStart, wallDraftCurrent);
    const angle = (Math.atan2(wallDraftCurrent.y - wallDraftStart.y, wallDraftCurrent.x - wallDraftStart.x) * 180) / Math.PI;
    const normAngle = ((angle % 360) + 360) % 360;
    return {
      length: len,
      angle: normAngle,
    };
  }, [wallDraftStart, wallDraftCurrent]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#F7F8FA] select-none"
      style={{ cursor: cursorStyle }}
    >
      <Rulers
        transform={viewportTransform}
        width={dimensions.width}
        height={dimensions.height}
        cursorPos={cursorPos}
      />

      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setCursorPos(null);
          setIsPanning(false);
        }}
      >
        {/* Background Grid */}
        <GridLayer
          transform={viewportTransform}
          stageWidth={dimensions.width}
          stageHeight={dimensions.height}
          gridSize={project?.settings?.gridSize || 0.5}
          showGrid={project?.settings?.showGrid ?? true}
          theme="light"
        />

        {/* Room Area fills */}
        <RoomsLayer
          rooms={rooms}
          transform={viewportTransform}
          selectedId={selectedPrimaryId}
          onSelectRoom={(id) => select(id, 'room')}
        />

        {/* Thickened Walls & Resizing Grips */}
        <WallsLayer
          walls={walls}
          transform={viewportTransform}
          selectedId={selectedPrimaryId}
          onSelectWall={(id) => select(id, 'wall')}
          onEndpointDrag={(wallId, which, newPos) => {
            updateWall(wallId, which === 'start' ? { start: newPos } : { end: newPos });
          }}
        />

        {/* Doors & Windows */}
        <OpeningsLayer
          doors={doors}
          windows={windows}
          walls={walls}
          transform={viewportTransform}
          selectedId={selectedPrimaryId}
          onSelectOpening={(id, type) => select(id, type)}
        />

        {/* Furniture Symbols */}
        <FurnitureLayer
          furniture={furniture}
          transform={viewportTransform}
          selectedId={selectedPrimaryId}
          onSelectFurniture={(id) => select(id, 'furniture')}
          onUpdateFurniturePos={(id, pos) => updateFurniture(id, { position: pos })}
          onUpdateFurnitureRot={(id, rotY) =>
            updateFurniture(id, { rotation: { x: 0, y: rotY, z: 0 } })
          }
        />

        {/* Parametric Civil Roof Plan Layer */}
        <RoofLayer
          roofs={roofs}
          transform={viewportTransform}
          selectedId={selectedPrimaryId}
          onSelectRoof={(id) => select(id, 'roof')}
        />

        {/* CAD Dimensions */}
        <DimensionsLayer
          dimensions={dimensionsList}
          transform={viewportTransform}
          selectedId={selectedPrimaryId}
          unit={project?.settings?.unit || "m"}
          onSelectDimension={(id) => select(id, 'dimension')}
        />

        {/* Live drafting preview & snap targets */}
        <DraftingOverlay
          wallDraftStart={wallDraftStart}
          wallDraftCurrent={wallDraftCurrent}
          measureDraftStart={measureDraftStart}
          measureDraftEnd={measureDraftEnd}
          activeSnap={activeSnap}
          transform={viewportTransform}
        />
      </Stage>

      {/* Precision CAD Status Bar HUD */}
      <div className="absolute bottom-2.5 left-16 right-3 pointer-events-none flex items-center justify-between z-20 text-[11px] font-mono select-none">
        {/* Left: Coordinates & Drafting Info */}
        <div className="pointer-events-auto flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg border border-[#E5E7EB] shadow-sm text-[#202124]">
          <div className="flex items-center space-x-1.5">
            <span className="text-[#16A34A] font-bold">X:</span>
            <span className="font-semibold">{cursorWorld ? cursorWorld.x.toFixed(2) : "0.00"}m</span>
            <span className="text-[#6B7280] text-[9px]">({cursorWorld ? (cursorWorld.x * 1000).toFixed(0) : "0"}mm)</span>
          </div>
          <span className="text-[#E5E7EB]">|</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-[#16A34A] font-bold">Y:</span>
            <span className="font-semibold">{cursorWorld ? cursorWorld.y.toFixed(2) : "0.00"}m</span>
            <span className="text-[#6B7280] text-[9px]">({cursorWorld ? (cursorWorld.y * 1000).toFixed(0) : "0"}mm)</span>
          </div>

          {draftingMetrics && (
            <>
              <span className="text-[#E5E7EB]">|</span>
              <div className="flex items-center space-x-1.5 text-[#16A34A] font-semibold">
                <span>L: {draftingMetrics.length.toFixed(2)}m</span>
                <span className="text-[#6B7280]">∠ {draftingMetrics.angle.toFixed(1)}°</span>
              </div>
            </>
          )}

          {activeSnap && activeSnap.snapped && (
            <>
              <span className="text-[#E5E7EB]">|</span>
              <div className="flex items-center space-x-1 text-emerald-600 font-semibold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{activeSnap.snapType?.toUpperCase()} SNAP</span>
              </div>
            </>
          )}
        </div>

        {/* Right: Scale, Zoom & Level info */}
        <div className="pointer-events-auto flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg border border-[#E5E7EB] shadow-sm text-[#6B7280]">
          <span className="hidden sm:inline text-[10px]">
            {isSpaceDown ? "SPACE PAN" : "HOLD SPACE TO PAN"}
          </span>
          <span className="hidden sm:inline text-[#E5E7EB]">|</span>
          <span>EL: {(activeFloor?.elevation || 0).toFixed(2)}m</span>
          <span className="text-[#E5E7EB]">|</span>
          <button
            onClick={() => {
              setZoom(1.0);
              setPan({ x: 0, y: 0 });
            }}
            title="Reset Zoom (1:50)"
            className="hover:text-[#202124] transition-colors font-semibold"
          >
            {Math.round(zoom * 100)}%
          </button>
        </div>
      </div>
    </div>
  );
};
