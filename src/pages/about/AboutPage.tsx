import React from 'react';
import { aboutContent } from './content/aboutContent';
import { AboutHero } from './components/AboutHero';
import { DestinationCard } from './components/DestinationCard';
import styles from './styles/about.module.css';

interface AboutPageProps {
  onNavigate: (viewId: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const handlePillClick = (pillName: string) => {
    if (pillName.includes('Story')) {
      onNavigate('our-story');
    } else if (pillName.includes('Barriers')) {
      onNavigate('barriers');
    } else if (pillName.includes('Community')) {
      onNavigate('community');
    }
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
            onCardClick={onNavigate}
          />
        ))}
      </div>
    </div>
  );
};

export default AboutPage;