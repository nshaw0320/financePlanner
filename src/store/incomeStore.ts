import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IncomeSource, IncomeEntry, MiscIncome, ID } from '../types';

interface IncomeState {
  sources: IncomeSource[];
  entries: IncomeEntry[];
  miscIncomes: MiscIncome[];

  // Sources
  addSource: (data: Omit<IncomeSource, 'id' | 'createdAt'>) => void;
  updateSource: (id: ID, data: Partial<Omit<IncomeSource, 'id' | 'createdAt'>>) => void;
  deleteSource: (id: ID) => void;

  // Entries
  addEntry: (data: Omit<IncomeEntry, 'id' | 'createdAt'>) => void;
  updateEntry: (id: ID, data: Partial<Omit<IncomeEntry, 'id' | 'createdAt'>>) => void;
  deleteEntry: (id: ID) => void;

  // Misc income
  addMiscIncome: (data: Omit<MiscIncome, 'id' | 'createdAt'>) => void;
  updateMiscIncome: (id: ID, data: Partial<Omit<MiscIncome, 'id' | 'createdAt'>>) => void;
  deleteMiscIncome: (id: ID) => void;

  // Cascade delete (called from familyStore)
  deleteByMemberId: (memberId: ID) => void;
}

export const useIncomeStore = create<IncomeState>()(
  persist(
    (set) => ({
      sources: [],
      entries: [],
      miscIncomes: [],

      addSource: (data) =>
        set((state) => ({
          sources: [
            ...state.sources,
            { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      updateSource: (id, data) =>
        set((state) => ({
          sources: state.sources.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),

      deleteSource: (id) =>
        set((state) => ({
          sources: state.sources.filter((s) => s.id !== id),
          entries: state.entries.filter((e) => e.incomeSourceId !== id),
        })),

      addEntry: (data) =>
        set((state) => ({
          entries: [
            ...state.entries,
            { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      updateEntry: (id, data) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),

      deleteEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),

      addMiscIncome: (data) =>
        set((state) => ({
          miscIncomes: [
            ...state.miscIncomes,
            { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      updateMiscIncome: (id, data) =>
        set((state) => ({
          miscIncomes: state.miscIncomes.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),

      deleteMiscIncome: (id) =>
        set((state) => ({ miscIncomes: state.miscIncomes.filter((m) => m.id !== id) })),

      deleteByMemberId: (memberId) =>
        set((state) => {
          const sourceIds = state.sources
            .filter((s) => s.memberId === memberId)
            .map((s) => s.id);
          return {
            sources: state.sources.filter((s) => s.memberId !== memberId),
            entries: state.entries.filter(
              (e) => !sourceIds.includes(e.incomeSourceId) && e.memberId !== memberId
            ),
          };
        }),
    }),
    { name: 'finance-planner-income', version: 1 }
  )
);
