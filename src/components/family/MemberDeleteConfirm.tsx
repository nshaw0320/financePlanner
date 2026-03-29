import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useFamilyStore } from '../../store/familyStore';
import { useIncomeStore } from '../../store/incomeStore';
import type { FamilyMember } from '../../types';

interface MemberDeleteConfirmProps {
  member: FamilyMember;
  onClose: () => void;
}

export function MemberDeleteConfirm({ member, onClose }: MemberDeleteConfirmProps) {
  const deleteMember = useFamilyStore((s) => s.deleteMember);
  const sourceCount = useIncomeStore(
    (s) => s.sources.filter((src) => src.memberId === member.id).length
  );
  const entryCount = useIncomeStore(
    (s) => s.entries.filter((e) => e.memberId === member.id).length
  );

  function handleDelete() {
    deleteMember(member.id);
    onClose();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
        <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
        <div className="text-sm text-red-700">
          <p className="font-medium">This will permanently delete:</p>
          <ul className="mt-1 list-disc list-inside space-y-0.5 text-red-600">
            <li><strong>{member.name}</strong>'s profile</li>
            {sourceCount > 0 && <li>{sourceCount} income source{sourceCount !== 1 ? 's' : ''}</li>}
            {entryCount > 0 && <li>{entryCount} paycheck entr{entryCount !== 1 ? 'ies' : 'y'}</li>}
          </ul>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} className="flex-1">
          Delete
        </Button>
      </div>
    </div>
  );
}
