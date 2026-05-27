export class GameFlags {
  private flags = new Map<string, boolean>();
  private variables = new Map<string, unknown>();

  getFlag(key: string): boolean {
    return this.flags.get(key) ?? false;
  }

  setFlag(key: string, value: boolean): void {
    this.flags.set(key, value);
  }

  getVariable(key: string): unknown {
    return this.variables.get(key);
  }

  setVariable(key: string, value: unknown): void {
    this.variables.set(key, value);
  }

  toJSON(): { flags: Record<string, boolean>; variables: Record<string, unknown> } {
    const flags: Record<string, boolean> = {};
    for (const [k, v] of this.flags) flags[k] = v;
    const variables: Record<string, unknown> = {};
    for (const [k, v] of this.variables) variables[k] = v;
    return { flags, variables };
  }

  fromJSON(data: { flags?: Record<string, boolean>; variables?: Record<string, unknown> }): void {
    this.flags.clear();
    this.variables.clear();
    if (data.flags) {
      for (const [k, v] of Object.entries(data.flags)) this.flags.set(k, v);
    }
    if (data.variables) {
      for (const [k, v] of Object.entries(data.variables)) this.variables.set(k, v);
    }
  }

  clear(): void {
    this.flags.clear();
    this.variables.clear();
  }
}
