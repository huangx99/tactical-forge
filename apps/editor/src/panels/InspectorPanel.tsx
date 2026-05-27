import { useState } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { useSceneStore } from '../stores/sceneStore';
import { useBlueprintStore } from '../stores/blueprintStore';
import { useAssetStore } from '../stores/assetStore';
import type { ComponentData } from '@tactical-forge/shared';

const TYPE_LABELS: Record<string, string> = {
  player: '玩家', npc: 'NPC', enemy: '敌人', item: '道具', prop: '装饰',
};

const TYPE_COLORS: Record<string, string> = {
  player: '#22c55e', npc: '#3b82f6', enemy: '#ef4444', item: '#eab308', prop: '#6b7280',
};

const STAT_LABELS: Record<string, string> = {
  str: '力量', dex: '敏捷', int: '智力', atk: '攻击', def: '防御', spd: '速度',
  hp: 'HP', mp: 'MP', luck: '幸运', charisma: '魅力',
};

const QUICK_ADD: { name: string; label: string; data: ComponentData }[] = [
  { name: 'health', label: '生命值', data: { max: 100, current: 100 } },
  { name: 'stats', label: '属性', data: { template: 'rpg', base: { str: 10, dex: 10, int: 10, atk: 10, def: 10, spd: 10 }, custom: {} } },
  { name: 'playerController', label: '控制器', data: { speed: 3, jumpForce: 8 } },
  { name: 'inventory', label: '背包', data: { capacity: 20, slots: [] } },
  { name: 'equipment', label: '装备', data: { slots: [{ slotId: 'mainHand', itemId: null }, { slotId: 'head', itemId: null }, { slotId: 'body', itemId: null }] } },
  { name: 'collider', label: '碰撞体', data: { shape: 'box', w: 24, h: 24 } },
  { name: 'dialogueTrigger', label: '对话', data: { blueprintId: '', interactRange: 32 } },
  { name: 'combat', label: '战斗', data: { attack: 5, defense: 2, blueprintId: '' } },
  { name: 'skillBar', label: '技能栏', data: { slots: [] } },
];

// --- Inline component renderers ---

