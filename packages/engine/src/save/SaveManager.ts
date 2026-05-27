import { Entity } from '../ecs/Entity';
import { Component } from '../ecs/Component';
import { GameFlags } from '../state/GameFlags';
import { EventBus } from '../events/EventBus';

export interface SaveData {
  version: number;
  timestamp: number;
  entities: Array<{ id: string; components: Record<string, unknown> }>;
  gameFlags: { flags: Record<string, boolean>; variables: Record<string, unknown> };
  blueprintContexts: Array<{ entityId: string; variables: Record<string, unknown> }>;
  currentScene: string;
}

export class SaveManager {
  constructor(
    private entityGetter: () => Entity[],
    private gameFlags: GameFlags,
    private contextSerializer: () => Array<{ entityId: string; variables: Record<string, unknown> }>,
    private entityLoader: (entities: Array<{ id: string; components: Record<string, unknown> }>) => void,
    private contextLoader: (contexts: Array<{ entityId: string; variables: Record<string, unknown> }>) => void,
    private sceneGetter: () => string,
    private sceneLoader: (sceneId: string) => void,
    private eventBus: EventBus
  ) {}

  save(): SaveData {
    const entities = this.entityGetter().map(e => ({
      id: e.id,
      components: e.toJSON(),
    }));
    return {
      version: 1,
      timestamp: Date.now(),
      entities,
      gameFlags: this.gameFlags.toJSON(),
      blueprintContexts: this.contextSerializer(),
      currentScene: this.sceneGetter(),
    };
  }

  load(data: SaveData): void {
    if (data.version !== 1) {
      console.warn(`Unsupported save version: ${data.version}`);
      return;
    }
    this.gameFlags.fromJSON(data.gameFlags);
    this.entityLoader(data.entities);
    this.contextLoader(data.blueprintContexts);
    this.sceneLoader(data.currentScene);
    this.eventBus.emit('save.loaded', { timestamp: data.timestamp });
  }

  saveToSlot(slot: number): void {
    const data = this.save();
    localStorage.setItem(`tactical_forge_save_${slot}`, JSON.stringify(data));
  }

  loadFromSlot(slot: number): boolean {
    const raw = localStorage.getItem(`tactical_forge_save_${slot}`);
    if (!raw) return false;
    try {
      const data = JSON.parse(raw) as SaveData;
      this.load(data);
      return true;
    } catch (e) {
      console.error('Failed to load save:', e);
      return false;
    }
  }

  deleteSlot(slot: number): void {
    localStorage.removeItem(`tactical_forge_save_${slot}`);
  }

  hasSlot(slot: number): boolean {
    return localStorage.getItem(`tactical_forge_save_${slot}`) !== null;
  }
}
