import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-ink-50 flex items-center justify-center text-ink-300 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-ink-700 mb-1">{title}</h3>
      {hint && <p className="text-sm text-ink-500 max-w-xs mb-5">{hint}</p>}
      {action}
    </div>
  );
}
