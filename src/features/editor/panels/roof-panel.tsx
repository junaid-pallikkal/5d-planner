"use client";

import React, { useMemo } from "react";
import { useProjectStore } from "@/stores/project-store";
import { useSelectionStore } from "@/stores/selection-store";
import { RoofType, RoofData } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Home,
  Sun,
  Layers,
  Droplets,
  CloudSnow,
  Wind,
  Sparkles,
  Trash2,
  Check,
  Zap,
  ShieldCheck,
  Compass,
  Ban,
} from "lucide-react";
import { toast } from "sonner";

interface RoofPreset {
  id: RoofType;
  title: string;
  desc: string;
  pitch: number;
  overhang: number;
  thickness: number;
  parapet: number;
  color: string;
  hasSolar: boolean;
  hasTrusses: boolean;
  iconBg: string;
}

const ROOF_PRESETS: RoofPreset[] = [
  {
    id: "none",
    title: "No Roof (Open-Air)",
    desc: "Uncovered open layout for courtyards, terraces & unobstructed 3D interior drafting",
    pitch: 0,
    overhang: 0,
    thickness: 0,
    parapet: 0,
    color: "#94a3b8",
    hasSolar: false,
    hasTrusses: false,
    iconBg: "bg-slate-100 text-slate-500",
  },
  {
    id: "gable",
    title: "Alpine Gable",
    desc: "Dual pitch triangular trusses, high snow/rain shedding",
    pitch: 32,
    overhang: 0.5,
    thickness: 0.25,
    parapet: 0,
    color: "#c2410c",
    hasSolar: false,
    hasTrusses: true,
    iconBg: "bg-orange-50 text-orange-600",
  },
  {
    id: "hip",
    title: "Mediterranean Hip",
    desc: "4-sided aerodynamic slope, high wind resistance",
    pitch: 25,
    overhang: 0.5,
    thickness: 0.25,
    parapet: 0,
    color: "#1e293b",
    hasSolar: false,
    hasTrusses: false,
    iconBg: "bg-slate-100 text-slate-700",
  },
  {
    id: "flat",
    title: "Modern Flat & Parapet",
    desc: "Structural reinforced slab, parapet walls & drainage",
    pitch: 1.5,
    overhang: 0.2,
    thickness: 0.28,
    parapet: 0.6,
    color: "#64748b",
    hasSolar: true,
    hasTrusses: false,
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    id: "shed",
    title: "Solar Skillion / Shed",
    desc: "Mono-pitch orientation for max solar PV yield",
    pitch: 14,
    overhang: 0.4,
    thickness: 0.22,
    parapet: 0,
    color: "#334155",
    hasSolar: true,
    hasTrusses: false,
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "green",
    title: "Eco Living Sedum",
    desc: "Substrate vegetation, storm retention & thermal barrier",
    pitch: 1.5,
    overhang: 0.2,
    thickness: 0.35,
    parapet: 0.5,
    color: "#15803d",
    hasSolar: false,
    hasTrusses: false,
    iconBg: "bg-green-50 text-green-700",
  },
  {
    id: "mansard",
    title: "French Mansard",
    desc: "Dual pitch curb profile maximizing attic living volume",
    pitch: 55,
    overhang: 0.4,
    thickness: 0.25,
    parapet: 0,
    color: "#475569",
    hasSolar: false,
    hasTrusses: false,
    iconBg: "bg-purple-50 text-purple-600",
  },
  {
    id: "gambrel",
    title: "Dutch Gambrel",
    desc: "Symmetrical dual-angle barn aesthetic with ridge rafters",
    pitch: 50,
    overhang: 0.45,
    thickness: 0.25,
    parapet: 0,
    color: "#78350f",
    hasSolar: false,
    hasTrusses: false,
    iconBg: "bg-amber-50 text-amber-700",
  },
  {
    id: "vaulted",
    title: "Barrel Arch Vault",
    desc: "Compressive structural vault for contemporary pavilions",
    pitch: 22,
    overhang: 0.3,
    thickness: 0.22,
    parapet: 0,
    color: "#0d9488",
    hasSolar: false,
    hasTrusses: false,
    iconBg: "bg-teal-50 text-teal-600",
  },
];

