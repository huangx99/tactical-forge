import { useState } from 'react';
import { AssetEditorWindow } from '../components/AssetEditorWindow';
import { InlineRename } from '../components/InlineRename';
import { NumberInput } from '../components/NumberInput';
import { useEditorStore } from '../stores/editorStore';
import { useAssetStore } from '../stores/assetStore';

export function StatusEffectEditorWindow() {
  const close = useEditorStore((s) => s.closeAssetEditorWindow);
  const { statuses, addStatus, updateStatus, deleteStatus } = useAssetStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const selected = statuses.find((s) => s.id === selectedId);

  const handleAdd = () => {
    const id = addStatus({
      name: '新状态', type: 'debuff', duration: 5, stackable: false,
      maxStacks: 1, tickInterval: 1, effects: [], immunity: [],
    });
    setSelectedId(id);
  };

  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify(statuses, null, 2));
    alert('状态效果数据已复制到剪贴板');
  };

  const handleImport = () => {
    const json = prompt('粘贴状态效果JSON:');
    if (!json) return;
    try {
      const data = JSON.parse(json);
      const arr = Array.isArray(data) ? data : [data];
      arr.forEach(({ id: _id, ...rest }: { id?: string }) => addStatus(rest as any));
    } catch { alert('JSON格式错误'); }
  };

  const filtered = statuses.filter((s) => !filter || s.name.includes(filter));

  return (
    <AssetEditorWindow title="状态效果" icon="✨" onClose={close} toolbar={
      <>
        <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={handleAdd}>+ 新建</button>
        <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={handleExport}>导出</button>
        <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={handleImport}>导入</button>
        <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={() => alert('AI生成功能将在Phase 9实现')}>AI 生成</button>
        <div className="flex-1" />
        <input className="input-field text-xs w-40" placeholder="搜索状态..." value={filter} onChange={(e) => setFilter(e.target.value)} />
      </>
    }>
      <div className="flex h-full">
        <div className="w-64 border-r border-editor-border overflow-auto">
          {filtered.map((s) => (
            <div key={s.id} className={`px-3 py-2 cursor-pointer hover:bg-editor-border ${s.id === selectedId ? 'bg-editor-border' : ''}`} onClick={() => setSelectedId(s.id)}>
              <InlineRename name={s.name} onRename={(name) => updateStatus(s.id, { name })} className="text-sm truncate" />
              <span className={`ml-2 text-[10px] ${s.type === 'buff' ? 'text-green-400' : 'text-red-400'}`}>{s.type === 'buff' ? 'BUFF' : 'DEBUFF'}</span>
            </div>
          ))}
          {statuses.length === 0 && <div className="px-3 py-8 text-editor-muted text-xs text-center">点击 "+ 新建"</div>}
        </div>
        {selected ? (
          <div className="flex-1 p-4 overflow-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-editor-muted block mb-1">名称</label><input className="input-field w-full" value={selected.name} onChange={(e) => updateStatus(selected.id, { name: e.target.value })} /></div>
              <div><label className="text-xs text-editor-muted block mb-1">类型</label>
                <select className="input-field w-full" value={selected.type} onChange={(e) => updateStatus(selected.id, { type: e.target.value as 'buff' | 'debuff' })}>
                  <option value="buff">BUFF (增益)</option><option value="debuff">DEBUFF (减益)</option>
                </select>
              </div>
              <div><label className="text-xs text-editor-muted block mb-1">持续时间(秒)</label><NumberInput className="input-field w-full" value={selected.duration} onChange={(v) => updateStatus(selected.id, { duration: v })} /></div>
              <div><label className="text-xs text-editor-muted block mb-1">Tick间隔(秒)</label><NumberInput className="input-field w-full" value={selected.tickInterval} onChange={(v) => updateStatus(selected.id, { tickInterval: v })} /></div>
              <div><label className="text-xs text-editor-muted block mb-1">可堆叠</label>
                <select className="input-field w-full" value={String(selected.stackable)} onChange={(e) => updateStatus(selected.id, { stackable: e.target.value === 'true' })}>
                  <option value="true">是</option><option value="false">否</option>
                </select>
              </div>
              <div><label className="text-xs text-editor-muted block mb-1">最大层数</label><NumberInput className="input-field w-full" value={selected.maxStacks} onChange={(v) => updateStatus(selected.id, { maxStacks: v })} /></div>
            </div>
            <div className="flex gap-2 items-center">
              <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs" onClick={() => { deleteStatus(selected.id); setSelectedId(null); }}>删除</button>
              <span className="text-[10px] text-editor-muted">ID: {selected.id}</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-editor-muted text-xs">选择或新建状态效果</div>
        )}
      </div>
    </AssetEditorWindow>
  );
}
