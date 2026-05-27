import { BlueprintNode, Blueprint, BlueprintEdge } from '@tactical-forge/shared';
import { Entity } from '../ecs/Entity';
import { EventBus } from '../events/EventBus';
import { Health } from '../components/Health';
import { Inventory } from '../components/Inventory';
import { StatusEffects } from '../components/StatusEffects';
import { SkillBar } from '../components/SkillBar';
import { Transform } from '../components/Transform';
import { Equipment } from '../components/Equipment';
import { Tag } from '../components/Tag';
import { GameFlags } from '../state/GameFlags';
import { BlueprintContext } from './BlueprintContext';

export interface ExecutorServices {
  eventBus: EventBus;
  gameFlags: GameFlags;
  entityGetter: (id: string) => Entity | undefined;
  spawner?: (prefabId: string, x: number, y: number) => Entity | undefined;
  audioManager?: { playSound(id: string): void };
  dialogueManager?: { startDialogue(entityId: string, text: string, choices?: string[]): void };
  sceneTransition?: (sceneId: string, x: number, y: number) => void;
  blueprintGetter?: (id: string) => Blueprint | undefined;
}

export type NodeExecutor = (
  ctx: BlueprintContext,
  node: BlueprintNode,
  entity: Entity,
  services: ExecutorServices,
  eventData: Record<string, unknown>,
  dataValues?: Record<string, unknown>
) => string | null; // returns next port id or null to stop

const executors = new Map<string, NodeExecutor>();

// ─── Event nodes ───
// Events are entry points, just pass through to 'out'
executors.set('event/onStart', (_ctx, _node, _entity, _services, _data) => 'out');
executors.set('event/onInteract', (_ctx, _node, _entity, _services, _data) => 'out');
executors.set('event/onCollision', (ctx, node, entity, services, data) => {
  const targetTag = node.data.targetTag as string;
  if (targetTag) {
    const otherId = data.otherId as string;
    const other = services.entityGetter(otherId);
    if (other) {
      const tagComp = other.getComponent(Tag);
      if (tagComp && !tagComp.tags.includes(targetTag)) {
        return null; // tag mismatch, stop
      }
    }
  }
  return 'out';
});
executors.set('event/onTimer', (_ctx, _node, _entity, _services, _data) => 'out');
executors.set('event/onDeath', (_ctx, _node, _entity, _services, _data) => 'out');

// ─── Condition nodes ───
executors.set('condition/hasItem', (ctx, node, entity, _services, _data, dataValues) => {
  const inventory = entity.getComponent<Inventory>(Inventory);
  const itemId = String((dataValues?.itemId ?? node.data.itemId) ?? '');
  const quantity = Number((dataValues?.quantity ?? node.data.quantity) ?? 1) || 1;
  const has = inventory?.slots.some(s => s.itemId === itemId && s.quantity >= quantity) ?? false;
  return has ? 'true' : 'false';
});

executors.set('condition/compareValue', (ctx, node, _entity, _services, _data, dataValues) => {
  const a = dataValues?.a ?? node.data.a;
  const b = dataValues?.b ?? node.data.b;
  const left = Number(a);
  const right = Number(b);
  let result = false;
  switch (node.data.operator as string) {
    case '==': result = left === right; break;
    case '!=': result = left !== right; break;
    case '>': result = left > right; break;
    case '<': result = left < right; break;
    case '>=': result = left >= right; break;
    case '<=': result = left <= right; break;
  }
  return result ? 'true' : 'false';
});

executors.set('condition/checkFlag', (_ctx, node, _entity, services, _data, dataValues) => {
  const flag = String((dataValues?.flag ?? node.data.flag) ?? '');
  const result = services.gameFlags.getFlag(flag);
  return result ? 'true' : 'false';
});

executors.set('condition/randomChance', (_ctx, node, _entity, _services, _data, dataValues) => {
  const chance = Number((dataValues?.chance ?? node.data.chance) ?? 50) || 50;
  return Math.random() * 100 < chance ? 'true' : 'false';
});

// ─── Action nodes ───
executors.set('action/showDialogue', (ctx, node, entity, services, _data, dataValues) => {
  const text = String((dataValues?.text ?? node.data.text) ?? '');
  const choicesRaw = String(node.data.choices ?? '');
  const choices = choicesRaw ? choicesRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;
  services.dialogueManager?.startDialogue(entity.id, text, choices);
  services.eventBus.emit('dialogue.start', { entityId: entity.id, text, choices }, entity.id);
  return 'out';
});

