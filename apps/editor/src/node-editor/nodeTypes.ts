export interface NodeTypeDef {
  type: string;
  category: 'event' | 'condition' | 'action' | 'flow';
  label: string;
  description: string;
  color: string;
  inputs: { id: string; label: string }[];
  outputs: { id: string; label: string }[];
  defaultData?: Record<string, unknown>;
  dataFields?: DataField[];
}

export interface DataField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
  options?: { label: string; value: string }[];
  defaultValue?: unknown;
}

export const NODE_REGISTRY: NodeTypeDef[] = [
  // Events
  {
    type: 'event/onStart',
    category: 'event',
    label: '场景开始',
    description: '场景加载时触发',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
  },
  {
    type: 'event/onInteract',
    category: 'event',
    label: '交互',
    description: '玩家按交互键时触发',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
  },
  {
    type: 'event/onCollision',
    category: 'event',
    label: '碰撞',
    description: '实体碰撞时触发',
    color: '#22c55e',
    inputs: [],
    outputs: [{ id: 'out', label: '触发' }],
    dataFields: [
      { key: 'targetTag', label: '目标标签', type: 'text', defaultValue: '' },
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
    dataFields: [
      { key: 'interval', label: '间隔(秒)', type: 'number', defaultValue: 1 },
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
  },

  // Conditions
  {
    type: 'condition/hasItem',
    category: 'condition',
    label: '拥有物品',
    description: '检查背包中是否有指定物品',
    color: '#eab308',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [
      { id: 'true', label: '是' },
      { id: 'false', label: '否' },
    ],
    dataFields: [
      { key: 'itemId', label: '物品ID', type: 'text', defaultValue: '' },
      { key: 'quantity', label: '数量', type: 'number', defaultValue: 1 },
    ],
  },
  {
    type: 'condition/compareValue',
    category: 'condition',
    label: '比较值',
    description: '比较变量或属性',
    color: '#eab308',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [
      { id: 'true', label: '是' },
      { id: 'false', label: '否' },
    ],
    dataFields: [
      { key: 'variable', label: '变量名', type: 'text', defaultValue: '' },
      { key: 'operator', label: '运算符', type: 'select', options: [
        { label: '等于', value: '==' },
        { label: '大于', value: '>' },
        { label: '小于', value: '<' },
        { label: '大于等于', value: '>=' },
        { label: '小于等于', value: '<=' },
        { label: '不等于', value: '!=' },
      ], defaultValue: '==' },
      { key: 'value', label: '比较值', type: 'text', defaultValue: '0' },
    ],
  },
  {
    type: 'condition/checkFlag',
    category: 'condition',
    label: '检查标记',
    description: '检查游戏标记是否为指定值',
    color: '#eab308',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [
      { id: 'true', label: '是' },
      { id: 'false', label: '否' },
    ],
    dataFields: [
      { key: 'flag', label: '标记名', type: 'text', defaultValue: '' },
    ],
  },
  {
    type: 'condition/randomChance',
    category: 'condition',
    label: '随机概率',
    description: '按百分比概率触发',
    color: '#eab308',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [
      { id: 'true', label: '成功' },
      { id: 'false', label: '失败' },
    ],
    dataFields: [
      { key: 'chance', label: '概率(0-100)', type: 'number', defaultValue: 50 },
    ],
  },

  // Actions
  {
    type: 'action/showDialogue',
    category: 'action',
    label: '显示对话',
    description: '显示对话框',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataFields: [
      { key: 'text', label: '对话文本', type: 'textarea', defaultValue: '' },
      { key: 'choices', label: '选项(逗号分隔)', type: 'text', defaultValue: '' },
    ],
  },
  {
    type: 'action/addItem',
    category: 'action',
    label: '添加物品',
    description: '向背包添加物品',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataFields: [
      { key: 'itemId', label: '物品ID', type: 'text', defaultValue: '' },
      { key: 'quantity', label: '数量', type: 'number', defaultValue: 1 },
    ],
  },
  {
    type: 'action/removeItem',
    category: 'action',
    label: '移除物品',
    description: '从背包移除物品',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataFields: [
      { key: 'itemId', label: '物品ID', type: 'text', defaultValue: '' },
      { key: 'quantity', label: '数量', type: 'number', defaultValue: 1 },
    ],
  },
  {
    type: 'action/dealDamage',
    category: 'action',
    label: '造成伤害',
    description: '对目标造成伤害',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataFields: [
      { key: 'amount', label: '伤害值', type: 'number', defaultValue: 10 },
      { key: 'element', label: '元素', type: 'select', options: [
        { label: '物理', value: 'physical' },
        { label: '火焰', value: 'fire' },
        { label: '冰霜', value: 'ice' },
        { label: '雷电', value: 'lightning' },
      ], defaultValue: 'physical' },
    ],
  },
  {
    type: 'action/heal',
    category: 'action',
    label: '治疗',
    description: '恢复HP',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataFields: [
      { key: 'amount', label: '治疗量', type: 'number', defaultValue: 20 },
    ],
  },
  {
    type: 'action/setFlag',
    category: 'action',
    label: '设置标记',
    description: '设置游戏标记',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataFields: [
      { key: 'flag', label: '标记名', type: 'text', defaultValue: '' },
      { key: 'value', label: '值', type: 'boolean', defaultValue: true },
    ],
  },
  {
    type: 'action/spawnObject',
    category: 'action',
    label: '生成对象',
    description: '在指定位置生成对象',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataFields: [
      { key: 'prefabId', label: '预制体ID', type: 'text', defaultValue: '' },
      { key: 'x', label: 'X', type: 'number', defaultValue: 0 },
      { key: 'y', label: 'Y', type: 'number', defaultValue: 0 },
    ],
  },
  {
    type: 'action/teleport',
    category: 'action',
    label: '传送',
    description: '传送到指定位置或场景',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataFields: [
      { key: 'sceneId', label: '场景ID(可选)', type: 'text', defaultValue: '' },
      { key: 'x', label: 'X', type: 'number', defaultValue: 0 },
      { key: 'y', label: 'Y', type: 'number', defaultValue: 0 },
    ],
  },
  {
    type: 'action/playSound',
    category: 'action',
    label: '播放音效',
    description: '播放音效',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataFields: [
      { key: 'soundId', label: '音效ID', type: 'text', defaultValue: '' },
    ],
  },
  {
    type: 'action/applyStatus',
    category: 'action',
    label: '施加状态',
    description: '给目标施加Buff/Debuff',
    color: '#3b82f6',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataFields: [
      { key: 'statusId', label: '状态ID', type: 'text', defaultValue: '' },
      { key: 'duration', label: '持续时间', type: 'number', defaultValue: 5 },
    ],
  },

  // Flow
  {
    type: 'flow/sequence',
    category: 'flow',
    label: '顺序执行',
    description: '按顺序执行多个输出',
    color: '#a855f7',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [
      { id: 'out1', label: '步骤1' },
      { id: 'out2', label: '步骤2' },
      { id: 'out3', label: '步骤3' },
    ],
  },
  {
    type: 'flow/delay',
    category: 'flow',
    label: '延迟',
    description: '等待N秒后继续',
    color: '#a855f7',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataFields: [
      { key: 'duration', label: '延迟(秒)', type: 'number', defaultValue: 1 },
    ],
  },
  {
    type: 'flow/loop',
    category: 'flow',
    label: '循环',
    description: '循环执行N次',
    color: '#a855f7',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [
      { id: 'body', label: '循环体' },
      { id: 'done', label: '完成' },
    ],
    dataFields: [
      { key: 'count', label: '次数', type: 'number', defaultValue: 3 },
    ],
  },
  {
    type: 'flow/blueprintRef',
    category: 'flow',
    label: '引用蓝图',
    description: '调用另一个蓝图',
    color: '#a855f7',
    inputs: [{ id: 'in', label: '输入' }],
    outputs: [{ id: 'out', label: '完成' }],
    dataFields: [
      { key: 'blueprintId', label: '蓝图ID', type: 'text', defaultValue: '' },
    ],
  },
];

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
  flow: '流程',
};

export const CATEGORY_COLORS: Record<string, string> = {
  event: '#22c55e',
  condition: '#eab308',
  action: '#3b82f6',
  flow: '#a855f7',
};
