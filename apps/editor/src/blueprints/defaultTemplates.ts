import type { Blueprint } from '@tactical-forge/shared';

export const DEFAULT_BLUEPRINT_TEMPLATES: Blueprint[] = [
  // 1. PlayerController — 按键驱动：onKeyHeld(每帧) → getPosition + 常量 → math/add → setPosition
  {
    id: 'tpl_player_controller',
    name: '玩家控制器',
    description: '通过按键事件+数学计算+位置设置实现移动，可自定义按键绑定',
    nodes: [
      // W键 → Y-1 (onKeyHeld: 按住时每帧触发)
      { id: 'n1', type: 'event/onKeyHeld', position: { x: 50, y: 0 }, data: { key: 'w' } },
      { id: 'n2', type: 'action/getPosition', position: { x: 50, y: -80 }, data: {} },
      { id: 'n3', type: 'value/number', position: { x: 50, y: -160 }, data: { value: -1 } },
      { id: 'n4', type: 'math/add', position: { x: 250, y: -120 }, data: {} },
      { id: 'n5', type: 'action/setPosition', position: { x: 450, y: -40 }, data: {} },
      // S键 → Y+1
      { id: 'n6', type: 'event/onKeyHeld', position: { x: 50, y: 150 }, data: { key: 's' } },
      { id: 'n7', type: 'action/getPosition', position: { x: 50, y: 70 }, data: {} },
      { id: 'n8', type: 'value/number', position: { x: 50, y: -10 }, data: { value: 1 } },
      { id: 'n9', type: 'math/add', position: { x: 250, y: 30 }, data: {} },
      { id: 'n10', type: 'action/setPosition', position: { x: 450, y: 110 }, data: {} },
      // A键 → X-1
      { id: 'n11', type: 'event/onKeyHeld', position: { x: 50, y: 300 }, data: { key: 'a' } },
      { id: 'n12', type: 'action/getPosition', position: { x: 50, y: 220 }, data: {} },
      { id: 'n13', type: 'value/number', position: { x: 50, y: 140 }, data: { value: -1 } },
      { id: 'n14', type: 'math/add', position: { x: 250, y: 180 }, data: {} },
      { id: 'n15', type: 'action/setPosition', position: { x: 450, y: 260 }, data: {} },
      // D键 → X+1
      { id: 'n16', type: 'event/onKeyHeld', position: { x: 50, y: 450 }, data: { key: 'd' } },
      { id: 'n17', type: 'action/getPosition', position: { x: 50, y: 370 }, data: {} },
      { id: 'n18', type: 'value/number', position: { x: 50, y: 290 }, data: { value: 1 } },
      { id: 'n19', type: 'math/add', position: { x: 250, y: 330 }, data: {} },
      { id: 'n20', type: 'action/setPosition', position: { x: 450, y: 410 }, data: {} },
      // 空格键 → emitEvent (onKeyDown: 按下一次触发)
      { id: 'n21', type: 'event/onKeyDown', position: { x: 50, y: 580 }, data: { key: ' ' } },
      { id: 'n22', type: 'action/emitEvent', position: { x: 350, y: 580 }, data: { eventType: 'player.jump' } },
      // E键 → 交互对话
      { id: 'n23', type: 'event/onKeyDown', position: { x: 50, y: 700 }, data: { key: 'e' } },
      { id: 'n24', type: 'action/showDialogue', position: { x: 350, y: 700 }, data: { text: '你好！' } },
    ],
    edges: [
      // W键链：执行流 + 数据流
      { id: 'e1', source: 'n1', sourcePort: 'out', target: 'n5', targetPort: 'in', type: 'execution' },
      { id: 'e2', source: 'n2', sourcePort: 'data-out-y', target: 'n4', targetPort: 'data-in-a', type: 'data' },
      { id: 'e3', source: 'n3', sourcePort: 'data-out-value', target: 'n4', targetPort: 'data-in-b', type: 'data' },
      { id: 'e4', source: 'n4', sourcePort: 'data-out-result', target: 'n5', targetPort: 'data-in-y', type: 'data' },
      // S键链
      { id: 'e5', source: 'n6', sourcePort: 'out', target: 'n10', targetPort: 'in', type: 'execution' },
      { id: 'e6', source: 'n7', sourcePort: 'data-out-y', target: 'n9', targetPort: 'data-in-a', type: 'data' },
      { id: 'e7', source: 'n8', sourcePort: 'data-out-value', target: 'n9', targetPort: 'data-in-b', type: 'data' },
      { id: 'e8', source: 'n9', sourcePort: 'data-out-result', target: 'n10', targetPort: 'data-in-y', type: 'data' },
      // A键链
      { id: 'e9', source: 'n11', sourcePort: 'out', target: 'n15', targetPort: 'in', type: 'execution' },
      { id: 'e10', source: 'n12', sourcePort: 'data-out-x', target: 'n14', targetPort: 'data-in-a', type: 'data' },
      { id: 'e11', source: 'n13', sourcePort: 'data-out-value', target: 'n14', targetPort: 'data-in-b', type: 'data' },
      { id: 'e12', source: 'n14', sourcePort: 'data-out-result', target: 'n15', targetPort: 'data-in-x', type: 'data' },
      // D键链
      { id: 'e13', source: 'n16', sourcePort: 'out', target: 'n20', targetPort: 'in', type: 'execution' },
      { id: 'e14', source: 'n17', sourcePort: 'data-out-x', target: 'n19', targetPort: 'data-in-a', type: 'data' },
      { id: 'e15', source: 'n18', sourcePort: 'data-out-value', target: 'n19', targetPort: 'data-in-b', type: 'data' },
      { id: 'e16', source: 'n19', sourcePort: 'data-out-result', target: 'n20', targetPort: 'data-in-x', type: 'data' },
      // 空格键
      { id: 'e17', source: 'n21', sourcePort: 'out', target: 'n22', targetPort: 'in', type: 'execution' },
      // E键
      { id: 'e18', source: 'n23', sourcePort: 'out', target: 'n24', targetPort: 'in', type: 'execution' },
    ],
  },

  // 2. SimpleNPC
  {
    id: 'tpl_simple_npc',
    name: '简单NPC',
    description: '交互时显示对话',
    nodes: [
      { id: 'n1', type: 'event/onInteract', position: { x: 50, y: 100 }, data: {} },
      { id: 'n2', type: 'action/showDialogue', position: { x: 350, y: 100 }, data: { text: '你好，旅行者！欢迎来到这个小镇。' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', sourcePort: 'out', target: 'n2', targetPort: 'in', type: 'execution' },
    ],
  },

  // 3. EnemyPatrol — 碰撞伤害 + 死亡掉落
  {
    id: 'tpl_enemy_patrol',
    name: '巡逻敌人',
    description: '碰撞时造成伤害，死亡时掉落物品',
    nodes: [
      { id: 'n1', type: 'event/onCollision', position: { x: 50, y: 50 }, data: { targetTag: 'player' } },
      { id: 'n2', type: 'action/dealDamage', position: { x: 350, y: 50 }, data: {} },
      { id: 'n3', type: 'value/number', position: { x: 50, y: -30 }, data: { value: 10 } },
      { id: 'n4', type: 'event/onDeath', position: { x: 50, y: 200 }, data: {} },
      { id: 'n5', type: 'action/rollLoot', position: { x: 350, y: 200 }, data: { lootTableId: '' } },
    ],
    edges: [
      // 执行流
      { id: 'e1', source: 'n1', sourcePort: 'out', target: 'n2', targetPort: 'in', type: 'execution' },
      // 数据流：常量10 → dealDamage.amount
      { id: 'e2', source: 'n3', sourcePort: 'data-out-value', target: 'n2', targetPort: 'data-in-amount', type: 'data' },
      // 执行流
      { id: 'e3', source: 'n4', sourcePort: 'out', target: 'n5', targetPort: 'in', type: 'execution' },
    ],
  },

  // 4. EnemyAggressive — 受伤反击
  {
    id: 'tpl_enemy_aggressive',
    name: '主动攻击敌人',
    description: '受伤后反击，死亡掉落物品',
    nodes: [
      { id: 'n1', type: 'event/onDamaged', position: { x: 50, y: 50 }, data: {} },
      { id: 'n2', type: 'action/dealDamage', position: { x: 350, y: 50 }, data: {} },
      { id: 'n3', type: 'value/number', position: { x: 50, y: -30 }, data: { value: 15 } },
      { id: 'n4', type: 'event/onDeath', position: { x: 50, y: 200 }, data: {} },
      { id: 'n5', type: 'action/rollLoot', position: { x: 350, y: 200 }, data: { lootTableId: '' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', sourcePort: 'out', target: 'n2', targetPort: 'in', type: 'execution' },
      { id: 'e2', source: 'n3', sourcePort: 'data-out-value', target: 'n2', targetPort: 'data-in-amount', type: 'data' },
      { id: 'e3', source: 'n4', sourcePort: 'out', target: 'n5', targetPort: 'in', type: 'execution' },
    ],
  },

  // 5. TreasureChest
  {
    id: 'tpl_treasure_chest',
    name: '宝箱',
    description: '交互时检查标记，随机掉落物品',
    nodes: [
      { id: 'n1', type: 'event/onInteract', position: { x: 50, y: 100 }, data: {} },
      { id: 'n2', type: 'condition/checkFlag', position: { x: 300, y: 100 }, data: {} },
      { id: 'n3', type: 'value/string', position: { x: 50, y: 20 }, data: { value: 'chest_opened' } },
      { id: 'n4', type: 'action/showDialogue', position: { x: 580, y: 40 }, data: { text: '这个宝箱已经空了。' } },
      { id: 'n5', type: 'action/rollLoot', position: { x: 580, y: 180 }, data: { lootTableId: '' } },
      { id: 'n6', type: 'action/setFlag', position: { x: 830, y: 180 }, data: {} },
      { id: 'n7', type: 'value/string', position: { x: 580, y: 260 }, data: { value: 'chest_opened' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', sourcePort: 'out', target: 'n2', targetPort: 'in', type: 'execution' },
      // 数据流：flag名 → checkFlag
      { id: 'e2', source: 'n3', sourcePort: 'data-out-value', target: 'n2', targetPort: 'data-in-flag', type: 'data' },
      { id: 'e3', source: 'n2', sourcePort: 'true', target: 'n4', targetPort: 'in', type: 'execution' },
      { id: 'e4', source: 'n2', sourcePort: 'false', target: 'n5', targetPort: 'in', type: 'execution' },
      { id: 'e5', source: 'n5', sourcePort: 'out', target: 'n6', targetPort: 'in', type: 'execution' },
      // 数据流：flag名 → setFlag
      { id: 'e6', source: 'n7', sourcePort: 'data-out-value', target: 'n6', targetPort: 'data-in-flag', type: 'data' },
    ],
  },

  // 6. Shopkeeper
  {
    id: 'tpl_shopkeeper',
    name: '商人',
    description: '交互时显示商店对话菜单',
    nodes: [
      { id: 'n1', type: 'event/onInteract', position: { x: 50, y: 100 }, data: {} },
      { id: 'n2', type: 'action/showDialogue', position: { x: 350, y: 100 }, data: { text: '欢迎光临！想买点什么？' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', sourcePort: 'out', target: 'n2', targetPort: 'in', type: 'execution' },
    ],
  },

  // 7. QuestGiver
  {
    id: 'tpl_quest_giver',
    name: '任务发布者',
    description: '根据任务状态显示不同对话',
    nodes: [
      { id: 'n1', type: 'event/onInteract', position: { x: 50, y: 100 }, data: {} },
      { id: 'n2', type: 'condition/checkFlag', position: { x: 300, y: 100 }, data: {} },
      { id: 'n3', type: 'value/string', position: { x: 50, y: 20 }, data: { value: 'quest_accepted' } },
      { id: 'n4', type: 'action/showDialogue', position: { x: 580, y: 40 }, data: { text: '任务进展如何？' } },
      { id: 'n5', type: 'action/showDialogue', position: { x: 580, y: 180 }, data: { text: '我需要你帮我收集材料，愿意帮忙吗？' } },
      { id: 'n6', type: 'action/setFlag', position: { x: 830, y: 180 }, data: {} },
      { id: 'n7', type: 'value/string', position: { x: 580, y: 260 }, data: { value: 'quest_accepted' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', sourcePort: 'out', target: 'n2', targetPort: 'in', type: 'execution' },
      { id: 'e2', source: 'n3', sourcePort: 'data-out-value', target: 'n2', targetPort: 'data-in-flag', type: 'data' },
      { id: 'e3', source: 'n2', sourcePort: 'true', target: 'n4', targetPort: 'in', type: 'execution' },
      { id: 'e4', source: 'n2', sourcePort: 'false', target: 'n5', targetPort: 'in', type: 'execution' },
      { id: 'e5', source: 'n5', sourcePort: 'out', target: 'n6', targetPort: 'in', type: 'execution' },
      { id: 'e6', source: 'n7', sourcePort: 'data-out-value', target: 'n6', targetPort: 'data-in-flag', type: 'data' },
    ],
  },

  // 8. PickableItem
  {
    id: 'tpl_pickable_item',
    name: '可拾取物品',
    description: '交互时添加物品到背包',
    nodes: [
      { id: 'n1', type: 'event/onInteract', position: { x: 50, y: 100 }, data: {} },
      { id: 'n2', type: 'action/addItem', position: { x: 350, y: 100 }, data: { itemId: '', quantity: 1 } },
      { id: 'n3', type: 'action/showDialogue', position: { x: 600, y: 100 }, data: { text: '获得了物品！' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', sourcePort: 'out', target: 'n2', targetPort: 'in', type: 'execution' },
      { id: 'e2', source: 'n2', sourcePort: 'out', target: 'n3', targetPort: 'in', type: 'execution' },
    ],
  },
];
