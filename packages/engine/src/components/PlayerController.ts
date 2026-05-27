import { Component } from '../ecs/Component';

export class PlayerController extends Component {
  static readonly typeName = 'playerController';

  speed = 3;
  jumpForce = 8;

  toJSON(): Record<string, unknown> {
    return { speed: this.speed, jumpForce: this.jumpForce };
  }

  fromJSON(data: Record<string, unknown>): void {
    this.speed = (data.speed as number) ?? 3;
    this.jumpForce = (data.jumpForce as number) ?? 8;
  }
}
