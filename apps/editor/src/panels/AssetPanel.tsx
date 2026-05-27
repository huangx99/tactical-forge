import { useRef } from 'react';
import { useTilemapStore } from '../stores/tilemapStore';

export function AssetPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { tilesets, activeTilesetId, setActiveTileset, addTileset, selectedTileIndex, setSelectedTile } = useTilemapStore();

  const activeTileset = tilesets.find((t) => t.id === activeTilesetId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        addTileset({
          name: file.name.replace(/\.\w+$/, ''),
          image: ev.target?.result as string,
          tileSize: 32,
          columns: Math.floor(img.width / 32),
          rows: Math.floor(img.height / 32),
        });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="panel-header flex items-center justify-between">
        <span>资源管理</span>
        <button
          className="text-editor-accent hover:text-white text-xs"
          onClick={() => fileRef.current?.click()}
        >
          + 上传
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      </div>

      {/* Tileset List */}
      {tilesets.length > 0 && (
        <div className="border-b border-editor-border">
          <div className="px-3 py-1 text-xs text-editor-muted">瓦片集</div>
          {tilesets.map((ts) => (
            <div
              key={ts.id}
              className={`px-3 py-1.5 cursor-pointer hover:bg-editor-border text-sm flex items-center justify-between ${ts.id === activeTilesetId ? 'bg-editor-border' : ''}`}
              onClick={() => setActiveTileset(ts.id)}
            >
              <span>{ts.name}</span>
              <span className="text-xs text-editor-muted">{ts.columns}x{ts.rows}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tile Palette */}
      {activeTileset && (
        <div className="flex-1 overflow-auto p-2">
          <div className="text-xs text-editor-muted mb-2">瓦片调色板 (选择后绘制)</div>
          <div
            className="grid gap-0.5"
            style={{
              gridTemplateColumns: `repeat(${activeTileset.columns}, 1fr)`,
            }}
          >
            {Array.from({ length: activeTileset.columns * activeTileset.rows }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square border cursor-pointer hover:border-editor-accent ${
                  i === selectedTileIndex ? 'border-editor-accent ring-1 ring-editor-accent' : 'border-editor-border'
                }`}
                style={{
                  backgroundImage: `url(${activeTileset.image})`,
                  backgroundSize: `${activeTileset.columns * 100}% ${activeTileset.rows * 100}%`,
                  backgroundPosition: `${(i % activeTileset.columns) / (activeTileset.columns - 1) * 100}% ${Math.floor(i / activeTileset.columns) / (activeTileset.rows - 1) * 100}%`,
                }}
                onClick={() => setSelectedTile(i)}
                title={`瓦片 ${i}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tilesets.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-editor-muted text-xs">
          <div className="text-center">
            <div className="text-2xl mb-2">📁</div>
            <div>上传瓦片集图片开始编辑地图</div>
            <div className="mt-1">支持 PNG / JPG</div>
            <button
              className="mt-3 px-4 py-1.5 bg-editor-accent hover:bg-red-600 rounded text-sm transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              上传瓦片集
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
