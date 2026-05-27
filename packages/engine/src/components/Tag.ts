import { Component } from '../ecs/Component';

export class Tag extends Component {
  static readonly typeName = 'tag';

  tags: string[] = [];

  toJSON(): Record<string, unknown> {
    return { tags: this.tags };
  }

  fromJSON(data: Record<string, unknown>): void {
    this.tags = (data.tags as string[]) ?? [];
  }
}