executors.set('action/addItem', (_ctx, node, entity, _services, _data, dataValues) => {
  const inventory = entity.getComponent<Inventory>(Inventory);
  if (!inventory) return 'out';
  const itemId = String((dataValues?.itemId ?? node.data.itemId) ?? '');
  const quantity = Number((dataValues?.quantity ?? node.data.quantity) ?? 1) || 1;
  const existing = inventory.slots.find(s => s.itemId === itemId);
  if (existing) {
    existing.quantity += quantity;
  } else if (inventory.slots.length < inventory.capacity) {
    inventory.slots.push({ itemId, quantity });
  }
  return 'out';
});

executors.set('action/removeItem', (_ctx, node, entity, _services, _data, dataValues) => {
  const inventory = entity.getComponent<Inventory>(Inventory);
  if (!inventory) return 'out';
  const itemId = String((dataValues?.itemId ?? node.data.itemId) ?? '');
  const quantity = Number((dataValues?.quantity ?? node.data.quantity) ?? 1) || 1;
  const slot = inventory.slots.find(s => s.itemId === itemId);
  if (slot) {
    slot.quantity -= quantity;
    if (slot.quantity <= 0) {
      inventory.slots = inventory.slots.filter(s => s.itemId !== itemId);
    }
  }
  return 'out';
});

executors.set('action/dealDamage', (_ctx, node, entity, services, data, dataValues) => {
  const amount = Number((dataValues?.amount ?? node.data.amount) ?? 10) || 10;
  const targetId = (data.targetId as string) ?? entity.id;
  const target = services.entityGetter(targetId) ?? entity;
  const health = target.getComponent<Health>(Health);
  if (health) {
    health.current = Math.max(0, health.current - amount);
    services.eventBus.emit('entity.damaged', {
      entityId: target.id,
      amount,
      sourceId: entity.id,
    }, entity.id);
    if (health.current <= 0) {
      services.eventBus.emit('entity.death', {
        entityId: target.id,
        killerId: entity.id,
      }, entity.id);
    }
  }
  return 'out';
});

executors.set('action/heal', (_ctx, node, entity, _services, _data, dataValues) => {
  const amount = Number((dataValues?.amount ?? node.data.amount) ?? 20) || 20;
  const health = entity.getComponent<Health>(Health);
  if (health) {
    health.current = Math.min(health.max, health.current + amount);
  }
  return 'out';
});

executors.set('action/setFlag', (_ctx, node, _entity, services, _data, dataValues) => {
  const flag = String((dataValues?.flag ?? node.data.flag) ?? '');
  const value = node.data.value as boolean;
  services.gameFlags.setFlag(flag, value);
  return 'out';
});

executors.set('action/spawnObject', (_ctx, node, entity, services, _data) => {
  const prefabId = node.data.prefabId as string;
  const x = (node.data.x as number) ?? 0;
  const y = (node.data.y as number) ?? 0;
  services.spawner?.(prefabId, x, y);
  return 'out';
});

executors.set('action/teleport', (_ctx, node, entity, services, _data) => {
  const sceneId = node.data.sceneId as string;
  const x = (node.data.x as number) ?? 0;
  const y = (node.data.y as number) ?? 0;
  if (sceneId) {
    services.sceneTransition?.(sceneId, x, y);
  } else {
    const transform = entity.getComponent<Transform>(Transform);
    if (transform) {
      transform.x = x;
      transform.y = y;
    }
  }
  return 'out';
});

executors.set('action/playSound', (_ctx, node, _entity, services, _data) => {
  const soundId = node.data.soundId as string;
  if (soundId) {
    services.audioManager?.playSound(soundId);
  }
  return 'out';
});

executors.set('action/applyStatus', (_ctx, node, entity, services, _data) => {
  const statusId = node.data.statusId as string;
  const duration = (node.data.duration as number) ?? 5;
  let statusComp = entity.getComponent<StatusEffects>(StatusEffects);
  if (!statusComp) {
    statusComp = new StatusEffects();
    entity.addComponent(statusComp);
  }
  const existing = statusComp.active.find(s => s.statusId === statusId);
  if (existing) {
    existing.stacks++;
    existing.remainingDuration = duration;
  } else {
    statusComp.active.push({ statusId, stacks: 1, remainingDuration: duration, tickTimer: 0 });
  }
  services.eventBus.emit('statusEffect.applied', { entityId: entity.id, statusId, duration }, entity.id);
  return 'out';
});

