"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, HardDrive, Palette } from "lucide-react";
import { useTheme } from "next-themes";

export default function GlobalSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col select-none relative">
      <div className="absolute inset-0 cad-dots opacity-30 pointer-events-none" />

      <header className="h-14 border-b border-border/50 px-6 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="space-x-1.5 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3 w-3" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <span className="text-muted-foreground/30 text-xs">/</span>
          <span className="text-xs font-mono text-muted-foreground">SETTINGS</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-8 space-y-6 relative z-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Studio Preferences</h1>
          <p className="text-xs text-muted-foreground">
            Manage your design system aesthetic and local-first persistence engine.
          </p>
        </div>

        {/* Theme Settings */}
        <div className="p-5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-3">
          <div className="flex items-center space-x-2">
            <Palette className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appearance Theme</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Toggle between obsidian dark studio, minimal blueprint light mode, or match system settings.
          </p>
          <div className="flex space-x-2 pt-1">
            <Button
              variant={theme === "dark" ? "activeCad" : "ghost"}
              size="sm"
              onClick={() => setTheme("dark")}
            >
              Obsidian Dark
            </Button>
            <Button
              variant={theme === "light" ? "activeCad" : "ghost"}
              size="sm"
              onClick={() => setTheme("light")}
            >
              Blueprint Light
            </Button>
            <Button
              variant={theme === "system" ? "activeCad" : "ghost"}
              size="sm"
              onClick={() => setTheme("system")}
            >
              System Default
            </Button>
          </div>
        </div>

        {/* Local Storage & Privacy */}
        <div className="p-5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-3">
          <div className="flex items-center space-x-2">
            <HardDrive className="h-4 w-4 text-emerald-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Offline Local Storage</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All floor plans, parametric models, custom textures, and architectural project data are
            stored directly inside your browser via IndexedDB (Dexie.js). 100% private and persistent.
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
