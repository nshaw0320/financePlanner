import { useState } from 'react';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { DatePicker } from '../ui/DatePicker';
import { Button } from '../ui/Button';
import { useIncomeStore } from '../../store/incomeStore';
import { useFamilyStore } from '../../store/familyStore';
import type { IncomeEntry } from '../../types';
import {
  MilitaryLESForm, CivilianPaycheckForm,
  initLES, initCivilian, buildLESData, buildCivilianData,
  calcLES, calcCivilian,
  type LESFormState, type CivilianFormState,
} from './PaycheckDetailForms';

interface IncomeEntryFormProps {
  entry?: IncomeEntry;
  defaultSourceId?: string;
  onClose: () => void;
}

export function IncomeEntryForm({ entry, defaultSourceId, onClose }: IncomeEntryFormProps) {
  const { addEntry, updateEntry, sources } = useIncomeStore();
  const members = useFamilyStore((s) => s.members);

  const initialSourceId = entry?.incomeSourceId ?? defaultSourceId ?? sources[0]?.id ?? '';
  const initialSource = sources.find((s) => s.id === initialSourceId);

  const [sourceId, setSourceId]   = useState(initialSourceId);
  const [date, setDate]           = useState(entry?.date ?? new Date().toISOString().split('T')[0]);
  const [isForecast, setIsForecast] = useState(entry?.isForecast ?? false);
  const [note, setNote]           = useState(entry?.note ?? '');
  const [errors, setErrors]       = useState<Record<string, string>>({});

  // Seed from entry data first, then fall back to the source's template
  const [lesData, setLesData] = useState<LESFormState>(() =>
    initLES(entry?.les ?? initialSource?.template?.les)
  );
  const [civilianData, setCivilianData] = useState<CivilianFormState>(() =>
    initCivilian(entry?.civilian ?? initialSource?.template?.civilian)
  );

  const selectedSource = sources.find((s) => s.id === sourceId);
  const isMilitary = selectedSource?.incomeType === 'military';

  function handleSourceChange(id: string) {
    setSourceId(id);
    const src = sources.find((s) => s.id === id);
    // Pre-fill from the new source's template (or blank if none)
    setLesData(initLES(src?.template?.les));
    setCivilianData(initCivilian(src?.template?.civilian));
  }

  const calculatedNet = isMilitary
    ? calcLES(lesData).netPay
    : calcCivilian(civilianData).netPay;

  function validate() {
    const errs: Record<string, string> = {};
    if (!sourceId) errs.sourceId = 'Select an income source';
    if (!date) errs.date = 'Date is required';
    if (isMilitary && !lesData.basicPay) errs.detail = 'Basic Pay is required';
    if (!isMilitary && !civilianData.regularPay) errs.detail = 'Regular Pay is required';
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const data = {
      incomeSourceId: sourceId,
      memberId: selectedSource!.memberId,
      amount: calculatedNet,
      date,
      isForecast,
      note: note.trim() || undefined,
      les: isMilitary ? buildLESData(lesData) : undefined,
      civilian: !isMilitary ? buildCivilianData(civilianData) : undefined,
    };

    if (entry) { updateEntry(entry.id, data); } else { addEntry(data); }
    onClose();
  }

  const sourceOptions = sources.map((s) => {
    const member = members.find((m) => m.id === s.memberId);
    const icon = s.incomeType === 'military' ? '🪖' : '💼';
    const typeLabel = s.incomeType === 'military' ? 'Military' : 'Civilian';
    const hasTemplate = !!s.template;
    return {
      value: s.id,
      label: `${icon} ${member?.name ?? 'Unknown'} — ${typeLabel}${hasTemplate ? ' ✦' : ''}`,
    };
  });

  if (sources.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        <p>No income sources yet. Add an income source first.</p>
        <Button variant="secondary" onClick={onClose} className="mt-4">Close</Button>
      </div>
    );
  }

  const templateLoaded = isMilitary
    ? !!selectedSource?.template?.les
    : !!selectedSource?.template?.civilian;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Source + Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Select
            id="source"
            label="Income Source"
            value={sourceId}
            onChange={(e) => handleSourceChange(e.target.value)}
            error={errors.sourceId}
            options={sourceOptions}
          />
          {templateLoaded && (
            <p className="mt-1 text-xs text-blue-600">✦ Template pre-filled — edit any field to override</p>
          )}
        </div>
        <DatePicker
          id="date"
          label="Pay Date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: '' })); }}
          error={errors.date}
        />
        <Input
          id="note"
          label="Note (optional)"
          placeholder="e.g. Includes bonus"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Forecast toggle */}
      <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${isForecast ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
        <div>
          <p className="text-sm font-medium text-gray-900">Forecast Entry</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isForecast ? 'Future projected paycheck' : 'Actual received paycheck'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsForecast((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${isForecast ? 'bg-amber-500' : 'bg-gray-300'}`}
          role="switch"
          aria-checked={isForecast}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${isForecast ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Detail form */}
      {selectedSource && (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          {isMilitary
            ? <MilitaryLESForm data={lesData} onChange={setLesData} />
            : <CivilianPaycheckForm data={civilianData} onChange={setCivilianData} />
          }
        </div>
      )}

      {errors.detail && <p className="text-xs text-red-600">{errors.detail}</p>}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">{entry ? 'Save Changes' : 'Log Paycheck'}</Button>
      </div>

    </form>
  );
}
