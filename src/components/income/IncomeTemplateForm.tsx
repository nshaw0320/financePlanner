import { useState } from 'react';
import { BookMarked } from 'lucide-react';
import { Button } from '../ui/Button';
import { useIncomeStore } from '../../store/incomeStore';
import type { IncomeSource } from '../../types';
import {
  MilitaryLESForm, CivilianPaycheckForm,
  initLES, initCivilian, buildLESData, buildCivilianData,
  calcLES, calcCivilian,
  type LESFormState, type CivilianFormState,
} from './PaycheckDetailForms';

interface IncomeTemplateFormProps {
  source: IncomeSource;
  onClose: () => void;
}

export function IncomeTemplateForm({ source, onClose }: IncomeTemplateFormProps) {
  const { updateSource } = useIncomeStore();
  const isMilitary = source.incomeType === 'military';

  const [lesData, setLesData]         = useState<LESFormState>(() => initLES(source.template?.les));
  const [civilianData, setCivilianData] = useState<CivilianFormState>(() => initCivilian(source.template?.civilian));

  const net = isMilitary ? calcLES(lesData).netPay : calcCivilian(civilianData).netPay;
  const hasValues = isMilitary
    ? lesData.basicPay !== ''
    : civilianData.regularPay !== '';

  function handleSave() {
    const template = isMilitary
      ? { les: buildLESData(lesData) }
      : { civilian: buildCivilianData(civilianData) };
    updateSource(source.id, { template });
    onClose();
  }

  function handleClear() {
    updateSource(source.id, { template: undefined });
    onClose();
  }

  return (
    <div className="space-y-4">

      {/* Info banner */}
      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
        <BookMarked size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          These values pre-fill automatically when you log a paycheck for this source.
          You can always override them per entry.
          {net > 0 && (
            <span className="block mt-1 font-semibold">
              Current template net pay: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(net)}
            </span>
          )}
        </p>
      </div>

      {/* Detail form */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
        {isMilitary
          ? <MilitaryLESForm data={lesData} onChange={setLesData} />
          : <CivilianPaycheckForm data={civilianData} onChange={setCivilianData} />
        }
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {hasValues && (
          <Button type="button" variant="ghost" onClick={handleClear} size="md">
            Clear Template
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="button" onClick={handleSave} className="flex-1">Save Template</Button>
      </div>

    </div>
  );
}
