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
  type: 'execution' | 'data';
}

export type NodeCategory = 'event' | 'condition' | 'action' | 'flow';

export interface DataPinDef {
  id: string;
  label: string;
  dataType: 'number' | 'string' | 'boolean' | 'any';
  defaultValue?: unknown;
}

export interface NodeTypeDef {
  type: string;
  category: NodeCategory;
  label: string;
  description: string;
  inputs: PortDef[];
  outputs: PortDef[];
  dataInputs?: DataPinDef[];
  dataOutputs?: DataPinDef[];
  defaultData?: Record<string, unknown>;
}

export interface PortDef {
  id: string;
  label: string;
  type?: string;
}
