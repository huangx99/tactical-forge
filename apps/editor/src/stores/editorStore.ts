import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type AssetEditorType = 'blueprint' | 'item' | 'skill' | 'statusEffect' | 'lootTable' | null;

interface EditorState {
  activeLeftTab: 'scene' | 'assets';
  selectedObjectId: string | null;
  isPlaying: boolean;
  zoom: number;
  openAssetEditor: AssetEditorType; // full-screen asset editor

  setActiveLeftTab: (tab: 'scene' | 'assets') => void;
  selectObject: (id: string | null) => void;
  setPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  openAssetEditorWindow: (type: AssetEditorType) => void;
  closeAssetEditorWindow: () => void;
}

export const useEditorStore = create<EditorState>()(
  immer((set) => ({
    activeLeftTab: 'scene',
    selectedObjectId: null,
    isPlaying: false,
    zoom: 1,
    openAssetEditor: null,

    setActiveLeftTab: (tab) => set((s) => { s.activeLeftTab = tab; }),
    selectObject: (id) => set((s) => { s.selectedObjectId = id; }),
    setPlaying: (playing) => set((s) => { s.isPlaying = playing; }),
    setZoom: (zoom) => set((s) => { s.zoom = zoom; }),
    openAssetEditorWindow: (type) => set((s) => { s.openAssetEditor = type; }),
    closeAssetEditorWindow: () => set((s) => { s.openAssetEditor = null; }),
  }))
);
