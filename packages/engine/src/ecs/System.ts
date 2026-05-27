import { Entity } from './Entity';

export abstract class System {
  abstract readonly name: string;
  abstract update(entities: Entity[], dt: number): void;
  init?(): void;
  destroy?(): void;
}
