import React from 'react';
import { aboutContent } from './content/aboutContent';
import { SectionHeader } from './components/SectionHeader';
import { FeatureGrid } from './components/FeatureGrid';
import styles from './styles/about.module.css';

interface LearningWithoutBarriersPageProps {
  onBack?: () => void;
}

export const LearningWithoutBarriersPage: React.FC<LearningWithoutBarriersPageProps> = ({ onBack }) => {
  const { title, subtitle, pillars } = aboutContent.barriers;

  return (
    <div className={styles.aboutContainer}>
      {/* Back Navigation Button */}
      <button 
        type="button"
        onClick={onBack} 
        className={styles.pillItem}
        style={{ 
          marginBottom: '2rem', 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          cursor: 'pointer',
          padding: '0.6rem 1.2rem',
          fontWeight: 600
        }}
      >
        ← Back to About Lerna
      </button>

      {/* Main Educational Barriers Header & Grid */}
      <section className={styles.sectionWrapper}>
        <SectionHeader title={title} subtitle={subtitle} />
        
        <div style={{ marginTop: '2rem' }}>
          <FeatureGrid pillars={pillars} />
        </div>
      </section>
    </div>
  );
};

export default LearningWithoutBarriersPage;