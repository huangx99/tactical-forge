import { Component } from '../ecs/Component';

export class Loot extends Component {
  static readonly typeName = 'loot';

  lootTableId: string | null = null;

  toJSON(): Record<string, unknown> {
    return { lootTableId: this.lootTableId };
  }

  fromJSON(data: Record<string, unknown>): void {
    this.lootTableId = (data.lootTableId as string) ?? null;
  }
}
