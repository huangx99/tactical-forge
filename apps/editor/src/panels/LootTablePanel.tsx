import { useState } from 'react';
import { AssetEditorWindow } from '../components/AssetEditorWindow';
import { InlineRename } from '../components/InlineRename';
import { NumberInput } from '../components/NumberInput';
import { useEditorStore } from '../stores/editorStore';
import { useAssetStore } from '../stores/assetStore';

export function LootTableEditorWindow() {
  const close = useEditorStore((s) => s.closeAssetEditorWindow);
  const { lootTables, addLootTable, updateLootTable, deleteLootTable } = useAssetStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const selected = lootTables.find((t) => t.id === selectedId);

  const handleAdd = () => {
    const id = addLootTable({ name: '新掉落表', entries: [], guaranteed: [], rollCount: { min: 1, max: 3 } });
    setSelectedId(id);
  };

  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify(lootTables, null, 2));
    alert('掉落表数据已复制到剪贴板');
  };

  const handleImport = () => {
    const json = prompt('粘贴掉落表JSON:');
    if (!json) return;
    try {
      const data = JSON.parse(json);
      const arr = Array.isArray(data) ? data : [data];
      arr.forEach(({ id: _id, ...rest }: { id?: string }) => addLootTable(rest as any));
    } catch { alert('JSON格式错误'); }
  };

  const filtered = lootTables.filter((t) => !filter || t.name.includes(filter));

  return (
    <AssetEditorWindow title="掉落表" icon="🎲" onClose={close} toolbar={
      <>
        <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={handleAdd}>+ 新建</button>
        <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={handleExport}>导出</button>
        <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={handleImport}>导入</button>
        <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={() => alert('AI生成功能将在Phase 9实现')}>AI 生成</button>
        <div className="flex-1" />
        <input className="input-field text-xs w-40" placeholder="搜索掉落表..." value={filter} onChange={(e) => setFilter(e.target.value)} />
      </>
    }>
      <div className="flex h-full">
        <div className="w-64 border-r border-editor-border overflow-auto">
          {filtered.map((t) => (
            <div
              key={t.id}
              className={`px-3 py-2 cursor-pointer hover:bg-editor-border flex items-center gap-2 ${t.id === selectedId ? 'bg-editor-border' : ''}`}
              onClick={() => setSelectedId(t.id)}
            >
              <span className="text-editor-accent text-xs shrink-0">🎲</span>
              <InlineRename name={t.name} onRename={(name) => updateLootTable(t.id, { name })} className="text-sm truncate flex-1" />
              <span className="text-[10px] text-editor-muted shrink-0">{t.entries.length} 项</span>
            </div>
          ))}
          {lootTables.length === 0 && <div className="px-3 py-8 text-editor-muted text-xs text-center">点击 "+ 新建"</div>}
        </div>
        {selected ? (
          <div className="flex-1 p-4 overflow-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-editor-muted block mb-1">最小掉落数</label><NumberInput className="input-field w-full" value={selected.rollCount.min} onChange={(v) => updateLootTable(selected.id, { rollCount: { ...selected.rollCount, min: v } })} /></div>
              <div><label className="text-xs text-editor-muted block mb-1">最大掉落数</label><NumberInput className="input-field w-full" value={selected.rollCount.max} onChange={(v) => updateLootTable(selected.id, { rollCount: { ...selected.rollCount, max: v } })} /></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-editor-muted">掉落项</label>
                <button className="text-xs text-editor-accent hover:text-white" onClick={() => updateLootTable(selected.id, { entries: [...selected.entries, { itemId: '', min: 1, max: 1, weight: 50 }] })}>+ 添加</button>
              </div>
              {selected.entries.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 mb-1 p-2 bg-editor-bg rounded">
                  <input className="input-field flex-1 text-xs" placeholder="物品ID" value={entry.itemId} onChange={(e) => { const ne = [...selected.entries]; ne[i] = { ...entry, itemId: e.target.value }; updateLootTable(selected.id, { entries: ne }); }} />
                  <NumberInput className="input-field w-16 text-xs" placeholder="最小" value={entry.min} onChange={(v) => { const ne = [...selected.entries]; ne[i] = { ...entry, min: v }; updateLootTable(selected.id, { entries: ne }); }} />
                  <NumberInput className="input-field w-16 text-xs" placeholder="最大" value={entry.max} onChange={(v) => { const ne = [...selected.entries]; ne[i] = { ...entry, max: v }; updateLootTable(selected.id, { entries: ne }); }} />
                  <NumberInput className="input-field w-16 text-xs" placeholder="权重" value={entry.weight} onChange={(v) => { const ne = [...selected.entries]; ne[i] = { ...entry, weight: v }; updateLootTable(selected.id, { entries: ne }); }} />
                  <button className="text-xs text-editor-muted hover:text-editor-accent" onClick={() => updateLootTable(selected.id, { entries: selected.entries.filter((_, j) => j !== i) })}>x</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs" onClick={() => { deleteLootTable(selected.id); setSelectedId(null); }}>删除</button>
              <span className="text-[10px] text-editor-muted">ID: {selected.id}</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-editor-muted text-xs">选择或新建掉落表</div>
        )}
      </div>
    </AssetEditorWindow>
  );
}
