import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { GameConfig } from '@tactical-forge/shared';
import { generateId } from '@tactical-forge/shared';

const STORAGE_KEY = 'tf-project';

const defaultProject: GameConfig = {
  id: generateId(),
  name: 'Untitled Game',
  version: '0.1.0',
  tileSize: 32,
  resolution: { width: 800, height: 600 },
  viewMode: 'top-down',
  combatMode: 'turn-based',
  scenes: [],
  assets: { sprites: {}, audio: {}, tilesets: {} },
  globalBlueprints: [],
  ui: { hud: [], menus: [] },
};

function loadFromStorage(): GameConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { ...defaultProject };
  } catch { return { ...defaultProject }; }
}

function saveToStorage(project: GameConfig) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(project)); } catch {}
}

interface ProjectState {
  project: GameConfig;
  dirty: boolean;

  updateProject: (updates: Partial<GameConfig>) => void;
  setDirty: (dirty: boolean) => void;
  newProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  immer((set) => ({
    project: loadFromStorage(),
    dirty: false,

    updateProject: (updates) =>
      set((s) => {
        Object.assign(s.project, updates);
        s.dirty = true;
        saveToStorage(s.project);
      }),
    setDirty: (dirty) => set((s) => { s.dirty = dirty; }),
    newProject: () =>
      set((s) => {
        s.project = { ...defaultProject, id: generateId() };
        s.dirty = false;
        saveToStorage(s.project);
      }),
  }))
);
