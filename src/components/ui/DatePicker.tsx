import { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface CalDay {
  day: number;
  month: number; // 0-based
  year: number;
  current: boolean; // belongs to the displayed month
}

function buildCalendar(year: number, month: number): CalDay[] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const days: CalDay[] = [];

  // Leading days from previous month
  for (let i = firstDow - 1; i >= 0; i--) {
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    days.push({ day: daysInPrev - i, month: m, year: y, current: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, month, year, current: true });
  }
  // Trailing days to fill 6 rows (42 cells)
  const trailing = 42 - days.length;
  for (let d = 1; d <= trailing; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    days.push({ day: d, month: m, year: y, current: false });
  }
  return days;
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDate(str: string): { year: number; month: number; day: number } | null {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m - 1, day: d };
}

function formatDisplay(str: string): string {
  const p = parseDate(str);
  if (!p) return '';
  return `${MONTH_NAMES[p.month]} ${p.day}, ${p.year}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface DatePickerProps {
  label?: string;
  error?: string;
  id?: string;
  value?: string;           // YYYY-MM-DD
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DatePicker({
  label,
  error,
  id: idProp,
  value = '',
  onChange,
  disabled,
  placeholder = 'Select date',
}: DatePickerProps) {
  const autoId = useId();
  const id = idProp ?? autoId;

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  // Navigate the calendar independently from selected value
  const today = new Date();
  const parsed = parseDate(value);
  const [navYear, setNavYear] = useState(parsed?.year ?? today.getFullYear());
  const [navMonth, setNavMonth] = useState(parsed?.month ?? today.getMonth());

  function openCalendar() {
    if (disabled) return;
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      // Decide whether to open upward or downward
      const spaceBelow = window.innerHeight - r.bottom;
      const panelH = 320; // approximate calendar height
      const top = spaceBelow >= panelH ? r.bottom + 4 : r.top - panelH - 4;
      setPos({ top, left: r.left, width: r.width });
    }
    // Sync nav to selected date when opening
    if (parsed) {
      setNavYear(parsed.year);
      setNavMonth(parsed.month);
    } else {
      setNavYear(today.getFullYear());
      setNavMonth(today.getMonth());
    }
    setOpen(true);
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      const t = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(t) &&
        panelRef.current && !panelRef.current.contains(t)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  function prevMonth() {
    if (navMonth === 0) { setNavMonth(11); setNavYear((y) => y - 1); }
    else setNavMonth((m) => m - 1);
  }

  function nextMonth() {
    if (navMonth === 11) { setNavMonth(0); setNavYear((y) => y + 1); }
    else setNavMonth((m) => m + 1);
  }

  function selectDay(cell: CalDay) {
    const str = toDateStr(cell.year, cell.month, cell.day);
    onChange?.({ target: { value: str } });
    setOpen(false);
  }

  const calendar = buildCalendar(navYear, navMonth);
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const panel = open && createPortal(
    <div
      ref={panelRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, width: Math.max(pos.width, 280), zIndex: 9999 }}
      className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
    >
      {/* Month / Year header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-gray-900">
          {MONTH_NAMES[navMonth]} {navYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 px-3 pt-2 pb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
        {calendar.map((cell, i) => {
          const cellStr = toDateStr(cell.year, cell.month, cell.day);
          const isSelected = cellStr === value;
          const isToday = cellStr === todayStr;

          return (
            <button
              key={i}
              type="button"
              onClick={() => selectDay(cell)}
              className={`
                relative flex items-center justify-center h-8 w-full rounded-lg text-sm transition-colors
                ${isSelected
                  ? 'bg-blue-600 text-white font-semibold'
                  : isToday
                    ? 'text-blue-600 font-semibold hover:bg-blue-50'
                    : cell.current
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-gray-50'
                }
              `}
            >
              {cell.day}
              {/* Today dot when not selected */}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Today shortcut */}
      <div className="border-t border-gray-100 px-4 py-2">
        <button
          type="button"
          onClick={() => {
            onChange?.({ target: { value: todayStr } });
            setOpen(false);
          }}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Today
        </button>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={openCalendar}
        className={`
          flex items-center gap-2 w-full border rounded-lg px-3 py-2 text-sm text-left transition-colors outline-none
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          bg-white
          ${error
            ? 'border-red-400'
            : open
              ? 'border-blue-500 ring-2 ring-blue-500'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <Calendar size={14} className="text-gray-400 shrink-0" />
        <span className={`flex-1 ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {panel}
    </div>
  );
}
