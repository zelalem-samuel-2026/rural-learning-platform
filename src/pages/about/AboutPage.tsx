import React, { useState } from 'react';
import { aboutContent } from './content/aboutContent';
import { AboutHero } from './components/AboutHero';
import { DestinationCard } from './components/DestinationCard';
import { SectionHeader } from './components/SectionHeader';
import { FeatureGrid } from './components/FeatureGrid';
import { FounderCard } from './components/FounderCard';
import styles from './styles/about.module.css';

export const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePillClick = (pillName: string) => {
    if (pillName.includes('Story')) scrollToSection('our-story');
    else if (pillName.includes('Barriers')) scrollToSection('barriers');
    else if (pillName.includes('Community')) scrollToSection('community');
    else setActiveTab('all');
  };

  return (
    <div className={styles.aboutContainer}>
      {/* 1. Hero Section */}
      <AboutHero
        hero={aboutContent.hero}
        pills={aboutContent.pills}
        onPillClick={handlePillClick}
      />

      {/* 2. Destination Cards Grid */}
      <div className={styles.destinationGrid}>
        {aboutContent.destinations.map((item) => (
          <DestinationCard
            key={item.id}
            item={item}
            onCardClick={scrollToSection}
          />
        ))}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--about-border)', margin: '3rem 0' }} />

      {/* 3. Our Story Section */}
      <section id="our-story" className={styles.sectionWrapper}>
        <SectionHeader
          title={aboutContent.ourStory.gap.title}
          subtitle={aboutContent.ourStory.gap.subtitle}
        />
        <p className={styles.bodyParagraph}>{aboutContent.ourStory.gap.body1}</p>
        <p className={styles.bodyParagraph}>{aboutContent.ourStory.gap.body2}</p>
        
        <div className={styles.quoteBox}>
          "{aboutContent.ourStory.gap.quote}"
        </div>

        <div style={{ marginTop: '3.5rem' }}>
          <SectionHeader
            title={aboutContent.ourStory.missionVision.missionTitle}
            subtitle={aboutContent.ourStory.missionVision.visionTitle}
          />
          <p className={styles.bodyParagraph}>
            {aboutContent.ourStory.missionVision.missionBody}
          </p>
          <p className={styles.bodyParagraph}>
            {aboutContent.ourStory.missionVision.visionBody}
          </p>
        </div>

        <div style={{ marginTop: '3.5rem' }}>
          <FounderCard founder={aboutContent.ourStory.founder} />
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--about-border)', margin: '3rem 0' }} />

      {/* 4. Educational Barriers Section */}
      <section id="barriers" className={styles.sectionWrapper}>
        <SectionHeader
          title={aboutContent.barriers.title}
          subtitle={aboutContent.barriers.subtitle}
        />
        <FeatureGrid pillars={aboutContent.barriers.pillars} />
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--about-border)', margin: '3rem 0' }} />

      {/* 5. Community & Action Section */}
      <section id="community" className={styles.sectionWrapper}>
        <SectionHeader
          title={aboutContent.community.title}
          subtitle={aboutContent.community.studentVoice}
        />
        <div className={styles.pillarCard} style={{ marginTop: '1.5rem', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--about-text-dark)' }}>
            {aboutContent.community.ambassador.title}
          </h3>
          <p className={styles.bodyParagraph} style={{ marginBottom: '1rem' }}>
            {aboutContent.community.ambassador.eligibility}
          </p>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--about-text-muted)', lineHeight: '1.8' }}>
            {aboutContent.community.ambassador.roles.map((role, idx) => (
              <li key={idx}>{role}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;