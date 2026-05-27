import { useState, useRef, useEffect } from 'react';

interface InlineRenameProps {
  name: string;
  onRename: (newName: string) => void;
  className?: string;
}

export function InlineRename({ name, onRename, className = '' }: InlineRenameProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setValue(name); }, [name]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) onRename(trimmed);
    else setValue(name);
    setEditing(false);
  };

  const cancel = () => {
    setValue(name);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={`bg-transparent border-b border-editor-accent outline-none ${className}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') cancel();
        }}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <span
      className={`cursor-text ${className}`}
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      title="双击重命名"
    >
      {name}
    </span>
  );
}
