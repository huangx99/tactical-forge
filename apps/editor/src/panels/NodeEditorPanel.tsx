import { useCallback, useMemo, useState, useRef } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import BlueprintNodeComponent from '../node-editor/BlueprintNodeComponent';
import { blueprintToReactFlow, reactFlowToBlueprint, type RFNodeData } from '../node-editor/converters';
import { NODE_REGISTRY, CATEGORY_LABELS, CATEGORY_COLORS, getNodeType } from '../node-editor/nodeTypes';
import { useBlueprintStore } from '../stores/blueprintStore';
import { useEditorStore } from '../stores/editorStore';
import { AssetEditorWindow } from '../components/AssetEditorWindow';
import { InlineRename } from '../components/InlineRename';
import { generateId } from '@tactical-forge/shared';

const nodeTypes = { blueprintNode: BlueprintNodeComponent };

function BlueprintEditor() {
  const {
    blueprints, activeBlueprintId, getActiveBlueprint,
    createBlueprint, deleteBlueprint, setActiveBlueprint, updateBlueprint,
    setNodes, setEdges, updateNodeData, importBlueprint, exportBlueprint,
  } = useBlueprintStore();

  const activeBlueprint = getActiveBlueprint();
  const containerRef = useRef<HTMLDivElement>(null);
  const rfInstance = useReactFlow();
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuScreenPos, setMenuScreenPos] = useState({ x: 0, y: 0 });
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<RFNodeData>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [importJson, setImportJson] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [filter, setFilter] = useState('');

  // Sync blueprint -> react flow
  useMemo(() => {
    if (activeBlueprint) {
      const { nodes, edges } = blueprintToReactFlow(activeBlueprint);
      setRfNodes(nodes);
      setRfEdges(edges);
    } else {
      setRfNodes([]);
      setRfEdges([]);
    }
  }, [activeBlueprintId, activeBlueprint?.nodes.length, activeBlueprint?.edges.length]);

  const syncToBlueprint = useCallback((nodes: Node<RFNodeData>[], edges: Edge[]) => {
    if (!activeBlueprintId || !activeBlueprint) return;
    const bp = reactFlowToBlueprint(nodes, edges, activeBlueprint);
    setNodes(activeBlueprintId, bp.nodes);
    setEdges(activeBlueprintId, bp.edges);
  }, [activeBlueprintId, activeBlueprint]);

  const onConnect = useCallback((connection: Connection) => {
    const newEdge = {
      ...connection,
      id: `e-${generateId()}`,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#64748b', strokeWidth: 2 },
    };
    setRfEdges((eds) => {
      const updated = addEdge(newEdge, eds);
      syncToBlueprint(rfNodes, updated);
      return updated;
    });
  }, [rfNodes, syncToBlueprint]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node<RFNodeData>) => {
    setSelectedNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setShowNodeMenu(false);
  }, []);

  const handlePaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMenuPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    setMenuScreenPos({ x: event.clientX, y: event.clientY });
    setShowNodeMenu(true);
  }, []);

  const handleContainerContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMenuPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    setMenuScreenPos({ x: event.clientX, y: event.clientY });
    setShowNodeMenu(true);
  }, []);

  const addNodeAtMenu = useCallback((nodeType: string) => {
    if (!activeBlueprintId) return;
    const typeDef = getNodeType(nodeType);
    if (!typeDef) return;

    const flowPos = rfInstance.screenToFlowPosition({ x: menuScreenPos.x, y: menuScreenPos.y });
    setShowNodeMenu(false);

    const newNode: Node<RFNodeData> = {
      id: generateId(),
      type: 'blueprintNode',
      position: { x: flowPos.x - 80, y: flowPos.y - 30 },
      data: {
        label: typeDef.label,
        nodeType: typeDef.type,
        category: typeDef.category,
        color: typeDef.color,
        data: { ...(typeDef.defaultData ?? {}) },
        inputs: typeDef.inputs,
        outputs: typeDef.outputs,
      },
    };

    setRfNodes((nds) => {
      const updated = [...nds, newNode];
      syncToBlueprint(updated, rfEdges);
      return updated;
    });
  }, [activeBlueprintId, menuScreenPos, rfInstance, rfEdges, syncToBlueprint]);

  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId || !activeBlueprintId) return;
    setRfNodes((nds) => {
      const updated = nds.filter((n) => n.id !== selectedNodeId);
      const updatedEdges = rfEdges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId);
      setRfEdges(updatedEdges);
      syncToBlueprint(updated, updatedEdges);
      return updated;
    });
    setSelectedNodeId(null);
  }, [selectedNodeId, activeBlueprintId, rfEdges, syncToBlueprint]);

  const handleExport = useCallback(() => {
    if (!activeBlueprintId) return;
    const json = exportBlueprint(activeBlueprintId);
    if (json) {
      navigator.clipboard.writeText(json);
      alert('蓝图JSON已复制到剪贴板');
    }
  }, [activeBlueprintId, exportBlueprint]);

  const handleImport = useCallback(() => {
    const id = importBlueprint(importJson);
    if (id) {
      setShowImport(false);
      setImportJson('');
    } else {
      alert('JSON格式错误');
    }
  }, [importJson, importBlueprint]);

  const selectedNode = selectedNodeId ? rfNodes.find((n) => n.id === selectedNodeId) : null;
  const filteredBps = blueprints.filter((bp) => !filter || bp.name.includes(filter));

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="h-9 border-b border-editor-border flex items-center px-2 gap-1 shrink-0">
        <button className="px-2 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={() => createBlueprint('新蓝图')}>+ 新建</button>
        <button className="px-2 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={handleExport}>导出</button>
        <button className="px-2 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={() => setShowImport(!showImport)}>导入</button>
        <button className="px-2 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={() => alert('AI生成功能将在Phase 9实现')}>AI 生成</button>
        <div className="flex-1" />
        <input className="input-field text-xs w-40" placeholder="搜索蓝图..." value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>

      {showImport && (
        <div className="p-2 border-b border-editor-border shrink-0">
          <textarea className="input-field w-full h-16 font-mono text-xs resize-y" placeholder="粘贴蓝图JSON..." value={importJson} onChange={(e) => setImportJson(e.target.value)} />
          <div className="flex gap-1 mt-1">
            <button className="px-2 py-0.5 bg-editor-accent rounded text-xs" onClick={handleImport}>导入</button>
            <button className="px-2 py-0.5 bg-editor-border rounded text-xs" onClick={() => setShowImport(false)}>取消</button>
          </div>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Left sidebar - blueprint list */}
        <div className="w-56 border-r border-editor-border flex flex-col shrink-0">

        <div className="flex-1 overflow-auto">
          {filteredBps.map((bp) => (
            <div
              key={bp.id}
              className={`px-3 py-2 cursor-pointer hover:bg-editor-border flex items-center gap-2 ${bp.id === activeBlueprintId ? 'bg-editor-border' : ''}`}
              onClick={() => setActiveBlueprint(bp.id)}
            >
              <span className="text-editor-accent text-xs shrink-0">🔗</span>
              <InlineRename
                name={bp.name}
                onRename={(name) => updateBlueprint(bp.id, { name })}
                className="flex-1 text-sm truncate"
              />
              <span className="text-[10px] text-editor-muted shrink-0">{bp.nodes.length}节点</span>
              <button
                className="text-[10px] text-editor-muted hover:text-red-400 shrink-0"
                onClick={(e) => { e.stopPropagation(); deleteBlueprint(bp.id); }}
              >
                x
              </button>
            </div>
          ))}
          {blueprints.length === 0 && (
            <div className="px-3 py-8 text-editor-muted text-xs text-center">点击 "+ 新建" 创建蓝图</div>
          )}
        </div>
      </div>

      {/* Right - React Flow canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeBlueprint ? (
          <div
            ref={containerRef}
            className="flex-1 relative"
            onContextMenu={handleContainerContextMenu}
          >
            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              onPaneContextMenu={handlePaneContextMenu}
              nodeTypes={nodeTypes}
              fitView
              snapToGrid
              snapGrid={[16, 16]}
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#64748b', strokeWidth: 2 },
              }}
              style={{ backgroundColor: '#0f0f1a' }}
            >
              <Controls />
              <MiniMap
                nodeColor={(n) => (n.data as RFNodeData)?.color ?? '#3b82f6'}
                style={{ backgroundColor: '#1e1e2e' }}
              />
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#1e1e2e" />
            </ReactFlow>

            {/* Context menu */}
            {showNodeMenu && (
              <div
                className="absolute z-50 bg-[#1e1e2e] border border-[#333] rounded-lg shadow-2xl py-1 min-w-[200px] max-h-[400px] overflow-auto"
                style={{ left: menuPosition.x, top: menuPosition.y }}
                onMouseLeave={() => setShowNodeMenu(false)}
              >
                <div className="px-3 py-1.5 text-[10px] text-slate-500 border-b border-[#333] mb-1">添加节点</div>
                {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                  <div key={cat}>
                    <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-medium" style={{ color: CATEGORY_COLORS[cat] }}>{label}</div>
                    {NODE_REGISTRY.filter((n) => n.category === cat).map((nodeType) => (
                      <button
                        key={nodeType.type}
                        className="w-full text-left px-3 py-1.5 hover:bg-[#2a2a3e] text-sm flex items-center gap-2 text-slate-300"
                        onClick={() => addNodeAtMenu(nodeType.type)}
                      >
                        <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: nodeType.color }} />
                        <span>{nodeType.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Node properties panel */}
            {selectedNode && (
              <div className="absolute top-2 right-2 w-64 bg-[#1e1e2e] border border-[#333] rounded-lg shadow-2xl z-40">
                <div className="px-3 py-2 border-b border-[#333] flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: selectedNode.data.color }}>{selectedNode.data.label}</span>
                  <div className="flex gap-2">
                    <span className="text-[10px] text-slate-500">{selectedNode.data.nodeType}</span>
                    <button className="text-red-400 hover:text-red-300 text-xs" onClick={handleDeleteNode}>删除</button>
                  </div>
                </div>
                <div className="p-3 space-y-2 max-h-[300px] overflow-auto">
                  {Object.entries(selectedNode.data.data).length === 0 && (
                    <div className="text-xs text-slate-500 text-center py-2">无数据字段</div>
                  )}
                  {Object.entries(selectedNode.data.data).map(([key, val]) => (
                    <div key={key}>
                      <label className="text-xs text-slate-500 block mb-0.5">{key}</label>
                      <input
                        className="w-full bg-[#0f0f1a] border border-[#333] rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                        value={String(val ?? '')}
                        onChange={(e) => {
                          const newData = { ...selectedNode.data.data, [key]: e.target.value };
                          setRfNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, data: newData } } : n));
                          if (activeBlueprintId) updateNodeData(activeBlueprintId, selectedNodeId!, newData);
                        }}
                      />
                    </div>
                  ))}
                  <button
                    className="text-xs text-blue-400 hover:text-blue-300"
                    onClick={() => {
                      const key = prompt('字段名:');
                      if (!key) return;
                      const newData = { ...selectedNode.data.data, [key]: '' };
                      setRfNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, data: newData } } : n));
                      if (activeBlueprintId) updateNodeData(activeBlueprintId, selectedNodeId!, newData);
                    }}
                  >
                    + 添加字段
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-editor-muted text-xs">
            <div className="text-center">
              <div className="text-2xl mb-2">🔗</div>
              <div>选择或新建蓝图</div>
              <div className="mt-1">右键画布添加节点</div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export function BlueprintEditorWindow() {
  const close = useEditorStore((s) => s.closeAssetEditorWindow);

  return (
    <AssetEditorWindow title="蓝图编辑器" icon="🔗" onClose={close}>
      <ReactFlowProvider>
        <BlueprintEditor />
      </ReactFlowProvider>
    </AssetEditorWindow>
  );
}
