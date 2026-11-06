"use client";

import React from "react";
import { useProjectStore } from "@/stores/project-store";
import { UnitType } from "@/types/project";
import { Settings, Sun, Grid, Magnet } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SettingsPanel: React.FC = () => {
  const project = useProjectStore((s) => s.project);
  const updateSettings = useProjectStore((s) => s.updateSettings);
  const settings = project.settings;

  return (
    <div className="p-3 flex flex-col h-full space-y-4 select-none overflow-y-auto">
      <div className="flex items-center space-x-1.5 pb-2 border-b border-border/40">
        <Settings className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          CAD Project Settings
        </span>
      </div>

      {/* Units */}
      <div>
        <label className="text-[9px] text-muted-foreground uppercase font-mono">Measurement Unit</label>
        <select
          value={settings.unit}
          onChange={(e) => updateSettings({ unit: e.target.value as UnitType })}
          className="w-full mt-1 h-7 rounded-md border border-border/40 bg-muted/20 px-2 text-xs font-medium text-foreground"
        >
          <option value="metric_m">Metric (Meters - m)</option>
          <option value="metric_mm">Metric (Millimeters - mm)</option>
          <option value="imperial_ft_in">Imperial (Feet & Inches - ft-in)</option>
        </select>
      </div>

      {/* Grid Settings */}
      <div className="space-y-2 border-t border-border/40 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-medium">
            <Grid className="h-3 w-3 text-primary" />
            <span>Grid Display & Snap</span>
          </div>
          <input
            type="checkbox"
            checked={settings.gridSnap}
            onChange={(e) => updateSettings({ gridSnap: e.target.checked })}
            className="h-3.5 w-3.5 accent-primary cursor-pointer"
          />
        </div>

        <div>
          <label className="text-[9px] text-muted-foreground font-mono">Grid Spacing</label>
          <select
            value={settings.gridSize}
            onChange={(e) => updateSettings({ gridSize: parseFloat(e.target.value) })}
            className="w-full mt-1 h-7 rounded border border-border/40 bg-muted/20 px-2 text-xs text-foreground"
          >
            <option value="0.1">0.10 m (10 cm)</option>
            <option value="0.25">0.25 m (25 cm)</option>
            <option value="0.5">0.50 m (50 cm CAD Standard)</option>
            <option value="1.0">1.00 m (1 meter)</option>
          </select>
        </div>
      </div>

      {/* Angle Snapping */}
      <div className="space-y-2 border-t border-border/40 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Angle Constraint</span>
          <input
            type="checkbox"
            checked={settings.angleSnap}
            onChange={(e) => updateSettings({ angleSnap: e.target.checked })}
            className="h-3.5 w-3.5 accent-primary cursor-pointer"
          />
        </div>

        <div>
          <label className="text-[9px] text-muted-foreground font-mono">Angle Increments</label>
          <select
            value={settings.angleSnapIncrement}
            onChange={(e) => updateSettings({ angleSnapIncrement: parseInt(e.target.value) })}
            className="w-full mt-1 h-7 rounded border border-border/40 bg-muted/20 px-2 text-xs text-foreground"
          >
            <option value="15">15° (Fine Ortho)</option>
            <option value="45">45° (Standard Architectural)</option>
            <option value="90">90° (Strict Orthogonal)</option>
          </select>
        </div>
      </div>

      {/* Sun / Heliodon Study */}
      <div className="space-y-2 border-t border-border/40 pt-3">
        <div className="flex items-center space-x-1.5 text-xs font-medium">
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          <span>Solar Heliodon</span>
        </div>

        <div>
          <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
            <span>Azimuth</span>
            <span>{settings.sunAzimuth}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={settings.sunAzimuth}
            onChange={(e) => updateSettings({ sunAzimuth: parseInt(e.target.value) })}
            className="w-full accent-amber-500 mt-1 h-1.5"
          />
        </div>

        <div>
          <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
            <span>Altitude</span>
            <span>{settings.sunAltitude}°</span>
          </div>
          <input
            type="range"
            min="10"
            max="85"
            value={settings.sunAltitude}
            onChange={(e) => updateSettings({ sunAltitude: parseInt(e.target.value) })}
            className="w-full accent-amber-500 mt-1 h-1.5"
          />
        </div>
      </div>
    </div>
  );
};
