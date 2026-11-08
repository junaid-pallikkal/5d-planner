"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { TopBar } from "./tools/top-bar";
import { LeftToolbar } from "./tools/left-toolbar";
import { CatalogPanel } from "./panels/catalog-panel";
import { PropertiesPanel } from "./panels/properties-panel";
import { MaterialsPanel } from "./panels/materials-panel";
import { RoofPanel } from "./panels/roof-panel";
import { FloorsPanel } from "./panels/floors-panel";
import { SettingsPanel } from "./panels/settings-panel";
import { AIAssistantPanel } from "./panels/ai-assistant-panel";
import { ShortcutsModal } from "./panels/shortcuts-modal";
import { useEditorStore } from "@/stores/editor-store";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import { ProjectStorageService } from "@/lib/storage/project-storage";
import { Loader2 } from "lucide-react";
import { CADErrorBoundary } from "@/components/error-boundary";

// Dynamic imports with SSR disabled for browser-only 2D & 3D canvases
const CanvasStage = dynamic(
  () => import("./canvas-2d/canvas-stage").then((mod) => mod.CanvasStage),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#F7F8FA] text-muted-foreground text-xs font-mono space-y-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>Loading 2D Architectural Engine...</span>
      </div>
    ),
  }
);

const SceneCanvas = dynamic(
  () => import("./scene-3d/scene-canvas").then((mod) => mod.SceneCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#F1F5F9] text-muted-foreground text-xs font-mono space-y-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>Initializing 3D WebGL BIM Environment...</span>
      </div>
    ),
  }
);

interface EditorWorkspaceProps {
  projectId?: string;
}

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({ projectId }) => {
  const viewMode = useEditorStore((s) => s.viewMode);
  const activePanel = useUIStore((s) => s.activePanel);
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen);
  const setProject = useProjectStore((s) => s.setProject);

  // Load project by ID on mount
  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      const doc = await ProjectStorageService.loadProject(projectId);
      if (doc) {
        setProject(doc, false);
      }
    };
    load();
  }, [projectId, setProject]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* CAD Top Navigation & Command Bar */}
      <TopBar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left CAD Tool Palette */}
        <LeftToolbar />

        {/* Center Main Workspace (2D / 3D / Split View) */}
        <main className="flex-1 flex overflow-hidden relative">
          {/* 2D Canvas */}
          {(viewMode === "2d" || viewMode === "split") && (
            <div
              className={`h-full relative overflow-hidden ${
                viewMode === "split" ? "w-1/2 border-r border-border/80" : "w-full"
              }`}
            >
              <CADErrorBoundary fallbackTitle="2D CAD Engine">
                <CanvasStage />
              </CADErrorBoundary>
            </div>
          )}

          {/* 3D Scene */}
          {(viewMode === "3d" || viewMode === "split") && (
            <div
              className={`h-full relative overflow-hidden ${
                viewMode === "split" ? "w-1/2" : "w-full"
              }`}
            >
              <CADErrorBoundary fallbackTitle="3D WebGL BIM Environment">
                <SceneCanvas />
              </CADErrorBoundary>
            </div>
          )}
        </main>

        {/* Right Architectural Property & Studio Panels */}
        {rightSidebarOpen && activePanel && (
          <aside className="w-80 border-l border-[#E5E7EB] bg-white/95 backdrop-blur-xl flex flex-col z-20 shadow-lg overflow-hidden transition-all">
            {activePanel === "catalog" && <CatalogPanel />}
            {activePanel === "properties" && <PropertiesPanel />}
            {activePanel === "materials" && <MaterialsPanel />}
            {activePanel === "roof" && <RoofPanel />}
            {activePanel === "floors" && <FloorsPanel />}
            {activePanel === "settings" && <SettingsPanel />}
            {activePanel === "ai" && <AIAssistantPanel />}
          </aside>
        )}
      </div>

      {/* Global Shortcuts Modal */}
      <ShortcutsModal />
    </div>
  );
};
