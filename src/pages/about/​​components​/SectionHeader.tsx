import React from 'react';
import styles from '../styles/about.module.css';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  centered = false 
}) => {
  return (
    <div 
      className={styles.sectionHeader} 
      style={{ textAlign: centered ? 'center' : 'left' }}
    >
      <h2 className={styles.sectionTitle}>{title}</h2>
      {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
    </div>
  );
};