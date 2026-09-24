import React from 'react';
import { aboutContent } from './content/aboutContent';
import { SectionHeader } from './components/SectionHeader';
import styles from './styles/about.module.css';

interface LearningWithoutBarriersPageProps {
  onBack?: () => void;
}

export const LearningWithoutBarriersPage: React.FC<LearningWithoutBarriersPageProps> = ({ onBack }) => {
  const { title, subtitle, pillars } = aboutContent.barriers;
  const pillarStyles = [
    { emoji: '📡', borderColor: '#059669', background: '#ecfdf5' },
    { emoji: '🌐', borderColor: '#2563eb', background: '#eff6ff' },
    { emoji: '📚', borderColor: '#d97706', background: '#fffbeb' },
    { emoji: '📱', borderColor: '#7c3aed', background: '#f5f3ff' },
    { emoji: '🔓', borderColor: '#e11d48', background: '#fff1f2' },
  ];

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
        
        <div className={styles.pillarsGrid} style={{ marginTop: '2rem' }}>
          {pillars.map((pillar, index) => {
            const cardStyle = pillarStyles[index];

            return (
              <div
                key={index}
                className={styles.pillarCard}
                style={{
                  borderLeft: `6px solid ${cardStyle.borderColor}`,
                  background: cardStyle.background,
                  borderRadius: '12px',
                  padding: '1.6rem',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
                }}
              >
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--about-text-dark)' }}>
                  <span aria-hidden="true">{cardStyle.emoji}</span> {pillar.title}
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--about-text-muted)', lineHeight: '1.6', margin: 0 }}>
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default LearningWithoutBarriersPage;