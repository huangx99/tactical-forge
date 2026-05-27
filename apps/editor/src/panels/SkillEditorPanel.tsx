import { useState } from 'react';
import { AssetEditorWindow } from '../components/AssetEditorWindow';
import { InlineRename } from '../components/InlineRename';
import { NumberInput } from '../components/NumberInput';
import { useEditorStore } from '../stores/editorStore';
import { useAssetStore } from '../stores/assetStore';

const SKILL_TYPES = ['active', 'passive', 'toggle'];
const CATEGORIES = ['magic', 'melee', 'ranged', 'support'];
const TARGET_TYPES = ['self', 'single', 'area', 'cone', 'line'];

const CAT_LABELS: Record<string, string> = { magic: '魔法', melee: '近战', ranged: '远程', support: '辅助' };

export function SkillEditorWindow() {
  const close = useEditorStore((s) => s.closeAssetEditorWindow);
  const { skills, addSkill, updateSkill, deleteSkill } = useAssetStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const selected = skills.find((s) => s.id === selectedId);

  const handleAdd = () => {
    const id = addSkill({
      name: '新技能', description: '', type: 'active', category: 'magic',
      mpCost: 10, cooldown: 3, castTime: 0.5, range: 100, targetType: 'single', maxLevel: 5, effects: [],
    });
    setSelectedId(id);
  };

  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify(skills, null, 2));
    alert('技能数据已复制到剪贴板');
  };

  const handleImport = () => {
    const json = prompt('粘贴技能JSON:');
    if (!json) return;
    try {
      const data = JSON.parse(json);
      const arr = Array.isArray(data) ? data : [data];
      arr.forEach(({ id: _id, ...rest }: { id?: string }) => addSkill(rest as any));
    } catch { alert('JSON格式错误'); }
  };

  const filtered = skills.filter((s) => !filter || s.name.includes(filter));

  return (
    <AssetEditorWindow
      title="技能编辑器"
      icon="🔥"
      onClose={close}
      toolbar={
        <>
          <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={handleAdd}>+ 新建</button>
          <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={handleExport}>导出</button>
          <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={handleImport}>导入</button>
          <button className="px-3 py-1 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={() => alert('AI生成将在Phase 9实现')}>AI 生成</button>
          <div className="flex-1" />
          <input className="input-field text-xs w-40" placeholder="搜索技能..." value={filter} onChange={(e) => setFilter(e.target.value)} />
        </>
      }
    >
      <div className="flex h-full">
        <div className="w-64 border-r border-editor-border overflow-auto">
          {filtered.map((skill) => (
            <div
              key={skill.id}
              className={`px-3 py-2 cursor-pointer hover:bg-editor-border ${skill.id === selectedId ? 'bg-editor-border' : ''}`}
              onClick={() => setSelectedId(skill.id)}
            >
              <InlineRename name={skill.name} onRename={(name) => updateSkill(skill.id, { name })} className="text-sm truncate" />
              <div className="text-[10px] text-editor-muted">{CAT_LABELS[skill.category] ?? skill.category} · {skill.type}</div>
            </div>
          ))}
          {skills.length === 0 && <div className="px-3 py-8 text-editor-muted text-xs text-center">点击 "+ 新建" 创建技能</div>}
        </div>

        {selected ? (
          <div className="flex-1 p-4 overflow-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-editor-muted block mb-1">名称</label>
                <input className="input-field w-full" value={selected.name} onChange={(e) => updateSkill(selected.id, { name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-editor-muted block mb-1">类型</label>
                <select className="input-field w-full" value={selected.type} onChange={(e) => updateSkill(selected.id, { type: e.target.value })}>
                  {SKILL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-editor-muted block mb-1">分类</label>
                <select className="input-field w-full" value={selected.category} onChange={(e) => updateSkill(selected.id, { category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-editor-muted block mb-1">目标类型</label>
                <select className="input-field w-full" value={selected.targetType} onChange={(e) => updateSkill(selected.id, { targetType: e.target.value })}>
                  {TARGET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-editor-muted block mb-1">描述</label>
              <textarea className="input-field w-full h-16 resize-y" value={selected.description} onChange={(e) => updateSkill(selected.id, { description: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div><label className="text-xs text-editor-muted block mb-1">MP消耗</label><NumberInput className="input-field w-full" value={selected.mpCost} onChange={(v) => updateSkill(selected.id, { mpCost: v })} /></div>
              <div><label className="text-xs text-editor-muted block mb-1">冷却(秒)</label><NumberInput className="input-field w-full" value={selected.cooldown} onChange={(v) => updateSkill(selected.id, { cooldown: v })} /></div>
              <div><label className="text-xs text-editor-muted block mb-1">施法时间</label><NumberInput className="input-field w-full" value={selected.castTime} onChange={(v) => updateSkill(selected.id, { castTime: v })} /></div>
              <div><label className="text-xs text-editor-muted block mb-1">范围</label><NumberInput className="input-field w-full" value={selected.range} onChange={(v) => updateSkill(selected.id, { range: v })} /></div>
            </div>
            {/* Effects */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-editor-muted">效果链</label>
                <button className="text-xs text-editor-accent hover:text-white" onClick={() => updateSkill(selected.id, { effects: [...selected.effects, { type: 'damage', value: 10 }] })}>+ 添加效果</button>
              </div>
              {selected.effects.map((eff, i) => (
                <div key={i} className="flex items-center gap-2 mb-1 p-2 bg-editor-bg rounded">
                  <select className="input-field text-xs" value={eff.type} onChange={(e) => {
                    const newEff = [...selected.effects];
                    newEff[i] = { ...eff, type: e.target.value };
                    updateSkill(selected.id, { effects: newEff });
                  }}>
                    <option value="damage">伤害</option>
                    <option value="heal">治疗</option>
                    <option value="applyStatus">施加状态</option>
                  </select>
                  <NumberInput className="input-field w-20 text-xs" value={eff.value} onChange={(v) => {
                    const newEff = [...selected.effects];
                    newEff[i] = { ...eff, value: v };
                    updateSkill(selected.id, { effects: newEff });
                  }} />
                  <button className="text-xs text-editor-muted hover:text-editor-accent" onClick={() => updateSkill(selected.id, { effects: selected.effects.filter((_, j) => j !== i) })}>x</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs" onClick={() => { deleteSkill(selected.id); setSelectedId(null); }}>删除技能</button>
              <span className="text-[10px] text-editor-muted">ID: {selected.id}</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-editor-muted text-xs">选择一个技能或点击 "+ 新建"</div>
        )}
      </div>
    </AssetEditorWindow>
  );
}
