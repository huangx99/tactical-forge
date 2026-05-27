import type { Node, Edge } from 'reactflow';
import type { Blueprint, BlueprintNode, BlueprintEdge, DataPinDef } from '@tactical-forge/shared';
import { getNodeType, DATA_PIN_COLORS } from './nodeTypes';

export interface RFNodeData {
  label: string;
  nodeType: string;
  category: string;
  color: string;
  data: Record<string, unknown>;
  inputs: { id: string; label: string }[];
  outputs: { id: string; label: string }[];
  dataInputs?: DataPinDef[];
  dataOutputs?: DataPinDef[];
  onDataChange?: (key: string, value: unknown) => void;
}

function isDataHandle(handleId: string | null | undefined): boolean {
  return handleId?.startsWith('data-in-') || handleId?.startsWith('data-out-') || false;
}

export function blueprintToReactFlow(blueprint: Blueprint): { nodes: Node<RFNodeData>[]; edges: Edge[] } {
  const nodes: Node<RFNodeData>[] = blueprint.nodes.map((n) => {
    const typeDef = getNodeType(n.type);
    return {
      id: n.id,
      type: 'blueprintNode',
      position: n.position,
      data: {
        label: typeDef?.label ?? n.type,
        nodeType: n.type,
        category: typeDef?.category ?? 'action',
        color: typeDef?.color ?? '#3b82f6',
        data: n.data,
        inputs: typeDef?.inputs ?? [{ id: 'in', label: '执行' }],
        outputs: typeDef?.outputs ?? [{ id: 'out', label: '完成' }],
        dataInputs: typeDef?.dataInputs ? [...typeDef.dataInputs] : undefined,
        dataOutputs: typeDef?.dataOutputs ? [...typeDef.dataOutputs] : undefined,
      },
    };
  });

  const edges: Edge[] = blueprint.edges.map((e) => {
    const isData = e.type === 'data';
    // Determine data pin color from source node's data output
    let strokeColor = '#64748b';
    if (isData) {
      const sourceNode = blueprint.nodes.find(n => n.id === e.source);
      if (sourceNode) {
        const typeDef = getNodeType(sourceNode.type);
        const dataOut = typeDef?.dataOutputs?.find(d => `data-out-${d.id}` === e.sourcePort);
        if (dataOut) {
          strokeColor = DATA_PIN_COLORS[dataOut.dataType] ?? DATA_PIN_COLORS.any;
        }
      }
    }
    return {
      id: e.id,
      source: e.source,
      sourceHandle: e.sourcePort,
      target: e.target,
      targetHandle: e.targetPort,
      type: isData ? 'default' : 'smoothstep',
      animated: !isData,
      style: {
        stroke: strokeColor,
        strokeWidth: isData ? 1.5 : 2,
      },
    };
  });

  return { nodes, edges };
}

export function reactFlowToBlueprint(
  nodes: Node<RFNodeData>[],
  edges: Edge[],
  existing?: Blueprint,
): Blueprint {
  const blueprintNodes: BlueprintNode[] = nodes.map((n) => ({
    id: n.id,
    type: n.data.nodeType,
    position: n.position,
    data: n.data.data,
  }));

  const blueprintEdges: BlueprintEdge[] = edges.map((e) => ({
    id: e.id,
    source: e.source,
    sourcePort: e.sourceHandle ?? 'out',
    target: e.target,
    targetPort: e.targetHandle ?? 'in',
    type: isDataHandle(e.sourceHandle) || isDataHandle(e.targetHandle) ? 'data' : 'execution',
  }));

  return {
    id: existing?.id ?? '',
    name: existing?.name ?? '',
    description: existing?.description,
    nodes: blueprintNodes,
    edges: blueprintEdges,
  };
}
