import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { RFNodeData } from './converters';
import { CATEGORY_LABELS } from './nodeTypes';

function BlueprintNodeComponent({ data, selected }: NodeProps<RFNodeData>) {
  return (
    <div
      className={`rounded-lg shadow-lg border-2 min-w-[160px] ${selected ? 'border-white' : 'border-transparent'}`}
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
        {/* Data preview */}
        {Object.keys(data.data).length > 0 && (
          <div className="text-[10px] text-slate-400 mb-2 max-w-[200px]">
            {Object.entries(data.data).map(([key, val]) => (
              <div key={key} className="truncate">
                <span className="text-slate-500">{key}:</span>{' '}
                <span className="text-slate-300">{String(val)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Ports */}
        <div className="flex justify-between">
          {/* Input handles */}
          <div className="flex flex-col gap-1">
            {data.inputs.map((input, i) => (
              <div key={input.id} className="flex items-center gap-1">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={input.id}
                  style={{
                    background: data.color,
                    width: 8,
                    height: 8,
                    border: '2px solid #1e1e2e',
                    top: 'auto',
                    position: 'relative',
                    left: -12,
                  }}
                />
                <span className="text-[10px] text-slate-400">{input.label}</span>
              </div>
            ))}
          </div>

          {/* Output handles */}
          <div className="flex flex-col gap-1 items-end">
            {data.outputs.map((output, i) => (
              <div key={output.id} className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">{output.label}</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={output.id}
                  style={{
                    background: data.color,
                    width: 8,
                    height: 8,
                    border: '2px solid #1e1e2e',
                    top: 'auto',
                    position: 'relative',
                    right: -12,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(BlueprintNodeComponent);
