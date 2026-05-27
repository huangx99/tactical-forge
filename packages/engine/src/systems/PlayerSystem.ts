import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';
import { Transform } from '../components/Transform';
import { PlayerController } from '../components/PlayerController';
import { Collider } from '../components/Collider';
import { InputSystem } from './InputSystem';

export type MovementMode = 'top-down' | 'side-scroll';

export class PlayerSystem extends System {
  readonly name = 'player';
  mode: MovementMode = 'top-down';
  private velocityY = 0;
  private isGrounded = false;
  private gravity = 0.6;
  private friction = 0.85;

  // World bounds
  worldBounds = { minX: 0, minY: 0, maxX: 1600, maxY: 1200 };

  // Collision callback
  onCollision?: (entityA: Entity, entityB: Entity) => void;

  private collidables: Entity[] = [];

  constructor(private input: InputSystem) {
    super();
  }

  update(entities: Entity[], dt: number): void {
    this.collidables = entities.filter(e => e.hasComponent(Collider) && e.hasComponent(Transform));

    for (const entity of entities) {
      const player = entity.getComponent(PlayerController);
      const transform = entity.getComponent(Transform);
      if (!player || !transform) continue;

      if (this.mode === 'top-down') {
        this.updateTopDown(entity, transform, player, dt);
      } else {
        this.updatePlatformer(entity, transform, player, dt);
      }

      // World bounds clamping
      const collider = entity.getComponent(Collider);
      const halfW = collider ? (collider.shape === 'box' ? collider.w / 2 : collider.radius) : 0;
      const halfH = collider ? (collider.shape === 'box' ? collider.h / 2 : collider.radius) : 0;
      transform.x = Math.max(this.worldBounds.minX + halfW, Math.min(this.worldBounds.maxX - halfW, transform.x));
      transform.y = Math.max(this.worldBounds.minY + halfH, Math.min(this.worldBounds.maxY - halfH, transform.y));
    }
  }

  private updateTopDown(entity: Entity, transform: Transform, player: PlayerController, dt: number): void {
    let dx = 0;
    let dy = 0;

    if (this.input.isKeyDown('ArrowLeft') || this.input.isKeyDown('a')) dx -= 1;
    if (this.input.isKeyDown('ArrowRight') || this.input.isKeyDown('d')) dx += 1;
    if (this.input.isKeyDown('ArrowUp') || this.input.isKeyDown('w')) dy -= 1;
    if (this.input.isKeyDown('ArrowDown') || this.input.isKeyDown('s')) dy += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }

    const moveX = dx * player.speed;
    const moveY = dy * player.speed;

    // Apply movement with collision
    this.moveWithCollision(entity, transform, moveX, 0);
    this.moveWithCollision(entity, transform, 0, moveY);
  }

  private updatePlatformer(entity: Entity, transform: Transform, player: PlayerController, dt: number): void {
    let dx = 0;

    if (this.input.isKeyDown('ArrowLeft') || this.input.isKeyDown('a')) dx -= 1;
    if (this.input.isKeyDown('ArrowRight') || this.input.isKeyDown('d')) dx += 1;

    // Horizontal movement
    this.moveWithCollision(entity, transform, dx * player.speed, 0);

    // Gravity
    this.velocityY += this.gravity;
    if (this.velocityY > 12) this.velocityY = 12; // terminal velocity

    // Jump
    if ((this.input.isKeyDown(' ') || this.input.isKeyDown('ArrowUp') || this.input.isKeyDown('w')) && this.isGrounded) {
      this.velocityY = -player.jumpForce;
      this.isGrounded = false;
    }

    // Apply vertical movement
    this.moveWithCollision(entity, transform, 0, this.velocityY);
  }

  private moveWithCollision(entity: Entity, transform: Transform, dx: number, dy: number): void {
    const collider = entity.getComponent(Collider);
    if (!collider || (!dx && !dy)) {
      transform.x += dx;
      transform.y += dy;
      return;
    }

    // Try move X
    if (dx !== 0) {
      const newX = transform.x + dx;
      let blocked = false;
      for (const other of this.collidables) {
        if (other.id === entity.id) continue;
        if (this.checkCollisionAt(entity, newX, transform.y, other)) {
          blocked = true;
          this.onCollision?.(entity, other);
          break;
        }
      }
      if (!blocked) {
        transform.x = newX;
      }
    }

    // Try move Y
    if (dy !== 0) {
      const newY = transform.y + dy;
      let blocked = false;
      for (const other of this.collidables) {
        if (other.id === entity.id) continue;
        if (this.checkCollisionAt(entity, transform.x, newY, other)) {
          blocked = true;
          this.onCollision?.(entity, other);
          // For platformer: if falling down and hitting something, land on it
          if (this.mode === 'side-scroll' && dy > 0) {
            this.velocityY = 0;
            this.isGrounded = true;
          }
          break;
        }
      }
      if (!blocked) {
        transform.y = newY;
        if (this.mode === 'side-scroll' && dy > 0) {
          this.isGrounded = false;
        }
      }
    }
  }

  private checkCollisionAt(entity: Entity, x: number, y: number, other: Entity): boolean {
    const cA = entity.getComponent(Collider)!;
    const tB = other.getComponent(Transform)!;
    const cB = other.getComponent(Collider)!;

    if (cA.shape === 'box' && cB.shape === 'box') {
      return (
        x - cA.w / 2 < tB.x + cB.w / 2 &&
        x + cA.w / 2 > tB.x - cB.w / 2 &&
        y - cA.h / 2 < tB.y + cB.h / 2 &&
        y + cA.h / 2 > tB.y - cB.h / 2
      );
    }

    if (cA.shape === 'circle' && cB.shape === 'circle') {
      const ddx = x - tB.x;
      const ddy = y - tB.y;
      return Math.sqrt(ddx * ddx + ddy * ddy) < cA.radius + cB.radius;
    }

    // Box vs circle
    const boxX = cA.shape === 'box' ? x : tB.x;
    const boxY = cA.shape === 'box' ? y : tB.y;
    const boxW = cA.shape === 'box' ? cA.w : cB.w;
    const boxH = cA.shape === 'box' ? cA.h : cB.h;
    const circX = cA.shape === 'circle' ? x : tB.x;
    const circY = cA.shape === 'circle' ? y : tB.y;
    const circR = cA.shape === 'circle' ? cA.radius : cB.radius;

    const closestX = Math.max(boxX - boxW / 2, Math.min(circX, boxX + boxW / 2));
    const closestY = Math.max(boxY - boxH / 2, Math.min(circY, boxY + boxH / 2));
    const ddx = circX - closestX;
    const ddy = circY - closestY;
    return ddx * ddx + ddy * ddy < circR * circR;
  }
}
