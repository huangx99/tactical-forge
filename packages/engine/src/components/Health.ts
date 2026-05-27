import { Component } from '../ecs/Component';

export class Health extends Component {
  static readonly typeName = 'health';

  max = 100;
  current = 100;

  toJSON(): Record<string, unknown> {
    return { max: this.max, current: this.current };
  }

  fromJSON(data: Record<string, unknown>): void {
    this.max = (data.max as number) ?? 100;
    this.current = (data.current as number) ?? this.max;
  }
}
