"use client";

import React from "react";
import { useUIStore } from "@/stores/ui-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const ShortcutsModal: React.FC = () => {
  const open = useUIStore((s) => s.shortcutsModalOpen);
  const setOpen = useUIStore((s) => s.setShortcutsModalOpen);

  const shortcuts = [
    { key: "V", desc: "Select / Move tool" },
    { key: "H", desc: "Pan canvas" },
    { key: "W", desc: "Draw wall (Click to start, click to end, ESC to cancel)" },
    { key: "Shift + W", desc: "Insert Window" },
    { key: "D", desc: "Insert Door" },
    { key: "M", desc: "Add CAD Dimension line" },
    { key: "Shift + M", desc: "Measure distance & angles" },
    { key: "F", desc: "Toggle Furniture Catalog" },
    { key: "T", desc: "Toggle Materials Palette" },
    { key: "R", desc: "Toggle Roof Designer & Civil BIM" },
    { key: "Ctrl + Z", desc: "Undo last architectural modification" },
    { key: "Ctrl + Y", desc: "Redo modification" },
    { key: "Space + Drag", desc: "Pan 2D canvas with hand cursor" },
    { key: "Scroll Wheel", desc: "Smooth zoom centered at mouse pointer" },
    { key: "Middle Click", desc: "Drag to pan 2D canvas" },
    { key: "ESC", desc: "Cancel active drafting / clear selection" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Architectural CAD Keybindings & Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-none"
            >
              <span className="text-muted-foreground">{sc.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-muted font-mono font-bold text-[11px] border border-border">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
