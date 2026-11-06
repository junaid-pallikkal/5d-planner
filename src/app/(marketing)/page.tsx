"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  HardDrive,
  FileCode,
} from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#202124] flex flex-col selection:bg-[#16A34A]/20 selection:text-[#16A34A] relative overflow-hidden">
      {/* Background Architectural Grid & Subtle Radial Glow */}
      <div className="absolute inset-0 cad-dots opacity-40 pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#16A34A]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Floating Minimal Navbar */}
      <header className="h-16 border-b border-[#E5E7EB] px-6 max-w-7xl w-full mx-auto flex items-center justify-between relative z-20 bg-white/90 backdrop-blur-md sticky top-0 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-7 w-7 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
            5D
          </div>
          <span className="font-semibold tracking-tight text-xs text-[#202124]">
            5D ARCHITECT
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-[#6B7280] pl-2 border-l border-[#E5E7EB]">
            v1.0.0 CAD/BIM
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/templates">
            <Button variant="ghost" size="sm" className="text-xs text-[#6B7280] hover:text-[#202124]">
              Blueprints
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-xs text-[#6B7280] hover:text-[#202124]">
              Dashboard
            </Button>
          </Link>
          <Link href="/editor/template_villa">
            <Button size="sm" className="text-xs space-x-1.5 bg-[#16A34A] text-white hover:bg-[#15803D] shadow-sm">
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
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-[#E5E7EB] bg-white text-[11px] font-mono text-[#6B7280] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>LOCAL-FIRST · 100% FREE · ZERO SUBSCRIPTIONS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#202124] leading-[1.1]">
            Architectural CAD. <br />
            <span className="text-[#16A34A]">
              Parametric 3D BIM.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#6B7280] max-w-xl mx-auto leading-relaxed">
            A minimal, production-grade architectural design studio. Draft precision 2D floor plans,
            visualize real-time synchronized 3D spaces with solar studies, and export professional
            AutoCAD DXF and PDF blueprint sheets.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/editor/template_villa">
              <Button size="lg" className="h-10 px-6 space-x-2 text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] shadow-md">
                <Compass className="h-4 w-4" />
                <span>Open Design Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="h-10 px-5 text-xs border-[#E5E7EB] bg-white text-[#202124] hover:bg-[#F1F5F9] shadow-sm">
                Explore Blueprints
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Interactive Blueprint Mockup Visual */}
        <div className="relative rounded-2xl border border-[#E5E7EB] bg-white p-3 sm:p-5 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between pb-3 px-2 border-b border-[#E5E7EB] text-[11px] font-mono text-[#6B7280]">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="pl-2 font-medium text-[#202124]">minimalist_modern_villa.5darch</span>
            </div>
            <div className="flex items-center space-x-3 text-[10px]">
              <span>SCALE 1:100</span>
              <span className="text-emerald-600 font-semibold">● LIVE 3D SYNC</span>
            </div>
          </div>

          {/* Architectural Drawing Canvas Visual */}
          <div className="relative h-64 sm:h-96 rounded-xl bg-[#F8FAFC] flex items-center justify-center overflow-hidden border border-[#E2E8F0]">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#E9EDF3_1px,transparent_1px),linear-gradient(to_bottom,#E9EDF3_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Stylized CAD Plan Wireframe */}
            <svg
              className="w-full max-w-lg h-56 text-[#16A34A]"
              viewBox="0 0 400 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer boundary wall */}
              <rect x="40" y="30" width="320" height="180" stroke="#1E293B" strokeWidth="6" rx="1" />
              
              {/* Interior partitions */}
              <line x1="220" y1="30" x2="220" y2="140" stroke="#334155" strokeWidth="4" />
              <line x1="220" y1="140" x2="360" y2="140" stroke="#334155" strokeWidth="4" />

              {/* Room fills with subtle architectural tints */}
              <rect x="43" y="33" width="174" height="174" fill="rgba(22, 163, 74, 0.08)" />
              <rect x="223" y="33" width="134" height="104" fill="rgba(16, 185, 129, 0.06)" />
              <rect x="223" y="143" width="134" height="64" fill="rgba(5, 150, 105, 0.06)" />

              {/* Door Arcs */}
              <path d="M 40 100 A 30 30 0 0 1 70 130" stroke="#D97706" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="40" y1="130" x2="70" y2="130" stroke="#B45309" strokeWidth="2" />

              <path d="M 220 70 A 25 25 0 0 1 245 95" stroke="#D97706" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="220" y1="95" x2="245" y2="95" stroke="#B45309" strokeWidth="2" />

              {/* Glazing Window Double Lines */}
              <line x1="100" y1="210" x2="160" y2="210" stroke="#16A34A" strokeWidth="4" />
              <line x1="260" y1="30" x2="320" y2="30" stroke="#16A34A" strokeWidth="4" />

              {/* Dimension string annotation */}
              <line x1="40" y1="225" x2="360" y2="225" stroke="#D97706" strokeWidth="1" />
              <line x1="40" y1="220" x2="40" y2="230" stroke="#D97706" strokeWidth="1" />
              <line x1="360" y1="220" x2="360" y2="230" stroke="#D97706" strokeWidth="1" />
              <text x="200" y="222" fill="#B45309" fontSize="9" fontFamily="monospace" fontWeight="600" textAnchor="middle">
                8.00 m
              </text>

              {/* Labels */}
              <text x="130" y="115" fill="#202124" fontSize="11" fontWeight="600" textAnchor="middle">
                Great Living Room
              </text>
              <text x="130" y="130" fill="#6B7280" fontSize="9" fontFamily="monospace" textAnchor="middle">
                35.0 m²
              </text>

              <text x="290" y="80" fill="#202124" fontSize="11" fontWeight="600" textAnchor="middle">
                Master Suite
              </text>
              <text x="290" y="95" fill="#6B7280" fontSize="9" fontFamily="monospace" textAnchor="middle">
                12.0 m²
              </text>

              <text x="290" y="172" fill="#202124" fontSize="10" fontWeight="600" textAnchor="middle">
                Ensuite Bath
              </text>
            </svg>

            {/* Floating 3D Badge */}
            <div className="absolute bottom-4 right-4 bg-white/95 border border-[#E5E7EB] px-3 py-1.5 rounded-lg flex items-center space-x-2 text-xs font-mono shadow-sm">
              <Box className="h-3.5 w-3.5 text-[#16A34A]" />
              <span className="text-[#202124] font-medium">Three.js WebGL BIM Active</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-xl border border-[#E5E7EB] bg-white shadow-sm space-y-2.5">
            <div className="h-9 w-9 rounded-lg bg-[#F0FDF4] flex items-center justify-center text-[#16A34A]">
              <PenTool className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-[#202124]">
              Precision 2D CAD
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Konva.js infinite canvas with magnetic snapping, automatic room cycle detection,
              real-time dimension strings, and drag-and-drop fixtures.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[#E5E7EB] bg-white shadow-sm space-y-2.5">
            <div className="h-9 w-9 rounded-lg bg-[#F0FDF4] flex items-center justify-center text-[#16A34A]">
              <Box className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-[#202124]">
              Real-Time 3D BIM
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Parametric Three.js walls with door and window cutouts, PBR textures, furniture models,
              first-person walkthroughs, and solar heliodon studies.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[#E5E7EB] bg-white shadow-sm space-y-2.5">
            <div className="h-9 w-9 rounded-lg bg-[#F0FDF4] flex items-center justify-center text-emerald-600">
              <Download className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-[#202124]">
              Universal Export
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Download AutoCAD DXF layers, print-ready PDF blueprint sheets with dimension schedules,
              clean vector SVG plans, and 3D GLTF / GLB models.
            </p>
          </div>
        </div>

        {/* Minimal Metrics Bar */}
        <div className="border-t border-b border-[#E5E7EB] py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center font-mono bg-white rounded-xl shadow-sm">
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#202124]">&lt; 1ms</div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">2D/3D SYNC</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#202124]">100%</div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">LOCAL PERSISTENCE</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#202124]">0</div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">SUBSCRIPTION FEES</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#202124]">5+</div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">CAD EXPORTS</div>
          </div>
        </div>
      </main>

      {/* Sleek Minimal Footer */}
      <footer className="border-t border-[#E5E7EB] py-6 text-center text-[11px] text-[#6B7280] font-mono bg-white">
        5D ARCHITECT · PROFESSIONAL ARCHITECTURAL CAD & BIM PLATFORM · LOCAL-FIRST
      </footer>
    </div>
  );
}
