"use client";

import React from "react";
import { Layer, Line, Circle } from "react-konva";
import { ViewportTransform, CoordinateService } from "@/lib/geometry/coordinates";

interface GridLayerProps {
  transform: ViewportTransform;
  stageWidth: number;
  stageHeight: number;
  gridSize?: number; // meters
  showGrid?: boolean;
  theme?: string;
}

export const GridLayer: React.FC<GridLayerProps> = ({
  transform,
  stageWidth,
  stageHeight,
  gridSize = 0.5,
  showGrid = true,
  theme = "dark",
}) => {
  if (!showGrid) return null;

  const baseScale = CoordinateService.PIXELS_PER_METER_DEFAULT;
  const pixelsPerGrid = gridSize * transform.scale * baseScale;

  if (pixelsPerGrid < 8) return null;

  const startWorld = CoordinateService.screenToWorld(
    { x: 0, y: 0 },
    transform,
    baseScale
  );
  const endWorld = CoordinateService.screenToWorld(
    { x: stageWidth, y: stageHeight },
    transform,
    baseScale
  );

  const startGridX = Math.floor(startWorld.x / gridSize) * gridSize;
  const endGridX = Math.ceil(endWorld.x / gridSize) * gridSize;
  const startGridY = Math.floor(startWorld.y / gridSize) * gridSize;
  const endGridY = Math.ceil(endWorld.y / gridSize) * gridSize;

  const lines: React.ReactNode[] = [];
  const isDark = theme === "dark";

  // Ultra-delicate architectural CAD grid
  const minorColor = "#E9EDF3";
  const majorColor = "#D1D5DB";
  const axisColor = "rgba(37, 99, 235, 0.45)";

  // Vertical grid lines
  for (let x = startGridX; x <= endGridX; x += gridSize) {
    const isMajor = Math.abs(x % (gridSize * 4)) < 0.01;
    const isAxis = Math.abs(x) < 0.01;
    const screenX = CoordinateService.worldToScreen({ x, y: 0 }, transform, baseScale).x;

    lines.push(
      <Line
        key={`v_${x.toFixed(2)}`}
        points={[screenX, 0, screenX, stageHeight]}
        stroke={isAxis ? axisColor : isMajor ? majorColor : minorColor}
        strokeWidth={isAxis ? 1.2 : 0.6}
        listening={false}
      />
    );
  }

  // Horizontal grid lines
  for (let y = startGridY; y <= endGridY; y += gridSize) {
    const isMajor = Math.abs(y % (gridSize * 4)) < 0.01;
    const isAxis = Math.abs(y) < 0.01;
    const screenY = CoordinateService.worldToScreen({ x: 0, y }, transform, baseScale).y;

    lines.push(
      <Line
        key={`h_${y.toFixed(2)}`}
        points={[0, screenY, stageWidth, screenY]}
        stroke={isAxis ? axisColor : isMajor ? majorColor : minorColor}
        strokeWidth={isAxis ? 1.2 : 0.6}
        listening={false}
      />
    );
  }

  // Origin Marker (0,0)
  const originScreen = CoordinateService.worldToScreen(
    { x: 0, y: 0 },
    transform,
    baseScale
  );

  return (
    <Layer listening={false}>
      {lines}
      <Circle
        x={originScreen.x}
        y={originScreen.y}
        radius={3}
        fill="#3b82f6"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth={1}
      />
    </Layer>
  );
};
