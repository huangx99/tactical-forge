export abstract class Component {
  static readonly typeName: string;

  abstract toJSON(): Record<string, unknown>;
  abstract fromJSON(data: Record<string, unknown>): void;
}
