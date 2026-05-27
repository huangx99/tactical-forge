import { useEditorStore, type AssetEditorType } from '../stores/editorStore';
import { useProjectStore } from '../stores/projectStore';
import { useSceneStore } from '../stores/sceneStore';
import { useTilemapStore } from '../stores/tilemapStore';
import { useBlueprintStore } from '../stores/blueprintStore';
import { useAssetStore } from '../stores/assetStore';

const ASSET_ITEMS: { type: AssetEditorType; label: string; icon: string }[] = [
  { type: 'blueprint', label: '蓝图编辑器', icon: '🔗' },
  { type: 'item', label: '物品编辑器', icon: '⚔️' },
  { type: 'skill', label: '技能编辑器', icon: '🔥' },
  { type: 'statusEffect', label: '状态效果', icon: '✨' },
  { type: 'lootTable', label: '掉落表', icon: '🎲' },
];

export function Toolbar() {
  const { isPlaying, setPlaying, openAssetEditorWindow } = useEditorStore();
  const { project, updateProject } = useProjectStore();
  const { addScene, scenes, activeSceneId, setActiveScene } = useSceneStore();
  const { activeTool, setActiveTool, showGrid, setShowGrid } = useTilemapStore();

  const handleSave = () => {
    const assetState = useAssetStore.getState();
    const data = {
      project: useProjectStore.getState().project,
      scenes: useSceneStore.getState().scenes,
      tilemaps: useTilemapStore.getState().tilemaps,
      blueprints: useBlueprintStore.getState().blueprints,
      assets: {
        items: assetState.items,
        skills: assetState.skills,
        statuses: assetState.statuses,
        lootTables: assetState.lootTables,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.project.name || 'project'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.project) useProjectStore.getState().updateProject(data.project);
          if (data.blueprints) {
            useBlueprintStore.getState().loadBlueprints(data.blueprints);
          }
          if (data.assets) {
            useAssetStore.getState().loadAssets(data.assets);
          }
        } catch {
          alert('文件格式错误');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="h-10 bg-editor-panel border-b border-editor-border flex items-center px-2 gap-1">
      <span className="font-bold text-editor-accent mr-4 text-sm">Tactical Forge</span>

      {/* File */}
      <div className="relative group">
        <button className="toolbar-btn">文件</button>
        <div className="absolute top-full left-0 bg-editor-panel border border-editor-border rounded shadow-lg py-1 hidden group-hover:block z-50 min-w-[120px]">
          <button className="w-full text-left px-3 py-1.5 hover:bg-editor-border text-sm" onClick={() => useProjectStore.getState().newProject()}>新建项目</button>
          <button className="w-full text-left px-3 py-1.5 hover:bg-editor-border text-sm" onClick={handleSave}>保存</button>
          <button className="w-full text-left px-3 py-1.5 hover:bg-editor-border text-sm" onClick={handleLoad}>加载</button>
        </div>
      </div>

      {/* Edit */}
      <div className="relative group">
        <button className="toolbar-btn">编辑</button>
        <div className="absolute top-full left-0 bg-editor-panel border border-editor-border rounded shadow-lg py-1 hidden group-hover:block z-50 min-w-[120px]">
          <button className="w-full text-left px-3 py-1.5 hover:bg-editor-border text-sm">撤销 <span className="text-editor-muted ml-2">Ctrl+Z</span></button>
          <button className="w-full text-left px-3 py-1.5 hover:bg-editor-border text-sm">重做 <span className="text-editor-muted ml-2">Ctrl+Y</span></button>
        </div>
      </div>

      {/* View */}
      <div className="relative group">
        <button className="toolbar-btn">视图</button>
        <div className="absolute top-full left-0 bg-editor-panel border border-editor-border rounded shadow-lg py-1 hidden group-hover:block z-50 min-w-[140px]">
          <button
            className="w-full text-left px-3 py-1.5 hover:bg-editor-border text-sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            {showGrid ? '✓ ' : '  '}显示网格 <span className="text-editor-muted ml-2">G</span>
          </button>
        </div>
      </div>

      {/* Scene */}
      <div className="relative group">
        <button className="toolbar-btn">场景</button>
        <div className="absolute top-full left-0 bg-editor-panel border border-editor-border rounded shadow-lg py-1 hidden group-hover:block z-50 min-w-[160px]">
          <button className="w-full text-left px-3 py-1.5 hover:bg-editor-border text-sm" onClick={() => addScene('新场景')}>新建场景</button>
          <div className="border-t border-editor-border my-1" />
          {scenes.map((s) => (
            <button
              key={s.id}
              className={`w-full text-left px-3 py-1.5 hover:bg-editor-border text-sm ${s.id === activeSceneId ? 'text-editor-accent' : ''}`}
              onClick={() => setActiveScene(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Assets */}
      <div className="relative group">
        <button className="toolbar-btn">资产</button>
        <div className="absolute top-full left-0 bg-editor-panel border border-editor-border rounded shadow-lg py-1 hidden group-hover:block z-50 min-w-[160px]">
          {ASSET_ITEMS.map((item) => (
            <button
              key={item.type}
              className="w-full text-left px-3 py-1.5 hover:bg-editor-border text-sm flex items-center gap-2"
              onClick={() => openAssetEditorWindow(item.type)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      {/* Scene name */}
      {activeSceneId && (
        <span className="text-xs text-editor-muted mr-3">
          {scenes.find((s) => s.id === activeSceneId)?.name}
        </span>
      )}

      {/* View Mode */}
      <select
        className="input-field mr-2 text-xs"
        value={project.viewMode}
        onChange={(e) => updateProject({ viewMode: e.target.value as 'top-down' | 'side-scroll' })}
      >
        <option value="top-down">俯视角</option>
        <option value="side-scroll">横版</option>
      </select>

      {/* Combat Mode */}
      <select
        className="input-field mr-2 text-xs"
        value={project.combatMode}
        onChange={(e) => updateProject({ combatMode: e.target.value as 'turn-based' | 'action' | 'none' })}
      >
        <option value="turn-based">回合制</option>
        <option value="action">动作</option>
        <option value="none">无战斗</option>
      </select>

      {/* Play/Stop */}
      <button
        className={`toolbar-btn font-medium ${isPlaying ? 'text-editor-accent' : 'text-green-400'}`}
        onClick={() => setPlaying(!isPlaying)}
      >
        {isPlaying ? '■ 停止' : '▶ 试玩'}
      </button>
    </div>
  );
}
