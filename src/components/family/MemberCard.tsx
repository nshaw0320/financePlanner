import { Pencil, Trash2, TrendingUp } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import type { FamilyMember } from '../../types';
import { useIncomeStore } from '../../store/incomeStore';

const relationshipVariant = {
  parent: 'blue' as const,
  child:  'green' as const,
  other:  'gray' as const,
};

interface MemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
}

export function MemberCard({ member, onEdit, onDelete }: MemberCardProps) {
  const sourceCount = useIncomeStore(
    (s) => s.sources.filter((src) => src.memberId === member.id && src.isActive).length
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <Avatar name={member.name} color={member.avatarColor} size="lg" />
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(member)}
            className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(member)}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div>
        <p className="font-semibold text-gray-900">{member.name}</p>
        <Badge variant={relationshipVariant[member.relationship]} >
          {member.relationship.charAt(0).toUpperCase() + member.relationship.slice(1)}
        </Badge>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <TrendingUp size={14} />
        <span>{sourceCount} active income source{sourceCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
