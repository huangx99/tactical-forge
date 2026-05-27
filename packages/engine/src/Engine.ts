import * as PIXI from 'pixi.js';
import { Entity } from './ecs/Entity';
import { System } from './ecs/System';
import { RenderSystem } from './systems/RenderSystem';
import { InputSystem } from './systems/InputSystem';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { PlayerSystem } from './systems/PlayerSystem';
import { CameraSystem, CameraConfig } from './systems/CameraSystem';
import { ScriptSystem } from './systems/ScriptSystem';
import { MovementMode } from './systems/PlayerSystem';
import { EventBus } from './events/EventBus';
import { GameFlags } from './state/GameFlags';
import { InputActionMapper, InputAction } from './input/InputActionMapper';
import { Blueprint } from '@tactical-forge/shared';

export interface EngineConfig {
  width: number;
  height: number;
  backgroundColor?: number;
  movementMode?: MovementMode;
  cameraConfig?: CameraConfig;
  worldBounds?: { minX: number; minY: number; maxX: number; maxY: number };
  customInputActions?: InputAction[];
}

export class Engine {
  readonly app: PIXI.Application;
  readonly world: PIXI.Container;
  readonly entities: Entity[] = [];
  readonly systems: System[] = [];

  // Core services
  readonly eventBus: EventBus;
  readonly gameFlags: GameFlags;

  // Systems
  readonly renderSystem: RenderSystem;
  readonly inputSystem: InputSystem;
  readonly physicsSystem: PhysicsSystem;
  readonly playerSystem: PlayerSystem;
  readonly cameraSystem: CameraSystem;
  readonly scriptSystem: ScriptSystem;
  readonly inputActionMapper: InputActionMapper;

  private running = false;
  private lastTime = 0;
  private onUpdate?: (dt: number) => void;
  currentSceneId = '';

  constructor(canvas: HTMLCanvasElement, config: EngineConfig) {
    this.app = new PIXI.Application({
      view: canvas,
      width: config.width,
      height: config.height,
      backgroundColor: config.backgroundColor ?? 0x1a1a2e,
      antialias: true,
    });

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);

    // Core services
    this.eventBus = new EventBus();
    this.gameFlags = new GameFlags();

    // Systems
    this.inputSystem = new InputSystem(canvas);
    this.inputActionMapper = new InputActionMapper(this.inputSystem, this.eventBus, config.customInputActions);
    this.renderSystem = new RenderSystem(this.world);
    this.physicsSystem = new PhysicsSystem(this.eventBus);
    this.playerSystem = new PlayerSystem(this.inputSystem);
    this.cameraSystem = new CameraSystem(config.width, config.height);
    this.scriptSystem = new ScriptSystem(
      this.eventBus,
      this.gameFlags,
      (id: string) => this.getEntity(id)
    );

    // Wire up services for script system
    this.scriptSystem.runtime.setService('entityGetter', (id: string) => this.getEntity(id));
    this.scriptSystem.runtime.setService('spawner', (prefabId, x, y) => this.spawnFromPrefab(prefabId, x, y));

    if (config.movementMode) {
      this.playerSystem.mode = config.movementMode;
    }
    if (config.cameraConfig) {
      this.cameraSystem.config = config.cameraConfig;
    }
    if (config.worldBounds) {
      this.playerSystem.worldBounds = config.worldBounds;
    }

    // System order: input → inputMapper → player → physics → script → camera → render
    this.systems = [
      this.inputSystem,
      this.inputActionMapper,
      this.playerSystem,
      this.physicsSystem,
      this.scriptSystem,
      this.cameraSystem,
      this.renderSystem,
    ];

    for (const system of this.systems) {
      system.init?.();
    }
  }

  setBlueprintStore(store: Map<string, Blueprint>): void {
    this.scriptSystem.setBlueprintStore(store);
  }

  setUpdateCallback(cb: (dt: number) => void): void {
    this.onUpdate = cb;
  }

  addEntity(entity: Entity): void {
    this.entities.push(entity);
    // Emit entity.start event
    this.eventBus.emit('entity.start', { entityId: entity.id }, entity.id);
  }

  removeEntity(id: string): void {
    const idx = this.entities.findIndex(e => e.id === id);
    if (idx >= 0) {
      this.entities.splice(idx, 1);
      this.scriptSystem.removeContext(id);
    }
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.find(e => e.id === id);
  }

  getEntities(): Entity[] {
    return this.entities;
  }

  setMovementMode(mode: MovementMode): void {
    this.playerSystem.mode = mode;
  }

  spawnFromPrefab(prefabId: string, x: number, y: number): Entity | undefined {
    // This will be wired up by the editor to create entities from scene objects
    this.eventBus.emit('spawn.request', { prefabId, x, y });
    return undefined;
  }

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.app.ticker.add(this.tick);

    // Emit scene.start
    this.eventBus.emit('scene.start', { sceneId: this.currentSceneId });

    // Emit entity.start for all existing entities
    for (const entity of this.entities) {
      this.eventBus.emit('entity.start', { entityId: entity.id }, entity.id);
    }
  }

  stop(): void {
    this.running = false;
    this.app.ticker.remove(this.tick);
  }

  isRunning(): boolean {
    return this.running;
  }

  private tick = (): void => {
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    for (const system of this.systems) {
      system.update(this.entities, dt);
    }

    // Apply camera offset to world container
    this.world.x = -this.cameraSystem.x * this.cameraSystem.zoom;
    this.world.y = -this.cameraSystem.y * this.cameraSystem.zoom;
    this.world.scale.set(this.cameraSystem.zoom);

    this.onUpdate?.(dt);
  };

  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
    this.cameraSystem.resize(width, height);
  }

  destroy(): void {
    this.stop();
    for (const system of this.systems) {
      system.destroy?.();
    }
    this.eventBus.clear();
    this.app.destroy(true);
  }
}
