import { create } from 'zustand';
import { CameraState } from '@/types/project';
import { Point3D } from '@/types/geometry';

interface CameraStoreState {
  mode: CameraState['mode'];
  position: Point3D;
  target: Point3D;
  fov: number;
  isFirstPerson: boolean;
  focusTrigger: { target: Point3D; position?: Point3D; id: number } | null;

  setMode: (mode: CameraState['mode']) => void;
  setPosition: (pos: Point3D) => void;
  setTarget: (target: Point3D) => void;
  setFov: (fov: number) => void;
  setFocusPoint: (target: Point3D, position?: Point3D) => void;
  resetCamera: (customTarget?: Point3D) => void;
}

export const useCameraStore = create<CameraStoreState>((set) => ({
  mode: 'orbit',
  position: { x: 12, y: 12, z: 12 },
  target: { x: 4, y: 0.5, z: 3.5 },
  fov: 45,
  isFirstPerson: false,
  focusTrigger: null,

  setMode: (mode) =>
    set({
      mode,
      isFirstPerson: mode === 'first_person',
    }),

  setPosition: (position) => set({ position }),
  setTarget: (target) => set({ target }),
  setFov: (fov) => set({ fov }),

  setFocusPoint: (target, position) =>
    set((state) => ({
      target,
      position: position || state.position,
      focusTrigger: { target, position, id: Date.now() },
    })),

  resetCamera: (customTarget) =>
    set({
      mode: 'orbit',
      position: { x: 12, y: 12, z: 12 },
      target: customTarget || { x: 4, y: 0.5, z: 3.5 },
      fov: 45,
      isFirstPerson: false,
      focusTrigger: {
        target: customTarget || { x: 4, y: 0.5, z: 3.5 },
        position: { x: 12, y: 12, z: 12 },
        id: Date.now(),
      },
    }),
}));
