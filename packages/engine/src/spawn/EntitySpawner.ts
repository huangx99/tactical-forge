import { Entity } from '../ecs/Entity';
import { Component } from '../ecs/Component';
import { EventBus } from '../events/EventBus';

export interface PrefabDef {
  id: string;
  components: Array<{ typeName: string; data: Record<string, unknown> }>;
}

export class EntitySpawner {
  private prefabs = new Map<string, PrefabDef>();
  private nextId = 1;

  constructor(
    private addEntity: (entity: Entity) => void,
    private eventBus: EventBus,
    private componentRegistry: Map<string, new () => Component>
  ) {}

  registerPrefab(prefab: PrefabDef): void {
    this.prefabs.set(prefab.id, prefab);
  }

  registerPrefabs(prefabs: PrefabDef[]): void {
    for (const p of prefabs) this.registerPrefab(p);
  }

  spawn(prefabId: string, x: number, y: number): Entity | null {
    const prefab = this.prefabs.get(prefabId);
    if (!prefab) return null;

    const entity = new Entity(`spawn_${this.nextId++}`);
    for (const compDef of prefab.components) {
      const CompClass = this.componentRegistry.get(compDef.typeName);
      if (CompClass) {
        const comp = new CompClass();
        (comp as any).fromJSON(compDef.data);
        entity.addComponent(comp);
      }
    }

    // Override position
    const transform = entity.getComponent({ typeName: 'transform' } as any) as any;
    if (transform) {
      transform.x = x;
      transform.y = y;
    }

    this.addEntity(entity);
    this.eventBus.emit('entity.start', { entityId: entity.id }, entity.id);
    return entity;
  }
}
