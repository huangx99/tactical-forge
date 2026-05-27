import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Blueprint, BlueprintNode, BlueprintEdge } from '@tactical-forge/shared';
import { generateId } from '@tactical-forge/shared';
import { DEFAULT_BLUEPRINT_TEMPLATES } from '../blueprints/defaultTemplates';

const STORAGE_KEY = 'tf-blueprints';
const TEMPLATE_VERSION_KEY = 'tf-blueprint-template-version';
const TEMPLATE_VERSION = 5; // 递增此版本号以强制刷新默认模板

function loadFromStorage(): Blueprint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let existing: Blueprint[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(existing)) existing = [];

    const storedVersion = Number(localStorage.getItem(TEMPLATE_VERSION_KEY)) || 0;
    if (storedVersion < TEMPLATE_VERSION) {
      // 模板版本更新，用新模板替换旧的默认模板，保留用户自建蓝图
      const templateIds = new Set(DEFAULT_BLUEPRINT_TEMPLATES.map((t) => t.id));
      const userBlueprints = existing.filter((b) => !templateIds.has(b.id));
      const merged = [...userBlueprints, ...DEFAULT_BLUEPRINT_TEMPLATES];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      localStorage.setItem(TEMPLATE_VERSION_KEY, String(TEMPLATE_VERSION));
      return merged;
    }

    // 始终确保默认模板存在（按 ID 去重）
    const existingIds = new Set(existing.map((b) => b.id));
    const missing = DEFAULT_BLUEPRINT_TEMPLATES.filter((t) => !existingIds.has(t.id));
    if (missing.length > 0) {
      const merged = [...existing, ...missing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      localStorage.setItem(TEMPLATE_VERSION_KEY, String(TEMPLATE_VERSION));
      return merged;
    }
    return existing;
  } catch { return [...DEFAULT_BLUEPRINT_TEMPLATES]; }
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
