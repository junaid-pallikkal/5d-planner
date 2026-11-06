"use client";

import React from "react";
import { ViewportTransform, CoordinateService } from "@/lib/geometry/coordinates";

interface RulersProps {
  transform: ViewportTransform;
  width: number;
  height: number;
  cursorPos: { x: number; y: number } | null;
}

export const Rulers: React.FC<RulersProps> = ({
  transform,
  width,
  height,
  cursorPos,
}) => {
  const rulerSize = 18; // 18px refined hairline ruler
  const baseScale = CoordinateService.PIXELS_PER_METER_DEFAULT;
  const pixelsPerMeter = transform.scale * baseScale;

  let stepMeters = 1.0;
  if (pixelsPerMeter < 25) stepMeters = 5.0;
  else if (pixelsPerMeter < 50) stepMeters = 2.0;
  else if (pixelsPerMeter > 150) stepMeters = 0.5;

  const startWorld = CoordinateService.screenToWorld(
    { x: rulerSize, y: rulerSize },
    transform,
    baseScale
  );
  const endWorld = CoordinateService.screenToWorld(
    { x: width, y: height },
    transform,
    baseScale
  );

  const startX = Math.floor(startWorld.x / stepMeters) * stepMeters;
  const endX = Math.ceil(endWorld.x / stepMeters) * stepMeters;
  const startY = Math.floor(startWorld.y / stepMeters) * stepMeters;
  const endY = Math.ceil(endWorld.y / stepMeters) * stepMeters;

  const topTicks: React.ReactNode[] = [];
  for (let x = startX; x <= endX; x += stepMeters) {
    const scX = CoordinateService.worldToScreen({ x, y: 0 }, transform, baseScale).x;
    if (scX >= rulerSize && scX <= width) {
      topTicks.push(
        <div
          key={`tx_${x.toFixed(1)}`}
          className="absolute top-0 flex flex-col items-center pointer-events-none"
          style={{ left: `${scX}px` }}
        >
          <div className="h-1.5 w-[1px] bg-gray-400" />
          <span className="text-[8px] font-mono text-[#6B7280] select-none -translate-x-1/2">
            {x.toFixed(x % 1 === 0 ? 0 : 1)}
          </span>
        </div>
      );
    }
  }

  const leftTicks: React.ReactNode[] = [];
  for (let y = startY; y <= endY; y += stepMeters) {
    const scY = CoordinateService.worldToScreen({ x: 0, y }, transform, baseScale).y;
    if (scY >= rulerSize && scY <= height) {
      leftTicks.push(
        <div
          key={`ty_${y.toFixed(1)}`}
          className="absolute left-0 flex items-center pointer-events-none"
          style={{ top: `${scY}px` }}
        >
          <div className="w-1.5 h-[1px] bg-gray-400" />
          <span className="text-[8px] font-mono text-[#6B7280] select-none -rotate-90 origin-left ml-0.5">
            {y.toFixed(y % 1 === 0 ? 0 : 1)}
          </span>
        </div>
      );
    }
  }

  return (
    <>
      {/* Corner Origin block */}
      <div
        className="absolute top-0 left-0 bg-white border-r border-b border-[#E5E7EB] z-20 flex items-center justify-center font-mono text-[8px] font-medium text-[#6B7280]"
        style={{ width: `${rulerSize}px`, height: `${rulerSize}px` }}
      >
        m
      </div>

      {/* Top Ruler Bar */}
      <div
        className="absolute top-0 left-[18px] right-0 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB] overflow-hidden z-10 pointer-events-none"
        style={{ height: `${rulerSize}px` }}
      >
        {topTicks}
        {cursorPos && (
          <div
            className="absolute top-0 bottom-0 w-[1px] bg-[#2563EB] z-20"
            style={{ left: `${cursorPos.x}px` }}
          />
        )}
      </div>

      {/* Left Ruler Bar */}
      <div
        className="absolute top-[18px] left-0 bottom-0 bg-white/95 backdrop-blur-sm border-r border-[#E5E7EB] overflow-hidden z-10 pointer-events-none"
        style={{ width: `${rulerSize}px` }}
      >
        {leftTicks}
        {cursorPos && (
          <div
            className="absolute left-0 right-0 h-[1px] bg-[#2563EB] z-20"
            style={{ top: `${cursorPos.y}px` }}
          />
        )}
      </div>
    </>
  );
};
