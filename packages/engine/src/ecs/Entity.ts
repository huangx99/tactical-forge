import { Component } from './Component';

export class Entity {
  readonly id: string;
  private components = new Map<string, Component>();

  constructor(id: string) {
    this.id = id;
  }

  addComponent(component: Component): this {
    const typeName = (component.constructor as typeof Component).typeName;
    this.components.set(typeName, component);
    return this;
  }

  getComponent<T extends Component>(type: { typeName: string; new(...args: unknown[]): T }): T | undefined {
    return this.components.get(type.typeName) as T | undefined;
  }

  hasComponent(type: { typeName: string }): boolean {
    return this.components.has(type.typeName);
  }

  removeComponent(type: { typeName: string }): void {
    this.components.delete(type.typeName);
  }

  getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }

  toJSON(): Record<string, unknown> {
    const data: Record<string, unknown> = { id: this.id };
    for (const [name, component] of this.components) {
      data[name] = component.toJSON();
    }
    return data;
  }
}
