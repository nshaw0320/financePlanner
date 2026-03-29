interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'blue' | 'purple' | 'gray' | 'red' | 'yellow';
}

const variantMap: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-gray-100 text-gray-700',
  green:   'bg-green-100 text-green-700',
  blue:    'bg-blue-100 text-blue-700',
  purple:  'bg-purple-100 text-purple-700',
  gray:    'bg-gray-100 text-gray-500',
  red:     'bg-red-100 text-red-700',
  yellow:  'bg-yellow-100 text-yellow-700',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantMap[variant]}`}>
      {children}
    </span>
  );
}
