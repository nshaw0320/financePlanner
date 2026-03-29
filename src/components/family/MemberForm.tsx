import { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useFamilyStore } from '../../store/familyStore';
import type { FamilyMember, AvatarColor, RelationshipType } from '../../types';

const COLORS: AvatarColor[] = [
  'slate', 'red', 'orange', 'amber', 'yellow', 'lime',
  'green', 'teal', 'cyan', 'blue', 'indigo', 'violet', 'purple', 'pink', 'rose',
];

interface MemberFormProps {
  member?: FamilyMember;
  onClose: () => void;
}

export function MemberForm({ member, onClose }: MemberFormProps) {
  const { addMember, updateMember } = useFamilyStore();
  const [name, setName] = useState(member?.name ?? '');
  const [relationship, setRelationship] = useState<RelationshipType>(member?.relationship ?? 'parent');
  const [avatarColor, setAvatarColor] = useState<AvatarColor>(member?.avatarColor ?? 'blue');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    if (member) {
      updateMember(member.id, { name: name.trim(), relationship, avatarColor });
    } else {
      addMember({ name: name.trim(), relationship, avatarColor });
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="name"
        label="Full Name"
        placeholder="e.g. Alex Johnson"
        value={name}
        onChange={(e) => { setName(e.target.value); setError(''); }}
        error={error}
        autoFocus
      />

      <Select
        id="relationship"
        label="Relationship"
        value={relationship}
        onChange={(e) => setRelationship(e.target.value as RelationshipType)}
        options={[
          { value: 'parent', label: 'Parent' },
          { value: 'child',  label: 'Child' },
          { value: 'other',  label: 'Other' },
        ]}
      />

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Avatar Color</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setAvatarColor(color)}
              className={`rounded-full transition-transform ${avatarColor === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`}
            >
              <Avatar name={name || '?'} color={color} size="sm" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {member ? 'Save Changes' : 'Add Member'}
        </Button>
      </div>
    </form>
  );
}
