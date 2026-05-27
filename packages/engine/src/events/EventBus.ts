import { GameEvent } from './GameEvent';

export type EventHandler = (event: GameEvent) => void;

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private pendingQueue: GameEvent[] = [];

  on(pattern: string, handler: EventHandler): void {
    let set = this.handlers.get(pattern);
    if (!set) {
      set = new Set();
      this.handlers.set(pattern, set);
    }
    set.add(handler);
  }

  off(pattern: string, handler: EventHandler): void {
    const set = this.handlers.get(pattern);
    if (set) {
      set.delete(handler);
      if (set.size === 0) this.handlers.delete(pattern);
    }
  }

  emit(type: string, data: Record<string, unknown> = {}, sourceId?: string): void {
    const event: GameEvent = {
      type,
      data,
      timestamp: performance.now(),
      sourceId,
    };
    this.dispatch(event);
  }

  emitDeferred(type: string, data: Record<string, unknown> = {}, sourceId?: string): void {
    this.pendingQueue.push({
      type,
      data,
      timestamp: performance.now(),
      sourceId,
    });
  }

  processPending(): GameEvent[] {
    const queue = this.pendingQueue;
    this.pendingQueue = [];
    for (const event of queue) {
      this.dispatch(event);
    }
    return queue;
  }

  hasPending(): boolean {
    return this.pendingQueue.length > 0;
  }

  private dispatch(event: GameEvent): void {
    for (const [pattern, set] of this.handlers) {
      if (this.matches(pattern, event.type)) {
        for (const handler of set) {
          handler(event);
        }
      }
    }
  }

  private matches(pattern: string, type: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -1);
      return type.startsWith(prefix);
    }
    return pattern === type;
  }

  clear(): void {
    this.handlers.clear();
    this.pendingQueue = [];
  }
}
