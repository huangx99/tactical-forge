export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
}

export interface BlueprintNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface BlueprintEdge {
  id: string;
  source: string;
  sourcePort: string;
  target: string;
  targetPort: string;
}

export type NodeCategory = 'event' | 'condition' | 'action' | 'flow';

export interface NodeTypeDef {
  type: string;
  category: NodeCategory;
  label: string;
  description: string;
  inputs: PortDef[];
  outputs: PortDef[];
  defaultData?: Record<string, unknown>;
}

export interface PortDef {
  id: string;
  label: string;
  type?: string;
}
