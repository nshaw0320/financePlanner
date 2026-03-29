import { useState, useEffect, useCallback } from 'react';
import { Input } from '../ui/Input';
import { DatePicker } from '../ui/DatePicker';
import type { MilitaryLESData, CivilianPaycheckData } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SS_RATE       = 0.062;   // 6.2%
const MEDICARE_RATE = 0.0145;  // 1.45%
const SGLI_RATE     = 0.06;    // $0.06 per $1,000 of coverage per month (2026)

const SGLI_COVERAGE_OPTIONS = [
  { value: 500_000, label: '$500,000  ·  $30.00 / mo' },
  { value: 400_000, label: '$400,000  ·  $24.00 / mo' },
  { value: 300_000, label: '$300,000  ·  $18.00 / mo' },
  { value: 200_000, label: '$200,000  ·  $12.00 / mo' },
  { value: 100_000, label: '$100,000  ·  $6.00 / mo' },
  { value: 0,       label: 'Declined  ·  $0.00 / mo' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function toNum(val: string): number | undefined {
  const v = parseFloat(val);
  return isNaN(v) || val === '' ? undefined : v;
}

export function toStr(val: number | undefined): string {
  return val !== undefined ? String(val) : '';
}

function round2(n: number) { return parseFloat(n.toFixed(2)); }

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-2 pt-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 pb-1">
        {children}
      </h3>
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="border border-blue-200 rounded-lg px-3 py-2 text-sm bg-blue-50 text-blue-900 font-semibold">
        {value}
      </div>
    </div>
  );
}

function F({ label, value, onChange, placeholder = '0.00' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <Input
      label={label} type="number" min="0" step="0.01" placeholder={placeholder}
      value={value} onChange={(e) => onChange(e.target.value)}
    />
  );
}

// ─── Auto-calculated input ────────────────────────────────────────────────────
// Shows a chip next to the label; when active the field becomes a readonly
// blue field showing the computed value, and syncs it up to the parent.

interface AutoInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  chipLabel: string;       // e.g. "6.2%"
  computedValue: number;   // computed from parent context, updated each render
}

