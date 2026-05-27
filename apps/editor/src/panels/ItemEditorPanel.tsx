import { useState } from 'react';
import { AssetEditorWindow } from '../components/AssetEditorWindow';
import { InlineRename } from '../components/InlineRename';
import { NumberInput } from '../components/NumberInput';
import { useEditorStore } from '../stores/editorStore';
import { useAssetStore, type ItemDef } from '../stores/assetStore';

const ITEM_TYPES = ['weapon', 'armor', 'consumable', 'material', 'key', 'accessory'];
const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const EQUIP_SLOTS = ['mainHand', 'offHand', 'head', 'body', 'feet', 'accessory1', 'accessory2'];

const TYPE_LABELS: Record<string, string> = {
  weapon: '武器', armor: '防具', consumable: '消耗品', material: '材料', key: '关键物品', accessory: '饰品',
};
const RARITY_LABELS: Record<string, string> = {
  common: '普通', uncommon: '优秀', rare: '稀有', epic: '史诗', legendary: '传说',
};
const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b',
};

export function ItemEditorWindow() {
  const close = useEditorStore((s) => s.closeAssetEditorWindow);
  const { items, addItem, updateItem, deleteItem } = useAssetStore();
  const updateItemName = (id: string, name: string) => updateItem(id, { name });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const selected = items.find((i) => i.id === selectedId);

  const handleAdd = () => {
    const id = addItem({
      name: '新物品', description: '', type: 'consumable', rarity: 'common',
      stackable: true, maxStack: 99, buyPrice: 0, sellPrice: 0, stats: {},
    });
    setSelectedId(id);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    deleteItem(selectedId);
    setSelectedId(null);
  };

  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify(items, null, 2));
    alert('物品数据已复制到剪贴板');
  };

  const handleImport = () => {
    const json = prompt('粘贴物品JSON:');
    if (!json) return;
    try {
      const data = JSON.parse(json);
      const arr: ItemDef[] = Array.isArray(data) ? data : [data];
      arr.forEach((item) => addItem(item));
    } catch { alert('JSON格式错误'); }
  };

  const filtered = items.filter((i) =>
    !filter || i.name.includes(filter) || i.type.includes(filter)
  );

  return (
    <AssetEditorWindow
      title="物品编辑器"
      icon="⚔️"
      onClose={close}
      toolbar={
        <>
          <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={handleAdd}>+ 新建</button>
          <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={handleExport}>导出</button>
          <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={handleImport}>导入</button>
          <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={() => alert('AI生成功能将在Phase 9实现')}>AI 生成</button>
          <div className="flex-1" />
          <input
            className="input-field text-xs w-40"
            placeholder="搜索物品..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </>
      }
    >
      <div className="flex h-full">
        <div className="w-64 border-r border-editor-border overflow-auto">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`px-3 py-2 cursor-pointer hover:bg-editor-border ${item.id === selectedId ? 'bg-editor-border' : ''}`}
              onClick={() => setSelectedId(item.id)}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: RARITY_COLORS[item.rarity] }} />
                <InlineRename name={item.name} onRename={(name) => updateItemName(item.id, name)} className="text-sm truncate" />
              </div>
              <div className="text-[10px] text-editor-muted ml-4">{TYPE_LABELS[item.type] ?? item.type}</div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="px-3 py-8 text-editor-muted text-xs text-center">点击 "+ 新建" 创建物品</div>
          )}
        </div>

        {selected ? (
          <div className="flex-1 p-4 overflow-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-editor-muted block mb-1">名称</label>
                <input className="input-field w-full" value={selected.name} onChange={(e) => updateItem(selected.id, { name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-editor-muted block mb-1">类型</label>
                <select className="input-field w-full" value={selected.type} onChange={(e) => updateItem(selected.id, { type: e.target.value })}>
                  {ITEM_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-editor-muted block mb-1">稀有度</label>
                <select className="input-field w-full" value={selected.rarity} onChange={(e) => updateItem(selected.id, { rarity: e.target.value })}>
                  {RARITIES.map((r) => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
                </select>
              </div>
              {selected.type === 'weapon' || selected.type === 'armor' || selected.type === 'accessory' ? (
                <div>
                  <label className="text-xs text-editor-muted block mb-1">装备槽位</label>
                  <select className="input-field w-full" value={selected.equipSlot ?? ''} onChange={(e) => updateItem(selected.id, { equipSlot: e.target.value })}>
                    <option value="">无</option>
                    {EQUIP_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ) : null}
            </div>
            <div>
              <label className="text-xs text-editor-muted block mb-1">描述</label>
              <textarea className="input-field w-full h-20 resize-y" value={selected.description} onChange={(e) => updateItem(selected.id, { description: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-editor-muted block mb-1">购买价格</label>
                <NumberInput className="input-field w-full" value={selected.buyPrice} onChange={(v) => updateItem(selected.id, { buyPrice: v })} />
              </div>
              <div>
                <label className="text-xs text-editor-muted block mb-1">出售价格</label>
                <NumberInput className="input-field w-full" value={selected.sellPrice} onChange={(v) => updateItem(selected.id, { sellPrice: v })} />
              </div>
              <div>
                <label className="text-xs text-editor-muted block mb-1">可堆叠</label>
                <select className="input-field w-full" value={String(selected.stackable)} onChange={(e) => updateItem(selected.id, { stackable: e.target.value === 'true' })}>
                  <option value="true">是</option>
                  <option value="false">否</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-editor-muted block mb-1">最大堆叠</label>
                <NumberInput className="input-field w-full" value={selected.maxStack} onChange={(v) => updateItem(selected.id, { maxStack: v })} />
              </div>
            </div>
            {/* Stats */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-editor-muted">属性加成</label>
                <button
                  className="text-xs text-editor-accent hover:text-white"
                  onClick={() => {
                    const key = prompt('属性名 (如 atk, def, spd):');
                    if (!key) return;
                    updateItem(selected.id, { stats: { ...selected.stats, [key]: 0 } });
                  }}
                >
                  + 添加
                </button>
              </div>
              {Object.entries(selected.stats).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-editor-muted w-16">{key}</span>
                  <NumberInput
                    className="input-field flex-1"
                    value={Number(val) || 0}
                    onChange={(v) => updateItem(selected.id, { stats: { ...selected.stats, [key]: v } })}
                  />
                  <button
                    className="text-xs text-editor-muted hover:text-editor-accent"
                    onClick={() => {
                      const newStats = { ...selected.stats };
                      delete newStats[key];
                      updateItem(selected.id, { stats: newStats });
                    }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs" onClick={handleDelete}>删除物品</button>
              <span className="text-[10px] text-editor-muted">ID: {selected.id}</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-editor-muted text-xs">
            选择一个物品或点击 "+ 新建"
          </div>
        )}
      </div>
    </AssetEditorWindow>
  );
}
