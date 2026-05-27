import type { Node, Edge } from 'reactflow';
import type { Blueprint, BlueprintNode, BlueprintEdge } from '@tactical-forge/shared';
import { getNodeType } from './nodeTypes';

export interface RFNodeData {
  label: string;
  nodeType: string;
  category: string;
  color: string;
  data: Record<string, unknown>;
  inputs: { id: string; label: string }[];
  outputs: { id: string; label: string }[];
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
        inputs: typeDef?.inputs ?? [{ id: 'in', label: '输入' }],
        outputs: typeDef?.outputs ?? [{ id: 'out', label: '输出' }],
      },
    };
  });

  const edges: Edge[] = blueprint.edges.map((e) => ({
    id: e.id,
    source: e.source,
    sourceHandle: e.sourcePort,
    target: e.target,
    targetHandle: e.targetPort,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#64748b', strokeWidth: 2 },
  }));

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
  }));

  return {
    id: existing?.id ?? '',
    name: existing?.name ?? '',
    description: existing?.description,
    nodes: blueprintNodes,
    edges: blueprintEdges,
  };
}
