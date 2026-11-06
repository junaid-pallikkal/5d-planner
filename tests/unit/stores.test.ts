import { describe, it, expect, beforeEach } from 'vitest';
import { useHistoryStore } from '@/stores/history-store';
import { TEMPLATE_MINIMALIST_VILLA } from '@/constants/templates';
import { ProjectDocument } from '@/types/project';

describe('History and Project State', () => {
  beforeEach(() => {
    useHistoryStore.getState().clearHistory();
  });

  it('records history snapshots and supports undo and redo', () => {
    const history = useHistoryStore.getState();
    const doc1 = { ...TEMPLATE_MINIMALIST_VILLA, name: 'Version 1' };
    const doc2 = { ...TEMPLATE_MINIMALIST_VILLA, name: 'Version 2' };

    history.pushSnapshot(doc1);
    expect(useHistoryStore.getState().canUndo).toBe(true);
    expect(useHistoryStore.getState().canRedo).toBe(false);

    // Undo returns doc1
    const undone = useHistoryStore.getState().undo(doc2);
    expect(undone?.name).toBe('Version 1');
    expect(useHistoryStore.getState().canRedo).toBe(true);

    // Redo returns doc2
    const redone = useHistoryStore.getState().redo(doc1);
    expect(redone?.name).toBe('Version 2');
  });
});
