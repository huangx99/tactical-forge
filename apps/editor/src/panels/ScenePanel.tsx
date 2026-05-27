import { useState } from 'react';
import { useSceneStore } from '../stores/sceneStore';
import { useEditorStore } from '../stores/editorStore';
import { useTilemapStore, type EditorTool } from '../stores/tilemapStore';
import { generateId } from '@tactical-forge/shared';

export function ScenePanel() {
  const { scenes, activeSceneId, setActiveScene, addScene, removeScene, updateScene, addObject, removeObject } = useSceneStore();
  const { selectObject, selectedObjectId } = useEditorStore();
  const { setActiveTool } = useTilemapStore();
  const [editingSceneName, setEditingSceneName] = useState<string | null>(null);
  const [newObjType, setNewObjType] = useState<string>('npc');

  const activeScene = scenes.find((s) => s.id === activeSceneId);

  const allObjects = activeScene?.layers
    .filter((l) => l.type === 'object')
    .flatMap((l) => (l.type === 'object' ? l.objects : [])) ?? [];

  const handleAddObject = () => {
    if (!activeSceneId) return;
    addObject(activeSceneId, {
      type: newObjType as 'player' | 'npc' | 'enemy' | 'item' | 'prop',
      position: { x: 200, y: 200 },
      sprite: '',
      components: newObjType === 'player' ? { playerController: { speed: 3, jumpForce: 8 }, health: { max: 100, current: 100 } } : {},
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scene List */}
      <div className="panel-header flex items-center justify-between">
        <span>场景</span>
        <button
          className="text-editor-accent hover:text-white text-lg leading-none"
          onClick={() => addScene('新场景')}
          title="新建场景"
        >
          +
        </button>
      </div>
      <div className="max-h-32 overflow-auto border-b border-editor-border">
        {scenes.length === 0 && (
          <div className="px-3 py-3 text-editor-muted text-xs text-center">
            点击 + 创建第一个场景
          </div>
        )}
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className={`flex items-center px-3 py-1.5 cursor-pointer hover:bg-editor-border ${scene.id === activeSceneId ? 'bg-editor-border' : ''}`}
            onClick={() => setActiveScene(scene.id)}
            onDoubleClick={() => setEditingSceneName(scene.id)}
          >
            {editingSceneName === scene.id ? (
              <input
                className="input-field flex-1 text-xs py-0"
                defaultValue={scene.name}
                autoFocus
                onBlur={(e) => {
                  updateScene(scene.id, { name: e.target.value });
                  setEditingSceneName(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateScene(scene.id, { name: (e.target as HTMLInputElement).value });
                    setEditingSceneName(null);
                  }
                }}
              />
            ) : (
              <span className="flex-1 text-sm">{scene.name}</span>
            )}
            <button
              className="text-editor-muted hover:text-editor-accent text-xs ml-2"
              onClick={(e) => { e.stopPropagation(); removeScene(scene.id); }}
              title="删除场景"
            >
              x
            </button>
          </div>
        ))}
      </div>

      {/* Scene Properties */}
      {activeScene && (
        <div className="border-b border-editor-border px-3 py-2">
          <div className="text-xs text-editor-muted mb-2">场景属性</div>
          <div className="space-y-1">
            <div>
              <label className="text-xs text-editor-muted">视角</label>
              <select
                className="input-field w-full text-xs"
                value={activeScene.viewMode || 'top-down'}
                onChange={(e) => updateScene(activeScene.id, { viewMode: e.target.value as 'top-down' | 'side-scroll' })}
              >
                <option value="top-down">俯视角</option>
                <option value="side-scroll">横版</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Object List */}
      {activeScene && (
        <>
          <div className="panel-header flex items-center justify-between">
            <span>对象</span>
            <div className="flex gap-1 items-center">
              <select
                className="input-field text-xs py-0 px-1"
                value={newObjType}
                onChange={(e) => setNewObjType(e.target.value)}
              >
                <option value="player">玩家</option>
                <option value="npc">NPC</option>
                <option value="enemy">敌人</option>
                <option value="item">道具</option>
                <option value="prop">装饰</option>
              </select>
              <button
                className="text-editor-accent hover:text-white text-lg leading-none"
                onClick={handleAddObject}
                title="添加对象"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {allObjects.map((obj) => (
              <div
                key={obj.id}
                className={`flex items-center px-3 py-1.5 cursor-pointer hover:bg-editor-border group ${obj.id === selectedObjectId ? 'bg-editor-border' : ''}`}
                onClick={() => {
                  selectObject(obj.id);
                  setActiveTool('select');
                }}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  obj.type === 'player' ? 'bg-green-400' :
                  obj.type === 'npc' ? 'bg-blue-400' :
                  obj.type === 'enemy' ? 'bg-red-400' :
                  obj.type === 'item' ? 'bg-yellow-400' :
                  'bg-gray-400'
                }`} />
                <span className="text-sm flex-1 truncate">{obj.id.slice(0, 8)}</span>
                <span className="text-xs text-editor-muted mr-2">{obj.type}</span>
                <button
                  className="text-editor-muted hover:text-editor-accent text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeObject(activeScene.id, obj.id);
                    if (selectedObjectId === obj.id) selectObject(null);
                  }}
                  title="删除"
                >
                  x
                </button>
              </div>
            ))}
            {allObjects.length === 0 && (
              <div className="px-3 py-4 text-editor-muted text-xs text-center">
                双击画布放置对象，或点击 + 添加
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
