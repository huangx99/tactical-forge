import * as PIXI from 'pixi.js';
import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';
import { Transform } from '../components/Transform';
import { Sprite } from '../components/Sprite';
import { Collider } from '../components/Collider';
import { Health } from '../components/Health';

// Color map for object types
const TYPE_COLORS: Record<string, number> = {
  player: 0x4ade80,
  npc: 0x60a5fa,
  enemy: 0xf87171,
  item: 0xfbbf24,
  prop: 0x9ca3af,
};

export class RenderSystem extends System {
  readonly name = 'render';
  private displayMap = new Map<string, PIXI.Container>();
  private container: PIXI.Container;
  private textureCache = new Map<string, PIXI.Texture>();

  constructor(private stage: PIXI.Container) {
    super();
    this.container = new PIXI.Container();
    this.stage.addChild(this.container);
  }

  update(entities: Entity[]): void {
    const visibleIds = new Set<string>();

    for (const entity of entities) {
      const transform = entity.getComponent(Transform);
      const spriteComp = entity.getComponent(Sprite);
      if (!transform) continue;

      visibleIds.add(entity.id);
      let display = this.displayMap.get(entity.id);

      if (!display) {
        display = this.createDisplay(entity, spriteComp);
        this.container.addChild(display);
        this.displayMap.set(entity.id, display);
      }

      display.position.set(transform.x, transform.y);
      display.rotation = transform.rotation;
      display.scale.set(transform.scaleX, transform.scaleY);
    }

    // Remove stale displays
    for (const [id, display] of this.displayMap) {
      if (!visibleIds.has(id)) {
        this.container.removeChild(display);
        display.destroy();
        this.displayMap.delete(id);
      }
    }
  }

  private createDisplay(entity: Entity, spriteComp: Sprite | undefined): PIXI.Container {
    const container = new PIXI.Container();

    // Determine color based on entity type (stored in sprite or use default)
    let color = 0x9ca3af;

    // Try to get texture
    if (spriteComp?.textureId) {
      let texture = this.textureCache.get(spriteComp.textureId);
      if (!texture) {
        texture = PIXI.Texture.from(spriteComp.textureId);
        this.textureCache.set(spriteComp.textureId, texture);
      }
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(spriteComp.anchorX, spriteComp.anchorY);
      container.addChild(sprite);
      return container;
    }

    // No texture - draw colored rectangle as placeholder
    const collider = entity.getComponent(Collider);
    const health = entity.getComponent(Health);

    // Determine color from entity type hint in the ID or components
    if (entity.id.includes('player')) color = TYPE_COLORS.player;
    else if (entity.id.includes('npc')) color = TYPE_COLORS.npc;
    else if (entity.id.includes('enemy')) color = TYPE_COLORS.enemy;
    else if (entity.id.includes('item')) color = TYPE_COLORS.item;

    if (collider) {
      if (collider.shape === 'box') {
        const gfx = new PIXI.Graphics();
        gfx.beginFill(color);
        gfx.drawRect(-collider.w / 2, -collider.h / 2, collider.w, collider.h);
        gfx.endFill();
        // Border
        gfx.lineStyle(1, 0xffffff, 0.3);
        gfx.drawRect(-collider.w / 2, -collider.h / 2, collider.w, collider.h);
        container.addChild(gfx);
      } else if (collider.shape === 'circle') {
        const gfx = new PIXI.Graphics();
        gfx.beginFill(color);
        gfx.drawCircle(0, 0, collider.radius);
        gfx.endFill();
        gfx.lineStyle(1, 0xffffff, 0.3);
        gfx.drawCircle(0, 0, collider.radius);
        container.addChild(gfx);
      }
    } else {
      // Default 24x24 box
      const gfx = new PIXI.Graphics();
      gfx.beginFill(color);
      gfx.drawRect(-12, -12, 24, 24);
      gfx.endFill();
      container.addChild(gfx);
    }

    // Health bar
    if (health && health.max > 0) {
      const barWidth = 30;
      const barHeight = 3;
      const barY = collider ? (collider.shape === 'box' ? -collider.h / 2 - 8 : -collider.radius - 8) : -20;

      const bg = new PIXI.Graphics();
      bg.beginFill(0x333333);
      bg.drawRect(-barWidth / 2, barY, barWidth, barHeight);
      bg.endFill();
      container.addChild(bg);

      const bar = new PIXI.Graphics();
      const ratio = health.current / health.max;
      bar.beginFill(ratio > 0.5 ? 0x4ade80 : ratio > 0.25 ? 0xfbbf24 : 0xf87171);
      bar.drawRect(-barWidth / 2, barY, barWidth * ratio, barHeight);
      bar.endFill();
      container.addChild(bar);
    }

    return container;
  }

  destroy(): void {
    for (const display of this.displayMap.values()) {
      display.destroy();
    }
    this.displayMap.clear();
    this.textureCache.clear();
    this.stage.removeChild(this.container);
    this.container.destroy();
  }
}
