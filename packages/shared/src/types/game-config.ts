export type ViewMode = 'top-down' | 'side-scroll';
export type CombatMode = 'turn-based' | 'action' | 'none';

export interface GameConfig {
  id: string;
  name: string;
  version: string;
  tileSize: number;
  resolution: { width: number; height: number };
  viewMode: ViewMode;
  combatMode: CombatMode;
  scenes: string[];
  assets: AssetRegistry;
  globalBlueprints: string[];
  ui: GameUIConfig;
}

export interface AssetRegistry {
  sprites: Record<string, string>;
  audio: Record<string, string>;
  tilesets: Record<string, string>;
}

export interface GameUIConfig {
  hud: HUDItem[];
  menus: string[];
}

export interface HUDItem {
  type: 'healthBar' | 'mpBar' | 'goldDisplay' | 'minimap' | 'custom';
  position: { x: number; y: number };
  size?: { w: number; h: number };
  config?: Record<string, unknown>;
}
