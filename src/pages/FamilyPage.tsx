import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { MemberCard } from '../components/family/MemberCard';
import { MemberForm } from '../components/family/MemberForm';
import { MemberDeleteConfirm } from '../components/family/MemberDeleteConfirm';
import { useFamilyStore } from '../store/familyStore';
import type { FamilyMember } from '../types';

export function FamilyPage() {
  const members = useFamilyStore((s) => s.members);
  const [addOpen, setAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);

  return (
    <div className="p-6">
      <PageHeader
        title="Family Members"
        subtitle={`${members.length} member${members.length !== 1 ? 's' : ''}`}
        action={
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus size={16} />
            Add Member
          </Button>
        }
      />

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <UserPlus size={28} className="text-blue-400" />
          </div>
          <p className="text-gray-900 font-medium">No family members yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">Add your first family member to get started</p>
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus size={16} />
            Add Member
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={setEditingMember}
              onDelete={setDeletingMember}
            />
          ))}
        </div>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Family Member">
        <MemberForm onClose={() => setAddOpen(false)} />
      </Modal>

      <Modal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        title="Edit Family Member"
      >
        {editingMember && (
          <MemberForm member={editingMember} onClose={() => setEditingMember(null)} />
        )}
      </Modal>

      <Modal
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        title="Delete Family Member"
      >
        {deletingMember && (
          <MemberDeleteConfirm
            member={deletingMember}
            onClose={() => setDeletingMember(null)}
          />
        )}
      </Modal>
    </div>
  );
}
