import { generateId } from '@tactical-forge/shared';
import type { Scene } from '@tactical-forge/shared';

export function createDemoScene(): Scene {
  const playerId = generateId();

  return {
    id: generateId(),
    name: '演示场景',
    viewMode: 'top-down',
    layers: [
      {
        id: generateId(),
        type: 'tilemap',
        tiles: [],
        tilesetId: '',
      },
      {
        id: generateId(),
        type: 'object',
        objects: [
          // Player
          {
            id: playerId,
            type: 'player',
            position: { x: 200, y: 300 },
            sprite: '',
            components: {
              playerController: { speed: 3, jumpForce: 12 },
              health: { max: 100, current: 100 },
              collider: { shape: 'box', w: 24, h: 24 },
            },
          },
          // NPC
          {
            id: generateId(),
            type: 'npc',
            position: { x: 400, y: 300 },
            sprite: '',
            components: {
              health: { max: 50, current: 50 },
              collider: { shape: 'box', w: 24, h: 24 },
              dialogueTrigger: { blueprintId: 'demo-dialogue', interactRange: 40 },
            },
          },
          // Walls / Platforms
          {
            id: generateId(),
            type: 'prop',
            position: { x: 300, y: 200 },
            sprite: '',
            components: {
              collider: { shape: 'box', w: 80, h: 16 },
            },
          },
          {
            id: generateId(),
            type: 'prop',
            position: { x: 150, y: 260 },
            sprite: '',
            components: {
              collider: { shape: 'box', w: 16, h: 80 },
            },
          },
          {
            id: generateId(),
            type: 'prop',
            position: { x: 500, y: 350 },
            sprite: '',
            components: {
              collider: { shape: 'box', w: 100, h: 16 },
            },
          },
          {
            id: generateId(),
            type: 'prop',
            position: { x: 350, y: 400 },
            sprite: '',
            components: {
              collider: { shape: 'box', w: 60, h: 16 },
            },
          },
          // Extra platforms for jumping
          {
            id: generateId(),
            type: 'prop',
            position: { x: 200, y: 150 },
            sprite: '',
            components: {
              collider: { shape: 'box', w: 60, h: 16 },
            },
          },
          {
            id: generateId(),
            type: 'prop',
            position: { x: 450, y: 250 },
            sprite: '',
            components: {
              collider: { shape: 'box', w: 50, h: 16 },
            },
          },
          // Enemy
          {
            id: generateId(),
            type: 'enemy',
            position: { x: 600, y: 300 },
            sprite: '',
            components: {
              health: { max: 30, current: 30 },
              collider: { shape: 'box', w: 20, h: 20 },
            },
          },
        ],
      },
    ],
    triggers: [],
    camera: {
      follow: playerId,
      bounds: { x: 0, y: 0, w: 800, h: 600 },
      deadzone: { x: 50, y: 50 },
    },
  };
}
