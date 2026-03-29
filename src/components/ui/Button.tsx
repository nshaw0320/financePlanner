import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variantMap = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 shadow-sm shadow-blue-200 border-transparent',
  secondary:
    'bg-white text-gray-600 hover:bg-gray-50 active:bg-gray-100 border-gray-200 shadow-sm',
  ghost:
    'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200 border-transparent',
  danger:
    'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 shadow-sm shadow-red-200 border-transparent',
};

const sizeMap = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-xl border
        transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
        ${variantMap[variant]} ${sizeMap[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
