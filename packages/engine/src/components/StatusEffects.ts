import { Component } from '../ecs/Component';

export interface ActiveStatusEffect {
  statusId: string;
  stacks: number;
  remainingDuration: number;
  tickTimer: number;
}

export class StatusEffects extends Component {
  static readonly typeName = 'statusEffects';

  active: ActiveStatusEffect[] = [];

  toJSON(): Record<string, unknown> {
    return { active: this.active };
  }

  fromJSON(data: Record<string, unknown>): void {
    this.active = (data.active as ActiveStatusEffect[]) ?? [];
  }
}