const ROOF_MATERIALS = [
  { id: "mat_terracotta", name: "Terracotta Clay S-Tiles", color: "#c2410c" },
  { id: "mat_standing_seam", name: "Anthracite Zinc Metal", color: "#334155" },
  { id: "mat_slate_shingles", name: "Slate Charcoal Shingles", color: "#1e293b" },
  { id: "mat_white_cool", name: "Reflective Cool Roof", color: "#f1f5f9" },
  { id: "mat_concrete_deck", name: "Reinforced Concrete Deck", color: "#64748b" },
  { id: "mat_green_sedum", name: "Living Sedum Eco-Garden", color: "#15803d" },
  { id: "mat_patina_copper", name: "Weathered Copper Patina", color: "#0d9488" },
];

export const RoofPanel: React.FC = () => {
  const activeFloor = useProjectStore((s) => s.getCurrentFloor());
  const generateAutoRoof = useProjectStore((s) => s.generateAutoRoof);
  const updateRoof = useProjectStore((s) => s.updateRoof);
  const deleteRoof = useProjectStore((s) => s.deleteRoof);
  const primaryId = useSelectionStore((s) => s.primaryId);
  const select = useSelectionStore((s) => s.select);

  // Active roof on current floor
  const roofs = activeFloor?.roofs || [];
  const activeRoof: RoofData | undefined =
    roofs.find((r) => r.id === primaryId && r.type !== "none") ||
    roofs.find((r) => r.type !== "none");
  const hasNoRoof = !activeRoof || activeRoof.type === "none";

  // Civil Engineering Calculations
  const metrics = useMemo(() => {
    if (!activeRoof || !activeRoof.polygon || activeRoof.polygon.length < 3) {
      return {
        footprintArea: 0,
        slopedArea: 0,
        runoffFlow: 0,
        annualSolarYield: 0,
        slopeRatio: "Flat (0:12)",
        snowClass: "Standard",
        windRating: "Moderate",
      };
    }

    // Bounding footprint
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    activeRoof.polygon.forEach((p) => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });

    const w = Math.max(1, maxX - minX);
    const d = Math.max(1, maxY - minY);
    const footprintArea = w * d;

    const rad = (activeRoof.pitch * Math.PI) / 180;
    const cosP = Math.max(0.2, Math.cos(rad));
    const slopedArea = activeRoof.type === "flat" ? footprintArea : footprintArea / cosP;

    // Rational Equation for Stormwater Drainage Runoff: Q = C * I * A / 360 (m3/s) => in Liters/sec
    // C: Runoff coefficient (metal/tile: 0.90, flat concrete: 0.85, green roof: 0.35)
    const C = activeRoof.type === "green" ? 0.35 : activeRoof.type === "flat" ? 0.82 : 0.92;
    const I = 50; // 50 mm/hr design storm intensity
    const runoffFlow = (0.278 * C * I * (footprintArea / 10000) * 1000).toFixed(1); // L/s

    // Solar PV Yield: ~150W/m2 peak * 4 peak sun hours * 365 days * performance factor 0.75
    const pvArea = activeRoof.hasSolarPanels ? slopedArea * (activeRoof.solarDensity || 0.6) * 0.5 : 0;
    const annualSolarYield = Math.round(pvArea * 150 * 4 * 365 * 0.75 / 1000); // kWh/year

    // Civil engineering slope ratio (X:12 pitch)
    const inchesRise = Math.round(Math.tan(rad) * 12);
    const slopeRatio = activeRoof.type === "flat" ? "1.5% Drainage Slope" : `${inchesRise}:12 (${activeRoof.pitch.toFixed(0)}°)`;

    const snowClass =
      activeRoof.pitch > 30 ? "Self-Shedding (Low Load)" : activeRoof.pitch < 10 ? "High Retention (Full Load)" : "Moderate Shedding";

    const windRating =
      activeRoof.type === "hip" ? "Superior Aerodynamic (ASCE 7 Category IV)" :
      activeRoof.type === "flat" ? "High Uplift at Parapet" : "Standard Dual-Pitch";

    return {
      footprintArea: Math.round(footprintArea),
      slopedArea: Math.round(slopedArea),
      runoffFlow,
      annualSolarYield,
      slopeRatio,
      snowClass,
      windRating,
    };
  }, [activeRoof]);

  const handleApplyPreset = (preset: RoofPreset) => {
    if (preset.id === "none") {
      generateAutoRoof("none");
      toast.info("Removed roof (Open-air mode active)");
      return;
    }

    generateAutoRoof(preset.id, {
      pitch: preset.pitch,
      overhang: preset.overhang,
      thickness: preset.thickness,
      parapetHeight: preset.parapet,
      color: preset.color,
      hasSolarPanels: preset.hasSolar,
      showTrusses: preset.hasTrusses,
      trussType: preset.hasTrusses ? "king_post" : "none",
    });
    toast.success(`Generated ${preset.title} Roof`);
  };

  const handleUpdate = (updates: Partial<RoofData>) => {
    if (!activeRoof) return;
    updateRoof(activeRoof.id, updates);
  };

  const handleDelete = () => {
    if (!activeRoof) return;
    deleteRoof(activeRoof.id);
    toast.info("Roof removed from floor");
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#E5E7EB] space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-[#16A34A] text-white flex items-center justify-center">
              <Home className="h-3.5 w-3.5" />
            </div>
            <h2 className="font-semibold text-xs text-[#202124] tracking-tight">
              ROOF DESIGNER & BIM
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {hasNoRoof ? (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                OPEN-AIR
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApplyPreset(ROOF_PRESETS[0])}
                className="h-5 px-1.5 text-[10px] text-slate-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1"
                title="Remove roof and set to Open-Air"
              >
                <Ban className="h-3 w-3" />
                <span>No Roof</span>
              </Button>
            )}
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              CIVIL BIM
            </span>
          </div>
        </div>
        <p className="text-[11px] text-[#6B7280]">
          Parametric civil engineering roof modeling, structural trusses & stormwater calculation.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Architectural Presets Grid */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-semibold flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-[#16A34A]" />
            <span>Civil Roof Presets</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {ROOF_PRESETS.map((p) => {
              const isCurrent = p.id === "none" ? hasNoRoof : (!hasNoRoof && activeRoof?.type === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p)}
                  className={`p-2.5 rounded-lg border text-left transition-all relative ${
                    isCurrent
                      ? "border-[#16A34A] bg-emerald-50/40 shadow-sm ring-1 ring-[#16A34A]/20"
                      : "border-[#E5E7EB] bg-white hover:border-[#16A34A]/50 hover:bg-[#F8FAFC]"
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[9px]">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}
                  <div className="font-semibold text-xs text-[#202124] tracking-tight flex items-center gap-1.5">
                    {p.id === "none" && <Ban className="h-3 w-3 text-slate-500" />}
                    <span>{p.title}</span>
                  </div>
                  <div className="text-[10px] text-[#6B7280] line-clamp-2 mt-0.5 leading-snug">
                    {p.desc}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-[#6B7280]">
                    <span>{p.id === "none" ? "Elevation: Open" : `Pitch: ${p.pitch}°`}</span>
                    {p.id === "none" ? (
                      <span className="text-[9px] font-medium text-slate-400">Open-Air</span>
                    ) : (
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 inline-block shadow-xs"
                        style={{ backgroundColor: p.color }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* When No Roof is active */}
        {hasNoRoof && (
          <div className="p-4 rounded-xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] text-center space-y-2.5">
            <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 mx-auto flex items-center justify-center">
              <Ban className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#202124]">
                Open-Air Story Active (No Roof)
              </div>
              <p className="text-[11px] text-[#6B7280] max-w-[260px] mx-auto mt-0.5 leading-relaxed">
                This floor level has no structural roof, allowing open-air courtyards, terraces, and unobstructed 3D top-down interior inspection.
              </p>
            </div>
            <div className="pt-1 flex justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApplyPreset(ROOF_PRESETS.find((p) => p.id === "flat")!)}
                className="h-7 text-xs border-[#16A34A]/30 text-[#16A34A] hover:bg-emerald-50"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Add Modern Flat
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApplyPreset(ROOF_PRESETS.find((p) => p.id === "gable")!)}
                className="h-7 text-xs border-[#16A34A]/30 text-[#16A34A] hover:bg-emerald-50"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Add Alpine Gable
              </Button>
            </div>
          </div>
        )}

        {/* Parametric Engineering Sliders (when roof exists) */}
        {!hasNoRoof && activeRoof && (
          <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#202124]">
                Parametric Controls
              </span>
              <span className="text-[10px] font-mono text-[#6B7280]">
                {activeRoof.type.toUpperCase()}
              </span>
            </div>

            {/* Pitch Angle Slider */}
            {activeRoof.type !== "flat" && activeRoof.type !== "green" && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#6B7280]">Roof Pitch Angle</span>
                  <span className="font-mono font-semibold text-[#202124]">
                    {activeRoof.pitch.toFixed(0)}° ({metrics.slopeRatio})
                  </span>
                </div>
                <Slider
                  value={[activeRoof.pitch]}
                  min={5}
                  max={60}
                  step={1}
                  onValueChange={([val]) => handleUpdate({ pitch: val })}
                />
              </div>
            )}

            {/* Eaves Overhang */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#6B7280]">Eaves Overhang</span>
                <span className="font-mono font-semibold text-[#202124]">
                  {(activeRoof.overhang * 1000).toFixed(0)} mm
                </span>
              </div>
              <Slider
                value={[activeRoof.overhang * 1000]}
                min={0}
                max={1200}
                step={50}
                onValueChange={([val]) => handleUpdate({ overhang: val / 1000 })}
              />
            </div>

            {/* Structural Slab / Rafter Thickness */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#6B7280]">Structural Thickness</span>
                <span className="font-mono font-semibold text-[#202124]">
                  {(activeRoof.thickness * 1000).toFixed(0)} mm
                </span>
              </div>
              <Slider
                value={[activeRoof.thickness * 1000]}
                min={150}
                max={450}
                step={10}
                onValueChange={([val]) => handleUpdate({ thickness: val / 1000 })}
              />
            </div>

            {/* Parapet Wall Height (for flat/green roofs) */}
            {(activeRoof.type === "flat" || activeRoof.type === "green") && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#6B7280]">Parapet Wall Height</span>
                  <span className="font-mono font-semibold text-[#202124]">
                    {((activeRoof.parapetHeight || 0.5) * 1000).toFixed(0)} mm
                  </span>
                </div>
                <Slider
                  value={[(activeRoof.parapetHeight || 0.5) * 1000]}
                  min={0}
                  max={1200}
                  step={50}
                  onValueChange={([val]) => handleUpdate({ parapetHeight: val / 1000 })}
                />
              </div>
            )}

            {/* Ridge Orientation Toggle (for Gable) */}
            {activeRoof.type === "gable" && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#6B7280]">Ridge Direction</span>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant={activeRoof.ridgeOrientation !== "transverse" ? "default" : "outline"}
                    className={`h-6 text-[10px] px-2 ${
                      activeRoof.ridgeOrientation !== "transverse" ? "bg-[#16A34A] text-white" : ""
                    }`}
                    onClick={() => handleUpdate({ ridgeOrientation: "longitudinal" })}
                  >
                    Longitudinal (X)
                  </Button>
                  <Button
                    size="sm"
                    variant={activeRoof.ridgeOrientation === "transverse" ? "default" : "outline"}
                    className={`h-6 text-[10px] px-2 ${
                      activeRoof.ridgeOrientation === "transverse" ? "bg-[#16A34A] text-white" : ""
                    }`}
                    onClick={() => handleUpdate({ ridgeOrientation: "transverse" })}
                  >
                    Transverse (Z)
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Civil Engineering Structural Systems */}
        {activeRoof && (
          <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-white space-y-3">
            <span className="text-xs font-semibold text-[#202124] flex items-center space-x-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" />
              <span>Civil & Structural Features</span>
            </span>

            {/* Solar PV Panels Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-[#202124] flex items-center space-x-1">
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  <span>Solar PV Panel Array</span>
                </div>
                <div className="text-[10px] text-[#6B7280]">
                  Rooftop photovoltaic solar cell generation
                </div>
              </div>
              <Switch
                checked={activeRoof.hasSolarPanels ?? false}
                onCheckedChange={(checked) => handleUpdate({ hasSolarPanels: checked })}
              />
            </div>

            {/* King Post Trusses Toggle */}
            {activeRoof.type === "gable" && (
              <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-[#202124] flex items-center space-x-1">
                    <Layers className="h-3.5 w-3.5 text-orange-600" />
                    <span>Timber King Post Trusses</span>
                  </div>
                  <div className="text-[10px] text-[#6B7280]">
                    Structural triangular load-bearing framing
                  </div>
                </div>
                <Switch
                  checked={activeRoof.showTrusses ?? false}
                  onCheckedChange={(checked) =>
                    handleUpdate({
                      showTrusses: checked,
                      trussType: checked ? "king_post" : "none",
                    })
                  }
                />
              </div>
            )}

            {/* Rainwater Gutters */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-[#202124] flex items-center space-x-1">
                  <Droplets className="h-3.5 w-3.5 text-blue-500" />
                  <span>Rainwater Eaves Gutters</span>
                </div>
                <div className="text-[10px] text-[#6B7280]">
                  Drainage gutters along perimeter eaves
                </div>
              </div>
              <Switch
                checked={activeRoof.hasGutters ?? true}
                onCheckedChange={(checked) => handleUpdate({ hasGutters: checked })}
              />
            </div>
          </div>
        )}

        {/* Materials Swatches */}
        {activeRoof && (
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-semibold">
              Roof Finish & Cladding
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {ROOF_MATERIALS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleUpdate({ color: m.color, materialId: m.id })}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                    activeRoof.color === m.color
                      ? "border-[#16A34A] bg-emerald-50/30 text-[#202124] font-medium"
                      : "border-[#E5E7EB] hover:bg-[#F8FAFC] text-[#6B7280]"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-xs"
                      style={{ backgroundColor: m.color }}
                    />
                    <span>{m.name}</span>
                  </div>
                  {activeRoof.color === m.color && (
                    <Check className="h-3.5 w-3.5 text-[#16A34A]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Civil Engineering Performance Metrics Card */}
        {activeRoof && (
          <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-white space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-[#202124]">
              <span className="flex items-center space-x-1.5">
                <Compass className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>Civil Engineering Analytics</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                IBC/Eurocode
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
              <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB]">
                <div className="text-[9px] text-[#6B7280]">PLAN AREA</div>
                <div className="text-xs font-bold text-[#202124] mt-0.5">
                  {metrics.footprintArea} m²
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB]">
                <div className="text-[9px] text-[#6B7280]">SLOPED CLAD AREA</div>
                <div className="text-xs font-bold text-[#202124] mt-0.5">
                  {metrics.slopedArea} m²
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB]">
                <div className="text-[9px] text-[#6B7280] flex items-center space-x-1">
                  <Droplets className="h-2.5 w-2.5 text-blue-500" />
                  <span>STORM RUNOFF (Q)</span>
                </div>
                <div className="text-xs font-bold text-[#202124] mt-0.5">
                  {metrics.runoffFlow} L/s
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB]">
                <div className="text-[9px] text-[#6B7280] flex items-center space-x-1">
                  <Zap className="h-2.5 w-2.5 text-amber-500" />
                  <span>ANNUAL SOLAR</span>
                </div>
                <div className="text-xs font-bold text-[#202124] mt-0.5">
                  {metrics.annualSolarYield > 0 ? `${metrics.annualSolarYield} kWh` : "None"}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5E7EB] space-y-1 text-[10px] text-[#6B7280]">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <CloudSnow className="h-3 w-3 text-sky-500" />
                  <span>Snow Load Behavior:</span>
                </span>
                <span className="font-semibold text-[#202124]">{metrics.snowClass}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Wind className="h-3 w-3 text-teal-600" />
                  <span>Aerodynamic Wind Class:</span>
                </span>
                <span className="font-semibold text-[#202124]">{metrics.windRating}</span>
              </div>
            </div>
          </div>
        )}

        {/* Delete Roof Button */}
        {activeRoof && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="w-full text-xs text-[#DC2626] border-[#DC2626]/20 hover:bg-[#DC2626]/5 hover:border-[#DC2626]"
          >
            <Trash2 className="h-3 w-3 mr-1.5" />
            <span>Remove Roof from Floor</span>
          </Button>
        )}
      </div>
    </div>
  );
};