// ─── Flow nodes ───
executors.set('flow/sequence', (_ctx, _node, _entity, _services, _data) => 'out1');

executors.set('flow/delay', (ctx, node, _entity, _services, _data) => {
  const duration = (node.data.duration as number) ?? 1;
  ctx.addDelay(node.id, duration, 'out', {});
  return null; // stop execution, will resume after delay
});

executors.set('flow/loop', (ctx, node, _entity, _services, _data) => {
  const count = (node.data.count as number) ?? 3;
  const loopVar = `__loop_${node.id}`;
  const current = (ctx.getVariable(loopVar) as number) ?? 0;
  if (current < count) {
    ctx.setVariable(loopVar, current + 1);
    return 'body';
  } else {
    ctx.variables.delete(loopVar);
    return 'done';
  }
});

executors.set('flow/blueprintRef', (ctx, node, entity, services, _data) => {
  const targetId = node.data.blueprintId as string;
  if (!targetId || !services.blueprintGetter) return 'out';
  const targetBlueprint = services.blueprintGetter(targetId);
  if (!targetBlueprint) return 'out';

  // Circular reference check
  if (ctx.callStack.includes(targetId)) {
    console.warn(`Circular blueprint reference detected: ${targetId}`);
    return 'out';
  }

  ctx.callStack.push(targetId);
  // The actual execution happens in BlueprintRuntime.executeBlueprintRef
  // This executor just signals the runtime to handle it
  return 'out';
});

// ─── Additional Event nodes ───
executors.set('event/onDamaged', (_ctx, _node, _entity, _services, _data) => 'out');
executors.set('event/onStatusTick', (_ctx, _node, _entity, _services, _data) => 'out');
executors.set('event/onMove', (_ctx, _node, _entity, _services, _data) => 'out');
executors.set('event/onJump', (_ctx, _node, _entity, _services, _data) => 'out');
executors.set('event/onAttack', (_ctx, _node, _entity, _services, _data) => 'out');
executors.set('event/onSkill', (_ctx, _node, _entity, _services, _data) => 'out');

// Key events: filter by key if specified in node data
executors.set('event/onKeyDown', (_ctx, node, _entity, _services, data) => {
  const filterKey = String(node.data.key ?? '').toLowerCase();
  if (filterKey) {
    const pressedKey = String(data.key ?? '').toLowerCase();
    if (pressedKey !== filterKey) return null; // key mismatch, stop
  }
  return 'out';
});
executors.set('event/onKeyUp', (_ctx, node, _entity, _services, data) => {
  const filterKey = String(node.data.key ?? '').toLowerCase();
  if (filterKey) {
    const releasedKey = String(data.key ?? '').toLowerCase();
    if (releasedKey !== filterKey) return null;
  }
  return 'out';
});
executors.set('event/onKeyHeld', (_ctx, node, _entity, _services, data) => {
  const filterKey = String(node.data.key ?? '').toLowerCase();
  if (filterKey) {
    const heldKey = String(data.key ?? '').toLowerCase();
    if (heldKey !== filterKey) return null;
  }
  return 'out';
});

// ─── Action/move — uses data pins for x, y, speed ───
executors.set('action/move', (_ctx, node, entity, _services, data, dataValues) => {
  const transform = entity.getComponent<Transform>(Transform);
  if (!transform) return 'out';
  const dx = Number((dataValues?.x ?? data.x) as number) || 0;
  const dy = Number((dataValues?.y ?? data.y) as number) || 0;
  const speed = Number((dataValues?.speed ?? node.data.speed) as number) || 3;
  transform.x += dx * speed;
  transform.y += dy * speed;
  return 'out';
});

// action/getPosition — pure data node, reads entity transform
executors.set('action/getPosition', (_ctx, _node, entity, _services, _data) => {
  const transform = entity.getComponent<Transform>(Transform);
  if (!transform) return null;
  // Store result in a way the data pin resolver can find it
  return null; // data-only node, no execution output
});

