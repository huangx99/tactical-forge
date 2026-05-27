export interface DataField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
  options?: { label: string; value: string }[];
  defaultValue?: unknown;
}

import type { DataPinDef as SharedDataPinDef } from '@tactical-forge/shared';
export type DataPinDef = SharedDataPinDef;

export interface NodeTypeDef {
  type: string;
  category: 'event' | 'condition' | 'action' | 'flow';
  label: string;
  description: string;
  color: string;
  inputs: { id: string; label: string }[];
  outputs: { id: string; label: string }[];
  dataInputs?: DataPinDef[];
  dataOutputs?: DataPinDef[];
}

export const DATA_PIN_COLORS: Record<string, string> = {
  number: '#22c55e',
  string: '#f97316',
  boolean: '#a855f7',
  any: '#94a3b8',
};

export const NODE_REGISTRY = [
  // ═══════════════════════════════════════
  // Events — 只有执行输出 + 数据输出
  // ═══════════════════════════════════════
  {
    type: 'event/onStart',
    category: 'event',
    label: '场景开始',
    description: '场景加载时触发',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataInputs: [],
    dataOutputs: [],
  },
  {
    type: 'event/onInteract',
    category: 'event',
    label: '交互',
    description: '玩家按交互键(E/Enter)时触发',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataInputs: [],
    dataOutputs: [],
  },
  {
    type: 'event/onCollision',
    category: 'event',
    label: '碰撞',
    description: '实体碰撞时触发',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataInputs: [],
    dataOutputs: [
      { id: 'otherId', label: '碰撞对象ID', dataType: 'string' },
    ],
  },
  {
    type: 'event/onTimer',
    category: 'event',
    label: '定时器',
    description: '每隔N秒触发',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataInputs: [],
    dataOutputs: [
      { id: 'timerId', label: '定时器ID', dataType: 'string' },
    ],
  },
  {
    type: 'event/onDeath',
    category: 'event',
    label: '死亡',
    description: '实体HP归零时触发',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataInputs: [],
    dataOutputs: [
      { id: 'killerId', label: '击杀者ID', dataType: 'string' },
    ],
  },
  {
    type: 'event/onDamaged',
    category: 'event',
    label: '受伤',
    description: '实体受到伤害时触发',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataInputs: [],
    dataOutputs: [
      { id: 'amount', label: '伤害量', dataType: 'number' },
      { id: 'sourceId', label: '来源ID', dataType: 'string' },
    ],
  },
  {
    type: 'event/onStatusTick',
    category: 'event',
    label: '状态Tick',
    description: '状态效果每秒触发',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataInputs: [],
    dataOutputs: [
      { id: 'statusId', label: '状态ID', dataType: 'string' },
    ],
  },
  {
    type: 'event/onMove',
    category: 'event',
    label: '移动输入',
    description: '玩家按下移动键时触发(WASD/方向键)',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataInputs: [],
    dataOutputs: [
      { id: 'x', label: 'X方向', dataType: 'number' },
      { id: 'y', label: 'Y方向', dataType: 'number' },
    ],
  },
  {
    type: 'event/onJump',
    category: 'event',
    label: '跳跃输入',
    description: '玩家按下跳跃键时触发(空格)',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataInputs: [],
    dataOutputs: [],
  },
  {
    type: 'event/onAttack',
    category: 'event',
    label: '攻击输入',
    description: '玩家按下攻击键时触发(J)',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataInputs: [],
    dataOutputs: [],
  },
  {
    type: 'event/onSkill',
    category: 'event',
    label: '技能输入',
    description: '玩家按下技能键时触发(1-4)',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataInputs: [],
    dataOutputs: [
      { id: 'slot', label: '技能槽位', dataType: 'number' },
    ],
  },
  {
    type: 'event/onKeyDown',
    category: 'event',
    label: '按下按键',
    description: '指定按键按下时触发（留空则任意按键）',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataInputs: [
      { id: 'key', label: '按键(W/A/S/D/空格/1-4...)', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [
      { id: 'key', label: '按下的键', dataType: 'string' },
    ],
  },
  {
    type: 'event/onKeyUp',
    category: 'event',
    label: '松开按键',
    description: '指定按键松开时触发',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataInputs: [
      { id: 'key', label: '按键', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [
      { id: 'key', label: '松开的键', dataType: 'string' },
    ],
  },
  {
    type: 'event/onKeyHeld',
    category: 'event',
    label: '按住按键(每帧)',
    description: '按键持续按住时每帧触发，用于连续移动',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataInputs: [
      { id: 'key', label: '按键(W/A/S/D...)', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [
      { id: 'key', label: '按住的键', dataType: 'string' },
    ],
  },

  // ═══════════════════════════════════════
  // Conditions — 数据输入 + 数据输出(布尔)
  // ═══════════════════════════════════════
  {
    type: 'condition/hasItem',
    category: 'condition',
    label: '拥有物品',
    description: '检查背包中是否有指定物品',
    color: '#eab308',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [
      { id: 'true', label: '是' },
      { id: 'false', label: '否' },
    ],
    dataInputs: [
      { id: 'itemId', label: '物品ID', dataType: 'string', defaultValue: '' },
      { id: 'quantity', label: '数量', dataType: 'number', defaultValue: 1 },
    ],
    dataOutputs: [
      { id: 'result', label: '结果', dataType: 'boolean' },
    ],
  },
  {
    type: 'condition/compareValue',
    category: 'condition',
    label: '比较值',
    description: '比较两个值',
    color: '#eab308',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [
      { id: 'true', label: '是' },
      { id: 'false', label: '否' },
    ],
    dataInputs: [
      { id: 'a', label: '值A', dataType: 'any', defaultValue: '' },
      { id: 'b', label: '值B', dataType: 'any', defaultValue: '' },
    ],
    dataOutputs: [
      { id: 'result', label: '结果', dataType: 'boolean' },
    ],
  },
  {
    type: 'condition/checkFlag',
    category: 'condition',
    label: '检查标记',
    description: '检查游戏标记是否为true',
    color: '#eab308',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [
      { id: 'true', label: '是' },
      { id: 'false', label: '否' },
    ],
    dataInputs: [
      { id: 'flag', label: '标记名', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [
      { id: 'result', label: '结果', dataType: 'boolean' },
    ],
  },
  {
    type: 'condition/randomChance',
    category: 'condition',
    label: '随机概率',
    description: '按百分比概率走不同分支',
    color: '#eab308',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [
      { id: 'true', label: '成功' },
      { id: 'false', label: '失败' },
    ],
    dataInputs: [
      { id: 'chance', label: '概率(0-100)', dataType: 'number', defaultValue: 50 },
    ],
    dataOutputs: [
      { id: 'result', label: '结果', dataType: 'boolean' },
    ],
  },
  {
    type: 'condition/skillReady',
    category: 'condition',
    label: '技能就绪',
    description: '检查技能冷却是否结束',
    color: '#eab308',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [
      { id: 'true', label: '就绪' },
      { id: 'false', label: '冷却中' },
    ],
    dataInputs: [
      { id: 'skillId', label: '技能ID', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [
      { id: 'result', label: '结果', dataType: 'boolean' },
    ],
  },
  {
    type: 'condition/hasSkill',
    category: 'condition',
    label: '拥有技能',
    description: '检查是否拥有指定技能',
    color: '#eab308',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [
      { id: 'true', label: '是' },
      { id: 'false', label: '否' },
    ],
    dataInputs: [
      { id: 'skillId', label: '技能ID', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [
      { id: 'result', label: '结果', dataType: 'boolean' },
    ],
  },
  {
    type: 'condition/hasStatus',
    category: 'condition',
    label: '拥有状态',
    description: '检查是否有指定状态效果',
    color: '#eab308',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [
      { id: 'true', label: '是' },
      { id: 'false', label: '否' },
    ],
    dataInputs: [
      { id: 'statusId', label: '状态ID', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [
      { id: 'result', label: '结果', dataType: 'boolean' },
    ],
  },
  {
    type: 'condition/isAlive',
    category: 'condition',
    label: '存活',
    description: '检查实体HP是否大于0',
    color: '#eab308',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [
      { id: 'true', label: '存活' },
      { id: 'false', label: '死亡' },
    ],
    dataInputs: [],
    dataOutputs: [
      { id: 'result', label: '结果', dataType: 'boolean' },
    ],
  },

  // ═══════════════════════════════════════
  // Actions — 数据输入 + 无数据输出
  // ═══════════════════════════════════════
  {
    type: 'action/move',
    category: 'action',
    label: '移动',
    description: '按方向向量移动实体（配合移动输入事件使用）',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'x', label: 'X方向', dataType: 'number', defaultValue: 0 },
      { id: 'y', label: 'Y方向', dataType: 'number', defaultValue: 0 },
      { id: 'speed', label: '速度', dataType: 'number', defaultValue: 3 },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/getPosition',
    category: 'action',
    label: '获取位置',
    description: '读取实体当前坐标',
    color: '#3b82f6',
    inputs: [],
    outputs: [],
    dataInputs: [],
    dataOutputs: [
      { id: 'x', label: 'X坐标', dataType: 'number' },
      { id: 'y', label: 'Y坐标', dataType: 'number' },
    ],
  },
  {
    type: 'action/getName',
    category: 'action',
    label: '获取名称',
    description: '读取实体的名称',
    color: '#3b82f6',
    inputs: [],
    outputs: [],
    dataInputs: [
      { id: 'entityId', label: '实体ID', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [
      { id: 'name', label: '名称', dataType: 'string' },
    ],
  },
  {
    type: 'action/setPosition',
    category: 'action',
    label: '设置位置',
    description: '设置实体坐标',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'x', label: 'X坐标', dataType: 'number', defaultValue: 0 },
      { id: 'y', label: 'Y坐标', dataType: 'number', defaultValue: 0 },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/showDialogue',
    category: 'action',
    label: '显示对话',
    description: '显示对话框',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'text', label: '对话文本', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [
      { id: 'choice', label: '选择的选项', dataType: 'number' },
    ],
  },
  {
    type: 'action/addItem',
    category: 'action',
    label: '添加物品',
    description: '向背包添加物品',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'itemId', label: '物品ID', dataType: 'string', defaultValue: '' },
      { id: 'quantity', label: '数量', dataType: 'number', defaultValue: 1 },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/removeItem',
    category: 'action',
    label: '移除物品',
    description: '从背包移除物品',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'itemId', label: '物品ID', dataType: 'string', defaultValue: '' },
      { id: 'quantity', label: '数量', dataType: 'number', defaultValue: 1 },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/dealDamage',
    category: 'action',
    label: '造成伤害',
    description: '对目标造成伤害',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'amount', label: '伤害值', dataType: 'number', defaultValue: 10 },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/heal',
    category: 'action',
    label: '治疗',
    description: '恢复HP',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'amount', label: '治疗量', dataType: 'number', defaultValue: 20 },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/setFlag',
    category: 'action',
    label: '设置标记',
    description: '设置游戏标记',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'flag', label: '标记名', dataType: 'string', defaultValue: '' },
      { id: 'value', label: '值', dataType: 'boolean', defaultValue: true },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/spawnObject',
    category: 'action',
    label: '生成对象',
    description: '在指定位置生成对象',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'prefabId', label: '预制体ID', dataType: 'string', defaultValue: '' },
      { id: 'x', label: 'X', dataType: 'number', defaultValue: 0 },
      { id: 'y', label: 'Y', dataType: 'number', defaultValue: 0 },
    ],
    dataOutputs: [
      { id: 'entityId', label: '生成的实体ID', dataType: 'string' },
    ],
  },
  {
    type: 'action/teleport',
    category: 'action',
    label: '传送',
    description: '传送到指定位置或场景',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'sceneId', label: '场景ID', dataType: 'string', defaultValue: '' },
      { id: 'x', label: 'X', dataType: 'number', defaultValue: 0 },
      { id: 'y', label: 'Y', dataType: 'number', defaultValue: 0 },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/playSound',
    category: 'action',
    label: '播放音效',
    description: '播放音效',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'soundId', label: '音效ID', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/applyStatus',
    category: 'action',
    label: '施加状态',
    description: '给目标施加Buff/Debuff',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'statusId', label: '状态ID', dataType: 'string', defaultValue: '' },
      { id: 'duration', label: '持续时间', dataType: 'number', defaultValue: 5 },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/useItem',
    category: 'action',
    label: '使用物品',
    description: '使用消耗品',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'itemId', label: '物品ID', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/equipItem',
    category: 'action',
    label: '装备物品',
    description: '装备物品到指定槽位',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'itemId', label: '物品ID', dataType: 'string', defaultValue: '' },
      { id: 'slot', label: '槽位', dataType: 'string', defaultValue: 'mainHand' },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/unequipItem',
    category: 'action',
    label: '卸下装备',
    description: '卸下指定槽位的装备',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'slot', label: '槽位', dataType: 'string', defaultValue: 'mainHand' },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/castSkill',
    category: 'action',
    label: '释放技能',
    description: '释放指定技能',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'skillId', label: '技能ID', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/learnSkill',
    category: 'action',
    label: '学习技能',
    description: '学习技能到快捷栏',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'skillId', label: '技能ID', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/setCooldown',
    category: 'action',
    label: '设置冷却',
    description: '设置技能冷却时间',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'skillId', label: '技能ID', dataType: 'string', defaultValue: '' },
      { id: 'cooldown', label: '冷却(秒)', dataType: 'number', defaultValue: 0 },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/removeStatus',
    category: 'action',
    label: '移除状态',
    description: '移除指定状态效果',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'statusId', label: '状态ID', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/clearAllStatus',
    category: 'action',
    label: '清除所有状态',
    description: '清除所有状态效果',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [],
    dataOutputs: [],
  },
  {
    type: 'action/rollLoot',
    category: 'action',
    label: '掷掉落',
    description: '按掉落表随机生成物品',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'lootTableId', label: '掉落表ID', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/setVariable',
    category: 'action',
    label: '设置变量',
    description: '设置蓝图变量',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'variable', label: '变量名', dataType: 'string', defaultValue: '' },
      { id: 'value', label: '值', dataType: 'any', defaultValue: '' },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/getVariable',
    category: 'action',
    label: '获取变量',
    description: '读取蓝图变量',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'variable', label: '变量名', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [
      { id: 'value', label: '值', dataType: 'any' },
    ],
  },
  {
    type: 'action/emitEvent',
    category: 'action',
    label: '发射事件',
    description: '发射自定义事件',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'eventType', label: '事件类型', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [],
  },
  {
    type: 'action/log',
    category: 'action',
    label: '日志',
    description: '在运行画面左上角显示日志，超时自动消失，多条堆叠',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'text', label: '内容', dataType: 'string', defaultValue: 'Hello' },
      { id: 'duration', label: '秒数', dataType: 'number', defaultValue: 3 },
    ],
    dataOutputs: [],
  },

  // ═══════════════════════════════════════
  // Flow — 执行流控制
  // ═══════════════════════════════════════
  {
    type: 'flow/sequence',
    category: 'flow',
    label: '顺序执行',
    description: '按顺序执行多个输出',
    color: '#a855f7',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [
      { id: 'out1', label: '步骤1' },
      { id: 'out2', label: '步骤2' },
      { id: 'out3', label: '步骤3' },
    ],
    dataInputs: [],
    dataOutputs: [],
  },
  {
    type: 'flow/delay',
    category: 'flow',
    label: '延迟',
    description: '等待N秒后继续',
    color: '#a855f7',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'duration', label: '延迟(秒)', dataType: 'number', defaultValue: 1 },
    ],
    dataOutputs: [],
  },
  {
    type: 'flow/loop',
    category: 'flow',
    label: '循环',
    description: '循环执行N次',
    color: '#a855f7',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [
      { id: 'body', label: '循环体' },
      { id: 'done', label: '完成' },
    ],
    dataInputs: [
      { id: 'count', label: '次数', dataType: 'number', defaultValue: 3 },
    ],
    dataOutputs: [
      { id: 'index', label: '当前索引', dataType: 'number' },
    ],
  },
  {
    type: 'flow/blueprintRef',
    category: 'flow',
    label: '引用蓝图',
    description: '调用另一个蓝图',
    color: '#a855f7',
    inputs: [{ id: 'in', label: '执行' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataInputs: [
      { id: 'blueprintId', label: '蓝图ID', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [],
  },

  // ═══════════════════════════════════════
  // Math — 数学运算节点（纯数据节点）
  // ═══════════════════════════════════════
  {
    type: 'math/add',
    category: 'flow',
    label: '加法',
    description: '两数相加',
    color: '#a855f7',
    inputs: [],
    outputs: [],
    dataInputs: [
      { id: 'a', label: 'A', dataType: 'number', defaultValue: 0 },
      { id: 'b', label: 'B', dataType: 'number', defaultValue: 0 },
    ],
    dataOutputs: [
      { id: 'result', label: '结果', dataType: 'number' },
    ],
  },
  {
    type: 'math/multiply',
    category: 'flow',
    label: '乘法',
    description: '两数相乘',
    color: '#a855f7',
    inputs: [],
    outputs: [],
    dataInputs: [
      { id: 'a', label: 'A', dataType: 'number', defaultValue: 0 },
      { id: 'b', label: 'B', dataType: 'number', defaultValue: 0 },
    ],
    dataOutputs: [
      { id: 'result', label: '结果', dataType: 'number' },
    ],
  },
  {
    type: 'math/clamp',
    category: 'flow',
    label: '限制范围',
    description: '将数值限制在最小和最大之间',
    color: '#a855f7',
    inputs: [],
    outputs: [],
    dataInputs: [
      { id: 'value', label: '值', dataType: 'number', defaultValue: 0 },
      { id: 'min', label: '最小', dataType: 'number', defaultValue: 0 },
      { id: 'max', label: '最大', dataType: 'number', defaultValue: 100 },
    ],
    dataOutputs: [
      { id: 'result', label: '结果', dataType: 'number' },
    ],
  },
  {
    type: 'math/random',
    category: 'flow',
    label: '随机数',
    description: '生成随机数',
    color: '#a855f7',
    inputs: [],
    outputs: [],
    dataInputs: [
      { id: 'min', label: '最小', dataType: 'number', defaultValue: 0 },
      { id: 'max', label: '最大', dataType: 'number', defaultValue: 100 },
    ],
    dataOutputs: [
      { id: 'result', label: '结果', dataType: 'number' },
    ],
  },

  // ═══════════════════════════════════════
  // String — 字符串操作节点
  // ═══════════════════════════════════════
  {
    type: 'string/concat',
    category: 'flow',
    label: '拼接',
    description: '将两个文本拼接在一起',
    color: '#f97316',
    inputs: [],
    outputs: [],
    dataInputs: [
      { id: 'a', label: '文本A', dataType: 'string', defaultValue: '' },
      { id: 'b', label: '文本B', dataType: 'string', defaultValue: '' },
    ],
    dataOutputs: [
      { id: 'result', label: '结果', dataType: 'string' },
    ],
  },

  // ═══════════════════════════════════════
  // Value — 常量值节点（纯数据节点）
  // ═══════════════════════════════════════
  {
    type: 'value/number',
    category: 'flow',
    label: '数值',
    description: '输出一个固定数值',
    color: '#a855f7',
    inputs: [],
    outputs: [],
    dataInputs: [],
    dataOutputs: [
      { id: 'value', label: '值', dataType: 'number' },
    ],
  },
  {
    type: 'value/string',
    category: 'flow',
    label: '文本',
    description: '输出一个固定文本',
    color: '#a855f7',
    inputs: [],
    outputs: [],
    dataInputs: [],
    dataOutputs: [
      { id: 'value', label: '值', dataType: 'string' },
    ],
  },
  {
    type: 'value/boolean',
    category: 'flow',
    label: '布尔值',
    description: '输出true或false',
    color: '#a855f7',
    inputs: [],
    outputs: [],
    dataInputs: [],
    dataOutputs: [
      { id: 'value', label: '值', dataType: 'boolean' },
    ],
  },
  {
    type: 'value/key',
    category: 'flow',
    label: '按键值',
    description: '输出一个按键名称(如 W, A, 空格, 1)',
    color: '#a855f7',
    inputs: [],
    outputs: [],
    dataInputs: [],
    dataOutputs: [
      { id: 'value', label: '按键', dataType: 'string' },
    ],
  },
] as NodeTypeDef[];

export function getNodeType(type: string): NodeTypeDef | undefined {
  return NODE_REGISTRY.find((n) => n.type === type);
}

export function getNodesByCategory(category: NodeTypeDef['category']): NodeTypeDef[] {
  return NODE_REGISTRY.filter((n) => n.category === category);
}

export const CATEGORY_LABELS: Record<string, string> = {
  event: '事件',
  condition: '条件',
  action: '动作',
  flow: '流程/数学',
};

export const CATEGORY_COLORS: Record<string, string> = {
  event: '#22c55e',
  condition: '#eab308',
  action: '#3b82f6',
  flow: '#a855f7',
};
