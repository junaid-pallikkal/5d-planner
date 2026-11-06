"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LocalProjectMeta } from "@/lib/storage/db";
import { ProjectStorageService } from "@/lib/storage/project-storage";
import { TEMPLATES_LIST } from "@/constants/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Layers,
  Upload,
  Download,
  Trash2,
  ExternalLink,
  Compass,
  FolderOpen,
  Search,
  LayoutTemplate,
  HardDrive,
  Copy,
  ArrowUpRight,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

export const DashboardView: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<LocalProjectMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleDuplicateProject = async (id: string, name: string) => {
    const doc = await ProjectStorageService.loadProject(id);
    if (!doc) return;

    const newId = `proj_${Date.now()}`;
    const newDoc = {
      ...doc,
      id: newId,
      name: `${name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ProjectStorageService.saveProject(newDoc);
    toast.success(`Duplicated "${name}"`);
    refreshProjects();
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

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#202124] flex flex-col select-none relative">
      <div className="absolute inset-0 cad-dots opacity-30 pointer-events-none" />

      <input
        ref={fileInputRef}
        type="file"
        accept=".5darch,.json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Sleek Light Architectural Header */}
      <header className="h-14 border-b border-[#E5E7EB] px-6 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
              5D
            </div>
            <span className="font-semibold text-xs tracking-tight text-[#202124]">
              5D ARCHITECT
            </span>
          </Link>
          <span className="text-[#6B7280]/40 text-xs">/</span>
          <span className="text-xs text-[#6B7280] font-mono">WORKSPACE</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full border border-[#E5E7EB] bg-[#F1F5F9] text-[10px] font-mono text-[#6B7280]">
            <HardDrive className="h-3 w-3 text-emerald-600" />
            <span>LOCAL INDEXEDDB</span>
          </div>

          <Link href="/settings">
            <Button
              variant="ghost"
              size="cadIcon"
              className="text-[#6B7280] hover:text-[#202124]"
              title="Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="space-x-1 text-xs border-[#E5E7EB] bg-white text-[#202124] hover:bg-[#F1F5F9]"
          >
            <Upload className="h-3 w-3 text-[#2563EB]" />
            <span>Import</span>
          </Button>

          <Button
            size="sm"
            onClick={handleCreateNewProject}
            className="space-x-1 text-xs font-medium bg-[#2563EB] text-white hover:bg-[#1d4ed8] shadow-sm"
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
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#6B7280]">
            <LayoutTemplate className="h-3.5 w-3.5 text-[#2563EB]" />
            <span>Architectural Blueprints</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEMPLATES_LIST.map((template) => (
              <div
                key={template.id}
                onClick={() => handleLaunchTemplate(template.id)}
                className="group relative flex flex-col justify-between p-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#2563EB]/60 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="space-y-2.5">
                  <div className="h-24 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center relative overflow-hidden group-hover:bg-[#EFF6FF] transition-colors">
                    <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] opacity-15 [background-size:16px_16px]" />
                    <Compass className="h-8 w-8 text-[#2563EB]/70 group-hover:text-[#2563EB] group-hover:scale-110 transition-all duration-200" />
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xs text-[#202124] tracking-tight">
                      {template.name}
                    </h3>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#6B7280] group-hover:text-[#2563EB] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>

                  <p className="text-[11px] text-[#6B7280] line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E5E7EB] text-[10px] font-mono text-[#6B7280]">
                  <span>{template.floors.length} Floor(s)</span>
                  <span>{template.floors[0]?.rooms.length || 0} Rooms</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Saved Projects Shelf */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#6B7280]">
              <FolderOpen className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>Saved Floor Plans</span>
              <span className="text-[11px] font-mono text-[#6B7280] pl-1">
                ({projects.length})
              </span>
            </div>

            {/* Project Search Box */}
            {projects.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B7280]" />
                <Input
                  placeholder="Filter floor plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8 bg-white border-[#E5E7EB] text-[#202124] focus:border-[#2563EB]"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-[#6B7280] font-mono bg-white rounded-xl border border-[#E5E7EB]">
              Loading local storage...
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[#CBD5E1] rounded-xl space-y-2.5 bg-white shadow-sm">
              <Compass className="h-8 w-8 text-[#94A3B8] mx-auto" />
              <p className="text-xs font-semibold text-[#202124]">No saved designs yet</p>
              <p className="text-[11px] text-[#6B7280] max-w-xs mx-auto">
                Create a blank canvas or launch one of the architectural templates above.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateNewProject}
                className="mt-2 text-xs border-[#E5E7EB] bg-white text-[#202124] hover:bg-[#F1F5F9]"
              >
                Create Blank Plan
              </Button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6B7280] font-mono bg-white rounded-xl border border-[#E5E7EB]">
              No plans matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="group flex flex-col justify-between p-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#2563EB]/50 hover:shadow-md transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-xs text-[#202124] truncate pr-2">
                        {proj.name}
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#6B7280] border border-[#E5E7EB]">
                        v{proj.version}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-[#6B7280] font-mono">
                      <span>{proj.floorCount} Floor(s)</span>
                      <span>·</span>
                      <span>{proj.totalArea} m² Area</span>
                    </div>

                    <div className="text-[10px] text-[#6B7280] font-mono">
                      Updated {new Date(proj.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E5E7EB]">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="cadIcon"
                        onClick={() => handleDuplicateProject(proj.id, proj.name)}
                        className="text-[#6B7280] hover:text-[#202124]"
                        title="Duplicate plan"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="cadIcon"
                        onClick={() => handleDelete(proj.id, proj.name)}
                        className="text-[#6B7280] hover:text-[#DC2626]"
                        title="Delete design"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <Link href={`/editor/${proj.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="space-x-1 text-xs border-[#E5E7EB] bg-[#F8FAFC] text-[#202124] hover:bg-[#EFF6FF] hover:border-[#2563EB]/50"
                      >
                        <span>Open Studio</span>
                        <ExternalLink className="h-3 w-3 text-[#2563EB]" />
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