function HealthView({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const max = Number(data.max) || 100;
  const current = Number(data.current) || 0;
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-editor-border rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct > 50 ? '#22c55e' : pct > 25 ? '#eab308' : '#ef4444' }} />
        </div>
        <span className="text-[10px] text-editor-muted">{current}/{max}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div>
          <label className="text-[10px] text-editor-muted">当前</label>
          <input className="input-field w-full text-xs" type="number" value={current} onChange={(e) => onChange({ ...data, current: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-[10px] text-editor-muted">最大</label>
          <input className="input-field w-full text-xs" type="number" value={max} onChange={(e) => onChange({ ...data, max: Number(e.target.value) })} />
        </div>
      </div>
    </div>
  );
}

function StatsView({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const base = (data.base as Record<string, number>) ?? {};
  const custom = (data.custom as Record<string, unknown>) ?? {};
  return (
    <div className="space-y-2">
      <div className="text-[10px] text-editor-muted">模板: {String(data.template ?? 'rpg')}</div>
      <div className="grid grid-cols-3 gap-1">
        {Object.entries(base).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1">
            <span className="text-[10px] text-editor-muted w-6">{STAT_LABELS[k] ?? k}</span>
            <input
              className="input-field w-full text-xs"
              type="number"
              value={v}
              onChange={(e) => onChange({ ...data, base: { ...base, [k]: Number(e.target.value) } })}
            />
          </div>
        ))}
      </div>
      {Object.keys(custom).length > 0 && (
        <>
          <div className="text-[10px] text-editor-muted">自定义属性</div>
          {Object.entries(custom).map(([k, v]) => {
            const val = typeof v === 'object' && v !== null ? (v as Record<string, unknown>).value : v;
            return (
              <div key={k} className="flex items-center gap-1">
                <span className="text-[10px] text-editor-accent w-16">{k}</span>
                <input
                  className="input-field flex-1 text-xs"
                  type="number"
                  value={Number(val) || 0}
                  onChange={(e) => onChange({ ...data, custom: { ...custom, [k]: { type: 'number', value: Number(e.target.value) } } })}
                />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function PlayerControllerView({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="text-[10px] text-editor-muted">移动速度</label>
        <input className="input-field w-full text-xs" type="number" value={Number(data.speed) || 3} onChange={(e) => onChange({ ...data, speed: Number(e.target.value) })} />
      </div>
      <div>
        <label className="text-[10px] text-editor-muted">跳跃力</label>
        <input className="input-field w-full text-xs" type="number" value={Number(data.jumpForce) || 8} onChange={(e) => onChange({ ...data, jumpForce: Number(e.target.value) })} />
      </div>
    </div>
  );
}

function ColliderView({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-1">
      <select className="input-field w-full text-xs" value={String(data.shape ?? 'box')} onChange={(e) => onChange({ ...data, shape: e.target.value })}>
        <option value="box">矩形</option>
        <option value="circle">圆形</option>
      </select>
      {data.shape === 'circle' ? (
        <div>
          <label className="text-[10px] text-editor-muted">半径</label>
          <input className="input-field w-full text-xs" type="number" value={Number(data.radius) || 12} onChange={(e) => onChange({ ...data, radius: Number(e.target.value) })} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1">
          <div>
            <label className="text-[10px] text-editor-muted">宽</label>
            <input className="input-field w-full text-xs" type="number" value={Number(data.w) || 24} onChange={(e) => onChange({ ...data, w: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-[10px] text-editor-muted">高</label>
            <input className="input-field w-full text-xs" type="number" value={Number(data.h) || 24} onChange={(e) => onChange({ ...data, h: Number(e.target.value) })} />
          </div>
        </div>
      )}
      <label className="flex items-center gap-1 text-[10px] text-editor-muted">
        <input type="checkbox" checked={!!data.isTrigger} onChange={(e) => onChange({ ...data, isTrigger: e.target.checked })} />
        触发器
      </label>
    </div>
  );
}

function DialogueTriggerView({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { openAssetEditorWindow } = useEditorStore();
  const { blueprints } = useBlueprintStore();
  const bpId = String(data.blueprintId ?? '');
  const bp = blueprints.find((b) => b.id === bpId);

  return (
    <div className="space-y-1">
      <div>
        <label className="text-[10px] text-editor-muted">关联蓝图</label>
        <select className="input-field w-full text-xs" value={bpId} onChange={(e) => onChange({ ...data, blueprintId: e.target.value })}>
          <option value="">未指定</option>
          {blueprints.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        {bp && (
          <button className="text-[10px] text-editor-accent hover:underline mt-0.5" onClick={() => openAssetEditorWindow('blueprint')}>
            打开蓝图: {bp.name}
          </button>
        )}
      </div>
      <div>
        <label className="text-[10px] text-editor-muted">交互范围</label>
        <input className="input-field w-full text-xs" type="number" value={Number(data.interactRange) || 32} onChange={(e) => onChange({ ...data, interactRange: Number(e.target.value) })} />
      </div>
    </div>
  );
}

function CombatView({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { openAssetEditorWindow } = useEditorStore();
  const { blueprints } = useBlueprintStore();
  const bpId = String(data.blueprintId ?? '');
  const bp = blueprints.find((b) => b.id === bpId);

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-1">
        <div>
          <label className="text-[10px] text-editor-muted">攻击力</label>
          <input className="input-field w-full text-xs" type="number" value={Number(data.attack) || 0} onChange={(e) => onChange({ ...data, attack: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-[10px] text-editor-muted">防御力</label>
          <input className="input-field w-full text-xs" type="number" value={Number(data.defense) || 0} onChange={(e) => onChange({ ...data, defense: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <label className="text-[10px] text-editor-muted">AI蓝图</label>
        <select className="input-field w-full text-xs" value={bpId} onChange={(e) => onChange({ ...data, blueprintId: e.target.value })}>
          <option value="">无</option>
          {blueprints.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        {bp && (
          <button className="text-[10px] text-editor-accent hover:underline mt-0.5" onClick={() => openAssetEditorWindow('blueprint')}>
            打开蓝图: {bp.name}
          </button>
        )}
      </div>
    </div>
  );
}

function InventoryView({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { items } = useAssetStore();
  const { openAssetEditorWindow } = useEditorStore();
  const capacity = Number(data.capacity) || 20;
  const slots = (data.slots as Array<{ itemId: string; quantity: number }>) ?? [];

  const addItem = (itemId: string) => {
    const existing = slots.findIndex((s) => s.itemId === itemId);
    if (existing >= 0) {
      const newSlots = [...slots];
      newSlots[existing] = { ...newSlots[existing], quantity: newSlots[existing].quantity + 1 };
      onChange({ ...data, slots: newSlots });
    } else if (slots.length < capacity) {
      onChange({ ...data, slots: [...slots, { itemId, quantity: 1 }] });
    }
  };

  const removeItem = (index: number) => {
    onChange({ ...data, slots: slots.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-editor-muted">容量: {slots.length}/{capacity}</span>
        <button className="text-[10px] text-editor-accent hover:underline" onClick={() => openAssetEditorWindow('item')}>管理物品</button>
      </div>
      {slots.map((slot, i) => {
        const item = items.find((it) => it.id === slot.itemId);
        return (
          <div key={i} className="flex items-center gap-1 text-[10px]">
            <span className="text-editor-accent flex-1 truncate">{item?.name ?? slot.itemId ?? '(空)'}</span>
            {slot.quantity > 1 && <span className="text-editor-muted">x{slot.quantity}</span>}
            <button className="text-editor-muted hover:text-red-400" onClick={() => removeItem(i)}>x</button>
          </div>
        );
      })}
      {items.length > 0 && slots.length < capacity && (
        <select
          className="input-field w-full text-[10px]"
          value=""
          onChange={(e) => { if (e.target.value) addItem(e.target.value); }}
        >
          <option value="">+ 添加物品...</option>
          {items.map((it) => <option key={it.id} value={it.id}>{it.name}</option>)}
        </select>
      )}
      {items.length === 0 && (
        <button className="text-[10px] text-editor-accent hover:underline" onClick={() => openAssetEditorWindow('item')}>
          先创建物品模板
        </button>
      )}
    </div>
  );
}

function EquipmentView({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { items } = useAssetStore();
  const { openAssetEditorWindow } = useEditorStore();
  const slots = (data.slots as Array<{ slotId: string; itemId: string | null }>) ?? [];

  const SLOT_LABELS: Record<string, string> = {
    mainHand: '主手', offHand: '副手', head: '头部', body: '身体', feet: '脚',
    accessory1: '饰品1', accessory2: '饰品2',
  };

  const equipableItems = items.filter((it) => it.equipSlot);

  const setSlotItem = (slotId: string, itemId: string | null) => {
    const newSlots = slots.map((s) => s.slotId === slotId ? { ...s, itemId } : s);
    onChange({ ...data, slots: newSlots });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-editor-muted">装备槽位</span>
        <button className="text-[10px] text-editor-accent hover:underline" onClick={() => openAssetEditorWindow('item')}>管理物品</button>
      </div>
      {slots.map((slot) => {
        const item = slot.itemId ? items.find((it) => it.id === slot.itemId) : null;
        const compatible = equipableItems.filter((it) => it.equipSlot === slot.slotId);
        return (
          <div key={slot.slotId} className="flex items-center gap-1 text-[10px]">
            <span className="text-editor-muted w-10 shrink-0">{SLOT_LABELS[slot.slotId] ?? slot.slotId}</span>
            <select
              className="input-field flex-1 text-[10px]"
              value={slot.itemId ?? ''}
              onChange={(e) => setSlotItem(slot.slotId, e.target.value || null)}
            >
              <option value="">(空)</option>
              {compatible.map((it) => <option key={it.id} value={it.id}>{it.name}</option>)}
            </select>
            {item && (
              <span className="text-[9px] text-editor-muted shrink-0">
                {Object.entries(item.stats).map(([k, v]) => `${k}+${v}`).join(' ')}
              </span>
            )}
          </div>
        );
      })}
      {equipableItems.length === 0 && (
        <button className="text-[10px] text-editor-accent hover:underline" onClick={() => openAssetEditorWindow('item')}>
          先创建可装备物品
        </button>
      )}
    </div>
  );
}

// --- Component renderer dispatcher ---

function SkillBarView({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { skills } = useAssetStore();
  const { openAssetEditorWindow } = useEditorStore();
  const slots = (data.slots as Array<{ skillId: string; cooldownRemaining: number }>) ?? [];

  const addSkill = (skillId: string) => {
    if (slots.some((s) => s.skillId === skillId)) return;
    onChange({ ...data, slots: [...slots, { skillId, cooldownRemaining: 0 }] });
  };

  const removeSkill = (index: number) => {
    onChange({ ...data, slots: slots.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-editor-muted">{slots.length} 个技能</span>
        <button className="text-[10px] text-editor-accent hover:underline" onClick={() => openAssetEditorWindow('skill')}>管理技能</button>
      </div>
      {slots.map((slot, i) => {
        const skill = skills.find((sk) => sk.id === slot.skillId);
        return (
          <div key={i} className="flex items-center gap-1 text-[10px]">
            <span className="text-editor-accent flex-1 truncate">{skill?.name ?? slot.skillId}</span>
            {skill && <span className="text-editor-muted shrink-0">{skill.mpCost}MP</span>}
            <button className="text-editor-muted hover:text-red-400" onClick={() => removeSkill(i)}>x</button>
          </div>
        );
      })}
      {skills.length > 0 && (
        <select
          className="input-field w-full text-[10px]"
          value=""
          onChange={(e) => { if (e.target.value) addSkill(e.target.value); }}
        >
          <option value="">+ 添加技能...</option>
          {skills.filter((sk) => !slots.some((s) => s.skillId === sk.id)).map((sk) => (
            <option key={sk.id} value={sk.id}>{sk.name}</option>
          ))}
        </select>
      )}
      {skills.length === 0 && (
        <button className="text-[10px] text-editor-accent hover:underline" onClick={() => openAssetEditorWindow('skill')}>
          先创建技能模板
        </button>
      )}
    </div>
  );
}

function ComponentInlineView({ compKey, data, onChange }: { compKey: string; data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  switch (compKey) {
    case 'health': return <HealthView data={data} onChange={onChange} />;
    case 'stats': return <StatsView data={data} onChange={onChange} />;
    case 'playerController': return <PlayerControllerView data={data} onChange={onChange} />;
    case 'collider': return <ColliderView data={data} onChange={onChange} />;
    case 'dialogueTrigger': return <DialogueTriggerView data={data} onChange={onChange} />;
    case 'combat': return <CombatView data={data} onChange={onChange} />;
    case 'inventory': return <InventoryView data={data} onChange={onChange} />;
    case 'equipment': return <EquipmentView data={data} onChange={onChange} />;
    case 'skillBar': return <SkillBarView data={data} onChange={onChange} />;
    default: return null;
  }
}

const HAS_INLINE_VIEW = new Set(['health', 'stats', 'playerController', 'collider', 'dialogueTrigger', 'combat', 'inventory', 'equipment', 'skillBar']);

// --- Main Panel ---

export function InspectorPanel() {
  const { selectedObjectId } = useEditorStore();
  const { scenes, activeSceneId, updateObject } = useSceneStore();

  const activeScene = scenes.find((s) => s.id === activeSceneId);
  const selectedObj = activeScene?.layers
    .filter((l) => l.type === 'object')
    .flatMap((l) => (l.type === 'object' ? l.objects : []))
    .find((o) => o.id === selectedObjectId);

  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [editJson, setEditJson] = useState('');

  if (!selectedObj || !activeSceneId) {
    return (
      <div className="flex flex-col h-full">
        <div className="panel-header">检查器</div>
        <div className="flex-1 flex items-center justify-center text-editor-muted text-xs text-center px-4">
          <div>
            <div className="text-2xl mb-2">📋</div>
            <div>选择场景中的对象</div>
            <div className="mt-1 text-[10px]">在画布上点击物体查看属性</div>
          </div>
        </div>
      </div>
    );
  }

  const handleFieldChange = (field: string, value: unknown) => {
    updateObject(activeSceneId, selectedObj.id, { [field]: value } as Partial<typeof selectedObj>);
  };

  const handleComponentUpdate = (key: string, newData: Record<string, unknown>) => {
    const newComponents = { ...selectedObj.components, [key]: newData };
    updateObject(activeSceneId, selectedObj.id, { components: newComponents });
  };

  const handleComponentSave = (key: string) => {
    try {
      const parsed = JSON.parse(editJson);
      handleComponentUpdate(key, parsed);
      setEditingComponent(null);
    } catch {
      alert('JSON 格式错误');
    }
  };

  const handleComponentDelete = (key: string) => {
    const newComponents = { ...selectedObj.components };
    delete newComponents[key];
    updateObject(activeSceneId, selectedObj.id, { components: newComponents });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="panel-header flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[selectedObj.type] }} />
        <span>{TYPE_LABELS[selectedObj.type] ?? selectedObj.type}</span>
        <span className="text-editor-muted text-[10px] ml-auto">{selectedObj.id.slice(0, 8)}</span>
      </div>

      <div className="p-3 space-y-3 overflow-auto flex-1">
        {/* Type */}
        <div>
          <label className="text-xs text-editor-muted block mb-1">类型</label>
          <select className="input-field w-full" value={selectedObj.type} onChange={(e) => handleFieldChange('type', e.target.value)}>
            <option value="player">玩家</option>
            <option value="npc">NPC</option>
            <option value="enemy">敌人</option>
            <option value="item">道具</option>
            <option value="prop">装饰</option>
          </select>
        </div>

        {/* Sprite */}
        <div>
          <label className="text-xs text-editor-muted block mb-1">精灵图</label>
          <input className="input-field w-full" value={selectedObj.sprite} onChange={(e) => handleFieldChange('sprite', e.target.value)} placeholder="精灵图ID或路径" />
        </div>

        {/* Position */}
        <div className="border-t border-editor-border pt-3">
          <label className="text-xs text-editor-muted block mb-2">位置</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-editor-muted">X</label>
              <input className="input-field w-full" type="number" value={selectedObj.position.x} onChange={(e) => handleFieldChange('position', { ...selectedObj.position, x: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-editor-muted">Y</label>
              <input className="input-field w-full" type="number" value={selectedObj.position.y} onChange={(e) => handleFieldChange('position', { ...selectedObj.position, y: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        {/* Components */}
        <div className="border-t border-editor-border pt-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-editor-muted">组件</label>
            <span className="text-[10px] text-editor-muted">{Object.keys(selectedObj.components).length} 个</span>
          </div>

          {Object.entries(selectedObj.components).map(([key, value]) => {
            const hasInline = HAS_INLINE_VIEW.has(key);
            const isEditing = editingComponent === key;
            const compData = value as Record<string, unknown>;

            return (
              <div key={key} className="mb-2 bg-editor-bg rounded overflow-hidden">
                <div className="flex items-center justify-between px-2 py-1.5 bg-editor-panel">
                  <span className="text-xs font-medium text-editor-accent">{key}</span>
                  <div className="flex gap-1">
                    {hasInline && (
                      <button className="text-[10px] text-editor-muted hover:text-editor-text px-1" onClick={() => { setEditingComponent(isEditing ? null : key); setEditJson(JSON.stringify(value, null, 2)); }}>
                        {isEditing ? '收起' : 'JSON'}
                      </button>
                    )}
                    <button className="text-[10px] text-editor-muted hover:text-red-400 px-1" onClick={() => handleComponentDelete(key)}>x</button>
                  </div>
                </div>

                {/* Inline visual view */}
                {hasInline && !isEditing && (
                  <div className="px-2 py-1.5">
                    <ComponentInlineView compKey={key} data={compData} onChange={(d) => handleComponentUpdate(key, d)} />
                  </div>
                )}

                {/* JSON editor */}
                {(!hasInline || isEditing) && (
                  <div className="p-2">
                    <textarea className="input-field w-full font-mono text-xs h-24 resize-y" value={isEditing ? editJson : JSON.stringify(value, null, 2)} onChange={(e) => setEditJson(e.target.value)} readOnly={!isEditing && !hasInline} />
                    {isEditing && (
                      <div className="flex gap-1 mt-1">
                        <button className="px-2 py-0.5 bg-editor-accent rounded text-xs" onClick={() => handleComponentSave(key)}>保存</button>
                        <button className="px-2 py-0.5 bg-editor-border rounded text-xs" onClick={() => setEditingComponent(null)}>取消</button>
                      </div>
                    )}
                    {!hasInline && !isEditing && (
                      <button className="mt-1 px-2 py-0.5 bg-editor-border rounded text-xs hover:bg-editor-accent" onClick={() => { setEditingComponent(key); setEditJson(JSON.stringify(value, null, 2)); }}>编辑</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {Object.keys(selectedObj.components).length === 0 && (
            <div className="text-xs text-editor-muted text-center py-2">无组件</div>
          )}
        </div>

        {/* Quick add */}
        <div className="border-t border-editor-border pt-3">
          <label className="text-xs text-editor-muted block mb-2">快速添加</label>
          <div className="flex flex-wrap gap-1">
            {QUICK_ADD.map(({ name, label, data }) => (
              <button
                key={name}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  name in selectedObj.components
                    ? 'border-editor-border text-editor-muted cursor-not-allowed'
                    : 'border-editor-border hover:border-editor-accent hover:text-editor-accent'
                }`}
                disabled={name in selectedObj.components}
                onClick={() => handleComponentUpdate(name, data as Record<string, unknown>)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Generate */}
        <div className="border-t border-editor-border pt-3">
          <button className="w-full py-2 bg-editor-accent hover:bg-editor-accent/80 rounded text-sm font-medium transition-colors">
            AI 生成属性
          </button>
        </div>
      </div>
    </div>
  );
}
