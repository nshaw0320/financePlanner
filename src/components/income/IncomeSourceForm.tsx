import { useState } from 'react';
import { Shield, Briefcase } from 'lucide-react';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useIncomeStore } from '../../store/incomeStore';
import { useFamilyStore } from '../../store/familyStore';
import type { IncomeSource, IncomeType } from '../../types';

interface IncomeSourceFormProps {
  source?: IncomeSource;
  defaultMemberId?: string;
  onClose: () => void;
}

export function IncomeSourceForm({ source, defaultMemberId, onClose }: IncomeSourceFormProps) {
  const { addSource, updateSource } = useIncomeStore();
  const members = useFamilyStore((s) => s.members);

  const [memberId, setMemberId]     = useState(source?.memberId ?? defaultMemberId ?? members[0]?.id ?? '');
  const [isActive, setIsActive]     = useState(source?.isActive ?? true);
  const [incomeType, setIncomeType] = useState<IncomeType>(source?.incomeType ?? 'civilian');
  const [errors, setErrors]         = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!memberId) errs.memberId = 'Select a family member';
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const data = { memberId, isActive, incomeType };
    if (source) { updateSource(source.id, data); } else { addSource(data); }
    onClose();
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        <p>No family members yet.</p>
        <p className="mt-1">Add a family member first before creating income sources.</p>
        <Button variant="secondary" onClick={onClose} className="mt-4">Close</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <Select
        id="member"
        label="Family Member"
        value={memberId}
        onChange={(e) => { setMemberId(e.target.value); setErrors({}); }}
        error={errors.memberId}
        options={members.map((m) => ({ value: m.id, label: m.name }))}
      />

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Income Type</p>
        <div className="grid grid-cols-2 gap-2">
          {(['civilian', 'military'] as IncomeType[]).map((type) => {
            const active = incomeType === type;
            const isMil  = type === 'military';
            return (
              <button
                key={type}
                type="button"
                onClick={() => setIncomeType(type)}
                className={`
                  flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all
                  ${active
                    ? isMil
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {isMil
                  ? <Shield size={15} className={active ? 'text-green-600' : 'text-gray-400'} />
                  : <Briefcase size={15} className={active ? 'text-blue-600' : 'text-gray-400'} />
                }
                {isMil ? 'Military' : 'Civilian'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <p className="text-sm font-medium text-gray-900">Active Income Source</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isActive ? 'Included in income tracking' : 'Excluded from income tracking'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsActive((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isActive ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={isActive}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">{source ? 'Save Changes' : 'Add Income Source'}</Button>
      </div>

    </form>
  );
}
