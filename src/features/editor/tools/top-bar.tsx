"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useProjectStore } from "@/stores/project-store";
import { useEditorStore } from "@/stores/editor-store";
import { useHistoryStore } from "@/stores/history-store";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Undo2,
  Redo2,
  Download,
  Upload,
  Layers,
  LayoutGrid,
  Box,
  Columns,
  Plus,
  FileText,
  FileCode,
  Image as ImageIcon,
  Sparkles,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { ProjectStorageService } from "@/lib/storage/project-storage";
import { DxfExporter } from "@/lib/export/dxf-exporter";
import { SvgExporter } from "@/lib/export/svg-exporter";
import { PdfExporter } from "@/lib/export/pdf-exporter";
import { toast } from "sonner";

export const TopBar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const project = useProjectStore((s) => s.project);
  const isSaving = useProjectStore((s) => s.isSaving);
  const activeFloor = useProjectStore((s) => s.getCurrentFloor());
  const setActiveFloorId = useProjectStore((s) => s.setActiveFloorId);
  const addFloor = useProjectStore((s) => s.addFloor);
  const updateMetadata = useProjectStore((s) => s.updateMetadata);
  const setProject = useProjectStore((s) => s.setProject);

  const viewMode = useEditorStore((s) => s.viewMode);
  const setViewMode = useEditorStore((s) => s.setViewMode);

  const canUndo = useHistoryStore((s) => s.canUndo);
  const canRedo = useHistoryStore((s) => s.canRedo);
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);

  const togglePanel = useUIStore((s) => s.togglePanel);

  const handleUndo = () => {
    const prev = undo(project);
    if (prev) {
      setProject(prev, false);
      toast.info("Undone");
    }
  };

  const handleRedo = () => {
    const next = redo(project);
    if (next) {
      setProject(next, false);
      toast.info("Redone");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = ProjectStorageService.parseProjectJson(text);
        setProject(imported, true);
        toast.success(`Project "${imported.name}" loaded`);
      } catch (err) {
        toast.error("Invalid project file format");
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="h-12 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-xl px-3 flex items-center justify-between z-30 select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept=".5darch,.json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Left: Brand & Inline Name */}
      <div className="flex items-center space-x-2.5">
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 text-foreground hover:opacity-80 transition-opacity"
          title="Back to Dashboard"
        >
          <div className="h-6 w-6 rounded bg-[#16A34A] text-white flex items-center justify-center font-bold text-[11px] tracking-wider shadow-sm">
            5D
          </div>
        </Link>

        <span className="text-[#6B7280]/40 text-xs">/</span>

        {/* Project Name Input */}
        <input
          value={project.name}
          onChange={(e) => updateMetadata(e.target.value)}
          className="bg-transparent font-medium text-xs text-[#202124] hover:bg-[#F1F5F9] focus:bg-[#F1F5F9] px-1.5 py-0.5 rounded transition-colors border border-transparent focus:border-[#E5E7EB] outline-none max-w-[160px] sm:max-w-[220px] truncate"
          title="Rename project"
        />

        {/* Minimalist Autosave Micro-Dot */}
        <div className="flex items-center space-x-1 pl-1" title={isSaving ? "Saving changes..." : "All changes saved locally"}>
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              isSaving ? "bg-amber-400 animate-pulse" : "bg-emerald-500"
            }`}
          />
        </div>
      </div>

      {/* Center: Minimalist Segmented View Mode & Floor Selector */}
      <div className="flex items-center space-x-1.5">
        {/* Floor Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 space-x-1 text-xs font-mono font-normal text-muted-foreground hover:text-foreground">
              <Layers className="h-3 w-3 text-primary" />
              <span>{activeFloor?.name || "Ground Floor"}</span>
              <ChevronDown className="h-2.5 w-2.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-44">
            <DropdownMenuLabel className="text-[10px] uppercase font-mono">Floor Levels</DropdownMenuLabel>
            {project.floors.map((floor) => (
              <DropdownMenuItem
                key={floor.id}
                onClick={() => setActiveFloorId(floor.id)}
                className="flex items-center justify-between text-xs"
              >
                <span>{floor.name}</span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  +{floor.elevation}m
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                const nextElev = project.floors.length * 2.8;
                addFloor(`Level ${project.floors.length}`, nextElev);
                toast.success(`Level ${project.floors.length} created`);
              }}
              className="text-primary text-xs space-x-1.5"
            >
              <Plus className="h-3 w-3" />
              <span>Add Level</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-border/80 h-3 w-[1px] mx-0.5" />

        {/* View Mode Segmented Controls */}
        <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E5E7EB]">
          <Button
            variant={viewMode === "2d" ? "activeCad" : "ghost"}
            size="sm"
            onClick={() => setViewMode("2d")}
            className="h-6 px-2 text-[11px]"
          >
            <LayoutGrid className="h-3 w-3 mr-1" />
            <span>2D</span>
          </Button>

          <Button
            variant={viewMode === "split" ? "activeCad" : "ghost"}
            size="sm"
            onClick={() => setViewMode("split")}
            className="h-6 px-2 text-[11px]"
          >
            <Columns className="h-3 w-3 mr-1" />
            <span>Split</span>
          </Button>

          <Button
            variant={viewMode === "3d" ? "activeCad" : "ghost"}
            size="sm"
            onClick={() => setViewMode("3d")}
            className="h-6 px-2 text-[11px]"
          >
            <Box className="h-3 w-3 mr-1" />
            <span>3D</span>
          </Button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-1">
        {/* Undo / Redo */}
        <Button
          variant="ghost"
          size="cadIcon"
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="cadIcon"
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </Button>

        <span className="text-border/80 h-3 w-[1px] mx-0.5" />

        {/* AI Copilot */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => togglePanel("ai")}
          className="h-7 px-2 text-xs text-primary space-x-1 hover:bg-primary/10"
        >
          <Sparkles className="h-3 w-3" />
          <span className="hidden md:inline font-mono text-[11px]">AI</span>
        </Button>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="cad" size="sm" className="h-7 px-2.5 space-x-1 text-xs">
              <Download className="h-3 w-3" />
              <span>Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-[10px] uppercase font-mono">Export Format</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                PdfExporter.exportFloorPlanPdf(project);
                toast.success("PDF Blueprint generated");
              }}
              className="space-x-2 text-xs"
            >
              <FileText className="h-3.5 w-3.5 text-rose-500" />
              <span>PDF Blueprint (A4 1:100)</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                DxfExporter.downloadDxf(project);
                toast.success("AutoCAD DXF generated");
              }}
              className="space-x-2 text-xs"
            >
              <FileCode className="h-3.5 w-3.5 text-amber-500" />
              <span>AutoCAD DXF</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                SvgExporter.downloadSvg(project);
                toast.success("SVG floor plan generated");
              }}
              className="space-x-2 text-xs"
            >
              <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
              <span>Vector SVG Plan</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                ProjectStorageService.exportProjectJson(project);
                toast.success("Project JSON exported");
              }}
              className="space-x-2 text-xs"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span>5D Project Backup (.5darch)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="cadIcon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </header>
  );
};
