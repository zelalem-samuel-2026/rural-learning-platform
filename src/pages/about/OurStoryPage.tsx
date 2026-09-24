import React from 'react';
import { aboutContent } from './content/aboutContent';
import { SectionHeader } from './components/SectionHeader';
import { FounderCard } from './components/FounderCard';
import styles from './styles/about.module.css';

interface OurStoryPageProps {
  onBack?: () => void;
}

export const OurStoryPage: React.FC<OurStoryPageProps> = ({ onBack }) => {
  const { gap, missionVision, founder } = aboutContent.ourStory;

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

      {/* 1. THE EDUCATIONAL GAP */}
      <section className={styles.sectionWrapper}>
        <SectionHeader title={gap.title} subtitle={gap.subtitle} />
        <p className={styles.bodyParagraph}>{gap.body1}</p>
        <p className={styles.bodyParagraph}>{gap.body2}</p>
        <div className={styles.quoteBox}>
          "{gap.quote}"
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--about-border)', margin: '3rem 0' }} />

      {/* 2. OUR MISSION & VISION */}
      <section className={styles.sectionWrapper}>
        <SectionHeader 
          title={missionVision.missionTitle} 
          subtitle={missionVision.visionTitle} 
        />
        <p className={styles.bodyParagraph}>{missionVision.missionBody}</p>
        <p className={styles.bodyParagraph}>{missionVision.visionBody}</p>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--about-border)', margin: '3rem 0' }} />

      {/* 3. FOUNDER STORY */}
      <section className={styles.sectionWrapper}>
        <FounderCard founder={founder} />
      </section>
    </div>
  );
};

export default OurStoryPage;