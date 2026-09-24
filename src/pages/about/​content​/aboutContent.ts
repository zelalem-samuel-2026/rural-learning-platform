import { AboutContentData } from '../typesDef/about.types';

export const aboutContent: AboutContentData = {
  hero: {
    title: "Reimagining Learning for Every Student",
    subtitle: "Lerna is an open-access educational platform built to bridge learning gaps, empower students, and make quality education available wherever you are."
  },
  pills: [
    "Our Story",
    "Educational Barriers",
    "Community & Action"
  ],
  destinations: [
    {
      id: "our-story",
      title: "Our Story & Vision",
      description: "Why Lerna was created, our core mission, and the founder's journey.",
      badge: "Mission & Purpose"
    },
    {
      id: "barriers",
      title: "The 5 Core Barriers",
      description: "Addressing connectivity, resources, language, foundations, and cost.",
      badge: "Our Strategy"
    },
    {
      id: "community",
      title: "Community & Action",
      description: "Student-centered learning, ambassador programs, and local initiatives.",
      badge: "Get Involved"
    }
  ],
  ourStory: {
    gap: {
      title: "1. THE EDUCATIONAL GAP",
      subtitle: "Where You Live Shouldn’t Decide What You Can Learn.",
      body1: "Education is one of the most powerful tools a person can have. For a student who has been given access to quality education, strong learning foundations, supportive resources, and the opportunity to develop their abilities, education can open doors to possibilities that once seemed unreachable. It can expand knowledge, build confidence, create new opportunities, and help people shape a different future for themselves, their families, and their communities.",
      body2: "But that opportunity is not equally available to every student. For many learners, especially those growing up in rural, economically disadvantaged, or under-resourced communities, the challenge begins early. A student may have the ability and ambition to succeed, but lack access to quality learning materials, reliable internet, appropriate educational technology, strong foundational instruction, or learning resources in a language they can easily understand. Language barriers can make learning harder. Limited educational resources can make independent study difficult. Unreliable connectivity can make digital learning inaccessible. And when students enter secondary school without strong foundations, concepts that should be manageable can become overwhelming.",
      quote: "Talent is everywhere. Opportunity is not. Lerna is built to help close that gap."
    },
    missionVision: {
      missionTitle: "2. OUR MISSION & VISION",
      missionBody: "Lerna's mission is to make high-quality learning more accessible to students who face barriers such as limited connectivity, scarce educational resources, language barriers, and unequal access to learning technology. We are building with the realities of students in low-resource communities in mind. Lerna is designed to support learning that is mobile-first, low-bandwidth ready, offline-friendly, bilingual (English and Amharic), simple, and curriculum-focused.",
      visionTitle: "A World Where Quality Learning Can Reach Every Student.",
      visionBody: "We envision a future where a student's learning opportunities are not determined by geography, income, internet connectivity, or access to expensive educational resources. Lerna is beginning with the realities of students in rural and underserved communities in Ethiopia. But our vision is not limited to one country. From rural communities in Ethiopia to underserved communities around the world, we want opportunity to travel farther than privilege."
    },
    founder: {
      title: "3. FOUNDER STORY",
      name: "Zelalem Samuel",
      bio1: "Lerna was founded by Zelalem Samuel, a secondary-school student from Ethiopia who became deeply interested in the intersection of education, technology, and access. The idea behind Lerna is personal. Before Grade 5, Zelalem struggled to take his studies seriously and did not yet have the kind of strong learning foundation that would later become important to his education. Then something changed: from around Grade 5 onward, he had access to someone who could support and guide him in his learning. That support made a meaningful difference.",
      question: "What happens to the students who do not have someone nearby to help them?",
      bio2: "Lerna grew from that question. Rather than accepting that access to better learning should require a student to move to another city, pay for expensive resources, or depend on opportunities that may not be available to them, Zelalem began exploring how technology could help make quality learning more accessible. He chose to use the technical skills he was developing as a student to work on a problem he had experienced and observed firsthand.",
      bio3: "Lerna is therefore more than a technology project. It is an ongoing attempt to turn a personal lesson into a practical idea: If better learning opportunities can change one student's path, how many more students could benefit if those opportunities were made easier to access? Lerna began with a student's question — and aims to become a platform shaped by learners everywhere."
    }
  },
  barriers: {
    title: "Breaking Down Educational Barriers",
    subtitle: "Lerna is specifically architected to address 5 major challenges facing students in low-resource communities.",
    pillars: [
      {
        title: "1. Low-Bandwidth & Offline Access",
        description: "Designed for slow internet and offline usage so learning never stops when connectivity drops."
      },
      {
        title: "2. Bilingual & Multilingual Support",
        description: "Supporting English and Amharic, removing language barriers for core academic subjects."
      },
      {
        title: "3. Foundational & Curriculum-Focused",
        description: "Structured around national curriculum standards to rebuild foundational gaps from earlier grades."
      },
      {
        title: "4. Mobile-First & Lightweight",
        description: "Optimized for budget smartphones and basic mobile web browsers without demanding high-end hardware."
      },
      {
        title: "5. Open & Free Access",
        description: "Completely free of paywalls, ensuring financial status never restricts a student's ability to learn."
      }
    ]
  },
  community: {
    title: "Community, Student Voice & Action",
    studentVoice: "Education works best when students are active co-creators of their learning environment.",
    ambassador: {
      title: "Lerna Student Ambassador Program",
      eligibility: "Open to high school and university students passionate about education and tech equity.",
      roles: [
        "Promote digital literacy and peer tutoring in local schools.",
        "Gather feedback from rural students to improve platform accessibility.",
        "Host offline study sessions using Lerna resources."
      ],
      formUrl: "#"
    }
  }
};