import { Component } from '../ecs/Component';

export interface InventorySlot {
  itemId: string;
  quantity: number;
}

export class Inventory extends Component {
  static readonly typeName = 'inventory';

  capacity = 20;
  slots: InventorySlot[] = [];

  toJSON(): Record<string, unknown> {
    return { capacity: this.capacity, slots: this.slots };
  }

  fromJSON(data: Record<string, unknown>): void {
    this.capacity = (data.capacity as number) ?? 20;
    this.slots = (data.slots as InventorySlot[]) ?? [];
  }
}
