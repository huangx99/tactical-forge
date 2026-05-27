import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Scene, GameObject } from '@tactical-forge/shared';
import { generateId } from '@tactical-forge/shared';

const STORAGE_KEY = 'tf-scenes';

function loadScenesFromStorage(): { scenes: Scene[]; activeSceneId: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const scenes: Scene[] = raw ? JSON.parse(raw) : [];
    return { scenes, activeSceneId: scenes[0]?.id ?? null };
  } catch { return { scenes: [], activeSceneId: null }; }
}

function saveToStorage(scenes: Scene[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes)); } catch {}
}

interface SceneState {
  scenes: Scene[];
  activeSceneId: string | null;

  getActiveScene: () => Scene | undefined;
  addScene: (name: string) => string;
  removeScene: (id: string) => void;
  setActiveScene: (id: string) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  addObject: (sceneId: string, obj: Omit<GameObject, 'id'>) => string;
  removeObject: (sceneId: string, objectId: string) => void;
  updateObject: (sceneId: string, objectId: string, updates: Partial<GameObject>) => void;
}

const initialState = loadScenesFromStorage();

export const useSceneStore = create<SceneState>()(
  immer((set, get) => ({
    scenes: initialState.scenes,
    activeSceneId: initialState.activeSceneId,

    getActiveScene: () => {
      const { scenes, activeSceneId } = get();
      return scenes.find((s) => s.id === activeSceneId);
    },

    addScene: (name) => {
      const id = generateId();
      set((s) => {
        s.scenes.push({
          id,
          name,
          layers: [
            { id: generateId(), type: 'tilemap', tiles: [], tilesetId: '' },
            { id: generateId(), type: 'object', objects: [] },
          ],
          triggers: [],
          camera: {},
        });
        if (!s.activeSceneId) s.activeSceneId = id;
        saveToStorage(s.scenes);
      });
      return id;
    },

    removeScene: (id) =>
      set((s) => {
        s.scenes = s.scenes.filter((sc) => sc.id !== id);
        if (s.activeSceneId === id) s.activeSceneId = s.scenes[0]?.id ?? null;
        saveToStorage(s.scenes);
      }),

    setActiveScene: (id) => set((s) => { s.activeSceneId = id; }),

    updateScene: (id, updates) =>
      set((s) => {
        const scene = s.scenes.find((sc) => sc.id === id);
        if (scene) Object.assign(scene, updates);
        saveToStorage(s.scenes);
      }),

    addObject: (sceneId, obj) => {
      const id = generateId();
      set((s) => {
        const scene = s.scenes.find((sc) => sc.id === sceneId);
        if (!scene) return;
        const layer = scene.layers.find((l) => l.type === 'object');
        if (layer && layer.type === 'object') {
          layer.objects.push({ ...obj, id });
        }
        saveToStorage(s.scenes);
      });
      return id;
    },

    removeObject: (sceneId, objectId) =>
      set((s) => {
        const scene = s.scenes.find((sc) => sc.id === sceneId);
        if (!scene) return;
        for (const layer of scene.layers) {
          if (layer.type === 'object') {
            layer.objects = layer.objects.filter((o) => o.id !== objectId);
          }
        }
        saveToStorage(s.scenes);
      }),

    updateObject: (sceneId, objectId, updates) =>
      set((s) => {
        const scene = s.scenes.find((sc) => sc.id === sceneId);
        if (!scene) return;
        for (const layer of scene.layers) {
          if (layer.type === 'object') {
            const obj = layer.objects.find((o) => o.id === objectId);
            if (obj) Object.assign(obj, updates);
          }
        }
        saveToStorage(s.scenes);
      }),
  }))
);
