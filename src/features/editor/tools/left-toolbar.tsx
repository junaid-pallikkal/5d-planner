"use client";

import React, { useEffect } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  MousePointer2,
  Hand,
  PenTool,
  DoorOpen,
  AppWindow,
  Armchair,
  Palette,
  Ruler,
  Settings,
  HelpCircle,
  SunMedium,
  Home,
} from "lucide-react";
import { ToolMode } from "@/types/editor";

export const LeftToolbar: React.FC = () => {
  const tool = useEditorStore((s) => s.tool);
  const setTool = useEditorStore((s) => s.setTool);

  const activePanel = useUIStore((s) => s.activePanel);
  const togglePanel = useUIStore((s) => s.togglePanel);
  const setShortcutsModalOpen = useUIStore((s) => s.setShortcutsModalOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setTool('select');
          break;
        case 'h':
          setTool('pan');
          break;
        case 'w':
          if (e.shiftKey) {
            setTool('window');
          } else {
            setTool('wall');
          }
          break;
        case 'd':
          setTool('door');
          break;
        case 'm':
          if (e.shiftKey) {
            setTool('measure');
          } else {
            setTool('dimension');
          }
          break;
        case 'f':
          togglePanel('catalog');
          break;
        case 't':
          togglePanel('materials');
          break;
        case 'r':
          togglePanel('roof');
          break;
        case '?':
          setShortcutsModalOpen(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool, togglePanel, setShortcutsModalOpen]);

  const toolsList: { id: ToolMode; label: string; shortcut: string; icon: React.ReactNode }[] = [
    { id: 'select', label: 'Select / Move', shortcut: 'V', icon: <MousePointer2 className="h-3.5 w-3.5" /> },
    { id: 'pan', label: 'Pan Canvas', shortcut: 'H', icon: <Hand className="h-3.5 w-3.5" /> },
    { id: 'wall', label: 'Draw Wall', shortcut: 'W', icon: <PenTool className="h-3.5 w-3.5" /> },
    { id: 'door', label: 'Insert Door', shortcut: 'D', icon: <DoorOpen className="h-3.5 w-3.5" /> },
    { id: 'window', label: 'Insert Window', shortcut: 'Shift+W', icon: <AppWindow className="h-3.5 w-3.5" /> },
    { id: 'dimension', label: 'CAD Dimension', shortcut: 'M', icon: <Ruler className="h-3.5 w-3.5" /> },
    { id: 'measure', label: 'Measure', shortcut: 'Shift+M', icon: <Ruler className="h-3.5 w-3.5 rotate-45" /> },
  ];

  return (
    <aside className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center select-none pointer-events-auto">
      <div className="glass-dock p-1 rounded-xl flex flex-col space-y-1 items-center">
        {/* Drawing & editing tools */}
        {toolsList.map((item) => {
          const isActive = tool === item.id;
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "activeCad" : "ghost"}
                  size="cadIcon"
                  onClick={() => setTool(item.id)}
                  className={`relative transition-all ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {item.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-[11px] py-1 px-2">
                <span className="font-medium">{item.label}</span>
                <span className="ml-1.5 opacity-60 font-mono text-[9px]">({item.shortcut})</span>
              </TooltipContent>
            </Tooltip>
          );
        })}

        <div className="w-4 h-[1px] bg-border/60 my-0.5" />

        {/* Feature panels */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activePanel === "catalog" ? "activeCad" : "ghost"}
              size="cadIcon"
              onClick={() => togglePanel("catalog")}
              className={activePanel === "catalog" ? "text-primary" : "text-muted-foreground hover:text-foreground"}
            >
              <Armchair className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-[11px] py-1 px-2">
            <span>Furniture Catalog</span>
            <span className="ml-1.5 opacity-60 font-mono text-[9px]">(F)</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activePanel === "materials" ? "activeCad" : "ghost"}
              size="cadIcon"
              onClick={() => togglePanel("materials")}
              className={activePanel === "materials" ? "text-primary" : "text-muted-foreground hover:text-foreground"}
            >
              <Palette className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-[11px] py-1 px-2">
            <span>Materials & PBR</span>
            <span className="ml-1.5 opacity-60 font-mono text-[9px]">(T)</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activePanel === "roof" ? "activeCad" : "ghost"}
              size="cadIcon"
              onClick={() => togglePanel("roof")}
              className={activePanel === "roof" ? "text-primary" : "text-muted-foreground hover:text-foreground"}
            >
              <Home className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-[11px] py-1 px-2">
            <span>Roof Designer & Civil BIM</span>
            <span className="ml-1.5 opacity-60 font-mono text-[9px]">(R)</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activePanel === "settings" ? "activeCad" : "ghost"}
              size="cadIcon"
              onClick={() => togglePanel("settings")}
              className={activePanel === "settings" ? "text-primary" : "text-muted-foreground hover:text-foreground"}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-[11px] py-1 px-2">
            <span>Units & Grid Settings</span>
          </TooltipContent>
        </Tooltip>

        <div className="w-4 h-[1px] bg-border/60 my-0.5" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="cadIcon"
              onClick={() => setShortcutsModalOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-[11px] py-1 px-2">
            <span>Keybindings (?)</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
};
