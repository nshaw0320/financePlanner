import { Users, TrendingUp, DollarSign, Briefcase } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Avatar } from '../components/ui/Avatar';
import { useFamilyStore } from '../store/familyStore';
import { useIncomeStore } from '../store/incomeStore';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function currentYear() {
  return new Date().getFullYear();
}

export function DashboardPage() {
  const members = useFamilyStore((s) => s.members);
  const { sources, entries, miscIncomes } = useIncomeStore();

  const activeSources = sources.filter((s) => s.isActive);
  const year = currentYear();

  const ytdPaychecks = entries
    .filter((e) => !e.isForecast && e.date.startsWith(String(year)))
    .reduce((sum, e) => sum + e.amount, 0);

  const forecastPaychecks = entries
    .filter((e) => e.isForecast && e.date.startsWith(String(year)))
    .reduce((sum, e) => sum + e.amount, 0);

  const ytdMisc = miscIncomes
    .filter((m) => m.date.startsWith(String(year)))
    .reduce((sum, m) => sum + m.amount, 0);

  const ytdTotal = ytdPaychecks + ytdMisc;

  const stats = [
    { label: 'Family Members',        value: String(members.length),          icon: Users,       color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Active Income Sources',  value: String(activeSources.length),    icon: Briefcase,   color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: `${year} YTD Actual`,     value: formatCurrency(ytdTotal),         icon: DollarSign,  color: 'text-green-600',  bg: 'bg-green-50' },
    { label: `${year} Forecasted`,     value: formatCurrency(forecastPaychecks), icon: TrendingUp, color: 'text-amber-600',  bg: 'bg-amber-50' },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Dashboard"
        subtitle={`Overview for ${year}`}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{label}</p>
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Per-member breakdown */}
      {members.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Income by Member
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => {
              const memberSources = activeSources.filter((s) => s.memberId === member.id);
              const ytd = entries
                .filter((e) => !e.isForecast && e.memberId === member.id && e.date.startsWith(String(year)))
                .reduce((sum, e) => sum + e.amount, 0);
              const forecasted = entries
                .filter((e) => e.isForecast && e.memberId === member.id && e.date.startsWith(String(year)))
                .reduce((sum, e) => sum + e.amount, 0);

              return (
                <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar name={member.name} color={member.avatarColor} size="md" />
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{member.relationship}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">YTD Actual</span>
                      <span className="font-medium text-gray-900">{formatCurrency(ytd)}</span>
                    </div>
                    {forecasted > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Forecasted</span>
                        <span className="font-medium text-amber-600">{formatCurrency(forecasted)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Active Sources</span>
                      <span className="font-medium text-gray-900">{memberSources.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Misc income card */}
            {miscIncomes.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <DollarSign size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Miscellaneous</p>
                    <p className="text-xs text-gray-400">Not member-specific</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">YTD Misc</span>
                    <span className="font-medium text-gray-900">{formatCurrency(ytdMisc)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Entries</span>
                    <span className="font-medium text-gray-900">{miscIncomes.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {members.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Add family members and income sources to see your dashboard.</p>
        </div>
      )}
    </div>
  );
}
