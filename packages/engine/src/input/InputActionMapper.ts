import { InputSystem } from '../systems/InputSystem';
import { EventBus } from '../events/EventBus';
import { Entity } from '../ecs/Entity';
import { System } from '../ecs/System';

export interface InputAction {
  name: string;
  type: 'digital' | 'axis1D' | 'axis2D';
  bindings: { key: string; scale: number }[];
}

const DEFAULT_ACTIONS: InputAction[] = [
  {
    name: 'move',
    type: 'axis2D',
    bindings: [
      { key: 'd', scale: 1 }, { key: 'D', scale: 1 },
      { key: 'ArrowRight', scale: 1 },
      { key: 'a', scale: -1 }, { key: 'A', scale: -1 },
      { key: 'ArrowLeft', scale: -1 },
      { key: 's', scale: 1 }, { key: 'S', scale: 1 },
      { key: 'ArrowDown', scale: 1 },
      { key: 'w', scale: -1 }, { key: 'W', scale: -1 },
      { key: 'ArrowUp', scale: -1 },
    ],
  },
  {
    name: 'interact',
    type: 'digital',
    bindings: [
      { key: 'e', scale: 1 }, { key: 'E', scale: 1 },
      { key: 'Enter', scale: 1 },
    ],
  },
  {
    name: 'jump',
    type: 'digital',
    bindings: [
      { key: ' ', scale: 1 },
    ],
  },
  {
    name: 'attack',
    type: 'digital',
    bindings: [
      { key: 'j', scale: 1 }, { key: 'J', scale: 1 },
    ],
  },
  {
    name: 'skill_1',
    type: 'digital',
    bindings: [{ key: '1', scale: 1 }],
  },
  {
    name: 'skill_2',
    type: 'digital',
    bindings: [{ key: '2', scale: 1 }],
  },
  {
    name: 'skill_3',
    type: 'digital',
    bindings: [{ key: '3', scale: 1 }],
  },
  {
    name: 'skill_4',
    type: 'digital',
    bindings: [{ key: '4', scale: 1 }],
  },
];

export class InputActionMapper extends System {
  readonly name = 'inputActionMapper';
  private actions: InputAction[];
  private prevMoveX = 0;
  private prevMoveY = 0;

  constructor(
    private inputSystem: InputSystem,
    private eventBus: EventBus,
    customActions?: InputAction[]
  ) {
    super();
    this.actions = customActions ?? [...DEFAULT_ACTIONS];
  }

  addAction(action: InputAction): void {
    this.actions.push(action);
  }

  update(_entities: Entity[]): void {
    // Read justPressed/justReleased before they're cleared
    const justPressed = this.inputSystem.getJustPressedKeys();
    const justReleased = this.inputSystem.getJustReleasedKeys();

    // Emit per-key events for blueprint system
    for (const key of justPressed) {
      this.eventBus.emit('input.keydown', { key });
    }
    for (const key of justReleased) {
      this.eventBus.emit('input.keyup', { key });
    }

    // Emit held events for all currently held keys (fires every frame)
    for (const key of this.inputSystem.getHeldKeys()) {
      this.eventBus.emit('input.keyHeld', { key });
    }

    // Process axis2D actions (move)
    let moveX = 0;
    let moveY = 0;

    for (const action of this.actions) {
      if (action.type === 'axis2D') {
        for (const binding of action.bindings) {
          if (this.inputSystem.isKeyDown(binding.key)) {
            // X axis: right (+1) keys, left (-1) keys
            // Y axis: down (+1) keys, up (-1) keys
            if (binding.scale > 0) {
              if (['d', 'D', 'ArrowRight', 'a', 'A', 'ArrowLeft'].includes(binding.key)) {
                moveX += binding.scale;
              } else {
                moveY += binding.scale;
              }
            } else {
              if (['a', 'A', 'ArrowLeft', 'd', 'D', 'ArrowRight'].includes(binding.key)) {
                moveX += binding.scale;
              } else {
                moveY += binding.scale;
              }
            }
          }
        }
      }
    }

    // Normalize diagonal
    if (moveX !== 0 && moveY !== 0) {
      const len = Math.sqrt(moveX * moveX + moveY * moveY);
      moveX /= len;
      moveY /= len;
    }

    // Emit move event if changed
    if (moveX !== this.prevMoveX || moveY !== this.prevMoveY) {
      this.eventBus.emit('input.move', { x: moveX, y: moveY });
      this.prevMoveX = moveX;
      this.prevMoveY = moveY;
    }

    // Process digital actions
    for (const action of this.actions) {
      if (action.type === 'digital') {
        for (const binding of action.bindings) {
          if (justPressed.includes(binding.key)) {
            const eventType = `input.${action.name}`;
            if (action.name.startsWith('skill_')) {
              const slot = parseInt(action.name.split('_')[1]) - 1;
              this.eventBus.emit('input.skill', { slot });
            } else {
              this.eventBus.emit(eventType, {});
            }
            break; // one trigger per action per frame
          }
        }
      }
    }

    // Clear transient state after all consumers have read it
    this.inputSystem.clearTransient();
  }
}
