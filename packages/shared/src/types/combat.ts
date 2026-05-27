export type DamageElement = 'physical' | 'fire' | 'ice' | 'lightning' | 'poison' | 'holy' | 'dark';

export interface CombatStats {
  attack: number;
  defense: number;
  speed: number;
  critRate?: number;
  critDamage?: number;
  elementResist?: Partial<Record<DamageElement, number>>;
}

export interface StatusEffectDef {
  id: string;
  name: string;
  icon?: string;
  type: 'buff' | 'debuff';
  duration: number;
  stackable: boolean;
  maxStacks?: number;
  tickInterval?: number;
  effects: StatusTickEffect[];
  onApply?: string;
  onRemove?: string;
  visualEffect?: string;
  immunity?: string[];
}

export interface StatusTickEffect {
  type: 'damageOverTime' | 'healOverTime' | 'statModify';
  value: number;
  element?: DamageElement;
  stat?: string;
}

export interface LootTable {
  id: string;
  entries: LootEntry[];
  guaranteed?: string[];
  rollCount: { min: number; max: number };
}

export interface LootEntry {
  itemId: string;
  min: number;
  max: number;
  weight: number;
}
