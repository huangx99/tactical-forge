// Core
export { Engine } from './Engine';
export type { EngineConfig } from './Engine';
export { Entity } from './ecs/Entity';
export { Component } from './ecs/Component';
export { System } from './ecs/System';

// Components
export { Transform } from './components/Transform';
export { Sprite } from './components/Sprite';
export { Collider } from './components/Collider';
export { Health } from './components/Health';
export { PlayerController } from './components/PlayerController';
export { Inventory } from './components/Inventory';
export type { InventorySlot } from './components/Inventory';
export { Stats } from './components/Stats';
export { Equipment } from './components/Equipment';
export { SkillBar } from './components/SkillBar';
export type { SkillSlot } from './components/SkillBar';
export { StatusEffects } from './components/StatusEffects';
export type { ActiveStatusEffect } from './components/StatusEffects';
export { DialogueTrigger } from './components/DialogueTrigger';
export { BlueprintComponent } from './components/Blueprint';
export { Tag } from './components/Tag';
export { Loot } from './components/Loot';
export { Name } from './components/Name';

// Systems
export { RenderSystem } from './systems/RenderSystem';
export { InputSystem } from './systems/InputSystem';
export type { InputState } from './systems/InputSystem';
export { PhysicsSystem } from './systems/PhysicsSystem';
export type { CollisionEvent } from './systems/PhysicsSystem';
export { PlayerSystem } from './systems/PlayerSystem';
export type { MovementMode } from './systems/PlayerSystem';
export { CameraSystem } from './systems/CameraSystem';
export type { CameraConfig } from './systems/CameraSystem';
export { ScriptSystem } from './systems/ScriptSystem';

// Events
export { EventBus } from './events/EventBus';
export type { EventHandler } from './events/EventBus';
export type { GameEvent } from './events/GameEvent';

// Input
export { InputActionMapper } from './input/InputActionMapper';
export type { InputAction } from './input/InputActionMapper';

// Blueprint
export { BlueprintRuntime } from './blueprint/BlueprintRuntime';
export { BlueprintContext } from './blueprint/BlueprintContext';
export type { ActiveTimer, PendingDelay } from './blueprint/BlueprintContext';
export { getExecutor, registerExecutor } from './blueprint/NodeExecutors';
export type { NodeExecutor, ExecutorServices } from './blueprint/NodeExecutors';

// State
export { GameFlags } from './state/GameFlags';

// Managers
export { DialogueManager } from './dialogue/DialogueManager';
export type { ActiveDialogue } from './dialogue/DialogueManager';
export { EntitySpawner } from './spawn/EntitySpawner';
export type { PrefabDef } from './spawn/EntitySpawner';
export { AudioManager } from './audio/AudioManager';
export { SaveManager } from './save/SaveManager';
export type { SaveData } from './save/SaveManager';