function AutoInput({ label, value, onChange, chipLabel, computedValue }: AutoInputProps) {
  const [isAuto, setIsAuto] = useState(false);

  // Sync computed value up when auto is on and the computed value changes
  useEffect(() => {
    if (!isAuto) return;
    const v = toStr(round2(computedValue));
    if (v !== value) onChange(v);
  }, [isAuto, computedValue]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
          type="button"
          onClick={() => setIsAuto((v) => !v)}
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
            isAuto
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
          }`}
        >
          Auto · {chipLabel}
        </button>
      </div>
      {isAuto ? (
        <div className="border border-blue-200 rounded-lg px-3 py-2 text-sm bg-blue-50 text-blue-900 font-semibold">
          {formatCurrency(computedValue)}
        </div>
      ) : (
        <Input
          type="number" min="0" step="0.01" placeholder="0.00"
          value={value} onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

// ─── TSP field ────────────────────────────────────────────────────────────────
// Toggle between entering a dollar amount directly or a % of basic pay.

interface TSPFieldProps {
  value: string;
  onChange: (v: string) => void;
  basicPay: string;
}

function TSPField({ value, onChange, basicPay }: TSPFieldProps) {
  const [mode, setMode] = useState<'amount' | 'percent'>('amount');
  const [percent, setPercent] = useState('');

  const basic = toNum(basicPay) ?? 0;
  const computedFromPercent = round2(basic * (parseFloat(percent) || 0) / 100);

  useEffect(() => {
    if (mode !== 'percent') return;
    const v = toStr(computedFromPercent);
    if (v !== value) onChange(v);
  }, [mode, computedFromPercent]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-1">
        <span className="text-sm font-medium text-gray-700">TSP</span>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium">
          {(['amount', 'percent'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2 py-0.5 transition-colors ${
                mode === m ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {m === 'amount' ? '$' : '%'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'percent' ? (
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number" min="0" max="100" step="0.1" placeholder="0.0"
            value={percent} onChange={(e) => setPercent(e.target.value)}
          />
          <div className="border border-blue-200 rounded-lg px-3 py-2 text-sm bg-blue-50 text-blue-900 font-semibold flex items-center">
            {formatCurrency(computedFromPercent)}
          </div>
        </div>
      ) : (
        <Input
          type="number" min="0" step="0.01" placeholder="0.00"
          value={value} onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

// ─── SGLI field ───────────────────────────────────────────────────────────────
// Dropdown to select coverage level; auto-computes the monthly premium.

interface SGLIFieldProps {
  value: string;
  onChange: (v: string) => void;
}

function SGLIField({ value, onChange }: SGLIFieldProps) {
  const [auto, setAuto] = useState(false);
  const [coverage, setCoverage] = useState(500_000);

  const computedMonthly = round2((coverage / 1_000) * SGLI_RATE);

  useEffect(() => {
    if (!auto) return;
    const v = toStr(computedMonthly);
    if (v !== value) onChange(v);
  }, [auto, computedMonthly]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-1">
        <span className="text-sm font-medium text-gray-700">SGLI</span>
        <button
          type="button"
          onClick={() => setAuto((v) => !v)}
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
            auto
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
          }`}
        >
          Auto · $0.06/$1K
        </button>
      </div>

      {auto ? (
        <div className="space-y-2">
          <select
            value={coverage}
            onChange={(e) => setCoverage(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {SGLI_COVERAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="border border-green-200 rounded-lg px-3 py-2 text-sm bg-green-50 text-green-900 font-semibold">
            {formatCurrency(computedMonthly)} / month
          </div>
        </div>
      ) : (
        <Input
          type="number" min="0" step="0.01" placeholder="0.00"
          value={value} onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

// ─── Military LES ─────────────────────────────────────────────────────────────

export interface LESFormState {
  basicPay: string; bah: string; bas: string; specialPay: string;
  incentivePay: string; cola: string; otherEntitlements: string;
  fedTax: string; stateTax: string; fica: string; medicare: string;
  tsp: string; sgli: string; allotments: string; otherDeductions: string;
  midMonthPay: string;
  leaveAccrued: string; leaveUsed: string; leaveBalance: string;
}

export function initLES(les?: MilitaryLESData): LESFormState {
  return {
    basicPay:          toStr(les?.basicPay),
    bah:               toStr(les?.bah),
    bas:               toStr(les?.bas),
    specialPay:        toStr(les?.specialPay),
    incentivePay:      toStr(les?.incentivePay),
    cola:              toStr(les?.cola),
    otherEntitlements: toStr(les?.otherEntitlements),
    fedTax:            toStr(les?.fedTax),
    stateTax:          toStr(les?.stateTax),
    fica:              toStr(les?.fica),
    medicare:          toStr(les?.medicare),
    tsp:               toStr(les?.tsp),
    sgli:              toStr(les?.sgli),
    allotments:        toStr(les?.allotments),
    otherDeductions:   toStr(les?.otherDeductions),
    midMonthPay:       toStr(les?.midMonthPay),
    leaveAccrued:      toStr(les?.leaveAccrued),
    leaveUsed:         toStr(les?.leaveUsed),
    leaveBalance:      toStr(les?.leaveBalance),
  };
}

export function calcLES(f: LESFormState) {
  const totalEntitlements =
    (toNum(f.basicPay) ?? 0) + (toNum(f.bah) ?? 0) + (toNum(f.bas) ?? 0) +
    (toNum(f.specialPay) ?? 0) + (toNum(f.incentivePay) ?? 0) + (toNum(f.cola) ?? 0) +
    (toNum(f.otherEntitlements) ?? 0);
  const totalDeductions =
    (toNum(f.fedTax) ?? 0) + (toNum(f.stateTax) ?? 0) + (toNum(f.fica) ?? 0) +
    (toNum(f.medicare) ?? 0) + (toNum(f.tsp) ?? 0) + (toNum(f.sgli) ?? 0) +
    (toNum(f.allotments) ?? 0) + (toNum(f.otherDeductions) ?? 0);
  const netPay = totalEntitlements - totalDeductions - (toNum(f.midMonthPay) ?? 0);
  return { totalEntitlements, totalDeductions, netPay };
}

export function buildLESData(f: LESFormState): MilitaryLESData {
  const { totalEntitlements, totalDeductions } = calcLES(f);
  return {
    basicPay: toNum(f.basicPay) ?? 0,
    bah: toNum(f.bah), bas: toNum(f.bas), specialPay: toNum(f.specialPay),
    incentivePay: toNum(f.incentivePay), cola: toNum(f.cola),
    otherEntitlements: toNum(f.otherEntitlements),
    totalEntitlements,
    fedTax: toNum(f.fedTax), stateTax: toNum(f.stateTax), fica: toNum(f.fica),
    medicare: toNum(f.medicare), tsp: toNum(f.tsp), sgli: toNum(f.sgli),
    allotments: toNum(f.allotments), otherDeductions: toNum(f.otherDeductions),
    totalDeductions,
    midMonthPay: toNum(f.midMonthPay),
    leaveAccrued: toNum(f.leaveAccrued), leaveUsed: toNum(f.leaveUsed), leaveBalance: toNum(f.leaveBalance),
  };
}

export function MilitaryLESForm({ data, onChange }: { data: LESFormState; onChange: (d: LESFormState) => void }) {
  const set = useCallback(
    (key: keyof LESFormState) => (v: string) => onChange({ ...data, [key]: v }),
    [data, onChange]
  );
  const { totalEntitlements, totalDeductions, netPay } = calcLES(data);
  const basic = toNum(data.basicPay) ?? 0;

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-3">
      <SectionHeader>Entitlements</SectionHeader>
      <F label="Basic Pay *"            value={data.basicPay}          onChange={set('basicPay')} />
      <F label="BAH"                    value={data.bah}               onChange={set('bah')} />
      <F label="BAS"                    value={data.bas}               onChange={set('bas')} />
      <F label="Special Pay"            value={data.specialPay}        onChange={set('specialPay')} />
      <F label="Incentive Pay"          value={data.incentivePay}      onChange={set('incentivePay')} />
      <F label="COLA"                   value={data.cola}              onChange={set('cola')} />
      <F label="Other Entitlements"     value={data.otherEntitlements} onChange={set('otherEntitlements')} />
      <ReadonlyField label="Total Entitlements" value={formatCurrency(totalEntitlements)} />

      <SectionHeader>Deductions</SectionHeader>
      <F label="Federal Tax"            value={data.fedTax}            onChange={set('fedTax')} />
      <F label="State Tax"              value={data.stateTax}          onChange={set('stateTax')} />

      <AutoInput
        label="FICA / OASDI"
        value={data.fica}
        onChange={set('fica')}
        chipLabel="6.2% of Basic"
        computedValue={round2(basic * SS_RATE)}
      />
      <AutoInput
        label="Medicare"
        value={data.medicare}
        onChange={set('medicare')}
        chipLabel="1.45% of Basic"
        computedValue={round2(basic * MEDICARE_RATE)}
      />

      <TSPField value={data.tsp} onChange={set('tsp')} basicPay={data.basicPay} />
      <SGLIField value={data.sgli} onChange={set('sgli')} />

      <F label="Allotments"             value={data.allotments}        onChange={set('allotments')} />
      <F label="Other Deductions"       value={data.otherDeductions}   onChange={set('otherDeductions')} />
      <ReadonlyField label="Total Deductions" value={formatCurrency(totalDeductions)} />
      <F label="Mid-Month Pay (already paid)" value={data.midMonthPay} onChange={set('midMonthPay')} />

      <SectionHeader>Leave (Days)</SectionHeader>
      <F label="Leave Accrued"          value={data.leaveAccrued}  onChange={set('leaveAccrued')}  placeholder="0" />
      <F label="Leave Used"             value={data.leaveUsed}     onChange={set('leaveUsed')}     placeholder="0" />
      <F label="Leave Balance"          value={data.leaveBalance}  onChange={set('leaveBalance')}  placeholder="0" />

      <SectionHeader>Summary</SectionHeader>
      <ReadonlyField label="Calculated Net Pay" value={formatCurrency(netPay)} />
    </div>
  );
}

// ─── Civilian Paycheck ────────────────────────────────────────────────────────

export interface CivilianFormState {
  regularPay: string; overtimePay: string; bonusPay: string; otherEarnings: string;
  payPeriodStart: string; payPeriodEnd: string;
  fedTax: string; stateTax: string; socialSecurity: string; medicare: string;
  retirement: string; healthInsurance: string; dentalVision: string;
  hsa: string; otherDeductions: string;
}

export function initCivilian(c?: CivilianPaycheckData): CivilianFormState {
  return {
    regularPay:      toStr(c?.regularPay),
    overtimePay:     toStr(c?.overtimePay),
    bonusPay:        toStr(c?.bonusPay),
    otherEarnings:   toStr(c?.otherEarnings),
    payPeriodStart:  c?.payPeriodStart ?? '',
    payPeriodEnd:    c?.payPeriodEnd ?? '',
    fedTax:          toStr(c?.fedTax),
    stateTax:        toStr(c?.stateTax),
    socialSecurity:  toStr(c?.socialSecurity),
    medicare:        toStr(c?.medicare),
    retirement:      toStr(c?.retirement),
    healthInsurance: toStr(c?.healthInsurance),
    dentalVision:    toStr(c?.dentalVision),
    hsa:             toStr(c?.hsa),
    otherDeductions: toStr(c?.otherDeductions),
  };
}

export function calcCivilian(f: CivilianFormState) {
  const grossPay =
    (toNum(f.regularPay) ?? 0) + (toNum(f.overtimePay) ?? 0) +
    (toNum(f.bonusPay) ?? 0) + (toNum(f.otherEarnings) ?? 0);
  const totalDeductions =
    (toNum(f.fedTax) ?? 0) + (toNum(f.stateTax) ?? 0) + (toNum(f.socialSecurity) ?? 0) +
    (toNum(f.medicare) ?? 0) + (toNum(f.retirement) ?? 0) + (toNum(f.healthInsurance) ?? 0) +
    (toNum(f.dentalVision) ?? 0) + (toNum(f.hsa) ?? 0) + (toNum(f.otherDeductions) ?? 0);
  const netPay = grossPay - totalDeductions;
  return { grossPay, totalDeductions, netPay };
}

export function buildCivilianData(f: CivilianFormState): CivilianPaycheckData {
  const { grossPay, totalDeductions } = calcCivilian(f);
  return {
    regularPay: toNum(f.regularPay) ?? 0,
    overtimePay: toNum(f.overtimePay), bonusPay: toNum(f.bonusPay), otherEarnings: toNum(f.otherEarnings),
    grossPay,
    payPeriodStart: f.payPeriodStart || undefined,
    payPeriodEnd:   f.payPeriodEnd || undefined,
    fedTax: toNum(f.fedTax), stateTax: toNum(f.stateTax), socialSecurity: toNum(f.socialSecurity),
    medicare: toNum(f.medicare), retirement: toNum(f.retirement), healthInsurance: toNum(f.healthInsurance),
    dentalVision: toNum(f.dentalVision), hsa: toNum(f.hsa), otherDeductions: toNum(f.otherDeductions),
    totalDeductions,
  };
}

export function CivilianPaycheckForm({ data, onChange }: { data: CivilianFormState; onChange: (d: CivilianFormState) => void }) {
  const set = useCallback(
    (key: keyof CivilianFormState) => (v: string) => onChange({ ...data, [key]: v }),
    [data, onChange]
  );
  const { grossPay, totalDeductions, netPay } = calcCivilian(data);

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-3">
      <SectionHeader>Earnings</SectionHeader>
      <F label="Regular Pay *"          value={data.regularPay}    onChange={set('regularPay')} />
      <F label="Overtime Pay"           value={data.overtimePay}   onChange={set('overtimePay')} />
      <F label="Bonus"                  value={data.bonusPay}      onChange={set('bonusPay')} />
      <F label="Other Earnings"         value={data.otherEarnings} onChange={set('otherEarnings')} />
      <ReadonlyField label="Gross Pay"  value={formatCurrency(grossPay)} />

      <SectionHeader>Pay Period</SectionHeader>
      <DatePicker label="Pay Period Start" value={data.payPeriodStart} onChange={(e) => set('payPeriodStart')(e.target.value)} />
      <DatePicker label="Pay Period End"   value={data.payPeriodEnd}   onChange={(e) => set('payPeriodEnd')(e.target.value)} />

      <SectionHeader>Deductions</SectionHeader>
      <F label="Federal Tax"            value={data.fedTax}          onChange={set('fedTax')} />
      <F label="State Tax"              value={data.stateTax}        onChange={set('stateTax')} />

      <AutoInput
        label="Social Security"
        value={data.socialSecurity}
        onChange={set('socialSecurity')}
        chipLabel="6.2% of Gross"
        computedValue={round2(grossPay * SS_RATE)}
      />
      <AutoInput
        label="Medicare"
        value={data.medicare}
        onChange={set('medicare')}
        chipLabel="1.45% of Gross"
        computedValue={round2(grossPay * MEDICARE_RATE)}
      />

      <F label="401k / Retirement"      value={data.retirement}      onChange={set('retirement')} />
      <F label="Health Insurance"       value={data.healthInsurance} onChange={set('healthInsurance')} />
      <F label="Dental / Vision"        value={data.dentalVision}    onChange={set('dentalVision')} />
      <F label="HSA / FSA"              value={data.hsa}             onChange={set('hsa')} />
      <F label="Other Deductions"       value={data.otherDeductions} onChange={set('otherDeductions')} />
      <ReadonlyField label="Total Deductions" value={formatCurrency(totalDeductions)} />

      <SectionHeader>Summary</SectionHeader>
      <ReadonlyField label="Calculated Net Pay" value={formatCurrency(netPay)} />
    </div>
  );
}
