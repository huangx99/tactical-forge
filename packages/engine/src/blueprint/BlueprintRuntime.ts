import { Blueprint, BlueprintNode, BlueprintEdge } from '@tactical-forge/shared';
import { Entity } from '../ecs/Entity';
import { EventBus } from '../events/EventBus';
import { GameEvent } from '../events/GameEvent';
import { GameFlags } from '../state/GameFlags';
import { Tag } from '../components/Tag';
import { Transform } from '../components/Transform';
import { Name } from '../components/Name';
import { BlueprintContext } from './BlueprintContext';
import { getExecutor, ExecutorServices } from './NodeExecutors';

const EVENT_TO_NODE: Record<string, string> = {
  'entity.start': 'event/onStart',
  'input.interact': 'event/onInteract',
  'collision.enter': 'event/onCollision',
  'timer.complete': 'event/onTimer',
  'entity.death': 'event/onDeath',
  'entity.damaged': 'event/onDamaged',
  'statusEffect.tick': 'event/onStatusTick',
  'input.move': 'event/onMove',
  'input.jump': 'event/onJump',
  'input.attack': 'event/onAttack',
  'input.skill': 'event/onSkill',
  'input.keydown': 'event/onKeyDown',
  'input.keyup': 'event/onKeyUp',
  'input.keyHeld': 'event/onKeyHeld',
};

// Data-only node types (no execution pins, only data pins)
const DATA_ONLY_NODES = new Set([
  'math/add', 'math/multiply', 'math/clamp', 'math/random',
  'value/number', 'value/string', 'value/boolean',
  'string/concat',
  'action/getName',
]);

export class BlueprintRuntime {
  private services: ExecutorServices;
  private onTimerEvent: (entityId: string, timerId: string) => void;

  constructor(
    eventBus: EventBus,
    gameFlags: GameFlags,
    entityGetter: (id: string) => Entity | undefined
  ) {
    this.services = { eventBus, gameFlags, entityGetter };
    this.onTimerEvent = (entityId, timerId) => {
      eventBus.emit('timer.complete', { entityId, timerId }, entityId);
    };
  }

  setService<K extends keyof ExecutorServices>(key: K, value: ExecutorServices[K]): void {
    this.services[key] = value;
  }

  handleEvent(
    event: GameEvent,
    blueprints: Blueprint[],
    entity: Entity,
    context: BlueprintContext
  ): void {
    const nodeType = EVENT_TO_NODE[event.type];
    if (!nodeType) return;

    for (const blueprint of blueprints) {
      const eventNodes = blueprint.nodes.filter(n => n.type === nodeType);

      for (const eventNode of eventNodes) {
        // For collision events, filter by targetTag
        if (nodeType === 'event/onCollision' && eventNode.data.targetTag) {
          const otherId = event.data.otherId as string;
          const other = this.services.entityGetter(otherId);
          if (other) {
            const tagComp = other.getComponent(Tag);
            if (tagComp && !tagComp.tags.includes(eventNode.data.targetTag as string)) {
              continue;
            }
          }
        }
        this.executeFromNode(blueprint, eventNode, 'out', event.data, entity, context);
      }
    }
  }

  executeFromNode(
    blueprint: Blueprint,
    startNode: BlueprintNode,
    startPort: string,
    data: Record<string, unknown>,
    entity: Entity,
    context: BlueprintContext
  ): void {
    context.resetSteps();
    this.traverse(blueprint, startNode, startPort, data, entity, context);
  }

  /**
   * Resolve all data input values for a node.
   * For each data input, check if there's a connected data edge.
   * If yes, evaluate the source node's data output.
   * If no, use the default value from node.data or the pin definition.
   */
  private resolveDataInputs(
    blueprint: Blueprint,
    node: BlueprintNode,
    eventData: Record<string, unknown>,
    entity?: Entity
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    // Find all data edges targeting this node
    const dataEdges = blueprint.edges.filter(
      e => e.type === 'data' && e.target === node.id
    );

    for (const edge of dataEdges) {
      const dataInputId = edge.targetPort.replace('data-in-', '');
      const sourceNode = blueprint.nodes.find(n => n.id === edge.source);
      if (!sourceNode) continue;

      const value = this.evaluateDataOutput(blueprint, sourceNode, edge.sourcePort, eventData, entity);
      result[dataInputId] = value;
    }

    return result;
  }

  /**
   * Evaluate a data output from a node.
   */
  private evaluateDataOutput(
    blueprint: Blueprint,
    node: BlueprintNode,
    outputPort: string,
    eventData: Record<string, unknown>,
    entity?: Entity
  ): unknown {
    const dataOutputId = outputPort.replace('data-out-', '');

    // Event nodes: data outputs come from eventData
    if (node.type.startsWith('event/')) {
      return eventData[dataOutputId];
    }

    // Data-only or data-producing nodes: evaluate recursively
    if (DATA_ONLY_NODES.has(node.type) || node.type === 'action/getPosition') {
      return this.evaluateDataNode(blueprint, node, eventData, entity, dataOutputId);
    }

    // Other nodes: read from node.data
    return node.data[dataOutputId];
  }

