import Dexie, { type Table } from 'dexie';
import { ProjectDocument } from '@/types/project';

export interface LocalProjectMeta {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  floorCount: number;
  totalArea: number;
}

export interface LocalProjectRecord {
  id: string;
  document: ProjectDocument;
  updatedAt: string;
}

export interface LocalAssetRecord {
  id: string;
  name: string;
  category: string;
  dimensions: { width: number; depth: number; height: number };
  modelUrl?: string;
  previewSvg?: string;
}

export class ArchitectDatabase extends Dexie {
  projects!: Table<LocalProjectMeta, string>;
  projectData!: Table<LocalProjectRecord, string>;
  assets!: Table<LocalAssetRecord, string>;

  constructor() {
    super('FiveDArchitectDB');
    this.version(1).stores({
      projects: 'id, name, updatedAt, createdAt',
      projectData: 'id, updatedAt',
      assets: 'id, category, name',
    });
  }
}

// Client-side singleton instance
export const localDb = typeof window !== 'undefined' ? new ArchitectDatabase() : null!;
