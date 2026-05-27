import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';

interface ResizablePanelProps {
  children: ReactNode;
  defaultWidth: number;
  minWidth?: number;
  maxWidth?: number;
  side: 'left' | 'right';
  className?: string;
}

export function ResizablePanel({ children, defaultWidth, minWidth = 150, maxWidth = 500, side, className = '' }: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      let newWidth: number;

      if (side === 'left') {
        newWidth = e.clientX - rect.left;
      } else {
        newWidth = rect.right - e.clientX;
      }

      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, side, minWidth, maxWidth]);

  return (
    <div
      ref={panelRef}
      className={`flex flex-col panel relative ${className}`}
      style={{ width, minWidth, flexShrink: 0 }}
    >
      {children}
      {/* Drag handle */}
      <div
        className={`absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-editor-accent transition-colors z-10 ${
          isDragging ? 'bg-editor-accent' : 'bg-transparent'
        } ${side === 'left' ? 'right-0' : 'left-0'}`}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