  /**
   * Evaluate a data-only / data-producing node.
   */
  private evaluateDataNode(
    blueprint: Blueprint,
    node: BlueprintNode,
    eventData: Record<string, unknown>,
    entity?: Entity,
    outputPortId?: string
  ): unknown {
    const inputs = this.resolveDataInputs(blueprint, node, eventData, entity);
    const mergedData = { ...node.data };
    for (const [key, value] of Object.entries(inputs)) {
      if (value !== undefined) mergedData[key] = value;
    }

    switch (node.type) {
      case 'math/add':
        return (Number(mergedData.a) || 0) + (Number(mergedData.b) || 0);
      case 'math/multiply':
        return (Number(mergedData.a) || 0) * (Number(mergedData.b) || 0);
      case 'math/clamp': {
        const val = Number(mergedData.value) || 0;
        const min = Number(mergedData.min) ?? 0;
        const max = Number(mergedData.max) ?? 100;
        return Math.max(min, Math.min(max, val));
      }
      case 'math/random': {
        const min = Number(mergedData.min) || 0;
        const max = Number(mergedData.max) || 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      case 'value/number':
        return Number(mergedData.value) || 0;
      case 'value/string':
        return String(mergedData.value ?? '');
      case 'value/boolean':
        return Boolean(mergedData.value);
      case 'value/key':
        return String(mergedData.value ?? '');
      case 'string/concat':
        return String(mergedData.a ?? '') + String(mergedData.b ?? '');
      case 'action/getPosition': {
        if (!entity) return 0;
        const transform = entity.getComponent(Transform);
        if (outputPortId === 'x') return transform?.x ?? 0;
        if (outputPortId === 'y') return transform?.y ?? 0;
        return transform?.x ?? 0;
      }
      case 'action/getName': {
        const targetId = String(mergedData.entityId ?? '') || entity?.id;
        if (!targetId) return '';
        const target = this.services.entityGetter(targetId);
        if (!target) return '';
        const nameComp = target.getComponent(Name);
        return nameComp?.value ?? '';
      }
      default:
        return undefined;
    }
  }

  private traverse(
    blueprint: Blueprint,
    node: BlueprintNode,
    inputPort: string,
    data: Record<string, unknown>,
    entity: Entity,
    context: BlueprintContext
  ): void {
    if (!context.incrementSteps()) {
      console.warn(`Blueprint step limit exceeded for entity ${entity.id}`);
      return;
    }

    const executor = getExecutor(node.type);
    if (!executor) {
      console.warn(`No executor for node type: ${node.type}`);
      return;
    }

    // Resolve data inputs from connected data edges
    const dataValues = this.resolveDataInputs(blueprint, node, data, entity);

    // Merge event data into dataValues for event nodes
    // (event data outputs like x, y from input.move are available as dataValues)
    const nextPort = executor(context, node, entity, this.services, data, dataValues);

    // Handle blueprintRef special case
    if (node.type === 'flow/blueprintRef' && nextPort === 'out') {
      const targetId = String(dataValues.blueprintId ?? node.data.blueprintId ?? '');
      if (targetId && this.services.blueprintGetter) {
        const targetBlueprint = this.services.blueprintGetter(targetId);
        if (targetBlueprint) {
          this.executeBlueprintRef(targetBlueprint, entity, context, data);
        }
      }
    }

    if (nextPort === null) return; // execution paused (delay)

    // Follow execution edges from the output port
    const outEdges = blueprint.edges.filter(
      e => e.type !== 'data' && e.source === node.id && e.sourcePort === nextPort
    );

    for (const edge of outEdges) {
      const nextNode = blueprint.nodes.find(n => n.id === edge.target);
      if (nextNode) {
        this.traverse(blueprint, nextNode, edge.targetPort, data, entity, context);
      }
    }
  }

  private executeBlueprintRef(
    blueprint: Blueprint,
    entity: Entity,
    context: BlueprintContext,
    data: Record<string, unknown>
  ): void {
    const startNode = blueprint.nodes.find(n => n.type === 'event/onStart');
    if (!startNode) return;

    context.callStack.push(blueprint.id);
    context.resetSteps();

    const outEdges = blueprint.edges.filter(
      e => e.type !== 'data' && e.source === startNode.id && e.sourcePort === 'out'
    );

    for (const edge of outEdges) {
      const nextNode = blueprint.nodes.find(n => n.id === edge.target);
      if (nextNode) {
        this.traverse(blueprint, nextNode, edge.targetPort, data, entity, context);
      }
    }

    context.callStack.pop();
  }

  updateTimersAndDelays(
    context: BlueprintContext,
    dt: number,
    blueprints: Blueprint[],
    entity: Entity
  ): void {
    const firedTimers = context.tickTimers(dt);
    for (const timer of firedTimers) {
      timer.callback();
      this.onTimerEvent(entity.id, timer.id);
    }

    const readyDelays = context.tickDelays(dt);
    for (const delay of readyDelays) {
      for (const blueprint of blueprints) {
        const node = blueprint.nodes.find(n => n.id === delay.nodeId);
        if (node) {
          this.traverse(blueprint, node, delay.resumePort, delay.resumeData, entity, context);
          break;
        }
      }
    }
  }
}
