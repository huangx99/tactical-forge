import { Component } from '../ecs/Component';

export type ColliderShape = 'box' | 'circle';

export class Collider extends Component {
  static readonly typeName = 'collider';

  shape: ColliderShape = 'box';
  w = 0;
  h = 0;
  radius = 0;
  isTrigger = false;
  mass = 1;
  isKinematic = false;

  toJSON(): Record<string, unknown> {
    return { shape: this.shape, w: this.w, h: this.h, radius: this.radius, isTrigger: this.isTrigger, mass: this.mass, isKinematic: this.isKinematic };
  }

  fromJSON(data: Record<string, unknown>): void {
    this.shape = (data.shape as ColliderShape) ?? 'box';
    this.w = (data.w as number) ?? 0;
    this.h = (data.h as number) ?? 0;
    this.radius = (data.radius as number) ?? 0;
    this.isTrigger = (data.isTrigger as boolean) ?? false;
    this.mass = (data.mass as number) ?? 1;
    this.isKinematic = (data.isKinematic as boolean) ?? false;
  }
}
