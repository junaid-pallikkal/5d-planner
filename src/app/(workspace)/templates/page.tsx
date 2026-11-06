"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEMPLATES_LIST } from "@/constants/templates";
import { ProjectStorageService } from "@/lib/storage/project-storage";
import { Button } from "@/components/ui/button";
import { Compass, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function TemplatesPage() {
  const router = useRouter();

  const handleLaunch = async (templateId: string) => {
    const template = TEMPLATES_LIST.find((t) => t.id === templateId);
    if (!template) return;

    const newId = `proj_${Date.now()}`;
    const newDoc = {
      ...template,
      id: newId,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ProjectStorageService.saveProject(newDoc);
    toast.success(`Created project from ${template.name}`);
    router.push(`/editor/${newId}`);
  };

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
          <span className="text-xs font-mono text-muted-foreground">BLUEPRINTS</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8 relative z-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Architectural Starter Blueprints</h1>
          <p className="text-xs text-muted-foreground">
            Explore ready-to-draft floor plan layouts or launch a blank parametric grid.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {TEMPLATES_LIST.map((template) => (
            <div
              key={template.id}
              className="group flex flex-col justify-between p-5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm hover:border-primary/50 hover:bg-card transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="h-28 rounded-lg bg-[#090d16] border border-white/[0.04] flex items-center justify-center relative overflow-hidden group-hover:border-primary/30 transition-colors">
                  <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] opacity-20 [background-size:16px_16px]" />
                  <Compass className="h-8 w-8 text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-sm text-foreground tracking-tight">{template.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {template.description}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>
                  {template.floors[0]?.walls.length || 0} Walls · {template.floors[0]?.rooms.length || 0} Rooms
                </span>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleLaunch(template.id)}
                  className="text-xs space-x-1 h-7"
                >
                  <span>Use Plan</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
