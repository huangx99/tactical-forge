import { ViewMode } from './game-config';

export interface Scene {
  id: string;
  name: string;
  viewMode?: ViewMode;
  layers: Layer[];
  triggers: Trigger[];
  camera: CameraConfig;
}

export type Layer = TilemapLayer | ObjectLayer;

export interface TilemapLayer {
  id: string;
  type: 'tilemap';
  tiles: number[][];
  tilesetId: string;
}

export interface ObjectLayer {
  id: string;
  type: 'object';
  objects: GameObject[];
}

export type ObjectType = 'player' | 'npc' | 'enemy' | 'item' | 'trigger' | 'prop';

export interface GameObject {
  id: string;
  name?: string;
  type: ObjectType;
  position: { x: number; y: number };
  sprite: string;
  components: Record<string, ComponentData>;
}

export interface ComponentData {
  [key: string]: unknown;
}

export interface Trigger {
  id: string;
  type: 'area' | 'interact';
  bounds: { x: number; y: number; w: number; h: number };
  blueprintId: string;
}

export interface CameraConfig {
  follow?: string;
  bounds?: { x: number; y: number; w: number; h: number };
  deadzone?: { x: number; y: number };
}
