import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  id?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  className?: string;
}

export function Select({ label, error, id: idProp, options, value, onChange, disabled, className = '' }: SelectProps) {
  const autoId = useId();
  const id = idProp ?? autoId;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  function select(val: string) {
    onChange?.({ target: { value: val } });
    setOpen(false);
  }

  return (
    <div className={`relative flex flex-col gap-1 ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Trigger button — identical sizing/shape to Input */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`relative flex items-center justify-between w-full border rounded-lg px-3 py-2 text-sm text-left transition-colors outline-none
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          bg-white
          ${error ? 'border-red-400' : open ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected?.label ?? 'Select…'}
        </span>
        <ChevronDown
          size={15}
          className={`text-gray-400 shrink-0 ml-2 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          style={{ width: containerRef.current?.offsetWidth }}
        >
          <ul className="py-1 max-h-56 overflow-y-auto" role="listbox">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => select(opt.value)}
                  className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors
                    ${isSelected
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {opt.label}
                  {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
