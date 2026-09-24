import React from 'react';
import { aboutContent } from './content/aboutContent';
import { SectionHeader } from './components/SectionHeader';
import { AmbassadorRequirements } from './components/AmbassadorRequirements';
import { StudentVoiceCard } from './components/StudentVoiceCard';
import styles from './styles/about.module.css';

interface CommunityPageProps {
  onBack?: () => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onBack }) => {
  const { title, studentVoice, ambassador } = aboutContent.community;

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

      {/* 1. COMMUNITY & STUDENT VOICES SECTION */}
      <section className={styles.sectionWrapper}>
        <SectionHeader title={title} subtitle={studentVoice} />
        
        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            marginTop: '2rem'
          }}
        >
          <StudentVoiceCard voice={studentVoice} />
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--about-border)', margin: '3rem 0' }} />

      {/* 2. AMBASSADOR REQUIREMENTS */}
      <section className={styles.sectionWrapper}>
        <AmbassadorRequirements requirements={ambassador.roles} />
      </section>

      {/* 3. PRIMARY CTA BUTTON (GOOGLE FORM) */}
      <section className={styles.sectionWrapper} style={{ textAlign: 'center', marginTop: '3rem' }}>
        <a
          href={ambassador.formUrl || "https://docs.google.com/forms"}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.pillItem}
          style={{
            display: 'inline-block',
            padding: '1rem 2.5rem',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#ffffff',
            backgroundColor: 'var(--about-accent, #0066cc)',
            borderRadius: '50px',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          {ambassador.title}
        </a>
      </section>
    </div>
  );
};

export default CommunityPage;