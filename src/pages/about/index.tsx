import React, { useState } from 'react';
import { AboutPage } from './AboutPage';
import { OurStoryPage } from './OurStoryPage';
import { LearningWithoutBarriersPage } from './LearningWithoutBarriersPage';
import { CommunityPage } from './CommunityPage';

type AboutView = 'hub' | 'our-story' | 'barriers' | 'community';

export const AboutModule: React.FC = () => {
  const [currentView, setCurrentView] = useState<AboutView>('hub');

  const handleNavigate = (viewId: string) => {
    if (viewId === 'our-story' || viewId === 'barriers' || viewId === 'community') {
      setCurrentView(viewId as AboutView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('hub');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToHub = () => {
    setCurrentView('hub');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main>
      {currentView === 'hub' && (
        <AboutPage onNavigate={handleNavigate} />
      )}

      {currentView === 'our-story' && (
        <OurStoryPage onBack={handleBackToHub} />
      )}

      {currentView === 'barriers' && (
        <LearningWithoutBarriersPage onBack={handleBackToHub} />
      )}

      {currentView === 'community' && (
        <CommunityPage onBack={handleBackToHub} />
      )}
    </main>
  );
};

export default AboutModule;