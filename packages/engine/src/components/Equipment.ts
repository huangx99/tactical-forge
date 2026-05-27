import { Component } from '../ecs/Component';

export interface EquipSlot {
  slotId: string;
  itemId: string | null;
}

export class Equipment extends Component {
  static readonly typeName = 'equipment';

  slots: EquipSlot[] = [
    { slotId: 'mainHand', itemId: null },
    { slotId: 'offHand', itemId: null },
    { slotId: 'head', itemId: null },
    { slotId: 'body', itemId: null },
    { slotId: 'feet', itemId: null },
    { slotId: 'accessory1', itemId: null },
    { slotId: 'accessory2', itemId: null },
  ];

  toJSON(): Record<string, unknown> {
    return { slots: this.slots };
  }

  fromJSON(data: Record<string, unknown>): void {
    if (data.slots) {
      this.slots = data.slots as EquipSlot[];
    }
  }
}
