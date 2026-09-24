import React from 'react';
import { DestinationCardItem } from '../typesDef/about.types';
import { BadgePill } from './BadgePill';
import styles from '../styles/about.module.css';

interface DestinationCardProps {
  item: DestinationCardItem;
  onCardClick?: (id: string) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ 
  item, 
  onCardClick 
}) => {
  return (
    <div 
      className={styles.destinationCard}
      onClick={() => onCardClick && onCardClick(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onCardClick && onCardClick(item.id);
        }
      }}
      style={{ cursor: 'pointer', minHeight: '180px' }}
    >
      <div>
        <BadgePill label={item.badge} variant="badge" />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.75rem 0 0.5rem 0', color: 'var(--about-text-dark)' }}>
          {item.title}
        </h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--about-text-muted)', lineHeight: '1.5', margin: 0 }}>
          {item.description}
        </p>
      </div>
    </div>
  );
};