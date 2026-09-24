import React, { useState } from 'react';
import { aboutContent } from './content/aboutContent';
import styles from './styles/about.module.css';

interface AboutPageProps {
  onNavigate: (viewId: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  // ለ Hover Animation የሚያገለግሉ state-ዎች
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);

  const handlePillClick = (pillName: string) => {
    if (pillName.includes('Story')) {
      onNavigate('our-story');
    } else if (pillName.includes('Barriers')) {
      onNavigate('barriers');
    } else if (pillName.includes('Community')) {
      onNavigate('community');
    }
  };

  // የካርዶቹ ልዩ ቀለማት እና ኢሞጂዎች
  const cardColors = [
    { bg: '#f0fdf4', border: '#4ade80', text: '#166534', icon: '📖' },
    { bg: '#eff6ff', border: '#60a5fa', text: '#1e3a8a', icon: '🚀' },
    { bg: '#fdf4ff', border: '#c084fc', text: '#701a75', icon: '🤝' },
  ];

  return (
    <div className={styles.aboutContainer} style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem 4rem 1rem', fontFamily: 'system-ui, sans-serif' }}>

      {/* 1. HERO SECTION (ዋናው ርዕስ) */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '2.8rem', 
          fontWeight: 900, 
          color: '#0f172a', 
          marginBottom: '1rem', 
          lineHeight: '1.2' 
        }}>
          {aboutContent.hero?.title || 'Reimagining Learning for Every Student'}
        </h1>
        <p style={{ 
          fontSize: '1.15rem', 
          color: '#475569', 
          maxWidth: '750px', 
          margin: '0 auto', 
          lineHeight: '1.6' 
        }}>
          {aboutContent.hero?.subtitle || 'Lerna is an open-access educational platform built to bridge learning gaps, empower students, and make quality education available wherever you are.'}
        </p>
      </div>

      {/* 2. CONTACT & FEEDBACK SECTION (አዲሱ ሞቅ ያለ የመገናኛ ክፍል) */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        marginBottom: '3.5rem',
        border: '1px solid #bae6fd',
        boxShadow: '0 10px 30px rgba(2, 132, 199, 0.08)'
      }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0369a1', marginBottom: '0.8rem' }}>
          👋 We’d Love to Hear From You!
        </h2>
        <p style={{ color: '#0f172a', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 1.5rem auto', lineHeight: '1.6' }}>
          ይህ መድረክ የተገነባው ለእርስዎ ነው! ስለ Lerna ያሎትን ሀሳብ፣ አስተያየት (Feedback) ወይም አብሮ የመስራት ፍላጎት ካሎት እባክዎ ያነጋግሩን። አብረን ትምህርትን ለሁሉም ተደራሽ እናድርግ!
        </p>
        <a
          href="mailto:info@lerna.et"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#0ea5e9',
            color: '#ffffff',
            padding: '0.8rem 2.2rem',
            borderRadius: '50px',
            fontWeight: 700,
            fontSize: '1.1rem',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.transform = 'translateY(-3px)'; 
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(14, 165, 233, 0.4)'; 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.transform = 'translateY(0)'; 
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(14, 165, 233, 0.3)'; 
          }}
        >
          ✉️ info@lerna.et
        </a>
      </div>

      {/* 3. NAVIGATION PILLS (ወደ ሌላ ገፅ መሄጃ ማራኪ ቁልፎች) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginBottom: '4rem' }}>
        {aboutContent.pills && aboutContent.pills.map((pill: string, idx: number) => (
          <button
            key={idx}
            onClick={() => handlePillClick(pill)}
            onMouseEnter={() => setHoveredPill(pill)}
            onMouseLeave={() => setHoveredPill(null)}
            style={{
              padding: '0.85rem 2rem',
              borderRadius: '50px',
              border: 'none',
              backgroundColor: hoveredPill === pill ? '#0f172a' : '#ffffff',
              color: hoveredPill === pill ? '#ffffff' : '#334155',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: hoveredPill === pill ? '0 8px 20px rgba(15, 23, 42, 0.25)' : '0 2px 10px rgba(0,0,0,0.06)',
              transition: 'all 0.3s ease',
              border: '1px solid #e2e8f0',
              transform: hoveredPill === pill ? 'translateY(-4px)' : 'translateY(0)'
            }}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* 4. DESTINATION CARDS GRID (ዋናዎቹ አነቃቂ ካርዶች) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        {aboutContent.destinations && aboutContent.destinations.map((item: any, idx: number) => {
          // ለእያንዳንዱ ካርድ የራሱን ቀለም እንሰጠዋለን
          const color = cardColors[idx % cardColors.length];
          const isHovered = hoveredCard === item.id;

          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '2.2rem',
                cursor: 'pointer',
                border: '1px solid #f1f5f9',
                borderTop: `6px solid ${color.border}`,
                boxShadow: isHovered ? `0 15px 35px ${color.border}25` : '0 4px 15px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* ከጀርባ የሚታይ ውብ ክብ ቅርፅ (Background Decoration) */}
              <div style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '120px',
                height: '120px',
                backgroundColor: color.bg,
                borderRadius: '50%',
                opacity: 0.8,
                zIndex: 0,
                transition: 'transform 0.5s ease',
                transform: isHovered ? 'scale(1.2)' : 'scale(1)'
              }} />

              {/* የካርዱ ትክክለኛ ይዘት */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                  <span style={{ fontSize: '2rem' }}>{color.icon}</span>
                  {item.label && (
                    <span style={{
                      backgroundColor: color.bg,
                      color: color.text,
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {item.label}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.8rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
                  {item.description}
                </p>
                
                {/* Explore የሚያደርግ ማራኪ ቀስት */}
                <div style={{
                  marginTop: '1.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: color.text,
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  transition: 'gap 0.3s ease',
                  gap: isHovered ? '0.8rem' : '0.4rem'
                }}>
                  Explore <span style={{ fontSize: '1.3rem' }}>→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default AboutPage;