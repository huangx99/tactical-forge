import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Blueprint, BlueprintNode, BlueprintEdge } from '@tactical-forge/shared';
import { generateId } from '@tactical-forge/shared';

const STORAGE_KEY = 'tf-blueprints';

function loadFromStorage(): Blueprint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToStorage(blueprints: Blueprint[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(blueprints)); } catch {}
}

interface BlueprintState {
  blueprints: Blueprint[];
  activeBlueprintId: string | null;

  getActiveBlueprint: () => Blueprint | undefined;
  createBlueprint: (name: string) => string;
  deleteBlueprint: (id: string) => void;
  setActiveBlueprint: (id: string) => void;
  updateBlueprint: (id: string, updates: Partial<Blueprint>) => void;
  setNodes: (blueprintId: string, nodes: BlueprintNode[]) => void;
  setEdges: (blueprintId: string, edges: BlueprintEdge[]) => void;
  addNode: (blueprintId: string, node: BlueprintNode) => void;
  removeNode: (blueprintId: string, nodeId: string) => void;
  updateNodeData: (blueprintId: string, nodeId: string, data: Record<string, unknown>) => void;
  importBlueprint: (json: string) => string | null;
  exportBlueprint: (id: string) => string | null;
  loadBlueprints: (bps: Blueprint[]) => void;
}

export const useBlueprintStore = create<BlueprintState>()(
  immer((set, get) => ({
    blueprints: loadFromStorage(),
    activeBlueprintId: null,

    getActiveBlueprint: () => {
      const { blueprints, activeBlueprintId } = get();
      return blueprints.find((b) => b.id === activeBlueprintId);
    },

    createBlueprint: (name) => {
      const id = generateId();
      set((s) => {
        s.blueprints.push({ id, name, nodes: [], edges: [] });
        if (!s.activeBlueprintId) s.activeBlueprintId = id;
        saveToStorage(s.blueprints);
      });
      return id;
    },

    deleteBlueprint: (id) =>
      set((s) => {
        s.blueprints = s.blueprints.filter((b) => b.id !== id);
        if (s.activeBlueprintId === id) s.activeBlueprintId = s.blueprints[0]?.id ?? null;
        saveToStorage(s.blueprints);
      }),

    setActiveBlueprint: (id) => set((s) => { s.activeBlueprintId = id; }),

    updateBlueprint: (id, updates) =>
      set((s) => {
        const bp = s.blueprints.find((b) => b.id === id);
        if (bp) Object.assign(bp, updates);
        saveToStorage(s.blueprints);
      }),

    setNodes: (blueprintId, nodes) =>
      set((s) => {
        const bp = s.blueprints.find((b) => b.id === blueprintId);
        if (bp) bp.nodes = nodes;
        saveToStorage(s.blueprints);
      }),

    setEdges: (blueprintId, edges) =>
      set((s) => {
        const bp = s.blueprints.find((b) => b.id === blueprintId);
        if (bp) bp.edges = edges;
        saveToStorage(s.blueprints);
      }),

    addNode: (blueprintId, node) =>
      set((s) => {
        const bp = s.blueprints.find((b) => b.id === blueprintId);
        if (bp) bp.nodes.push(node);
        saveToStorage(s.blueprints);
      }),

    removeNode: (blueprintId, nodeId) =>
      set((s) => {
        const bp = s.blueprints.find((b) => b.id === blueprintId);
        if (bp) {
          bp.nodes = bp.nodes.filter((n) => n.id !== nodeId);
          bp.edges = bp.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
        }
        saveToStorage(s.blueprints);
      }),

    updateNodeData: (blueprintId, nodeId, data) =>
      set((s) => {
        const bp = s.blueprints.find((b) => b.id === blueprintId);
        if (bp) {
          const node = bp.nodes.find((n) => n.id === nodeId);
          if (node) node.data = { ...node.data, ...data };
        }
        saveToStorage(s.blueprints);
      }),

    importBlueprint: (json) => {
      try {
        const bp = JSON.parse(json) as Blueprint;
        if (!bp.id || !bp.name || !bp.nodes) return null;
        bp.id = generateId();
        set((s) => {
          s.blueprints.push(bp);
          s.activeBlueprintId = bp.id;
          saveToStorage(s.blueprints);
        });
        return bp.id;
      } catch {
        return null;
      }
    },

    exportBlueprint: (id) => {
      const bp = get().blueprints.find((b) => b.id === id);
      return bp ? JSON.stringify(bp, null, 2) : null;
    },

    loadBlueprints: (bps) =>
      set((s) => {
        s.blueprints = bps;
        if (!s.activeBlueprintId && bps.length > 0) s.activeBlueprintId = bps[0].id;
        saveToStorage(s.blueprints);
      }),
  }))
);
