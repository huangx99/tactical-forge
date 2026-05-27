export interface GameUISchema {
  screens: UIScreen[];
}

export interface UIScreen {
  id: string;
  name: string;
  type: 'hud' | 'menu' | 'dialogue' | 'inventory';
  elements: UIElement[];
}

export type UIElementType = 'healthBar' | 'mpBar' | 'text' | 'button' | 'image' | 'panel' | 'slot';

export interface UIElement {
  id: string;
  type: UIElementType;
  position: { x: number; y: number };
  size?: { w: number; h: number };
  properties: Record<string, unknown>;
}
