import React from 'react';
import { FounderSection } from '../typesDef/about.types';
import { SectionHeader } from './SectionHeader';
import styles from '../styles/about.module.css';

interface FounderCardProps {
  founder: FounderSection;
}

export const FounderCard: React.FC<FounderCardProps> = ({ founder }) => {
  return (
    <div className={styles.sectionWrapper}>
      <SectionHeader title={founder.title} subtitle={`Founded by ${founder.name}`} />
      
      <p className={styles.bodyParagraph}>
        {founder.bio1}
      </p>

      <div className={styles.quoteBox}>
        "{founder.question}"
      </div>

      <p className={styles.bodyParagraph}>
        {founder.bio2}
      </p>

      <p className={styles.bodyParagraph}>
        {founder.bio3}
      </p>
    </div>
  );
};