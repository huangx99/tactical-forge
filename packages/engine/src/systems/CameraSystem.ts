import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';
import { Transform } from '../components/Transform';

export interface CameraConfig {
  follow?: string;
  bounds?: { x: number; y: number; w: number; h: number };
  deadzone?: { x: number; y: number };
  smoothing?: number;
}

export class CameraSystem extends System {
  readonly name = 'camera';
  config: CameraConfig = {};

  // Camera position in world space
  x = 0;
  y = 0;
  zoom = 1;

  // Screen dimensions
  screenWidth: number;
  screenHeight: number;

  // Smooth follow
  private targetX = 0;
  private targetY = 0;
  private smoothing = 0.1;

  constructor(screenWidth: number, screenHeight: number) {
    super();
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }

  setFollow(entityId: string): void {
    this.config.follow = entityId;
  }

  update(entities: Entity[], _dt: number): void {
    if (!this.config.follow) return;

    const entity = entities.find(e => e.id === this.config.follow);
    if (!entity) return;

    const transform = entity.getComponent(Transform);
    if (!transform) return;

    // Calculate target camera position (center on entity)
    this.targetX = transform.x - this.screenWidth / (2 * this.zoom);
    this.targetY = transform.y - this.screenHeight / (2 * this.zoom);

    // Apply deadzone
    if (this.config.deadzone) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      if (Math.abs(dx) < this.config.deadzone.x) this.targetX = this.x;
      if (Math.abs(dy) < this.config.deadzone.y) this.targetY = this.y;
    }

    // Smooth follow
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;

    // Apply bounds
    if (this.config.bounds) {
      const b = this.config.bounds;
      this.x = Math.max(b.x, Math.min(b.x + b.w - this.screenWidth / this.zoom, this.x));
      this.y = Math.max(b.y, Math.min(b.y + b.h - this.screenHeight / this.zoom, this.y));
    }
  }

  resize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return {
      x: (wx - this.x) * this.zoom,
      y: (wy - this.y) * this.zoom,
    };
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return {
      x: sx / this.zoom + this.x,
      y: sy / this.zoom + this.y,
    };
  }
}