// action/setPosition — sets entity transform from data inputs (only overrides axes with connected data edges)
executors.set('action/setPosition', (_ctx, _node, entity, _services, _data, dataValues) => {
  const transform = entity.getComponent<Transform>(Transform);
  if (!transform) return 'out';
  if (dataValues?.x !== undefined) transform.x = Number(dataValues.x) || 0;
  if (dataValues?.y !== undefined) transform.y = Number(dataValues.y) || 0;
  return 'out';
});

// ─── Additional Action nodes ───
executors.set('action/useItem', (_ctx, node, entity, services, _data) => {
  const itemId = node.data.itemId as string;
  const inventory = entity.getComponent<Inventory>(Inventory);
  if (!inventory) return 'out';
  const slot = inventory.slots.find(s => s.itemId === itemId);
  if (slot && slot.quantity > 0) {
    services.eventBus.emit('item.used', { entityId: entity.id, itemId }, entity.id);
    slot.quantity--;
    if (slot.quantity <= 0) {
      inventory.slots = inventory.slots.filter(s => s.itemId !== itemId);
    }
  }
  return 'out';
});

executors.set('action/equipItem', (_ctx, node, entity, services, _data) => {
  const itemId = node.data.itemId as string;
  const slotId = (node.data.slot as string) ?? 'mainHand';
  const equipment = entity.getComponent<Equipment>(Equipment);
  const inventory = entity.getComponent<Inventory>(Inventory);
  if (!equipment || !inventory) return 'out';

  const invSlot = inventory.slots.find(s => s.itemId === itemId);
  if (!invSlot) return 'out';

  // Unequip current item in slot if any
  const currentEquipped = equipment.slots.find(s => s.slotId === slotId);
  if (currentEquipped?.itemId) {
    inventory.slots.push({ itemId: currentEquipped.itemId, quantity: 1 });
  }

  // Equip new item
  if (currentEquipped) {
    currentEquipped.itemId = itemId;
  } else {
    equipment.slots.push({ slotId, itemId });
  }

  // Remove from inventory
  invSlot.quantity--;
  if (invSlot.quantity <= 0) {
    inventory.slots = inventory.slots.filter(s => s.itemId !== itemId);
  }

  services.eventBus.emit('item.equipped', { entityId: entity.id, itemId, slot: slotId }, entity.id);
  return 'out';
});

executors.set('action/unequipItem', (_ctx, node, entity, services, _data) => {
  const slotId = (node.data.slot as string) ?? 'mainHand';
  const equipment = entity.getComponent<Equipment>(Equipment);
  const inventory = entity.getComponent<Inventory>(Inventory);
  if (!equipment || !inventory) return 'out';

  const equipSlot = equipment.slots.find(s => s.slotId === slotId);
  if (!equipSlot?.itemId) return 'out';

  // Move to inventory
  const existing = inventory.slots.find(s => s.itemId === equipSlot.itemId);
  if (existing) {
    existing.quantity++;
  } else if (inventory.slots.length < inventory.capacity) {
    inventory.slots.push({ itemId: equipSlot.itemId, quantity: 1 });
  }

  equipSlot.itemId = null;
  services.eventBus.emit('item.unequipped', { entityId: entity.id, slot: slotId }, entity.id);
  return 'out';
});

executors.set('action/castSkill', (_ctx, node, entity, services, _data) => {
  const skillId = node.data.skillId as string;
  const slot = node.data.slot as number;
  const skillBar = entity.getComponent<SkillBar>(SkillBar);
  if (!skillBar) return 'out';

  let skillSlot: { skillId: string; cooldownRemaining: number } | undefined;
  if (slot >= 0) {
    skillSlot = skillBar.slots[slot];
  } else {
    skillSlot = skillBar.slots.find(s => s.skillId === skillId);
  }

  if (!skillSlot || skillSlot.cooldownRemaining > 0) return 'out';
  services.eventBus.emit('skill.cast', { entityId: entity.id, skillId: skillSlot.skillId, slot }, entity.id);
  return 'out';
});

executors.set('action/learnSkill', (_ctx, node, entity, services, _data) => {
  const skillId = node.data.skillId as string;
  const skillBar = entity.getComponent<SkillBar>(SkillBar);
  if (!skillBar) return 'out';
  if (skillBar.slots.some(s => s.skillId === skillId)) return 'out'; // already known
  if (skillBar.slots.length >= skillBar.maxSlots) return 'out'; // full
  skillBar.slots.push({ skillId, cooldownRemaining: 0 });
  services.eventBus.emit('skill.learned', { entityId: entity.id, skillId }, entity.id);
  return 'out';
});

