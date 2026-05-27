import { Component } from '../ecs/Component';

export class Transform extends Component {
  static readonly typeName = 'transform';

  x = 0;
  y = 0;
  rotation = 0;
  scaleX = 1;
  scaleY = 1;

  toJSON(): Record<string, unknown> {
    return { x: this.x, y: this.y, rotation: this.rotation, scaleX: this.scaleX, scaleY: this.scaleY };
  }

  fromJSON(data: Record<string, unknown>): void {
    this.x = (data.x as number) ?? 0;
    this.y = (data.y as number) ?? 0;
    this.rotation = (data.rotation as number) ?? 0;
    this.scaleX = (data.scaleX as number) ?? 1;
    this.scaleY = (data.scaleY as number) ?? 1;
  }
}
