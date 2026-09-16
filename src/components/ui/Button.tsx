import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-soft',
  secondary: 'bg-accent-500 text-white hover:bg-accent-600 shadow-soft',
  outline: 'border-2 border-primary-200 text-primary-700 hover:border-primary-400 hover:bg-primary-50',
  ghost: 'text-ink-600 hover:bg-ink-100',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3.5 py-2 min-h-[40px]',
  md: 'text-base px-5 py-2.5 min-h-[44px]',
  lg: 'text-lg px-6 py-3.5 min-h-[52px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn-touch ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
