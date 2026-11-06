"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, HardDrive, Palette, CheckCircle } from "lucide-react";
import { useTheme } from "next-themes";

export default function GlobalSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#202124] flex flex-col select-none relative">
      <div className="absolute inset-0 cad-dots opacity-30 pointer-events-none" />

      <header className="h-14 border-b border-[#E5E7EB] px-6 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="space-x-1.5 text-xs text-[#6B7280] hover:text-[#202124]">
              <ArrowLeft className="h-3 w-3" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <span className="text-[#6B7280]/40 text-xs">/</span>
          <span className="text-xs font-mono text-[#6B7280]">SETTINGS</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-8 space-y-6 relative z-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#202124]">Studio Preferences</h1>
          <p className="text-xs text-[#6B7280]">
            Manage your design system aesthetic and local-first persistence engine.
          </p>
        </div>

        {/* Theme Settings */}
        <div className="p-5 rounded-xl border border-[#E5E7EB] bg-white shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <Palette className="h-4 w-4 text-[#16A34A]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Appearance Theme</h2>
          </div>
          <p className="text-xs text-[#6B7280]">
            5D Architect provides a clean architectural light drafting aesthetic optimized for precision CAD drawing and high-contrast viewing.
          </p>
          <div className="flex space-x-2 pt-1">
            <Button
              variant="default"
              size="sm"
              className="bg-[#16A34A] text-white hover:bg-[#15803D]"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Architectural Light
            </Button>
          </div>
        </div>

        {/* Local Storage & Privacy */}
        <div className="p-5 rounded-xl border border-[#E5E7EB] bg-white shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <HardDrive className="h-4 w-4 text-emerald-600" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Offline Local Storage</h2>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            All floor plans, parametric models, custom textures, and architectural project data are
            stored directly inside your browser via IndexedDB (Dexie.js). 100% private, offline-first, and persistent.
          </p>
          <div className="flex items-center space-x-2 pt-1">
            <Badge variant="status">IndexedDB Active</Badge>
            <Badge variant="minimal">Zero Cloud Dependencies</Badge>
          </div>
        </div>
      </main>
    </div>
  );
}
