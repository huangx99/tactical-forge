import { useState, useEffect, useCallback, type InputHTMLAttributes } from 'react';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number;
  onChange: (value: number) => void;
}

export function NumberInput({ value, onChange, onBlur, className, ...rest }: NumberInputProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(String(value));

  useEffect(() => {
    if (!editing) setText(String(value));
  }, [value, editing]);

  const commit = useCallback(() => {
    setEditing(false);
    const num = Number(text);
    if (text === '' || text === '-') {
      onChange(0);
    } else if (!isNaN(num)) {
      onChange(num);
    } else {
      setText(String(value));
    }
  }, [text, value, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    commit();
    onBlur?.(e);
  }, [commit, onBlur]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit();
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setText(String(value));
      setEditing(false);
      (e.target as HTMLInputElement).blur();
    }
    e.stopPropagation();
  }, [commit, value]);

  const handleFocus = useCallback(() => {
    setEditing(true);
    setText(String(value));
  }, [value]);

  return (
    <input
      {...rest}
      type="text"
      inputMode="numeric"
      className={`nodrag ${className ?? ''}`}
      value={editing ? text : String(value)}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}
