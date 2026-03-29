import type { AvatarColor } from '../../types';

const colorMap: Record<AvatarColor, string> = {
  slate:  'bg-slate-500',
  red:    'bg-red-500',
  orange: 'bg-orange-500',
  amber:  'bg-amber-500',
  yellow: 'bg-yellow-500',
  lime:   'bg-lime-500',
  green:  'bg-green-500',
  teal:   'bg-teal-500',
  cyan:   'bg-cyan-500',
  blue:   'bg-blue-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  purple: 'bg-purple-500',
  pink:   'bg-pink-500',
  rose:   'bg-rose-500',
};

interface AvatarProps {
  name: string;
  color: AvatarColor;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };

export function Avatar({ name, color, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`${colorMap[color]} ${sizeMap[size]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
    >
      {initials}
    </div>
  );
}
