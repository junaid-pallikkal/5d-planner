import { ProjectDocument } from '@/types/project';
import { localDb, LocalProjectMeta } from './db';
import { TEMPLATES_LIST } from '@/constants/templates';

export class ProjectStorageService {
  /**
   * Loads a project by ID from IndexedDB or built-in templates.
   */
  static async loadProject(id: string): Promise<ProjectDocument | null> {
    // 1. Check if ID matches a template
    const templateMatch = TEMPLATES_LIST.find((t) => t.id === id);
    if (templateMatch) {
      return JSON.parse(JSON.stringify(templateMatch));
    }

    if (typeof window === 'undefined' || !localDb) {
      return null;
    }

    try {
      const record = await localDb.projectData.get(id);
      if (record && record.document) {
        return record.document;
      }
    } catch (err) {
      console.error('Failed to load project from IndexedDB:', err);
    }

    return null;
  }

  /**
   * Persists a project document to IndexedDB.
   */
  static async saveProject(document: ProjectDocument): Promise<void> {
    if (typeof window === 'undefined' || !localDb) return;

    try {
      const now = new Date().toISOString();
      const updatedDoc = {
        ...document,
        updatedAt: now,
        version: (document.version || 1) + 1,
      };

      const totalArea = updatedDoc.floors.reduce((sum, floor) => {
        const floorArea = floor.rooms.reduce((rSum, r) => rSum + (r.area || 0), 0);
        return sum + floorArea;
      }, 0);

      const meta: LocalProjectMeta = {
        id: updatedDoc.id,
        name: updatedDoc.name,
        description: updatedDoc.description,
        createdAt: updatedDoc.createdAt || now,
        updatedAt: now,
        version: updatedDoc.version,
        floorCount: updatedDoc.floors.length,
        totalArea: Math.round(totalArea * 10) / 10,
      };

      await localDb.transaction('rw', localDb.projects, localDb.projectData, async () => {
        await localDb.projects.put(meta);
        await localDb.projectData.put({
          id: updatedDoc.id,
          document: updatedDoc,
          updatedAt: now,
        });
      });
    } catch (err) {
      console.error('Failed to save project to IndexedDB:', err);
    }
  }

  /**
   * Lists all local projects sorted by recent update time.
   */
  static async listProjects(): Promise<LocalProjectMeta[]> {
    if (typeof window === 'undefined' || !localDb) return [];

    try {
      const records = await localDb.projects.toArray();
      return records.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (err) {
      console.error('Failed to list projects from IndexedDB:', err);
      return [];
    }
  }

  /**
   * Deletes a project from IndexedDB.
   */
  static async deleteProject(id: string): Promise<void> {
    if (typeof window === 'undefined' || !localDb) return;

    try {
      await localDb.transaction('rw', localDb.projects, localDb.projectData, async () => {
        await localDb.projects.delete(id);
        await localDb.projectData.delete(id);
      });
    } catch (err) {
      console.error('Failed to delete project from IndexedDB:', err);
    }
  }

  /**
   * Exports project document as downloadable JSON file.
   */
  static exportProjectJson(doc: ProjectDocument): void {
    const jsonStr = JSON.stringify(doc, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    if (typeof window !== 'undefined') {
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${doc.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.5darch`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Validates and parses imported JSON string into a ProjectDocument.
   */
  static parseProjectJson(jsonStr: string): ProjectDocument {
    const parsed = JSON.parse(jsonStr);

    if (!parsed.id || !parsed.name || !Array.isArray(parsed.floors)) {
      throw new Error('Invalid 5D Architect project file structure');
    }

    return parsed as ProjectDocument;
  }
}
