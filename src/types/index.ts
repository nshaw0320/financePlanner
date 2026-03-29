export type ID = string;

// ─── Family ───────────────────────────────────────────────────────────────────

export type RelationshipType = 'parent' | 'child' | 'other';

export type AvatarColor =
  | 'slate' | 'red' | 'orange' | 'amber' | 'yellow'
  | 'lime'  | 'green' | 'teal' | 'cyan' | 'blue'
  | 'indigo' | 'violet' | 'purple' | 'pink' | 'rose';

export interface FamilyMember {
  id: ID;
  name: string;
  relationship: RelationshipType;
  avatarColor: AvatarColor;
  createdAt: string;
}

// ─── Income Sources ───────────────────────────────────────────────────────────

export type IncomeFrequency =
  | 'weekly'
  | 'bi-weekly'
  | 'semi-monthly'
  | 'monthly'
  | 'annually';

export type IncomeType = 'civilian' | 'military';

export type MilitaryBranch =
  | 'army' | 'navy' | 'marines' | 'air-force' | 'space-force' | 'coast-guard';

export interface IncomeEntryTemplate {
  les?: MilitaryLESData;
  civilian?: CivilianPaycheckData;
}

export interface IncomeSource {
  id: ID;
  memberId: ID;
  isActive: boolean;
  incomeType: IncomeType;
  template?: IncomeEntryTemplate;
  createdAt: string;
}

// ─── Military LES Data ────────────────────────────────────────────────────────

export interface MilitaryLESData {
  // Entitlements
  basicPay: number;
  bah?: number;           // Basic Allowance for Housing
  bas?: number;           // Basic Allowance for Subsistence
  specialPay?: number;
  incentivePay?: number;
  cola?: number;          // Cost of Living Allowance
  otherEntitlements?: number;
  totalEntitlements: number;
  // Deductions
  fedTax?: number;
  stateTax?: number;
  fica?: number;          // OASDI / Social Security
  medicare?: number;
  tsp?: number;           // Thrift Savings Plan
  sgli?: number;          // Servicemembers' Group Life Insurance
  allotments?: number;
  otherDeductions?: number;
  totalDeductions: number;
  // Mid-month pay already received
  midMonthPay?: number;
  // Leave (days)
  leaveAccrued?: number;
  leaveUsed?: number;
  leaveBalance?: number;
}

// ─── Civilian Paycheck Data ───────────────────────────────────────────────────

export interface CivilianPaycheckData {
  // Earnings
  regularPay: number;
  overtimePay?: number;
  bonusPay?: number;
  otherEarnings?: number;
  grossPay: number;
  // Pay period
  payPeriodStart?: string;
  payPeriodEnd?: string;
  // Deductions
  fedTax?: number;
  stateTax?: number;
  socialSecurity?: number;
  medicare?: number;
  retirement?: number;    // 401k / 403b / pension
  healthInsurance?: number;
  dentalVision?: number;
  hsa?: number;
  otherDeductions?: number;
  totalDeductions: number;
}

// ─── Income Entries ───────────────────────────────────────────────────────────

export interface IncomeEntry {
  id: ID;
  incomeSourceId: ID;
  memberId: ID;
  date: string;
  amount: number;         // net pay
  isForecast?: boolean;
  note?: string;
  les?: MilitaryLESData;
  civilian?: CivilianPaycheckData;
  createdAt: string;
}

// ─── Misc Income ──────────────────────────────────────────────────────────────

export interface MiscIncome {
  id: ID;
  description: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}
