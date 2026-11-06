"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LocalProjectMeta } from "@/lib/storage/db";
import { ProjectStorageService } from "@/lib/storage/project-storage";
import { TEMPLATES_LIST } from "@/constants/templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Layers,
  Upload,
  Download,
  Trash2,
  ExternalLink,
  Compass,
  FolderOpen,
  Clock,
  LayoutTemplate,
  HardDrive,
  Sun,
  Moon,
  ArrowUpRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export const DashboardView: React.FC = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<LocalProjectMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProjects = async () => {
    setLoading(true);
    const list = await ProjectStorageService.listProjects();
    setProjects(list);
    setLoading(false);
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const handleCreateNewProject = async () => {
    const newId = `proj_${Date.now()}`;
    const emptyDoc = {
      ...TEMPLATES_LIST[2],
      id: newId,
      name: `Untitled Plan ${projects.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ProjectStorageService.saveProject(emptyDoc);
    toast.success("New architectural plan created");
    router.push(`/editor/${newId}`);
  };

  const handleLaunchTemplate = async (templateId: string) => {
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

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const imported = ProjectStorageService.parseProjectJson(text);
        const importedId = `proj_${Date.now()}`;
        const finalDoc = { ...imported, id: importedId };

        await ProjectStorageService.saveProject(finalDoc);
        toast.success(`Project "${finalDoc.name}" imported`);
        router.push(`/editor/${importedId}`);
      } catch (err) {
        toast.error("Failed to import. Check project file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete project "${name}"?`)) {
      await ProjectStorageService.deleteProject(id);
      toast.info(`Deleted "${name}"`);
      refreshProjects();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col select-none relative">
      <div className="absolute inset-0 cad-dots opacity-30 pointer-events-none" />

      <input
        ref={fileInputRef}
        type="file"
        accept=".5darch,.json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Sleek Minimal Header */}
      <header className="h-14 border-b border-border/50 px-6 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-[11px] tracking-wider">
              5D
            </div>
            <span className="font-semibold text-xs tracking-tight">
              5D ARCHITECT
            </span>
          </Link>
          <span className="text-muted-foreground/40 text-xs">/</span>
          <span className="text-xs text-muted-foreground font-mono">WORKSPACE</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full border border-border/60 bg-muted/30 text-[10px] font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>LOCAL INDEXEDDB</span>
          </div>

          <Button
            variant="ghost"
            size="cadIcon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>

          <Button
            variant="cad"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="space-x-1 text-xs"
          >
            <Upload className="h-3 w-3" />
            <span>Import</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleCreateNewProject}
            className="space-x-1 text-xs font-medium shadow-sm"
          >
            <Plus className="h-3 w-3" />
            <span>New Plan</span>
          </Button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-10 relative z-10">
        {/* Starter Blueprints */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <LayoutTemplate className="h-3.5 w-3.5 text-primary" />
            <span>Architectural Blueprints</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEMPLATES_LIST.map((template) => (
              <div
                key={template.id}
                onClick={() => handleLaunchTemplate(template.id)}
                className="group relative flex flex-col justify-between p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm hover:border-primary/50 hover:bg-card transition-all cursor-pointer shadow-sm"
              >
                <div className="space-y-2.5">
                  <div className="h-24 rounded-lg bg-[#090d16] border border-white/[0.04] flex items-center justify-center relative overflow-hidden group-hover:border-primary/30 transition-colors">
                    <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] opacity-20 [background-size:16px_16px]" />
                    <Compass className="h-8 w-8 text-primary/60 group-hover:text-primary transition-colors" />
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xs text-foreground tracking-tight">
                      {template.name}
                    </h3>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
                  <span>{template.floors.length} Floor(s)</span>
                  <span>{template.floors[0]?.rooms.length || 0} Rooms</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Saved Projects Shelf */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <FolderOpen className="h-3.5 w-3.5 text-primary" />
              <span>Saved Floor Plans</span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              {projects.length} design(s)
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground font-mono">
              Loading local storage...
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border/60 rounded-xl space-y-2.5 bg-card/20">
              <Compass className="h-8 w-8 text-muted-foreground/30 mx-auto" />
              <p className="text-xs font-medium text-foreground">No saved designs yet</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Create a blank canvas or launch one of the architectural templates above.
              </p>
              <Button
                variant="cad"
                size="sm"
                onClick={handleCreateNewProject}
                className="mt-2 text-xs"
              >
                Create Blank Plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="group flex flex-col justify-between p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm hover:border-border transition-all shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-xs text-foreground truncate pr-2">
                        {proj.name}
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                        v{proj.version}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-muted-foreground font-mono">
                      <span>{proj.floorCount} Floor(s)</span>
                      <span>·</span>
                      <span>{proj.totalArea} m² Area</span>
                    </div>

                    <div className="text-[10px] text-muted-foreground/60 font-mono">
                      Updated {new Date(proj.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40">
                    <Button
                      variant="ghost"
                      size="cadIcon"
                      onClick={() => handleDelete(proj.id, proj.name)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete design"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>

                    <Link href={`/editor/${proj.id}`}>
                      <Button variant="cad" size="sm" className="space-x-1 text-xs">
                        <span>Open Studio</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
