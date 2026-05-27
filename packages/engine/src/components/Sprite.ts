import { Component } from '../ecs/Component';

export class Sprite extends Component {
  static readonly typeName = 'sprite';

  textureId = '';
  anchorX = 0.5;
  anchorY = 0.5;
  visible = true;

  toJSON(): Record<string, unknown> {
    return { textureId: this.textureId, anchorX: this.anchorX, anchorY: this.anchorY, visible: this.visible };
  }

  fromJSON(data: Record<string, unknown>): void {
    this.textureId = (data.textureId as string) ?? '';
    this.anchorX = (data.anchorX as number) ?? 0.5;
    this.anchorY = (data.anchorY as number) ?? 0.5;
    this.visible = (data.visible as boolean) ?? true;
  }
}
