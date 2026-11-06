"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Box,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Download,
  PenTool,
  Ruler,
  Eye,
  CheckCircle2,
  Cpu,
  Maximize2,
} from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 relative overflow-hidden">
      {/* Background Architectural Grid & Subtle Radial Glow */}
      <div className="absolute inset-0 cad-dots opacity-40 pointer-events-none" />
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Floating Minimal Navbar */}
      <header className="h-16 border-b border-border/40 px-6 max-w-7xl w-full mx-auto flex items-center justify-between relative z-20 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="h-7 w-7 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
            5D
          </div>
          <span className="font-semibold tracking-tight text-sm">
            5D ARCHITECT
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-muted-foreground/60 pl-2 border-l border-border/40">
            v1.0.0 CAD/BIM
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-xs">
              Dashboard
            </Button>
          </Link>
          <Link href="/editor/template_villa">
            <Button variant="default" size="sm" className="text-xs space-x-1.5 shadow-sm">
              <span>Launch Studio</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pt-16 pb-24 space-y-20 relative z-10">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Micro Status Pill */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-border/60 bg-muted/30 backdrop-blur-md text-[11px] font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>LOCAL-FIRST · 100% FREE · ZERO SUBSCRIPTIONS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            Architectural CAD. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-400">
              Parametric 3D BIM.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A minimal, production-grade architectural workspace. Draft sub-millimeter 2D floor plans,
            visualize synchronized 3D spaces with real sunlight studies, and export industry-standard
            AutoCAD DXF and PDF sheets.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/editor/template_villa">
              <Button size="lg" className="h-10 px-6 space-x-2 text-xs font-semibold shadow-md">
                <Compass className="h-4 w-4" />
                <span>Open Design Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button variant="cad" size="lg" className="h-10 px-5 text-xs">
                Explore Blueprints
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Interactive Blueprint Mockup Visual */}
        <div className="relative rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-2 sm:p-4 shadow-2xl shadow-black/30 overflow-hidden">
          <div className="flex items-center justify-between pb-3 px-3 border-b border-border/50 text-[11px] font-mono text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <span className="pl-2">minimalist_villa.5darch</span>
            </div>
            <div className="flex items-center space-x-3">
              <span>SCALE 1:100</span>
              <span className="text-emerald-500">● LIVE 3D SYNC</span>
            </div>
          </div>

          {/* Graphical Architectural Visual Preview */}
          <div className="relative h-64 sm:h-96 rounded-xl bg-[#090d16] flex items-center justify-center overflow-hidden border border-white/[0.04]">
            {/* Architectural Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Stylized CAD Plan Wireframe */}
            <svg
              className="w-full max-w-lg h-56 text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              viewBox="0 0 400 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer boundary wall */}
              <rect x="40" y="30" width="320" height="180" stroke="rgba(255,255,255,0.9)" strokeWidth="6" />
              
              {/* Interior partitions */}
              <line x1="220" y1="30" x2="220" y2="140" stroke="rgba(255,255,255,0.7)" strokeWidth="4" />
              <line x1="220" y1="140" x2="360" y2="140" stroke="rgba(255,255,255,0.7)" strokeWidth="4" />

              {/* Room fills with soft glows */}
              <rect x="43" y="33" width="174" height="174" fill="rgba(59, 130, 246, 0.08)" />
              <rect x="223" y="33" width="134" height="104" fill="rgba(16, 185, 129, 0.08)" />
              <rect x="223" y="143" width="134" height="64" fill="rgba(6, 182, 212, 0.08)" />

              {/* Door Arcs */}
              <path d="M 40 100 A 30 30 0 0 1 70 130" stroke="#f97316" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="40" y1="130" x2="70" y2="130" stroke="#f97316" strokeWidth="2" />

              <path d="M 220 70 A 25 25 0 0 1 245 95" stroke="#f97316" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="220" y1="95" x2="245" y2="95" stroke="#f97316" strokeWidth="2" />

              {/* Glazing Window Double Lines */}
              <line x1="100" y1="210" x2="160" y2="210" stroke="#38bdf8" strokeWidth="4" />
              <line x1="260" y1="30" x2="320" y2="30" stroke="#38bdf8" strokeWidth="4" />

              {/* Dimension string annotation */}
              <line x1="40" y1="225" x2="360" y2="225" stroke="#f59e0b" strokeWidth="1" />
              <line x1="40" y1="220" x2="40" y2="230" stroke="#f59e0b" strokeWidth="1" />
              <line x1="360" y1="220" x2="360" y2="230" stroke="#f59e0b" strokeWidth="1" />
              <text x="200" y="222" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                8.00 m
              </text>

              {/* Labels */}
              <text x="130" y="115" fill="rgba(255,255,255,0.9)" fontSize="11" fontWeight="600" textAnchor="middle">
                Great Living Room
              </text>
              <text x="130" y="130" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="monospace" textAnchor="middle">
                35.0 m²
              </text>

              <text x="290" y="80" fill="rgba(255,255,255,0.9)" fontSize="11" fontWeight="600" textAnchor="middle">
                Master Suite
              </text>
              <text x="290" y="95" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="monospace" textAnchor="middle">
                12.0 m²
              </text>

              <text x="290" y="172" fill="rgba(255,255,255,0.9)" fontSize="10" fontWeight="600" textAnchor="middle">
                Bath
              </text>
            </svg>

            {/* Floating 3D Badge */}
            <div className="absolute bottom-4 right-4 glass-panel px-3 py-1.5 rounded-lg flex items-center space-x-2 text-xs font-mono">
              <Box className="h-3.5 w-3.5 text-primary" />
              <span>Three.js WebGL Active</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm space-y-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <PenTool className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              Precision 2D CAD
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Konva.js infinite canvas with magnetic snapping, automatic room cycle detection,
              and dimension lines.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm space-y-2.5">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
              <Box className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              Real-Time 3D BIM
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Parametric Three.js walls with door cutouts, PBR textures, furniture models,
              and first-person walkthroughs.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm space-y-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Download className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              Universal Export
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Download AutoCAD DXF layers, landscape PDF blueprint sheets with schedules,
              and 3D GLTF / GLB models.
            </p>
          </div>
        </div>

        {/* Minimal Metrics Bar */}
        <div className="border-t border-b border-border/60 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center font-mono">
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">&lt; 1ms</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">2D/3D SYNC</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">100%</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">OFFLINE READY</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">0</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">PAYWALLS</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">5+</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">CAD EXPORTS</div>
          </div>
        </div>
      </main>

      {/* Sleek Minimal Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-[11px] text-muted-foreground font-mono">
        5D ARCHITECT · MINIMAL ARCHITECTURAL CAD & BIM PLATFORM
      </footer>
    </div>
  );
}
