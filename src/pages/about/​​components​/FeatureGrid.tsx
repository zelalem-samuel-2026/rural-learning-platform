import React from 'react';
import { PillarItem } from '../typesDef/about.types';
import styles from '../styles/about.module.css';

interface FeatureGridProps {
  pillars: PillarItem[];
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ pillars }) => {
  return (
    <div className={styles.pillarsGrid}>
      {pillars.map((pillar, index) => (
        <div key={index} className={styles.pillarCard}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--about-text-dark)' }}>
            {pillar.title}
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--about-text-muted)', lineHeight: '1.6', margin: 0 }}>
            {pillar.description}
          </p>
        </div>
      ))}
    </div>
  );
};