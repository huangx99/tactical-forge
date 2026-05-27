import { useEffect, useRef, useCallback, useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useSceneStore } from '../stores/sceneStore';
import { useEditorStore } from '../stores/editorStore';
import { useBlueprintStore } from '../stores/blueprintStore';
import {
  Entity,
  Transform,
  Sprite,
  Collider,
  Health,
  PlayerController,
  Inventory,
  Stats,
  Equipment,
  SkillBar,
  StatusEffects,
  DialogueTrigger,
  BlueprintComponent,
  Tag,
  Loot,
  Name,
  EventBus,
  GameFlags,
  InputSystem,
  InputActionMapper,
  PhysicsSystem,
  PlayerSystem,
  CameraSystem,
  ScriptSystem,
} from '@tactical-forge/engine';
import type { GameObject, Blueprint } from '@tactical-forge/shared';

// Color map for entity types
const TYPE_COLORS: Record<string, string> = {
  player: '#4ade80',
  npc: '#60a5fa',
  enemy: '#f87171',
  item: '#fbbf24',
  prop: '#9ca3af',
};

function createEntityFromGameObject(obj: GameObject): Entity {
  const entity = new Entity(obj.id);

  const transform = new Transform();
  transform.x = obj.position.x;
  transform.y = obj.position.y;
  entity.addComponent(transform);

  if (obj.components.sprite) {
    const sprite = new Sprite();
    sprite.fromJSON(obj.components.sprite as Record<string, unknown>);
    entity.addComponent(sprite);
  }
  if (obj.components.collider) {
    const collider = new Collider();
    collider.fromJSON(obj.components.collider as Record<string, unknown>);
    entity.addComponent(collider);
  }
  if (obj.components.health) {
    const health = new Health();
    health.fromJSON(obj.components.health as Record<string, unknown>);
    entity.addComponent(health);
  }
  if (obj.components.playerController) {
    const pc = new PlayerController();
    pc.fromJSON(obj.components.playerController as Record<string, unknown>);
    entity.addComponent(pc);
  }
  if (obj.components.inventory) {
    const inv = new Inventory();
    inv.fromJSON(obj.components.inventory as Record<string, unknown>);
    entity.addComponent(inv);
  }
  if (obj.components.stats) {
    const stats = new Stats();
    stats.fromJSON(obj.components.stats as Record<string, unknown>);
    entity.addComponent(stats);
  }
  if (obj.components.equipment) {
    const equip = new Equipment();
    equip.fromJSON(obj.components.equipment as Record<string, unknown>);
    entity.addComponent(equip);
  }
  if (obj.components.skillBar) {
    const skillBar = new SkillBar();
    skillBar.fromJSON(obj.components.skillBar as Record<string, unknown>);
    entity.addComponent(skillBar);
  }
  if (obj.components.statusEffects) {
    const statusEffects = new StatusEffects();
    statusEffects.fromJSON(obj.components.statusEffects as Record<string, unknown>);
    entity.addComponent(statusEffects);
  }
  if (obj.components.loot) {
    const loot = new Loot();
    loot.fromJSON(obj.components.loot as Record<string, unknown>);
    entity.addComponent(loot);
  }
  if (obj.components.dialogueTrigger) {
    const dt = new DialogueTrigger();
    dt.fromJSON(obj.components.dialogueTrigger as Record<string, unknown>);
    entity.addComponent(dt);
  }
  if (obj.components.blueprint) {
    const bp = new BlueprintComponent();
    bp.fromJSON(obj.components.blueprint as Record<string, unknown>);
    entity.addComponent(bp);
  }

  const tag = new Tag();
  tag.tags = [obj.type];
  entity.addComponent(tag);

  if (obj.name) {
    const nameComp = new Name();
    nameComp.value = obj.name;
    entity.addComponent(nameComp);
  }

  return entity;
}

/** Lightweight game runner using Canvas2D (no PixiJS dependency) */
class GameRunner {
  readonly eventBus: EventBus;
  readonly gameFlags: GameFlags;
  readonly entities: Entity[] = [];
  readonly inputSystem: InputSystem;
  readonly inputActionMapper: InputActionMapper;
  readonly physicsSystem: PhysicsSystem;
  readonly playerSystem: PlayerSystem;
  readonly cameraSystem: CameraSystem;
  readonly scriptSystem: ScriptSystem;

