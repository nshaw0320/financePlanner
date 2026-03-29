import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FamilyMember, ID } from '../types';
import { useIncomeStore } from './incomeStore';

interface FamilyState {
  members: FamilyMember[];
  addMember: (data: Omit<FamilyMember, 'id' | 'createdAt'>) => void;
  updateMember: (id: ID, data: Partial<Omit<FamilyMember, 'id' | 'createdAt'>>) => void;
  deleteMember: (id: ID) => void;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set) => ({
      members: [],

      addMember: (data) =>
        set((state) => ({
          members: [
            ...state.members,
            { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      updateMember: (id, data) =>
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),

      deleteMember: (id) => {
        set((state) => ({ members: state.members.filter((m) => m.id !== id) }));
        useIncomeStore.getState().deleteByMemberId(id);
      },
    }),
    { name: 'finance-planner-family', version: 1 }
  )
);
