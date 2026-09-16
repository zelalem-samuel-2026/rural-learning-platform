import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: 'primary' | 'success' | 'accent' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  icon?: ReactNode;
}

const colorClasses = {
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-700',
  accent: 'bg-accent-100 text-accent-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
  neutral: 'bg-ink-100 text-ink-600',
};

const sizeClasses = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-1' };

export function Badge({ children, color = 'neutral', size = 'sm', icon }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${colorClasses[color]} ${sizeClasses[size]}`}>
      {icon}
      {children}
    </span>
  );
}
