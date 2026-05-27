import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface HistoryEntry {
  description: string;
  snapshot: string; // JSON snapshot of relevant state
}

interface HistoryState {
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  maxHistory: number;

  push: (entry: HistoryEntry) => void;
  undo: () => HistoryEntry | undefined;
  redo: () => HistoryEntry | undefined;
  clear: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useHistoryStore = create<HistoryState>()(
  immer((set, get) => ({
    undoStack: [],
    redoStack: [],
    maxHistory: 50,

    push: (entry) =>
      set((s) => {
        s.undoStack.push(entry);
        if (s.undoStack.length > s.maxHistory) s.undoStack.shift();
        s.redoStack = [];
      }),

    undo: () => {
      const state = get();
      if (state.undoStack.length === 0) return undefined;
      let entry: HistoryEntry | undefined;
      set((s) => {
        entry = s.undoStack.pop()!;
        s.redoStack.push(entry!);
      });
      return entry;
    },

    redo: () => {
      const state = get();
      if (state.redoStack.length === 0) return undefined;
      let entry: HistoryEntry | undefined;
      set((s) => {
        entry = s.redoStack.pop()!;
        s.undoStack.push(entry!);
      });
      return entry;
    },

    clear: () => set((s) => { s.undoStack = []; s.redoStack = []; }),
    canUndo: () => get().undoStack.length > 0,
    canRedo: () => get().redoStack.length > 0,
  }))
);
