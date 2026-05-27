import { Component } from '../ecs/Component';

export class Name extends Component {
  static readonly typeName = 'name';

  value = '';

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }

  fromJSON(data: Record<string, unknown>): void {
    this.value = (data.value as string) ?? '';
  }
}
