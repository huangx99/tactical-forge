import { Blueprint } from '@tactical-forge/shared';
import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';
import { EventBus } from '../events/EventBus';
import { GameEvent } from '../events/GameEvent';
import { GameFlags } from '../state/GameFlags';
import { BlueprintRuntime } from '../blueprint/BlueprintRuntime';
import { BlueprintContext } from '../blueprint/BlueprintContext';
import { BlueprintComponent } from '../components/Blueprint';
import { StatusEffects } from '../components/StatusEffects';

export class ScriptSystem extends System {
  readonly name = 'script';

  readonly runtime: BlueprintRuntime;
  private contexts = new Map<string, BlueprintContext>();
  private blueprintStore: Map<string, Blueprint> = new Map();
  private eventQueue: GameEvent[] = [];

  constructor(
    private eventBus: EventBus,
    private gameFlags: GameFlags,
    private entityGetter: (id: string) => Entity | undefined
  ) {
    super();
    this.runtime = new BlueprintRuntime(eventBus, gameFlags, entityGetter);

    // Listen to all events and queue them
    eventBus.on('*', (event) => {
      this.eventQueue.push(event);
    });
  }

  setBlueprintStore(store: Map<string, Blueprint>): void {
    this.blueprintStore = store;
    this.runtime.setService('blueprintGetter', (id: string) => this.blueprintStore.get(id));
  }

  getContext(entityId: string): BlueprintContext {
    let ctx = this.contexts.get(entityId);
    if (!ctx) {
      ctx = new BlueprintContext(entityId);
      this.contexts.set(entityId, ctx);
    }
    return ctx;
  }

  removeContext(entityId: string): void {
    this.contexts.delete(entityId);
  }

  serializeContexts(): Array<{ entityId: string; variables: Record<string, unknown> }> {
    const result: Array<{ entityId: string; variables: Record<string, unknown> }> = [];
    for (const [entityId, ctx] of this.contexts) {
      const json = ctx.toJSON();
      result.push({
        entityId: json.entityId as string,
        variables: json.variables as Record<string, unknown>,
      });
    }
    return result;
  }

  update(entities: Entity[], dt: number): void {
    // 1. Process status effects tick
    this.tickStatusEffects(entities, dt);

    // 2. Process timers and delays for all contexts
    for (const entity of entities) {
      const bpComp = entity.getComponent<BlueprintComponent>(BlueprintComponent);
      if (!bpComp || bpComp.blueprintIds.length === 0) continue;

      const ctx = this.getContext(entity.id);
      const blueprints = this.getBlueprints(bpComp.blueprintIds);
      this.runtime.updateTimersAndDelays(ctx, dt, blueprints, entity);
    }

    // 3. Process queued events
    const events = this.eventQueue;
    this.eventQueue = [];

    for (const event of events) {
      this.processEvent(event, entities);
    }

    // 4. Process deferred events (from EventBus)
    this.eventBus.processPending();
  }

  private processEvent(event: GameEvent, entities: Entity[]): void {
    for (const entity of entities) {
      // If event has a sourceId, only deliver to that entity (skip others)
      // Global events (no sourceId) are delivered to all entities
      if (event.sourceId && event.sourceId !== entity.id) continue;

      const bpComp = entity.getComponent<BlueprintComponent>(BlueprintComponent);
      if (!bpComp || bpComp.blueprintIds.length === 0) continue;

      const ctx = this.getContext(entity.id);
      const blueprints = this.getBlueprints(bpComp.blueprintIds);
      this.runtime.handleEvent(event, blueprints, entity, ctx);
    }
  }

  private getBlueprints(ids: string[]): Blueprint[] {
    const result: Blueprint[] = [];
    for (const id of ids) {
      const bp = this.blueprintStore.get(id);
      if (bp) result.push(bp);
    }
    return result;
  }

  private tickStatusEffects(entities: Entity[], dt: number): void {
    for (const entity of entities) {
      const statusComp = entity.getComponent<StatusEffects>(StatusEffects);
      if (!statusComp || statusComp.active.length === 0) continue;

      for (const effect of statusComp.active) {
        effect.remainingDuration -= dt;
        effect.tickTimer += dt;

        // Emit tick event (for blueprint-driven effects)
        if (effect.tickTimer >= 1) {
          effect.tickTimer -= 1;
          this.eventBus.emit('statusEffect.tick', {
            entityId: entity.id,
            statusId: effect.statusId,
            stacks: effect.stacks,
          }, entity.id);
        }
      }

      // Remove expired effects
      const expired = statusComp.active.filter(e => e.remainingDuration <= 0);
      for (const effect of expired) {
        this.eventBus.emit('statusEffect.expire', {
          entityId: entity.id,
          statusId: effect.statusId,
        }, entity.id);
      }
      statusComp.active = statusComp.active.filter(e => e.remainingDuration > 0);
    }
  }

  destroy(): void {
    this.contexts.clear();
    this.eventQueue = [];
  }
}
