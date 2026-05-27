import { EventBus } from '../events/EventBus';

export interface ActiveDialogue {
  entityId: string;
  text: string;
  choices?: string[];
  resolved: boolean;
}

export class DialogueManager {
  private activeDialogue: ActiveDialogue | null = null;

  constructor(private eventBus: EventBus) {}

  startDialogue(entityId: string, text: string, choices?: string[]): void {
    this.activeDialogue = { entityId, text, choices, resolved: false };
  }

  choose(index: number): void {
    if (!this.activeDialogue) return;
    this.activeDialogue.resolved = true;
    this.eventBus.emit('dialogue.choice', {
      entityId: this.activeDialogue.entityId,
      index,
    }, this.activeDialogue.entityId);
    this.eventBus.emit('dialogue.end', {
      entityId: this.activeDialogue.entityId,
    }, this.activeDialogue.entityId);
    this.activeDialogue = null;
  }

  close(): void {
    if (!this.activeDialogue) return;
    this.eventBus.emit('dialogue.end', {
      entityId: this.activeDialogue.entityId,
    }, this.activeDialogue.entityId);
    this.activeDialogue = null;
  }

  isActive(): boolean {
    return this.activeDialogue !== null;
  }

  getActive(): ActiveDialogue | null {
    return this.activeDialogue;
  }
}
