import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';

export class ScriptSystem extends System {
  readonly name = 'script';

  update(_entities: Entity[], _dt: number): void {
    // Blueprint execution will be implemented in Phase 4
  }
}