executors.set('action/setCooldown', (_ctx, node, entity, _services, _data) => {
  const skillId = node.data.skillId as string;
  const cooldown = (node.data.cooldown as number) ?? 0;
  const skillBar = entity.getComponent<SkillBar>(SkillBar);
  if (!skillBar) return 'out';
  const slot = skillBar.slots.find(s => s.skillId === skillId);
  if (slot) {
    slot.cooldownRemaining = cooldown;
  }
  return 'out';
});

executors.set('action/removeStatus', (_ctx, node, entity, services, _data) => {
  const statusId = node.data.statusId as string;
  const statusComp = entity.getComponent<StatusEffects>(StatusEffects);
  if (!statusComp) return 'out';
  statusComp.active = statusComp.active.filter(s => s.statusId !== statusId);
  services.eventBus.emit('statusEffect.removed', { entityId: entity.id, statusId }, entity.id);
  return 'out';
});

executors.set('action/clearAllStatus', (_ctx, _node, entity, services, _data) => {
  const statusComp = entity.getComponent<StatusEffects>(StatusEffects);
  if (!statusComp) return 'out';
  statusComp.active = [];
  services.eventBus.emit('statusEffect.cleared', { entityId: entity.id }, entity.id);
  return 'out';
});

executors.set('action/rollLoot', (_ctx, node, entity, services, _data) => {
  const lootTableId = node.data.lootTableId as string;
  services.eventBus.emit('loot.roll', { entityId: entity.id, lootTableId }, entity.id);
  return 'out';
});

executors.set('action/setVariable', (ctx, node, _entity, _services, _data) => {
  const variable = node.data.variable as string;
  const value = node.data.value;
  ctx.setVariable(variable, value);
  return 'out';
});

executors.set('action/getVariable', (ctx, node, _entity, _services, _data) => {
  const variable = node.data.variable as string;
  ctx.getVariable(variable); // just reads, value is in context
  return 'out';
});

executors.set('action/emitEvent', (_ctx, node, entity, services, _data) => {
  const eventType = node.data.eventType as string;
  let eventData = {};
  try {
    eventData = JSON.parse(node.data.eventData as string ?? '{}');
  } catch { /* ignore parse errors */ }
  services.eventBus.emit(eventType, { ...eventData, entityId: entity.id }, entity.id);
  return 'out';
});

executors.set('action/log', (_ctx, node, entity, services, _data, dataValues) => {
  const text = String((dataValues?.text ?? node.data.text) ?? '');
  const duration = Number((dataValues?.duration ?? node.data.duration) ?? 3) || 3;
  services.eventBus.emit('log.new', { text, duration, entityId: entity.id }, entity.id);
  return 'out';
});

// ─── Additional Condition nodes ───
executors.set('condition/skillReady', (_ctx, node, entity, _services, _data) => {
  const skillId = node.data.skillId as string;
  const skillBar = entity.getComponent<SkillBar>(SkillBar);
  if (!skillBar) return 'false';
  const slot = skillBar.slots.find(s => s.skillId === skillId);
  return slot && slot.cooldownRemaining <= 0 ? 'true' : 'false';
});

executors.set('condition/hasSkill', (_ctx, node, entity, _services, _data) => {
  const skillId = node.data.skillId as string;
  const skillBar = entity.getComponent<SkillBar>(SkillBar);
  if (!skillBar) return 'false';
  return skillBar.slots.some(s => s.skillId === skillId) ? 'true' : 'false';
});

executors.set('condition/hasStatus', (_ctx, node, entity, _services, _data) => {
  const statusId = node.data.statusId as string;
  const statusComp = entity.getComponent<StatusEffects>(StatusEffects);
  if (!statusComp) return 'false';
  return statusComp.active.some(s => s.statusId === statusId) ? 'true' : 'false';
});

executors.set('condition/isAlive', (_ctx, _node, entity, _services, _data) => {
  const health = entity.getComponent<Health>(Health);
  return health && health.current > 0 ? 'true' : 'false';
});

export function getExecutor(type: string): NodeExecutor | undefined {
  return executors.get(type);
}

export function registerExecutor(type: string, executor: NodeExecutor): void {
  executors.set(type, executor);
}
