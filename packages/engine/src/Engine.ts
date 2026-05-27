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

export interface EngineConfig {
  width: number;
  height: number;
  backgroundColor?: number;
  movementMode?: MovementMode;
  cameraConfig?: CameraConfig;
  worldBounds?: { minX: number; minY: number; maxX: number; maxY: number };
}

export class Engine {
  readonly app: PIXI.Application;
  readonly world: PIXI.Container;
  readonly entities: Entity[] = [];
  readonly systems: System[] = [];

  // Systems
  readonly renderSystem: RenderSystem;
  readonly inputSystem: InputSystem;
  readonly physicsSystem: PhysicsSystem;
  readonly playerSystem: PlayerSystem;
  readonly cameraSystem: CameraSystem;
  readonly scriptSystem: ScriptSystem;

  private running = false;
  private lastTime = 0;
  private onUpdate?: (dt: number) => void;

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

    this.inputSystem = new InputSystem(canvas);
    this.renderSystem = new RenderSystem(this.world);
    this.physicsSystem = new PhysicsSystem();
    this.playerSystem = new PlayerSystem(this.inputSystem);
    this.cameraSystem = new CameraSystem(config.width, config.height);
    this.scriptSystem = new ScriptSystem();

    if (config.movementMode) {
      this.playerSystem.mode = config.movementMode;
    }
    if (config.cameraConfig) {
      this.cameraSystem.config = config.cameraConfig;
    }
    if (config.worldBounds) {
      this.playerSystem.worldBounds = config.worldBounds;
    }

    this.systems = [
      this.inputSystem,
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

  setUpdateCallback(cb: (dt: number) => void): void {
    this.onUpdate = cb;
  }

  addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  removeEntity(id: string): void {
    const idx = this.entities.findIndex(e => e.id === id);
    if (idx >= 0) this.entities.splice(idx, 1);
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.find(e => e.id === id);
  }

  setMovementMode(mode: MovementMode): void {
    this.playerSystem.mode = mode;
  }

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.app.ticker.add(this.tick);
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
    this.app.destroy(true);
  }
}
