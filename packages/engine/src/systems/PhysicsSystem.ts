import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';
import { Transform } from '../components/Transform';
import { Collider } from '../components/Collider';

export interface CollisionEvent {
  entityA: Entity;
  entityB: Entity;
}

export class PhysicsSystem extends System {
  readonly name = 'physics';
  private collisionEvents: CollisionEvent[] = [];

  update(entities: Entity[]): void {
    this.collisionEvents = [];
    const collidables = entities.filter(e => e.hasComponent(Collider) && e.hasComponent(Transform));

    for (let i = 0; i < collidables.length; i++) {
      for (let j = i + 1; j < collidables.length; j++) {
        const a = collidables[i];
        const b = collidables[j];
        const cA = a.getComponent(Collider)!;
        const cB = b.getComponent(Collider)!;

        // Skip if both are triggers (no solid collision)
        if (cA.isTrigger && cB.isTrigger) continue;

        if (this.checkCollision(a, b)) {
          this.collisionEvents.push({ entityA: a, entityB: b });

          // Resolve solid collision (push apart)
          if (!cA.isTrigger && !cB.isTrigger) {
            this.resolveCollision(a, b);
          }
        }
      }
    }
  }

  getCollisionEvents(): CollisionEvent[] {
    return this.collisionEvents;
  }

  checkCollision(a: Entity, b: Entity): boolean {
    const tA = a.getComponent(Transform)!;
    const cA = a.getComponent(Collider)!;
    const tB = b.getComponent(Transform)!;
    const cB = b.getComponent(Collider)!;

    if (cA.shape === 'box' && cB.shape === 'box') {
      return this.boxBox(tA, cA, tB, cB);
    }
    if (cA.shape === 'circle' && cB.shape === 'circle') {
      return this.circleCircle(tA, cA, tB, cB);
    }
    return this.boxCircle(
      cA.shape === 'box' ? tA : tB,
      cA.shape === 'box' ? cA : cB,
      cA.shape === 'circle' ? tA : tB,
      cA.shape === 'circle' ? cA : cB,
    );
  }

  private resolveCollision(a: Entity, b: Entity): void {
    const tA = a.getComponent(Transform)!;
    const tB = b.getComponent(Transform)!;
    const cA = a.getComponent(Collider)!;
    const cB = b.getComponent(Collider)!;

    // Calculate overlap and push apart
    const dx = tB.x - tA.x;
    const dy = tB.y - tA.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    let overlap: number;
    if (cA.shape === 'box' && cB.shape === 'box') {
      const overlapX = (cA.w + cB.w) / 2 - Math.abs(dx);
      const overlapY = (cA.h + cB.h) / 2 - Math.abs(dy);
      overlap = Math.min(overlapX, overlapY);
    } else if (cA.shape === 'circle' && cB.shape === 'circle') {
      overlap = cA.radius + cB.radius - dist;
    } else {
      overlap = 4; // simplified
    }

    if (overlap > 0) {
      const pushX = nx * overlap * 0.5;
      const pushY = ny * overlap * 0.5;
      tA.x -= pushX;
      tA.y -= pushY;
      tB.x += pushX;
      tB.y += pushY;
    }
  }

  private boxBox(tA: Transform, cA: Collider, tB: Transform, cB: Collider): boolean {
    return (
      tA.x - cA.w / 2 < tB.x + cB.w / 2 &&
      tA.x + cA.w / 2 > tB.x - cB.w / 2 &&
      tA.y - cA.h / 2 < tB.y + cB.h / 2 &&
      tA.y + cA.h / 2 > tB.y - cB.h / 2
    );
  }

  private circleCircle(tA: Transform, cA: Collider, tB: Transform, cB: Collider): boolean {
    const dx = tA.x - tB.x;
    const dy = tA.y - tB.y;
    return Math.sqrt(dx * dx + dy * dy) < cA.radius + cB.radius;
  }

  private boxCircle(tB: Transform, cB: Collider, tC: Transform, cC: Collider): boolean {
    const closestX = Math.max(tB.x - cB.w / 2, Math.min(tC.x, tB.x + cB.w / 2));
    const closestY = Math.max(tB.y - cB.h / 2, Math.min(tC.y, tB.y + cB.h / 2));
    const dx = tC.x - closestX;
    const dy = tC.y - closestY;
    return dx * dx + dy * dy < cC.radius * cC.radius;
  }
}
