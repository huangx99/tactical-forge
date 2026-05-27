import { useEffect, useRef, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useSceneStore } from '../stores/sceneStore';
import { useEditorStore } from '../stores/editorStore';
import type { GameObject } from '@tactical-forge/shared';

// Simple 2D game runtime - no PixiJS dependency for now
interface EntityRuntime {
  obj: GameObject;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPlayer: boolean;
  collider: { shape: 'box' | 'circle'; w: number; h: number; radius: number } | null;
  health: { max: number; current: number } | null;
  speed: number;
  jumpForce: number;
  isGrounded: boolean;
}

const COLORS: Record<string, string> = {
  player: '#4ade80',
  npc: '#60a5fa',
  enemy: '#f87171',
  item: '#fbbf24',
  prop: '#9ca3af',
};

export function PlayMode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const { project } = useProjectStore();
  const { scenes, activeSceneId } = useSceneStore();
  const { setPlaying } = useEditorStore();

  const activeScene = scenes.find((s) => s.id === activeSceneId);

  const stopGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setPlaying(false);
  }, [setPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeScene) return;

    const ctx = canvas.getContext('2d')!;

    const W = project.resolution.width;
    const H = project.resolution.height;
    canvas.width = W;
    canvas.height = H;

    // Build entities
    const entities: EntityRuntime[] = [];
    for (const layer of activeScene.layers) {
      if (layer.type !== 'object') continue;
      for (const obj of layer.objects) {
        const pc = obj.components.playerController as Record<string, unknown> | undefined;
        const hp = obj.components.health as Record<string, unknown> | undefined;
        const col = obj.components.collider as Record<string, unknown> | undefined;

        entities.push({
          obj,
          x: obj.position.x,
          y: obj.position.y,
          vx: 0,
          vy: 0,
          isPlayer: obj.type === 'player' && !!pc,
          collider: col ? {
            shape: (col.shape as 'box' | 'circle') ?? 'box',
            w: (col.w as number) ?? 24,
            h: (col.h as number) ?? 24,
            radius: (col.radius as number) ?? 12,
          } : null,
          health: hp ? { max: (hp.max as number) ?? 100, current: (hp.current as number) ?? 100 } : null,
          speed: (pc?.speed as number) ?? 0,
          jumpForce: (pc?.jumpForce as number) ?? 8,
          isGrounded: false,
        });
      }
    }

    // Input
    const keys = new Set<string>();
    const jumpHeld = { value: false };
    const onKeyDown = (e: KeyboardEvent) => {
      keys.add(e.key.toLowerCase());
      if (e.key === 'Escape') stopGame();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase());
      // Variable jump height: release early = cut jump short
      if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && jumpHeld.value) {
        jumpHeld.value = false;
        for (const ent of entities) {
          if (ent.isPlayer && ent.vy < -3) {
            ent.vy = ent.vy * 0.4; // cut upward velocity
          }
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Collision check
    function checkCollision(a: EntityRuntime, b: EntityRuntime): boolean {
      if (!a.collider || !b.collider) return false;
      const ac = a.collider;
      const bc = b.collider;

      if (ac.shape === 'box' && bc.shape === 'box') {
        return (
          a.x - ac.w / 2 < b.x + bc.w / 2 &&
          a.x + ac.w / 2 > b.x - bc.w / 2 &&
          a.y - ac.h / 2 < b.y + bc.h / 2 &&
          a.y + ac.h / 2 > b.y - bc.h / 2
        );
      }
      if (ac.shape === 'circle' && bc.shape === 'circle') {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy) < ac.radius + bc.radius;
      }
      // box vs circle simplified
      const halfW = ac.shape === 'box' ? ac.w / 2 : bc.w / 2;
      const halfH = ac.shape === 'box' ? ac.h / 2 : bc.h / 2;
      const r = ac.shape === 'circle' ? ac.radius : bc.radius;
      const cx = ac.shape === 'circle' ? a.x : b.x;
      const cy = ac.shape === 'circle' ? a.y : b.y;
      const bx = ac.shape === 'box' ? a.x : b.x;
      const by = ac.shape === 'box' ? a.y : b.y;
      const closestX = Math.max(bx - halfW, Math.min(cx, bx + halfW));
      const closestY = Math.max(by - halfH, Math.min(cy, by + halfH));
      const dx = cx - closestX;
      const dy = cy - closestY;
      return dx * dx + dy * dy < r * r;
    }

    // Game loop
    let lastTime = performance.now();
    const gravity = 0.5;
    const mode = project.viewMode;

    function gameLoop() {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 16.67, 3); // cap at 3x speed
      lastTime = now;

      // Update player
      for (const e of entities) {
        if (!e.isPlayer) continue;

        if (mode === 'top-down') {
          let dx = 0, dy = 0;
          if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
          if (keys.has('d') || keys.has('arrowright')) dx += 1;
          if (keys.has('w') || keys.has('arrowup')) dy -= 1;
          if (keys.has('s') || keys.has('arrowdown')) dy += 1;
          if (dx && dy) { dx *= 0.707; dy *= 0.707; }

          // Move X with collision
          const newX = e.x + dx * e.speed * dt;
          let blocked = false;
          for (const other of entities) {
            if (other === e || !other.collider) continue;
            const test = { ...e, x: newX };
            if (checkCollision(test, other)) { blocked = true; break; }
          }
          if (!blocked) e.x = newX;

          // Move Y with collision
          const newY = e.y + dy * e.speed * dt;
          blocked = false;
          for (const other of entities) {
            if (other === e || !other.collider) continue;
            const test = { ...e, y: newY };
            if (checkCollision(test, other)) { blocked = true; break; }
          }
          if (!blocked) e.y = newY;

        } else {
          // Side-scroll
          let dx = 0;
          if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
          if (keys.has('d') || keys.has('arrowright')) dx += 1;

          const newX = e.x + dx * e.speed * dt;
          let blocked = false;
          for (const other of entities) {
            if (other === e || !other.collider) continue;
            const test = { ...e, x: newX };
            if (checkCollision(test, other)) { blocked = true; break; }
          }
          if (!blocked) e.x = newX;

          // Gravity
          e.vy += gravity;
          if (e.vy > 15) e.vy = 15; // terminal velocity

          // Jump - check grounded before applying gravity
          const groundY = H - 16; // world floor
          if (e.y >= groundY - 1) {
            e.isGrounded = true;
            e.vy = 0;
            e.y = groundY;
          }

          if ((keys.has(' ') || keys.has('arrowup') || keys.has('w')) && e.isGrounded) {
            e.vy = -e.jumpForce;
            e.isGrounded = false;
            jumpHeld.value = true;
          }

          const newY = e.y + e.vy;
          blocked = false;
          for (const other of entities) {
            if (other === e || !other.collider) continue;
            const test = { ...e, y: newY };
            if (checkCollision(test, other)) {
              blocked = true;
              if (e.vy > 0) {
                // Land on top of the platform
                if (other.collider.shape === 'box') {
                  e.y = other.y - other.collider.h / 2 - (e.collider?.h ?? 24) / 2;
                } else {
                  e.y = other.y - other.collider.radius - (e.collider?.h ?? 24) / 2;
                }
                e.vy = 0;
                e.isGrounded = true;
              } else if (e.vy < 0) {
                // Hit ceiling
                e.vy = 0;
              }
              break;
            }
          }
          if (!blocked) {
            e.y = newY;
          }
        }

        // World bounds
        e.x = Math.max(16, Math.min(W - 16, e.x));
        e.y = Math.max(16, Math.min(H - 16, e.y));
      }

      // Camera
      const player = entities.find(e => e.isPlayer);
      let camX = 0, camY = 0;
      if (player) {
        camX = player.x - W / 2;
        camY = player.y - H / 2;
        camX = Math.max(0, Math.min(W, camX));
        camY = Math.max(0, Math.min(H, camY));
      }

      // Render
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(-camX, -camY);

      // Grid
      ctx.strokeStyle = '#2a2a4e';
      ctx.lineWidth = 0.5;
      const ts = project.tileSize;
      for (let x = 0; x <= W * 2; x += ts) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H * 2); ctx.stroke();
      }
      for (let y = 0; y <= H * 2; y += ts) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W * 2, y); ctx.stroke();
      }

      // Draw entities
      for (const e of entities) {
        const color = COLORS[e.obj.type] ?? '#9ca3af';
        ctx.fillStyle = color;

        if (e.collider) {
          if (e.collider.shape === 'box') {
            ctx.fillRect(e.x - e.collider.w / 2, e.y - e.collider.h / 2, e.collider.w, e.collider.h);
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(e.x - e.collider.w / 2, e.y - e.collider.h / 2, e.collider.w, e.collider.h);
          } else {
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.collider.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        } else {
          ctx.fillRect(e.x - 12, e.y - 12, 24, 24);
        }

        // Health bar
        if (e.health) {
          const barW = 30;
          const barY = e.collider
            ? (e.collider.shape === 'box' ? e.y - e.collider.h / 2 - 10 : e.y - e.collider.radius - 10)
            : e.y - 20;
          ctx.fillStyle = '#333';
          ctx.fillRect(e.x - barW / 2, barY, barW, 4);
          const ratio = e.health.current / e.health.max;
          ctx.fillStyle = ratio > 0.5 ? '#4ade80' : ratio > 0.25 ? '#fbbf24' : '#f87171';
          ctx.fillRect(e.x - barW / 2, barY, barW * ratio, 4);
        }

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        const labelY = e.collider
          ? (e.collider.shape === 'box' ? e.y + e.collider.h / 2 + 14 : e.y + e.collider.radius + 14)
          : e.y + 20;
        ctx.fillText(e.obj.type, e.x, labelY);
      }

      ctx.restore();

      // HUD
      if (player?.health) {
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`HP: ${player.health.current}/${player.health.max}`, 10, 24);
      }

      rafRef.current = requestAnimationFrame(gameLoop);
    }

    rafRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [activeScene?.id, project.resolution.width, project.resolution.height, project.viewMode, project.tileSize, stopGame]);

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
