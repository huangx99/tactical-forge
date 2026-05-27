import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';

export interface InputState {
  keys: Set<string>;
  justPressed: Set<string>;
  justReleased: Set<string>;
  mouseX: number;
  mouseY: number;
  mouseDown: boolean;
  interact: boolean;
}

export class InputSystem extends System {
  readonly name = 'input';
  readonly state: InputState = {
    keys: new Set(),
    justPressed: new Set(),
    justReleased: new Set(),
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    interact: false,
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.state.keys.has(e.key)) {
      this.state.justPressed.add(e.key);
    }
    this.state.keys.add(e.key);
  };
  private handleKeyUp = (e: KeyboardEvent) => {
    this.state.keys.delete(e.key);
    this.state.justReleased.add(e.key);
  };
  private handleMouseMove = (e: MouseEvent) => { this.state.mouseX = e.clientX; this.state.mouseY = e.clientY; };
  private handleMouseDown = () => { this.state.mouseDown = true; };
  private handleMouseUp = () => { this.state.mouseDown = false; };

  constructor(private canvas?: HTMLCanvasElement) {
    super();
  }

  init(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    if (this.canvas) {
      this.canvas.addEventListener('mousemove', this.handleMouseMove);
      this.canvas.addEventListener('mousedown', this.handleMouseDown);
      this.canvas.addEventListener('mouseup', this.handleMouseUp);
    }
  }

  update(_entities: Entity[]): void {
    // Process interact input
    this.state.interact = this.state.justPressed.has('e') || this.state.justPressed.has('E') || this.state.justPressed.has('Enter');
    // NOTE: justPressed/justReleased are cleared by InputActionMapper after it reads them
  }

  clearTransient(): void {
    this.state.justPressed.clear();
    this.state.justReleased.clear();
  }

  isKeyDown(key: string): boolean {
    return this.state.keys.has(key.toLowerCase()) || this.state.keys.has(key.toUpperCase());
  }

  isKeyJustPressed(key: string): boolean {
    return this.state.justPressed.has(key) || this.state.justPressed.has(key.toLowerCase()) || this.state.justPressed.has(key.toUpperCase());
  }

  isKeyJustReleased(key: string): boolean {
    return this.state.justReleased.has(key) || this.state.justReleased.has(key.toLowerCase()) || this.state.justReleased.has(key.toUpperCase());
  }

  getJustPressedKeys(): string[] {
    return [...this.state.justPressed];
  }

  getJustReleasedKeys(): string[] {
    return [...this.state.justReleased];
  }

  getHeldKeys(): string[] {
    return [...this.state.keys];
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('mousedown', this.handleMouseDown);
      this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    }
  }
}
