import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`card-surface ${hoverable ? 'cursor-pointer transition-all duration-200 hover:shadow-lift hover:-translate-y-0.5' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
