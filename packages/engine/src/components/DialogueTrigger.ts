import { Component } from '../ecs/Component';

export class DialogueTrigger extends Component {
  static readonly typeName = 'dialogueTrigger';

  blueprintId = '';
  interactRange = 32;

  toJSON(): Record<string, unknown> {
    return { blueprintId: this.blueprintId, interactRange: this.interactRange };
  }

  fromJSON(data: Record<string, unknown>): void {
    this.blueprintId = (data.blueprintId as string) ?? '';
    this.interactRange = (data.interactRange as number) ?? 32;
  }
}
