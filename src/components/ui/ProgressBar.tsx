interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'accent';
  showLabel?: boolean;
  label?: string;
}

const sizeClasses = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };
const colorClasses = { primary: 'bg-primary-500', success: 'bg-success-500', accent: 'bg-accent-500' };

export function ProgressBar({ value, max = 100, size = 'md', color = 'primary', showLabel, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium text-ink-600">{label}</span>
          <span className="text-sm font-bold text-ink-800">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full ${sizeClasses[size]} bg-ink-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
