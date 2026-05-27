import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { generateId } from '@tactical-forge/shared';

export interface Tileset {
  id: string;
  name: string;
  image: string;
  tileSize: number;
  columns: number;
  rows: number;
}

export type EditorTool = 'select' | 'paint' | 'erase' | 'fill' | 'object';

interface TilemapState {
  tilesets: Tileset[];
  activeTilesetId: string | null;
  selectedTileIndex: number;
  activeTool: EditorTool;
  showGrid: boolean;

  // Tilemap data: sceneId -> layerId -> 2D array
  tilemaps: Record<string, Record<string, number[][]>>;

  addTileset: (tileset: Omit<Tileset, 'id'>) => string;
  removeTileset: (id: string) => void;
  setActiveTileset: (id: string | null) => void;
  setSelectedTile: (index: number) => void;
  setActiveTool: (tool: EditorTool) => void;
  setShowGrid: (show: boolean) => void;

  setTile: (sceneId: string, layerId: string, x: number, y: number, tileIndex: number) => void;
  fillTiles: (sceneId: string, layerId: string, x: number, y: number, tileIndex: number) => void;
  eraseTile: (sceneId: string, layerId: string, x: number, y: number) => void;
  resizeTilemap: (sceneId: string, layerId: string, width: number, height: number) => void;
  getTilemap: (sceneId: string, layerId: string) => number[][] | undefined;
}

function createEmptyTilemap(width: number, height: number): number[][] {
  return Array.from({ length: height }, () => Array(width).fill(-1));
}

export const useTilemapStore = create<TilemapState>()(
  immer((set, get) => ({
    tilesets: [],
    activeTilesetId: null,
    selectedTileIndex: 0,
    activeTool: 'paint',
    showGrid: true,
    tilemaps: {},

    addTileset: (tileset) => {
      const id = generateId();
      set((s) => {
        s.tilesets.push({ ...tileset, id });
        if (!s.activeTilesetId) s.activeTilesetId = id;
      });
      return id;
    },

    removeTileset: (id) =>
      set((s) => {
        s.tilesets = s.tilesets.filter((t) => t.id !== id);
        if (s.activeTilesetId === id) s.activeTilesetId = s.tilesets[0]?.id ?? null;
      }),

    setActiveTileset: (id) => set((s) => { s.activeTilesetId = id; }),
    setSelectedTile: (index) => set((s) => { s.selectedTileIndex = index; }),
    setActiveTool: (tool) => set((s) => { s.activeTool = tool; }),
    setShowGrid: (show) => set((s) => { s.showGrid = show; }),

    setTile: (sceneId, layerId, x, y, tileIndex) =>
      set((s) => {
        if (!s.tilemaps[sceneId]) s.tilemaps[sceneId] = {};
        if (!s.tilemaps[sceneId][layerId]) s.tilemaps[sceneId][layerId] = createEmptyTilemap(50, 50);
        const map = s.tilemaps[sceneId][layerId];
        if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
          map[y][x] = tileIndex;
        }
      }),

    fillTiles: (sceneId, layerId, x, y, tileIndex) =>
      set((s) => {
        if (!s.tilemaps[sceneId]) s.tilemaps[sceneId] = {};
        if (!s.tilemaps[sceneId][layerId]) s.tilemaps[sceneId][layerId] = createEmptyTilemap(50, 50);
        const map = s.tilemaps[sceneId][layerId];
        if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return;
        const target = map[y][x];
        if (target === tileIndex) return;
        const stack = [[x, y]];
        while (stack.length > 0) {
          const [cx, cy] = stack.pop()!;
          if (cx < 0 || cx >= map[0].length || cy < 0 || cy >= map.length) continue;
          if (map[cy][cx] !== target) continue;
          map[cy][cx] = tileIndex;
          stack.push([cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]);
        }
      }),

    eraseTile: (sceneId, layerId, x, y) =>
      set((s) => {
        const map = s.tilemaps[sceneId]?.[layerId];
        if (map && y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
          map[y][x] = -1;
        }
      }),

    resizeTilemap: (sceneId, layerId, width, height) =>
      set((s) => {
        if (!s.tilemaps[sceneId]) s.tilemaps[sceneId] = {};
        const old = s.tilemaps[sceneId][layerId];
        const newMap = createEmptyTilemap(width, height);
        if (old) {
          for (let y = 0; y < Math.min(height, old.length); y++) {
            for (let x = 0; x < Math.min(width, old[0].length); x++) {
              newMap[y][x] = old[y][x];
            }
          }
        }
        s.tilemaps[sceneId][layerId] = newMap;
      }),

    getTilemap: (sceneId, layerId) => {
      return get().tilemaps[sceneId]?.[layerId];
    },
  }))
);
