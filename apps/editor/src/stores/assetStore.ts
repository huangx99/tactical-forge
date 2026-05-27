import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { generateId } from '@tactical-forge/shared';

const STORAGE_KEY = 'tf-assets';

function loadFromStorage<T>(field: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    return data[field] ?? fallback;
  } catch { return fallback; }
}

function saveToStorage(state: { items: ItemDef[]; skills: SkillDef[]; statuses: StatusDef[]; lootTables: LootTableDef[] }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      items: state.items, skills: state.skills,
      statuses: state.statuses, lootTables: state.lootTables,
    }));
  } catch {}
}

// --- Item ---
export interface ItemDef {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  stackable: boolean;
  maxStack: number;
  buyPrice: number;
  sellPrice: number;
  equipSlot?: string;
  stats: Record<string, number>;
}

// --- Skill ---
export interface SkillDef {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  mpCost: number;
  cooldown: number;
  castTime: number;
  range: number;
  targetType: string;
  maxLevel: number;
  effects: { type: string; value: number; element?: string }[];
}

// --- Status Effect ---
export interface StatusDef {
  id: string;
  name: string;
  type: 'buff' | 'debuff';
  duration: number;
  stackable: boolean;
  maxStacks: number;
  tickInterval: number;
  effects: { type: string; value: number }[];
  immunity: string[];
}

// --- Loot Table ---
export interface LootEntry {
  itemId: string;
  min: number;
  max: number;
  weight: number;
}

export interface LootTableDef {
  id: string;
  name: string;
  entries: LootEntry[];
  guaranteed: string[];
  rollCount: { min: number; max: number };
}

// --- Store ---
interface AssetState {
  items: ItemDef[];
  skills: SkillDef[];
  statuses: StatusDef[];
  lootTables: LootTableDef[];

  addItem: (item: Omit<ItemDef, 'id'>) => string;
  updateItem: (id: string, updates: Partial<ItemDef>) => void;
  deleteItem: (id: string) => void;
  getItem: (id: string) => ItemDef | undefined;

  addSkill: (skill: Omit<SkillDef, 'id'>) => string;
  updateSkill: (id: string, updates: Partial<SkillDef>) => void;
  deleteSkill: (id: string) => void;
  getSkill: (id: string) => SkillDef | undefined;

  addStatus: (status: Omit<StatusDef, 'id'>) => string;
  updateStatus: (id: string, updates: Partial<StatusDef>) => void;
  deleteStatus: (id: string) => void;
  getStatus: (id: string) => StatusDef | undefined;

  addLootTable: (table: Omit<LootTableDef, 'id'>) => string;
  updateLootTable: (id: string, updates: Partial<LootTableDef>) => void;
  deleteLootTable: (id: string) => void;
  getLootTable: (id: string) => LootTableDef | undefined;

  loadAssets: (data: { items?: ItemDef[]; skills?: SkillDef[]; statuses?: StatusDef[]; lootTables?: LootTableDef[] }) => void;
}

export const useAssetStore = create<AssetState>()(
  immer((set, get) => ({
    items: loadFromStorage<ItemDef>('items', []),
    skills: loadFromStorage<SkillDef>('skills', []),
    statuses: loadFromStorage<StatusDef>('statuses', []),
    lootTables: loadFromStorage<LootTableDef>('lootTables', []),

    // --- Items ---
    addItem: (item) => {
      const id = generateId();
      set((s) => { s.items.push({ ...item, id }); saveToStorage(s); });
      return id;
    },
    updateItem: (id, updates) =>
      set((s) => {
        const item = s.items.find((i) => i.id === id);
        if (item) Object.assign(item, updates);
        saveToStorage(s);
      }),
    deleteItem: (id) =>
      set((s) => { s.items = s.items.filter((i) => i.id !== id); saveToStorage(s); }),
    getItem: (id) => get().items.find((i) => i.id === id),

    // --- Skills ---
    addSkill: (skill) => {
      const id = generateId();
      set((s) => { s.skills.push({ ...skill, id }); saveToStorage(s); });
      return id;
    },
    updateSkill: (id, updates) =>
      set((s) => {
        const skill = s.skills.find((sk) => sk.id === id);
        if (skill) Object.assign(skill, updates);
        saveToStorage(s);
      }),
    deleteSkill: (id) =>
      set((s) => { s.skills = s.skills.filter((sk) => sk.id !== id); saveToStorage(s); }),
    getSkill: (id) => get().skills.find((sk) => sk.id === id),

    // --- Status Effects ---
    addStatus: (status) => {
      const id = generateId();
      set((s) => { s.statuses.push({ ...status, id }); saveToStorage(s); });
      return id;
    },
    updateStatus: (id, updates) =>
      set((s) => {
        const status = s.statuses.find((st) => st.id === id);
        if (status) Object.assign(status, updates);
        saveToStorage(s);
      }),
    deleteStatus: (id) =>
      set((s) => { s.statuses = s.statuses.filter((st) => st.id !== id); saveToStorage(s); }),
    getStatus: (id) => get().statuses.find((st) => st.id === id),

    // --- Loot Tables ---
    addLootTable: (table) => {
      const id = generateId();
      set((s) => { s.lootTables.push({ ...table, id }); saveToStorage(s); });
      return id;
    },
    updateLootTable: (id, updates) =>
      set((s) => {
        const table = s.lootTables.find((t) => t.id === id);
        if (table) Object.assign(table, updates);
        saveToStorage(s);
      }),
    deleteLootTable: (id) =>
      set((s) => { s.lootTables = s.lootTables.filter((t) => t.id !== id); saveToStorage(s); }),
    getLootTable: (id) => get().lootTables.find((t) => t.id === id),

    // --- Bulk load ---
    loadAssets: (data) =>
      set((s) => {
        if (data.items) s.items = data.items;
        if (data.skills) s.skills = data.skills;
        if (data.statuses) s.statuses = data.statuses;
        if (data.lootTables) s.lootTables = data.lootTables;
        saveToStorage(s);
      }),
  }))
);
