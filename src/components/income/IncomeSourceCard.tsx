import { Pencil, Trash2, PlusCircle, Shield, Briefcase, BookMarked, Zap } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { IncomeSource } from '../../types';

interface IncomeSourceCardProps {
  source: IncomeSource;
  onEdit: (source: IncomeSource) => void;
  onDelete: (source: IncomeSource) => void;
  onLogPaycheck: (source: IncomeSource) => void;
  onSetTemplate: (source: IncomeSource) => void;
  onQuickLog: (source: IncomeSource) => void;
}

export function IncomeSourceCard({
  source, onEdit, onDelete, onLogPaycheck, onSetTemplate, onQuickLog,
}: IncomeSourceCardProps) {
  const isMilitary = source.incomeType === 'military';
  const hasTemplate = !!(isMilitary ? source.template?.les : source.template?.civilian);

  return (
    <div className={`bg-white rounded-xl border p-4 flex flex-col gap-3 transition-opacity ${source.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
      {/* Top row: identity + action icons */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isMilitary ? 'bg-green-50' : 'bg-blue-50'}`}>
            {isMilitary
              ? <Shield size={16} className="text-green-600" />
              : <Briefcase size={16} className="text-blue-500" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">{isMilitary ? 'Military' : 'Civilian'}</p>
            <Badge variant={source.isActive ? 'green' : 'gray'}>
              {source.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onSetTemplate(source)}
            className={`p-1.5 rounded-md transition-colors ${hasTemplate ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
            title={hasTemplate ? 'Edit template' : 'Set template'}
          >
            <BookMarked size={15} />
          </button>
          <button
            onClick={() => onEdit(source)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Edit source"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(source)}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Bottom row: log buttons */}
      <div className="flex gap-2 pt-1 border-t border-gray-100">
        {hasTemplate && (
          <button
            onClick={() => onQuickLog(source)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
            title="Quick log using template"
          >
            <Zap size={12} />
            Quick Log
          </button>
        )}
        <button
          onClick={() => onLogPaycheck(source)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
          title="Log paycheck manually"
        >
          <PlusCircle size={12} />
          Log Paycheck
        </button>
      </div>
    </div>
  );
}
