import { Component } from '../ecs/Component';

export type StatTemplate = 'rpg' | 'action' | 'minimal';

export interface StatValue {
  type: 'number' | 'string' | 'boolean';
  value: number | string | boolean;
}

export class Stats extends Component {
  static readonly typeName = 'stats';

  template: StatTemplate = 'rpg';
  base: Record<string, number> = {};
  custom: Record<string, StatValue> = {};

  toJSON(): Record<string, unknown> {
    return { template: this.template, base: this.base, custom: this.custom };
  }

  fromJSON(data: Record<string, unknown>): void {
    this.template = (data.template as StatTemplate) ?? 'rpg';
    this.base = (data.base as Record<string, number>) ?? {};
    this.custom = (data.custom as Record<string, StatValue>) ?? {};
  }

  getStat(name: string): number | undefined {
    if (name in this.base) return this.base[name];
    const c = this.custom[name];
    if (c && c.type === 'number') return c.value as number;
    return undefined;
  }
}
