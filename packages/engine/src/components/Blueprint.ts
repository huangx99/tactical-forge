import { Component } from '../ecs/Component';

export class BlueprintComponent extends Component {
  static readonly typeName = 'blueprint';

  blueprintIds: string[] = [];
  variables: Record<string, unknown> = {};

  toJSON(): Record<string, unknown> {
    return {
      blueprintIds: this.blueprintIds,
      variables: this.variables,
    };
  }

  fromJSON(data: Record<string, unknown>): void {
    this.blueprintIds = (data.blueprintIds as string[]) ?? [];
    this.variables = (data.variables as Record<string, unknown>) ?? {};
  }
}
