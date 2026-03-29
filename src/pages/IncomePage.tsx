import { useState } from 'react';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { IncomeSourceCard } from '../components/income/IncomeSourceCard';
import { IncomeSourceForm } from '../components/income/IncomeSourceForm';
import { IncomeEntryForm } from '../components/income/IncomeEntryForm';
import { IncomeTemplateForm } from '../components/income/IncomeTemplateForm';
import { MiscIncomeForm } from '../components/income/MiscIncomeForm';
import { useFamilyStore } from '../store/familyStore';
import { useIncomeStore } from '../store/incomeStore';
import { buildLESData, buildCivilianData, initLES, initCivilian, calcLES, calcCivilian } from '../components/income/PaycheckDetailForms';
import type { IncomeSource, IncomeEntry, MiscIncome } from '../types';

type Tab = 'sources' | 'history' | 'misc';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function IncomePage() {
  const [tab, setTab] = useState<Tab>('sources');

  // Sources
  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);
  const [deletingSource, setDeletingSource] = useState<IncomeSource | null>(null);
  const [templateSource, setTemplateSource] = useState<IncomeSource | null>(null);

  // Entries
  const [logPaycheckSource, setLogPaycheckSource] = useState<IncomeSource | null>(null);
  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null);

  // Misc
  const [addMiscOpen, setAddMiscOpen] = useState(false);
  const [editingMisc, setEditingMisc] = useState<MiscIncome | null>(null);

  const members = useFamilyStore((s) => s.members);
  const { sources, entries, miscIncomes, deleteSource, deleteEntry, deleteMiscIncome, addEntry } = useIncomeStore();

  function handleQuickLog(source: IncomeSource) {
    const isMilitary = source.incomeType === 'military';
    const template = source.template;
    if (!template) return;
    const net = isMilitary
      ? calcLES(initLES(template.les)).netPay
      : calcCivilian(initCivilian(template.civilian)).netPay;
    addEntry({
      incomeSourceId: source.id,
      memberId: source.memberId,
      amount: net,
      date: new Date().toISOString().split('T')[0],
      isForecast: false,
      les: isMilitary && template.les ? buildLESData(initLES(template.les)) : undefined,
      civilian: !isMilitary && template.civilian ? buildCivilianData(initCivilian(template.civilian)) : undefined,
    });
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'sources', label: 'Income Sources' },
    { id: 'history', label: 'Paycheck History' },
    { id: 'misc',    label: 'Misc Income' },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Income"
        subtitle="Track all income sources and paycheck history"
        action={
          tab === 'sources' ? (
            <Button onClick={() => setAddSourceOpen(true)}>
              <Plus size={16} /> Add Income Source
            </Button>
          ) : tab === 'history' ? (
            <Button onClick={() => setAddEntryOpen(true)}>
              <Plus size={16} /> Log Paycheck
            </Button>
          ) : (
            <Button onClick={() => setAddMiscOpen(true)}>
              <Plus size={16} /> Add Misc Income
            </Button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 -mt-2">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sources Tab */}
      {tab === 'sources' && (
        <>
          {sources.length === 0 ? (
            <EmptyState
              message="No income sources yet"
              sub="Add income sources for each family member"
              onAdd={() => setAddSourceOpen(true)}
              label="Add Income Source"
            />
          ) : (
            <div className="space-y-6">
              {members.map((member) => {
                const memberSources = sources.filter((s) => s.memberId === member.id);
                if (memberSources.length === 0) return null;
                return (
                  <div key={member.id}>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={member.name} color={member.avatarColor} size="sm" />
                      <span className="font-medium text-gray-900">{member.name}</span>
                      <Badge variant="gray">{memberSources.length} source{memberSources.length !== 1 ? 's' : ''}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-11">
                      {memberSources.map((source) => (
                        <IncomeSourceCard
                          key={source.id}
                          source={source}
                          onEdit={setEditingSource}
                          onDelete={setDeletingSource}
                          onLogPaycheck={setLogPaycheckSource}
                          onSetTemplate={setTemplateSource}
                          onQuickLog={handleQuickLog}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <>
          {entries.length === 0 ? (
            <EmptyState
              message="No paychecks logged yet"
              sub="Log paychecks from the Income Sources tab or here"
              onAdd={() => setAddEntryOpen(true)}
              label="Log Paycheck"
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Member</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Source</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Gross</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Net Pay</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Note</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map((entry) => {
                    const member = members.find((m) => m.id === entry.memberId);
                    const source = sources.find((s) => s.id === entry.incomeSourceId);
                    const isMilitary = source?.incomeType === 'military';
                    const gross = entry.les?.totalEntitlements ?? entry.civilian?.grossPay;
                    return (
                      <tr key={entry.id} className={`hover:bg-gray-50 ${entry.isForecast ? 'bg-amber-50/40' : ''}`}>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {formatDate(entry.date)}
                            {entry.isForecast && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">Forecast</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {member && (
                            <div className="flex items-center gap-2">
                              <Avatar name={member.name} color={member.avatarColor} size="sm" />
                              <span className="text-gray-700">{member.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{source ? (source.incomeType === 'military' ? 'Military' : 'Civilian') : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isMilitary ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {isMilitary && <Shield size={10} />}
                            {isMilitary ? 'Military' : 'Civilian'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">{gross !== undefined ? formatCurrency(gross) : '—'}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(entry.amount)}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">{entry.note ?? '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => setEditingEntry(entry)}
                              className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => deleteEntry(entry.id)}
                              className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Misc Income Tab */}
      {tab === 'misc' && (
        <>
          {miscIncomes.length === 0 ? (
            <EmptyState
              message="No miscellaneous income yet"
              sub="Track one-off income like tax refunds, bonuses, or gifts"
              onAdd={() => setAddMiscOpen(true)}
              label="Add Misc Income"
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Description</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Note</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...miscIncomes].sort((a, b) => b.date.localeCompare(a.date)).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(item.date)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">{item.note ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => setEditingMisc(item)}
                            className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => deleteMiscIncome(item.id)}
                            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <Modal isOpen={!!templateSource} onClose={() => setTemplateSource(null)} title="Paycheck Template" maxWidth="max-w-2xl">
        {templateSource && <IncomeTemplateForm source={templateSource} onClose={() => setTemplateSource(null)} />}
      </Modal>

      <Modal isOpen={addSourceOpen} onClose={() => setAddSourceOpen(false)} title="Add Income Source">
        <IncomeSourceForm onClose={() => setAddSourceOpen(false)} />
      </Modal>
      <Modal isOpen={!!editingSource} onClose={() => setEditingSource(null)} title="Edit Income Source">
        {editingSource && <IncomeSourceForm source={editingSource} onClose={() => setEditingSource(null)} />}
      </Modal>
      <Modal isOpen={!!deletingSource} onClose={() => setDeletingSource(null)} title="Delete Income Source">
        {deletingSource && (
          <DeleteConfirm
            message={`Delete this ${deletingSource.incomeType} income source? All associated paycheck history will also be removed.`}
            onConfirm={() => { deleteSource(deletingSource.id); setDeletingSource(null); }}
            onCancel={() => setDeletingSource(null)}
          />
        )}
      </Modal>

      <Modal isOpen={!!logPaycheckSource || addEntryOpen} onClose={() => { setLogPaycheckSource(null); setAddEntryOpen(false); }} title="Log Paycheck" maxWidth="max-w-2xl">
        <IncomeEntryForm
          defaultSourceId={logPaycheckSource?.id}
          onClose={() => { setLogPaycheckSource(null); setAddEntryOpen(false); }}
        />
      </Modal>
      <Modal isOpen={!!editingEntry} onClose={() => setEditingEntry(null)} title="Edit Paycheck Entry" maxWidth="max-w-2xl">
        {editingEntry && <IncomeEntryForm entry={editingEntry} onClose={() => setEditingEntry(null)} />}
      </Modal>

      <Modal isOpen={addMiscOpen} onClose={() => setAddMiscOpen(false)} title="Add Miscellaneous Income">
        <MiscIncomeForm onClose={() => setAddMiscOpen(false)} />
      </Modal>
      <Modal isOpen={!!editingMisc} onClose={() => setEditingMisc(null)} title="Edit Misc Income">
        {editingMisc && <MiscIncomeForm miscIncome={editingMisc} onClose={() => setEditingMisc(null)} />}
      </Modal>
    </div>
  );
}

function EmptyState({ message, sub, onAdd, label }: { message: string; sub: string; onAdd: () => void; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <Plus size={24} className="text-blue-400" />
      </div>
      <p className="text-gray-900 font-medium">{message}</p>
      <p className="text-sm text-gray-500 mt-1 mb-4">{sub}</p>
      <Button onClick={onAdd}><Plus size={16} />{label}</Button>
    </div>
  );
}

function DeleteConfirm({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{message}</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button variant="danger" onClick={onConfirm} className="flex-1">Delete</Button>
      </div>
    </div>
  );
}
