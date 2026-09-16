import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export function Input({ label, error, hint, icon, className = '', id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-sm font-semibold text-ink-700 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">{icon}</span>}
        <input
          id={inputId}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border-2 transition-colors text-ink-900 placeholder:text-ink-400 min-h-[44px] ${
            error ? 'border-error-300 focus:border-error-500' : 'border-ink-200 focus:border-primary-500'
          } focus:outline-none ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-ink-500">{hint}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
}

export function Select({ label, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || props.name;
  return (
    <div className="w-full">
      {label && <label htmlFor={selectId} className="block text-sm font-semibold text-ink-700 mb-1.5">{label}</label>}
      <select
        id={selectId}
        className={`w-full px-4 py-3 rounded-xl border-2 border-ink-200 focus:border-primary-500 transition-colors text-ink-900 min-h-[44px] bg-white focus:outline-none ${className}`}
        {...props}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const textareaId = id || props.name;
  return (
    <div className="w-full">
      {label && <label htmlFor={textareaId} className="block text-sm font-semibold text-ink-700 mb-1.5">{label}</label>}
      <textarea
        id={textareaId}
        className={`w-full px-4 py-3 rounded-xl border-2 ${error ? 'border-error-300' : 'border-ink-200 focus:border-primary-500'} transition-colors text-ink-900 placeholder:text-ink-400 min-h-[88px] focus:outline-none resize-y ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
    </div>
  );
}
