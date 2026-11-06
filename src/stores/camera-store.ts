import { create } from 'zustand';
import { CameraState } from '@/types/project';
import { Point3D } from '@/types/geometry';

interface CameraStoreState {
  mode: CameraState['mode'];
  position: Point3D;
  target: Point3D;
  fov: number;
  isFirstPerson: boolean;

  setMode: (mode: CameraState['mode']) => void;
  setPosition: (pos: Point3D) => void;
  setTarget: (target: Point3D) => void;
  setFov: (fov: number) => void;
  resetCamera: () => void;
}

export const useCameraStore = create<CameraStoreState>((set) => ({
  mode: 'orbit',
  position: { x: 10, y: 12, z: 12 },
  target: { x: 4, y: 0, z: 3.5 },
  fov: 45,
  isFirstPerson: false,

  setMode: (mode) =>
    set({
      mode,
      isFirstPerson: mode === 'first_person',
    }),

  setPosition: (position) => set({ position }),
  setTarget: (target) => set({ target }),
  setFov: (fov) => set({ fov }),

  resetCamera: () =>
    set({
      mode: 'orbit',
      position: { x: 10, y: 12, z: 12 },
      target: { x: 4, y: 0, z: 3.5 },
      fov: 45,
      isFirstPerson: false,
    }),
}));
