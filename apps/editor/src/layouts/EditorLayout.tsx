import { Toolbar } from '../panels/Toolbar';
import { ScenePanel } from '../panels/ScenePanel';
import { AssetPanel } from '../panels/AssetPanel';
import { InspectorPanel } from '../panels/InspectorPanel';
import { GameCanvas } from '../canvas/GameCanvas';
import { PlayMode } from '../canvas/PlayMode';
import { BlueprintEditorWindow } from '../panels/NodeEditorPanel';
import { ItemEditorWindow } from '../panels/ItemEditorPanel';
import { SkillEditorWindow } from '../panels/SkillEditorPanel';
import { StatusEffectEditorWindow } from '../panels/StatusEffectPanel';
import { LootTableEditorWindow } from '../panels/LootTablePanel';
import { ResizablePanel } from '../components/ResizablePanel';
import { useEditorStore } from '../stores/editorStore';

const ASSET_EDITOR_MAP = {
  blueprint: BlueprintEditorWindow,
  item: ItemEditorWindow,
  skill: SkillEditorWindow,
  statusEffect: StatusEffectEditorWindow,
  lootTable: LootTableEditorWindow,
} as const;

export function EditorLayout() {
  const { activeLeftTab, setActiveLeftTab, isPlaying, openAssetEditor } = useEditorStore();

  const AssetEditorComponent = openAssetEditor ? ASSET_EDITOR_MAP[openAssetEditor] : null;

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        {!isPlaying && (
          <ResizablePanel defaultWidth={256} minWidth={160} maxWidth={400} side="left">
            <div className="flex border-b border-editor-border">
              <button
                className={`flex-1 py-2 text-xs font-medium ${activeLeftTab === 'scene' ? 'bg-editor-border text-editor-text' : 'text-editor-muted hover:text-editor-text'}`}
                onClick={() => setActiveLeftTab('scene')}
              >
                场景
              </button>
              <button
                className={`flex-1 py-2 text-xs font-medium ${activeLeftTab === 'assets' ? 'bg-editor-border text-editor-text' : 'text-editor-muted hover:text-editor-text'}`}
                onClick={() => setActiveLeftTab('assets')}
              >
                资源
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {activeLeftTab === 'scene' ? <ScenePanel /> : <AssetPanel />}
            </div>
          </ResizablePanel>
        )}

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col relative min-w-0">
          <GameCanvas />
          {isPlaying && <PlayMode />}
        </div>

        {/* Right Panel - Unified Inspector */}
        {!isPlaying && (
          <ResizablePanel defaultWidth={320} minWidth={200} maxWidth={500} side="right">
            <InspectorPanel />
          </ResizablePanel>
        )}
      </div>

      {/* Asset Editor Windows (full-screen overlay) */}
      {AssetEditorComponent && <AssetEditorComponent />}

      {/* Status Bar */}
      <div className="h-6 bg-editor-panel border-t border-editor-border flex items-center px-3 text-xs text-editor-muted gap-4">
        <span>Tactical Forge v0.1.0</span>
        <span>视角: {isPlaying ? '试玩中' : '编辑'}</span>
        {!isPlaying && <span>工具: 选择</span>}
        <span className="ml-auto">{isPlaying ? '按 ESC 退出试玩' : '就绪'}</span>
      </div>
    </div>
  );
}
