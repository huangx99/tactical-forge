import { Component } from '../ecs/Component';

export interface SkillSlot {
  skillId: string;
  cooldownRemaining: number;
}

export class SkillBar extends Component {
  static readonly typeName = 'skillBar';

  slots: SkillSlot[] = [];
  maxSlots = 8;

  toJSON(): Record<string, unknown> {
    return { slots: this.slots, maxSlots: this.maxSlots };
  }

  fromJSON(data: Record<string, unknown>): void {
    this.slots = (data.slots as SkillSlot[]) ?? [];
    this.maxSlots = (data.maxSlots as number) ?? 8;
  }
}
