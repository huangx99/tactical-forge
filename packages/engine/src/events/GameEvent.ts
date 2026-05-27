export interface GameEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
  sourceId?: string;
}
