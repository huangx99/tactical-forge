import { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps, useEdges } from 'reactflow';
import { NumberInput } from '../components/NumberInput';
import type { RFNodeData } from './converters';
import { CATEGORY_LABELS, DATA_PIN_COLORS } from './nodeTypes';

function BlueprintNodeComponent({ id, data, selected }: NodeProps<RFNodeData>) {
  const edges = useEdges();
  const connectedHandles = useMemo(() => {
    const set = new Set<string>();
    for (const e of edges) {
      if (e.source === id && e.sourceHandle) set.add(e.sourceHandle);
      if (e.target === id && e.targetHandle) set.add(e.targetHandle);
    }
    return set;
  }, [edges, id]);

  const hasExecIn = data.inputs.length > 0;
  const hasExecOut = data.outputs.length > 0;
  const hasDataIn = (data.dataInputs?.length ?? 0) > 0;
  const hasDataOut = (data.dataOutputs?.length ?? 0) > 0;

  return (
    <div
      className={`rounded-lg shadow-lg border-2 min-w-[180px] ${selected ? 'border-white' : 'border-transparent'}`}
      style={{ backgroundColor: '#1e1e2e' }}
    >
      {/* Header */}
      <div
        className="px-3 py-1.5 rounded-t-md flex items-center gap-2"
        style={{ backgroundColor: data.color }}
      >
        <span className="text-[10px] text-white/70 uppercase tracking-wider">
          {CATEGORY_LABELS[data.category] ?? data.category}
        </span>
        <span className="text-xs font-bold text-white flex-1">{data.label}</span>
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        {/* Execution pins row */}
        {(hasExecIn || hasExecOut) && (
          <div className="flex justify-between mb-1">
            {/* Exec In */}
            <div className="flex flex-col gap-1">
              {data.inputs.map((input) => (
                <div key={input.id} className="flex items-center gap-1">
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={input.id}
                    style={{
                      background: '#ffffff',
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      border: '2px solid #1e1e2e',
                      top: 'auto',
                      position: 'relative',
                      left: -14,
                    }}
                  />
                  <span className="text-[10px] text-slate-300">{input.label}</span>
                </div>
              ))}
            </div>
            {/* Exec Out */}
            <div className="flex flex-col gap-1 items-end">
              {data.outputs.map((output) => (
                <div key={output.id} className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-300">{output.label}</span>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={output.id}
                    style={{
                      background: '#ffffff',
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      border: '2px solid #1e1e2e',
                      top: 'auto',
                      position: 'relative',
                      right: -14,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider between exec and data pins */}
        {hasExecIn && hasDataIn && (
          <div className="border-t border-slate-700 my-1" />
        )}

        {/* Data pins */}
        {(hasDataIn || hasDataOut) && (
          <div className="flex justify-between">
            {/* Data Inputs */}
            <div className="flex flex-col gap-1">
              {data.dataInputs?.map((pin) => {
                const pinColor = DATA_PIN_COLORS[pin.dataType] ?? DATA_PIN_COLORS.any;
                const isConnected = connectedHandles.has(`data-in-${pin.id}`);
                return (
                  <div key={pin.id} className="flex items-center gap-1">
                    <Handle
                      type="target"
                      position={Position.Left}
                      id={`data-in-${pin.id}`}
                      style={{
                        background: pinColor,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        border: '2px solid #1e1e2e',
                        top: 'auto',
                        position: 'relative',
                        left: -14,
                      }}
                    />
                    <span className="text-[10px] text-slate-400">{pin.label}</span>
                    {/* Hide editable field when connected */}
                    {!isConnected && (
                      pin.dataType === 'number' ? (
                        <NumberInput
                          className="w-[48px] text-[9px] bg-slate-800 border border-slate-600 rounded px-1 text-slate-300 focus:outline-none focus:border-blue-400"
                          value={Number(data.data[pin.id] ?? pin.defaultValue ?? 0)}
                          onChange={(v) => data.onDataChange?.(pin.id, v)}
                        />
                      ) : pin.dataType === 'boolean' ? (
                        <input
                          className="w-3 h-3 nodrag"
                          type="checkbox"
                          checked={Boolean(data.data[pin.id] ?? pin.defaultValue)}
                          onChange={(e) => data.onDataChange?.(pin.id, e.target.checked)}
                        />
                      ) : (
                        <input
                          className="nodrag w-[64px] text-[9px] bg-slate-800 border border-slate-600 rounded px-1 text-slate-300 focus:outline-none focus:border-blue-400 truncate"
                          type="text"
                          value={String(data.data[pin.id] ?? pin.defaultValue ?? '')}
                          onChange={(e) => data.onDataChange?.(pin.id, e.target.value)}
                        />
                      )
                    )}
                  </div>
                );
              })}
            </div>
            {/* Data Outputs */}
            <div className="flex flex-col gap-1 items-end">
              {data.dataOutputs?.map((pin) => {
                const pinColor = DATA_PIN_COLORS[pin.dataType] ?? DATA_PIN_COLORS.any;
                const isValueNode = !hasDataIn;
                const isOutConnected = connectedHandles.has(`data-out-${pin.id}`);
                return (
                  <div key={pin.id} className="flex items-center gap-1">
                    {isValueNode && !isOutConnected ? (
                      pin.dataType === 'number' ? (
                        <NumberInput
                          className="w-[48px] text-[9px] bg-slate-800 border border-slate-600 rounded px-1 text-slate-300 focus:outline-none focus:border-blue-400 text-right"
                          value={Number(data.data[pin.id] ?? 0)}
                          onChange={(v) => data.onDataChange?.(pin.id, v)}
                        />
                      ) : pin.dataType === 'boolean' ? (
                        <input
                          className="w-3 h-3 nodrag"
                          type="checkbox"
                          checked={Boolean(data.data[pin.id])}
                          onChange={(e) => data.onDataChange?.(pin.id, e.target.checked)}
                        />
                      ) : (
                        <input
                          className="nodrag w-[80px] text-[9px] bg-slate-800 border border-slate-600 rounded px-1 text-slate-300 focus:outline-none focus:border-blue-400 text-right truncate"
                          type="text"
                          value={String(data.data[pin.id] ?? '')}
                          onChange={(e) => data.onDataChange?.(pin.id, e.target.value)}
                        />
                      )
                    ) : (
                      <span className="text-[10px] text-slate-400">{pin.label}</span>
                    )}
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`data-out-${pin.id}`}
                      style={{
                        background: pinColor,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        border: '2px solid #1e1e2e',
                        top: 'auto',
                        position: 'relative',
                        right: -14,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(BlueprintNodeComponent);