  private running = false;
  private lastTime = 0;
  private rafId = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    movementMode: string,
    worldBounds: { minX: number; minY: number; maxX: number; maxY: number },
  ) {
    this.eventBus = new EventBus();
    this.gameFlags = new GameFlags();
    this.inputSystem = new InputSystem(canvas);
    this.inputActionMapper = new InputActionMapper(this.inputSystem, this.eventBus);
    this.physicsSystem = new PhysicsSystem(this.eventBus);
    this.playerSystem = new PlayerSystem(this.inputSystem);
    this.cameraSystem = new CameraSystem(width, height);
    this.scriptSystem = new ScriptSystem(
      this.eventBus,
      this.gameFlags,
      (id: string) => this.entities.find((e) => e.id === id),
    );

    this.scriptSystem.runtime.setService('entityGetter', (id: string) => this.entities.find((e) => e.id === id));

    if (movementMode) this.playerSystem.mode = movementMode as 'top-down' | 'side-scroll';
    this.playerSystem.worldBounds = worldBounds;

    const systems = [
      this.inputSystem,
      this.inputActionMapper,
      // PlayerSystem skipped — movement handled by blueprint onKeyHeld → setPosition
      this.scriptSystem,
      this.physicsSystem,
      this.cameraSystem,
    ];
    for (const sys of systems) sys.init?.();

    // Store systems for update loop
    this._systems = systems;
  }

  private _systems: any[] = [];

  addEntity(entity: Entity): void {
    this.entities.push(entity);
    this.eventBus.emit('entity.start', { entityId: entity.id }, entity.id);
  }

  setBlueprintStore(store: Map<string, Blueprint>): void {
    this.scriptSystem.setBlueprintStore(store);
  }

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.eventBus.emit('scene.start', { sceneId: '' });
    for (const entity of this.entities) {
      this.eventBus.emit('entity.start', { entityId: entity.id }, entity.id);
    }
    this.tick();
  }

  private tick = (): void => {
    if (!this.running) return;
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    for (const sys of this._systems) {
      sys.update(this.entities, dt);
    }

    this.render();
    this.rafId = requestAnimationFrame(this.tick);
  };

  private render(): void {
    const { ctx, canvas, cameraSystem, entities } = this;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(-cameraSystem.x * cameraSystem.zoom, -cameraSystem.y * cameraSystem.zoom);
    ctx.scale(cameraSystem.zoom, cameraSystem.zoom);

    for (const entity of entities) {
      const transform = entity.getComponent(Transform);
      if (!transform) continue;

      const collider = entity.getComponent(Collider);
      const health = entity.getComponent(Health);
      const tagComp = entity.getComponent(Tag);

      // Determine color from Tag component
      let color = '#9ca3af';
      if (tagComp) {
        for (const tag of tagComp.tags) {
          if (TYPE_COLORS[tag]) { color = TYPE_COLORS[tag]; break; }
        }
      }

      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.rotate(transform.rotation);

      if (collider) {
        if (collider.shape === 'box') {
          ctx.fillStyle = color;
          ctx.fillRect(-collider.w / 2, -collider.h / 2, collider.w, collider.h);
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(-collider.w / 2, -collider.h / 2, collider.w, collider.h);
        } else if (collider.shape === 'circle') {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(0, 0, collider.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(-12, -12, 24, 24);
      }

      // Health bar
      if (health && health.max > 0) {
        const barW = 30;
        const barH = 3;
        const barY = collider ? (collider.shape === 'box' ? -collider.h / 2 - 8 : -collider.radius - 8) : -20;
        const ratio = health.current / health.max;
        ctx.fillStyle = '#333';
        ctx.fillRect(-barW / 2, barY, barW, barH);
        ctx.fillStyle = ratio > 0.5 ? '#4ade80' : ratio > 0.25 ? '#fbbf24' : '#f87171';
        ctx.fillRect(-barW / 2, barY, barW * ratio, barH);
      }

      ctx.restore();
    }

    ctx.restore();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  destroy(): void {
    this.stop();
    for (const sys of this._systems) sys.destroy?.();
    this.eventBus.clear();
  }
}

export function PlayMode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runnerRef = useRef<GameRunner | null>(null);
  const { project } = useProjectStore();
  const { scenes, activeSceneId } = useSceneStore();
  const { setPlaying } = useEditorStore();
  const { blueprints } = useBlueprintStore();
  const [dialogue, setDialogue] = useState<{ text: string; choices?: string[] } | null>(null);
  const [logEntries, setLogEntries] = useState<{ id: number; text: string }[]>([]);
  const logIdRef = useRef(0);
  const logTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const activeScene = scenes.find((s) => s.id === activeSceneId);

  const stopGame = useCallback(() => {
    if (runnerRef.current) {
      runnerRef.current.destroy();
      runnerRef.current = null;
    }
    setPlaying(false);
  }, [setPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeScene) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = project.resolution.width;
    const H = project.resolution.height;

    const runner = new GameRunner(
      canvas, ctx, W, H,
      project.viewMode,
      { minX: 0, minY: 0, maxX: W, maxY: H },
    );

    // Load blueprints
    const bpStore = new Map<string, Blueprint>();
    for (const bp of blueprints) bpStore.set(bp.id, bp);
    runner.setBlueprintStore(bpStore);

    // Create entities
    for (const layer of activeScene.layers) {
      if (layer.type !== 'object') continue;
      for (const obj of layer.objects) {
        runner.addEntity(createEntityFromGameObject(obj));
      }
    }

    // Listen for dialogue events
    runner.eventBus.on('dialogue.start', (event) => {
      const text = event.data.text as string;
      const choices = event.data.choices as string[] | undefined;
      setDialogue({ text, choices });
    });
    runner.eventBus.on('dialogue.end', () => {
      setDialogue(null);
    });

    // Listen for log events
    runner.eventBus.on('log.new', (event) => {
      const text = event.data.text as string;
      const duration = (event.data.duration as number) ?? 3;
      const id = ++logIdRef.current;
      setLogEntries((prev) => [...prev, { id, text }]);
      const timer = setTimeout(() => {
        setLogEntries((prev) => prev.filter((e) => e.id !== id));
        logTimersRef.current.delete(id);
      }, duration * 1000);
      logTimersRef.current.set(id, timer);
    });

    // Escape to stop
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stopGame();
    };
    window.addEventListener('keydown', onKeyDown);

    runner.start();
    runnerRef.current = runner;

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      for (const timer of logTimersRef.current.values()) clearTimeout(timer);
      logTimersRef.current.clear();
      setLogEntries([]);
      runner.destroy();
      runnerRef.current = null;
    };
  }, [activeScene?.id, project.resolution.width, project.resolution.height, project.viewMode, blueprints, stopGame]);

  const handleDialogueChoice = (index: number) => {
    if (runnerRef.current) {
      runnerRef.current.eventBus.emit('dialogue.choice', { index });
      runnerRef.current.eventBus.emit('dialogue.end', {});
    }
    setDialogue(null);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={project.resolution.width}
          height={project.resolution.height}
          style={{ border: '1px solid #0f3460', outline: 'none' }}
          tabIndex={0}
          autoFocus
        />

        {/* Log overlay */}
        {logEntries.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
            {logEntries.map((entry) => (
              <div
                key={entry.id}
                className="px-2 py-1 bg-black/70 text-green-400 text-xs font-mono rounded animate-fadeIn"
              >
                {entry.text}
              </div>
            ))}
          </div>
        )}

        {/* Dialogue overlay */}
        {dialogue && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] max-w-[500px] bg-gray-900/95 border border-gray-600 rounded-lg p-4">
            <p className="text-white text-sm mb-3">{dialogue.text}</p>
            {dialogue.choices && dialogue.choices.length > 0 ? (
              <div className="flex flex-col gap-1">
                {dialogue.choices.map((choice, i) => (
                  <button
                    key={i}
                    className="text-left px-3 py-1.5 text-xs text-blue-300 hover:bg-gray-700 rounded"
                    onClick={() => handleDialogueChoice(i)}
                  >
                    {i + 1}. {choice}
                  </button>
                ))}
              </div>
            ) : (
              <button
                className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                onClick={() => handleDialogueChoice(0)}
              >
                关闭
              </button>
            )}
          </div>
        )}

        <div className="mt-2 flex gap-2 items-center">
          <button
            className="px-3 py-1 bg-editor-panel border border-editor-border rounded text-editor-accent text-xs hover:bg-editor-border"
            onClick={stopGame}
          >
            停止 (ESC)
          </button>
          <span className="text-xs text-editor-muted">
            WASD/方向键移动 {project.viewMode === 'side-scroll' ? '| 空格跳跃' : ''} | ESC停止
          </span>
        </div>
      </div>
    </div>
  );
}
