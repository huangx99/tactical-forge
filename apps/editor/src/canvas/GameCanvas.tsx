import { useEffect, useRef, useState, useCallback } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { useProjectStore } from '../stores/projectStore';
import { useSceneStore } from '../stores/sceneStore';
import { useTilemapStore } from '../stores/tilemapStore';

type DragAxis = 'x' | 'y' | 'both' | null;

const GIZMO_LEN = 50;
const GIZMO_HIT = 10;

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isPlaying, selectObject, selectedObjectId } = useEditorStore();
  const { project } = useProjectStore();
  const { scenes, activeSceneId, addObject, updateObject } = useSceneStore();
  const {
    activeTool, selectedTileIndex, showGrid,
    tilemaps, setTile, eraseTile, fillTiles,
    tilesets, activeTilesetId,
  } = useTilemapStore();
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Drag state
  const dragRef = useRef<{
    axis: DragAxis;
    objId: string;
    startMouse: { x: number; y: number };
    startObjPos: { x: number; y: number };
  } | null>(null);
  const [dragAxis, setDragAxis] = useState<DragAxis>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasSize({
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height),
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const activeTileset = tilesets.find((t) => t.id === activeTilesetId);
  const tilemapLayerId = activeSceneId ? tilemaps[activeSceneId] ? Object.keys(tilemaps[activeSceneId])[0] : null : null;
  const currentTilemap = activeSceneId && tilemapLayerId ? tilemaps[activeSceneId]?.[tilemapLayerId] : undefined;

  const screenToTile = useCallback((screenX: number, screenY: number) => {
    const worldX = (screenX - cameraOffset.x) / zoom;
    const worldY = (screenY - cameraOffset.y) / zoom;
    return {
      x: Math.floor(worldX / project.tileSize),
      y: Math.floor(worldY / project.tileSize),
    };
  }, [cameraOffset, zoom, project.tileSize]);

  // Check if screen point hits a gizmo axis
  const hitTestGizmo = useCallback((screenX: number, screenY: number): DragAxis => {
    if (!selectedObjectId || !activeSceneId) return null;
    const activeScene = scenes.find((s) => s.id === activeSceneId);
    if (!activeScene) return null;

    let obj: { position: { x: number; y: number } } | undefined;
    for (const layer of activeScene.layers) {
      if (layer.type !== 'object') continue;
      obj = layer.objects.find((o) => o.id === selectedObjectId);
      if (obj) break;
    }
    if (!obj) return null;

    const cx = obj.position.x * zoom + cameraOffset.x;
    const cy = obj.position.y * zoom + cameraOffset.y;
    const len = GIZMO_LEN * zoom;

    // X axis: horizontal line from (cx, cy) to (cx + len, cy)
    const dx = screenX - cx;
    const dy = screenY - cy;
    if (dx >= -4 && dx <= len + 4 && Math.abs(dy) <= GIZMO_HIT) return 'x';

    // Y axis: vertical line from (cx, cy) to (cx, cy + len)
    if (dy >= -4 && dy <= len + 4 && Math.abs(dx) <= GIZMO_HIT) return 'y';

    // Object body (free drag)
    if (Math.abs(dx) <= 16 && Math.abs(dy) <= 16) return 'both';

    return null;
  }, [selectedObjectId, activeSceneId, scenes, cameraOffset, zoom]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(cameraOffset.x, cameraOffset.y);
    ctx.scale(zoom, zoom);

    const tileSize = project.tileSize;

    // Draw tilemap
    if (currentTilemap && activeTileset) {
      const img = new Image();
      img.src = activeTileset.image;
      for (let y = 0; y < currentTilemap.length; y++) {
        for (let x = 0; x < currentTilemap[y].length; x++) {
          const tileIdx = currentTilemap[y][x];
          if (tileIdx < 0) continue;
          const sx = (tileIdx % activeTileset.columns) * tileSize;
          const sy = Math.floor(tileIdx / activeTileset.columns) * tileSize;
          ctx.drawImage(img, sx, sy, tileSize, tileSize, x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#2a2a4e';
      ctx.lineWidth = 0.5;
      const gridW = 50;
      const gridH = 50;
      for (let x = 0; x <= gridW; x++) {
        ctx.beginPath();
        ctx.moveTo(x * tileSize, 0);
        ctx.lineTo(x * tileSize, gridH * tileSize);
        ctx.stroke();
      }
      for (let y = 0; y <= gridH; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * tileSize);
        ctx.lineTo(gridW * tileSize, y * tileSize);
        ctx.stroke();
      }
    }

    // Draw objects
    const activeScene = scenes.find((s) => s.id === activeSceneId);
    if (activeScene) {
      for (const layer of activeScene.layers) {
        if (layer.type !== 'object') continue;
        for (const obj of layer.objects) {
          const isSelected = obj.id === selectedObjectId;
          const size = 24;

          ctx.fillStyle =
            obj.type === 'player' ? '#4ade80' :
            obj.type === 'npc' ? '#60a5fa' :
            obj.type === 'enemy' ? '#f87171' :
            obj.type === 'item' ? '#fbbf24' :
            '#9ca3af';

          ctx.fillRect(obj.position.x - size / 2, obj.position.y - size / 2, size, size);

          if (isSelected) {
            ctx.strokeStyle = '#e94560';
            ctx.lineWidth = 2 / zoom;
            ctx.strokeRect(obj.position.x - size / 2 - 3, obj.position.y - size / 2 - 3, size + 6, size + 6);

            // Draw gizmo axes
            const lw = 2 / zoom;
            const headLen = 8 / zoom;

            // X axis (red)
            ctx.strokeStyle = dragAxis === 'x' ? '#ff6b6b' : '#ef4444';
            ctx.lineWidth = lw;
            ctx.beginPath();
            ctx.moveTo(obj.position.x, obj.position.y);
            ctx.lineTo(obj.position.x + GIZMO_LEN, obj.position.y);
            ctx.stroke();
            // X arrowhead
            ctx.fillStyle = dragAxis === 'x' ? '#ff6b6b' : '#ef4444';
            ctx.beginPath();
            ctx.moveTo(obj.position.x + GIZMO_LEN, obj.position.y);
            ctx.lineTo(obj.position.x + GIZMO_LEN - headLen, obj.position.y - headLen * 0.6);
            ctx.lineTo(obj.position.x + GIZMO_LEN - headLen, obj.position.y + headLen * 0.6);
            ctx.closePath();
            ctx.fill();
            // X label
            ctx.fillStyle = '#ef4444';
            ctx.font = `bold ${10 / zoom}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('X', obj.position.x + GIZMO_LEN + 10 / zoom, obj.position.y + 4 / zoom);

            // Y axis (green)
            ctx.strokeStyle = dragAxis === 'y' ? '#6bff6b' : '#22c55e';
            ctx.lineWidth = lw;
            ctx.beginPath();
            ctx.moveTo(obj.position.x, obj.position.y);
            ctx.lineTo(obj.position.x, obj.position.y + GIZMO_LEN);
            ctx.stroke();
            // Y arrowhead
            ctx.fillStyle = dragAxis === 'y' ? '#6bff6b' : '#22c55e';
            ctx.beginPath();
            ctx.moveTo(obj.position.x, obj.position.y + GIZMO_LEN);
            ctx.lineTo(obj.position.x - headLen * 0.6, obj.position.y + GIZMO_LEN - headLen);
            ctx.lineTo(obj.position.x + headLen * 0.6, obj.position.y + GIZMO_LEN - headLen);
            ctx.closePath();
            ctx.fill();
            // Y label
            ctx.fillStyle = '#22c55e';
            ctx.font = `bold ${10 / zoom}px sans-serif`;
            ctx.textAlign = 'left';
            ctx.fillText('Y', obj.position.x + 4 / zoom, obj.position.y + GIZMO_LEN + 12 / zoom);
          }

          // Label
          ctx.fillStyle = '#fff';
          ctx.font = `${10 / zoom}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(obj.type, obj.position.x, obj.position.y + size / 2 + 14);
        }
      }
    }

    ctx.restore();

    // Play mode overlay
    if (isPlaying) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('试玩模式 - 按 ESC 退出', canvas.width / 2, canvas.height / 2);
    }

    // Tool cursor indicator
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    const toolNames = { select: '选择', paint: '画笔', erase: '橡皮擦', fill: '填充', object: '放置' };
    ctx.fillText(`工具: ${toolNames[activeTool]}`, 10, canvas.height - 10);
  }, [canvasSize, scenes, activeSceneId, isPlaying, project.tileSize, selectedObjectId,
      currentTilemap, activeTileset, showGrid, activeTool, cameraOffset, zoom, dragAxis]);

  const handleTileAction = useCallback((x: number, y: number) => {
    if (!activeSceneId || !tilemapLayerId) return;
    const tile = screenToTile(x, y);
    if (activeTool === 'paint') {
      setTile(activeSceneId, tilemapLayerId, tile.x, tile.y, selectedTileIndex);
    } else if (activeTool === 'erase') {
      eraseTile(activeSceneId, tilemapLayerId, tile.x, tile.y);
    } else if (activeTool === 'fill') {
      fillTiles(activeSceneId, tilemapLayerId, tile.x, tile.y, selectedTileIndex);
    }
  }, [activeSceneId, tilemapLayerId, activeTool, selectedTileIndex, screenToTile, setTile, eraseTile, fillTiles]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Middle button pan
    if (e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - cameraOffset.x, y: e.clientY - cameraOffset.y });
      return;
    }

    if (isPlaying) return;

    if (activeTool === 'select') {
      // Check gizmo hit first
      const axis = hitTestGizmo(x, y);
      if (axis && selectedObjectId) {
        const activeScene = scenes.find((s) => s.id === activeSceneId);
        if (activeScene) {
          let obj: { position: { x: number; y: number } } | undefined;
          for (const layer of activeScene.layers) {
            if (layer.type !== 'object') continue;
            obj = layer.objects.find((o) => o.id === selectedObjectId);
            if (obj) break;
          }
          if (obj) {
            dragRef.current = {
              axis,
              objId: selectedObjectId,
              startMouse: { x, y },
              startObjPos: { ...obj.position },
            };
            setDragAxis(axis);
            return;
          }
        }
      }

      // Check object click
      const activeScene = scenes.find((s) => s.id === activeSceneId);
      if (activeScene) {
        const worldX = (x - cameraOffset.x) / zoom;
        const worldY = (y - cameraOffset.y) / zoom;
        for (const layer of activeScene.layers) {
          if (layer.type !== 'object') continue;
          for (const obj of layer.objects) {
            if (Math.abs(obj.position.x - worldX) < 16 && Math.abs(obj.position.y - worldY) < 16) {
              selectObject(obj.id);
              // Start free drag
              dragRef.current = {
                axis: 'both',
                objId: obj.id,
                startMouse: { x, y },
                startObjPos: { ...obj.position },
              };
              setDragAxis('both');
              return;
            }
          }
        }
      }
      selectObject(null);
    } else if (activeTool === 'paint' || activeTool === 'erase' || activeTool === 'fill') {
      setIsDrawing(true);
      handleTileAction(x, y);
    } else if (activeTool === 'object' && activeSceneId) {
      const worldX = Math.round((x - cameraOffset.x) / zoom);
      const worldY = Math.round((y - cameraOffset.y) / zoom);
      addObject(activeSceneId, {
        type: 'prop',
        position: { x: worldX, y: worldY },
        sprite: '',
        components: {},
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle drag
    if (dragRef.current && activeSceneId) {
      const drag = dragRef.current;
      const dx = (x - drag.startMouse.x) / zoom;
      const dy = (y - drag.startMouse.y) / zoom;
      const newPos = { ...drag.startObjPos };
      if (drag.axis === 'x' || drag.axis === 'both') newPos.x = Math.round(drag.startObjPos.x + dx);
      if (drag.axis === 'y' || drag.axis === 'both') newPos.y = Math.round(drag.startObjPos.y + dy);
      updateObject(activeSceneId, drag.objId, { position: newPos });
      return;
    }

    if (isPanning) {
      setCameraOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (isDrawing && (activeTool === 'paint' || activeTool === 'erase')) {
      handleTileAction(x, y);
    }
  };

  const handleMouseUp = () => {
    dragRef.current = null;
    setDragAxis(null);
    setIsDrawing(false);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.25, Math.min(4, z * delta)));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const toolMap: Record<string, () => void> = {
        '1': () => useTilemapStore.getState().setActiveTool('select'),
        '2': () => useTilemapStore.getState().setActiveTool('paint'),
        '3': () => useTilemapStore.getState().setActiveTool('erase'),
        '4': () => useTilemapStore.getState().setActiveTool('fill'),
        '5': () => useTilemapStore.getState().setActiveTool('object'),
        'g': () => useTilemapStore.getState().setShowGrid(!useTilemapStore.getState().showGrid),
        'Escape': () => useEditorStore.getState().setPlaying(false),
      };
      toolMap[e.key]?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="flex-1 relative overflow-hidden bg-editor-bg">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="absolute inset-0"
        style={{ cursor: dragAxis === 'x' ? 'ew-resize' : dragAxis === 'y' ? 'ns-resize' : dragAxis === 'both' ? 'move' : isPanning ? 'grabbing' : activeTool === 'paint' ? 'crosshair' : activeTool === 'erase' ? 'cell' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      {/* Tool bar overlay */}
      <div className="absolute top-2 left-2 flex gap-1">
        {([
          { id: 'select' as const, icon: '🖱️', key: '1', tip: '选择' },
          { id: 'paint' as const, icon: '🖌️', key: '2', tip: '画笔' },
          { id: 'erase' as const, icon: '🧹', key: '3', tip: '橡皮擦' },
          { id: 'fill' as const, icon: '🪣', key: '4', tip: '填充' },
          { id: 'object' as const, icon: '📦', key: '5', tip: '放置对象' },
        ]).map((tool) => (
          <button
            key={tool.id}
            className={`toolbar-btn bg-editor-panel/80 backdrop-blur text-xs ${activeTool === tool.id ? 'ring-1 ring-editor-accent' : ''}`}
            title={`${tool.tip} (${tool.key})`}
            onClick={() => useTilemapStore.getState().setActiveTool(tool.id)}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      {/* Zoom controls */}
      <div className="absolute bottom-2 right-2 flex gap-1 items-center bg-editor-panel/80 backdrop-blur rounded px-2 py-1">
        <button className="text-xs hover:text-editor-accent" onClick={() => setZoom((z) => Math.max(0.25, z * 0.9))}>-</button>
        <span className="text-xs text-editor-muted px-2 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
        <button className="text-xs hover:text-editor-accent" onClick={() => setZoom((z) => Math.min(4, z * 1.1))}>+</button>
        <button className="text-xs text-editor-muted hover:text-editor-text ml-2" onClick={() => { setZoom(1); setCameraOffset({ x: 0, y: 0 }); }}>重置</button>
      </div>
      {/* Coordinates */}
      <div className="absolute bottom-2 left-2 text-xs text-editor-muted bg-editor-panel/80 backdrop-blur rounded px-2 py-1">
        偏移: {Math.round(cameraOffset.x)}, {Math.round(cameraOffset.y)}
      </div>
    </div>
  );
}
