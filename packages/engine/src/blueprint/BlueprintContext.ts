export interface ActiveTimer {
  id: string;
  remaining: number;
  callback: () => void;
}

export interface PendingDelay {
  nodeId: string;
  remaining: number;
  resumePort: string;
  resumeData: Record<string, unknown>;
}

export class BlueprintContext {
  readonly entityId: string;
  variables = new Map<string, unknown>();
  activeTimers: ActiveTimer[] = [];
  pendingDelays: PendingDelay[] = [];
  callStack: string[] = [];
  private stepCount = 0;
  readonly maxStepsPerFrame = 1000;

  constructor(entityId: string) {
    this.entityId = entityId;
  }

  getVariable(key: string): unknown {
    return this.variables.get(key);
  }

  setVariable(key: string, value: unknown): void {
    this.variables.set(key, value);
  }

  addTimer(id: string, duration: number, callback: () => void): void {
    this.activeTimers.push({ id, remaining: duration, callback });
  }

  removeTimer(id: string): void {
    this.activeTimers = this.activeTimers.filter(t => t.id !== id);
  }

  addDelay(nodeId: string, duration: number, resumePort: string, resumeData: Record<string, unknown>): void {
    this.pendingDelays.push({ nodeId, remaining: duration, resumePort, resumeData });
  }

  tickTimers(dt: number): ActiveTimer[] {
    const fired: ActiveTimer[] = [];
    for (const timer of this.activeTimers) {
      timer.remaining -= dt;
      if (timer.remaining <= 0) {
        fired.push(timer);
      }
    }
    this.activeTimers = this.activeTimers.filter(t => t.remaining > 0);
    return fired;
  }

  tickDelays(dt: number): PendingDelay[] {
    const ready: PendingDelay[] = [];
    for (const delay of this.pendingDelays) {
      delay.remaining -= dt;
      if (delay.remaining <= 0) {
        ready.push(delay);
      }
    }
    this.pendingDelays = this.pendingDelays.filter(d => d.remaining > 0);
    return ready;
  }

  resetSteps(): void {
    this.stepCount = 0;
  }

  incrementSteps(): boolean {
    this.stepCount++;
    return this.stepCount <= this.maxStepsPerFrame;
  }

  toJSON(): Record<string, unknown> {
    const vars: Record<string, unknown> = {};
    for (const [k, v] of this.variables) {
      vars[k] = v;
    }
    return { entityId: this.entityId, variables: vars };
  }
}
