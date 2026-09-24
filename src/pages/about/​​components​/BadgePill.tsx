import React from 'react';
import styles from '../styles/about.module.css';

interface BadgePillProps {
  label: string;
  variant?: 'badge' | 'pill';
  onClick?: () => void;
}

export const BadgePill: React.FC<BadgePillProps> = ({ 
  label, 
  variant = 'badge',
  onClick 
}) => {
  if (variant === 'pill') {
    return (
      <button 
        type="button" 
        className={styles.pillItem} 
        onClick={onClick}
      >
        {label}
      </button>
    );
  }

  return (
    <span className={styles.cardBadge}>
      {label}
    </span>
  );
};