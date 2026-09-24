import React from 'react';
import { HeroContent } from '../typesDef/about.types';
import { BadgePill } from './BadgePill';
import styles from '../styles/about.module.css';

interface AboutHeroProps {
  hero: HeroContent;
  pills: string[];
  onPillClick?: (pillName: string) => void;
}

export const AboutHero: React.FC<AboutHeroProps> = ({ 
  hero, 
  pills, 
  onPillClick 
}) => {
  return (
    <section className={styles.heroSection}>
      <h1 className={styles.heroTitle}>{hero.title}</h1>
      <p className={styles.heroSubtitle}>{hero.subtitle}</p>

      <div className={styles.pillNav}>
        {pills.map((pill, index) => (
          <BadgePill
            key={index}
            label={pill}
            variant="pill"
            onClick={() => onPillClick && onPillClick(pill)}
          />
        ))}
      </div>
    </section>
  );
};