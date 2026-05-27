import { useEffect, type ReactNode } from 'react';

interface AssetEditorWindowProps {
  title: string;
  icon: string;
  onClose: () => void;
  children: ReactNode;
  toolbar?: ReactNode;
}

export function AssetEditorWindow({ title, icon, onClose, children, toolbar }: AssetEditorWindowProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f1a] flex flex-col">
      {/* Title bar */}
      <div className="h-10 bg-editor-panel border-b border-editor-border flex items-center px-3 gap-2">
        <span className="text-lg">{icon}</span>
        <span className="font-bold text-sm">{title}</span>
        {toolbar && <div className="flex-1 flex items-center gap-2 ml-4">{toolbar}</div>}
        {!toolbar && <div className="flex-1" />}
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-editor-border text-editor-muted hover:text-editor-text text-sm"
          onClick={onClose}
          title="关闭 (Esc)"
        >
          ✕
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
