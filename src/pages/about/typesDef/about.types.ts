export interface HeroContent {
  title: string;
  subtitle: string;
}

export interface DestinationCardItem {
  id: 'our-story' | 'barriers' | 'community';
  title: string;
  description: string;
  badge: string;
}

export interface GapSection {
  title: string;
  subtitle: string;
  body1: string;
  body2: string;
  quote: string;
}

export interface MissionVisionSection {
  missionTitle: string;
  missionBody: string;
  visionTitle: string;
  visionBody: string;
}

export interface FounderSection {
  title: string;
  name: string;
  bio1: string;
  question: string;
  bio2: string;
  bio3: string;
}

export interface PillarItem {
  title: string;
  description: string;
}

export interface AmbassadorSection {
  title: string;
  eligibility: string;
  roles: string[];
  formUrl: string;
}

export interface AboutContentData {
  hero: HeroContent;
  pills: string[];
  destinations: DestinationCardItem[];
  ourStory: {
    gap: GapSection;
    missionVision: MissionVisionSection;
    founder: FounderSection;
  };
  barriers: {
    title: string;
    subtitle: string;
    pillars: PillarItem[];
  };
  community: {
    title: string;
    studentVoice: string;
    ambassador: AmbassadorSection;
  };
}