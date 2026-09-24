import React from 'react';
import { aboutContent } from './content/aboutContent';
import styles from './styles/about.module.css';

interface CommunityPageProps {
  onBack?: () => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onBack }) => {
  // Safe fallback for Google Form link
  const formUrl = aboutContent?.community?.ambassador?.formUrl || "https://docs.google.com/forms";

  return (
    <div 
      className={styles.aboutContainer} 
      style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '1rem 1rem 3rem 1rem', 
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
      }}
    >
      
      {/* 1. BACK NAVIGATION BUTTON */}
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
          fontWeight: 600,
          borderRadius: '30px',
          border: '1px solid #cbd5e1',
          backgroundColor: '#ffffff',
          color: '#1e293b',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease'
        }}
      >
        ← Back to About Lerna
      </button>

      {/* 2. HERO HEADER & PRIMARY CTA */}
      <section style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{
          display: 'inline-block',
          padding: '0.4rem 1.2rem',
          backgroundColor: '#e0f2fe',
          color: '#0284c7',
          borderRadius: '50px',
          fontWeight: 700,
          fontSize: '0.875rem',
          letterSpacing: '0.5px',
          marginBottom: '1rem',
          textTransform: 'uppercase'
        }}>
          👥 Lerna Student Ambassador Movement
        </div>
        
        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: '1.25',
          marginBottom: '1rem'
        }}>
          Become a <span style={{ background: 'linear-gradient(135deg, #0284c7, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lerna Ambassador</span>
        </h1>
        
        <p style={{
          fontSize: '1.05rem',
          color: '#475569',
          maxWidth: '680px',
          margin: '0 auto 2rem auto',
          lineHeight: '1.6'
        }}>
          ትምህርትን ለሁሉም ተማሪዎች ተራሽ ለማድረግ በተደረገው ጉዞ ላይ መሪ ይሁኑ! ተማሪዎችን በማስተማር እና በማንቃት የአመራር ክህሎትዎን ያሳድጉ፣ ብሄራዊ እውቅና እና የምስክር ወረቀት ያግኙ።
        </p>

        {/* HERO CTA BUTTON */}
        <a
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '1rem 2.2rem',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#ffffff',
            background: 'linear-gradient(135deg, #0284c7 0%, #0f766e 100%)',
            borderRadius: '50px',
            textDecoration: 'none',
            boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          🚀 Apply Here to Become an Ambassador
        </a>
      </section>

      {/* 3. THE 4 AMBASSADOR LEVELS */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            The 4 Levels 🏆
          </h2>
          <p style={{ color: '#64748b' }}>ብዙ ተማሪዎችን በሚደርሱ ቁጥር ደረጃዎ እና የሚያገኟቸው ጥቅሞች ያድጋሉ</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* BRONZE */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.8rem',
            border: '2px solid #fdba74',
            boxShadow: '0 4px 14px rgba(251, 146, 60, 0.08)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🥉</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#9a3412', margin: '0 0 0.25rem 0' }}>BRONZE LEVEL</h3>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ea580c', marginBottom: '1rem' }}>(10+ Students Reached)</p>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#475569', fontSize: '0.92rem', lineHeight: '1.6' }}>
              <li>Official Digital Certificate</li>
              <li>Lerna Community Ambassador Badge</li>
              <li>Access to Regional Ambassador Group</li>
            </ul>
          </div>

          {/* SILVER */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.8rem',
            border: '2px solid #cbd5e1',
            boxShadow: '0 4px 14px rgba(148, 163, 184, 0.1)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🥈</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#334155', margin: '0 0 0.25rem 0' }}>SILVER LEVEL</h3>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '1rem' }}>(25+ Students Reached)</p>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#475569', fontSize: '0.92rem', lineHeight: '1.6' }}>
              <li>Verified Leadership Certificate</li>
              <li>Featured Spot on Lerna Platform</li>
              <li>Priority Support & Special Event Invites</li>
            </ul>
          </div>

          {/* GOLD */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.8rem',
            border: '2px solid #fde047',
            boxShadow: '0 4px 14px rgba(234, 179, 8, 0.12)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🥇</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#854d0e', margin: '0 0 0.25rem 0' }}>GOLD LEVEL</h3>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ca8a04', marginBottom: '1rem' }}>(50+ Students Reached)</p>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#475569', fontSize: '0.92rem', lineHeight: '1.6' }}>
              <li>LinkedIn Badge + Recommendation</li>
              <li>Official Recommendation Letter</li>
              <li>Exclusive Lerna Ambassador Swag/Merch</li>
            </ul>
          </div>

          {/* PLATINUM */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '18px',
            padding: '1.8rem',
            border: '2px solid #a855f7',
            boxShadow: '0 4px 18px rgba(168, 85, 247, 0.15)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👑</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6b21a8', margin: '0 0 0.25rem 0' }}>PLATINUM LEVEL</h3>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9333ea', marginBottom: '1rem' }}>(100+ Students Reached)</p>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#475569', fontSize: '0.92rem', lineHeight: '1.6' }}>
              <li>Executive Recommendation Letter</li>
              <li>Scholarship Application Assistance</li>
              <li>Direct Mentorship with Lerna Core Team</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. SPECIAL RECOGNITION */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Special Recognition 🌟
          </h2>
          <p style={{ color: '#64748b' }}>ለከፍተኛ አፈፃፀም አምባሳደሮች የሚሰጥ ብሄራዊ ሽልማት</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* TOP 10 */}
          <div style={{
            backgroundColor: '#f0fdf4',
            borderRadius: '18px',
            padding: '1.8rem',
            border: '1.5px solid #86efac',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.08)'
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🏆</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#14532d', marginBottom: '0.8rem' }}>
              TOP 10 AMBASSADORS NATIONALLY
            </h3>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#166534', fontSize: '0.92rem', lineHeight: '1.6' }}>
              <li>Featured on official Lerna website & social media</li>
              <li>National Certificate of Educational Excellence</li>
              <li>Personalized Recommendation Letter for Universities</li>
            </ul>
          </div>

          {/* NATIONAL AMBASSADOR */}
          <div style={{
            backgroundColor: '#eff6ff',
            borderRadius: '18px',
            padding: '1.8rem',
            border: '1.5px solid #93c5fd',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)'
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>⭐</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.4rem' }}>
              NATIONAL AMBASSADOR
            </h3>
            <p style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
              #1 Top Leader in Ethiopia
            </p>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#1e40af', fontSize: '0.92rem', lineHeight: '1.6' }}>
              <li>Featured as National Student Leader of the Year</li>
              <li>Lead Mentor role for all regional teams</li>
              <li>Special Award & Leadership Sponsorship Opportunity</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. EARN YOUR TITLES */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Earn Your Titles 🎖️
          </h2>
          <p style={{ color: '#64748b' }}>በትምህርት ቤትዎ፣ በከተማዎ እና በብሄራዊ ደረጃ የማዕረግ ስሞች ያግኙ</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.2rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🏫</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.3rem 0' }}>SCHOOL AMBASSADOR</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Be #1 at your school</p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🏙️</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.3rem 0' }}>CITY AMBASSADOR</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Be Top 3 in your city</p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🗺️</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.3rem 0' }}>REGIONAL AMBASSADOR</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Be Top 5 in your region</p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🇪🇹</div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.3rem 0' }}>NATIONAL AMBASSADOR</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Be Top 10 in Ethiopia</p>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM APPLICATION CALL TO ACTION */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '24px',
        padding: '2.5rem 1.8rem',
        textAlign: 'center',
        color: '#ffffff',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.25)'
      }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.8rem', color: '#ffffff' }}>
          Ready to Start Your Leadership Journey? 🚀
        </h2>
        <p style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 1.8rem auto', lineHeight: '1.6' }}>
          አምባሳደር እና ተሳታፊ በመሆን ከ Lerna ጋር ለመስራት ከታች ያለውን አጭር ፎርም ይሙሉ!
        </p>

        <a
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '1.1rem 2.5rem',
            fontSize: '1.1rem',
            fontWeight: 800,
            color: '#0f172a',
            backgroundColor: '#38bdf8',
            borderRadius: '50px',
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(56, 189, 248, 0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          👉 Apply Here - Fill Application Form
        </a>
      </section>

    </div>
  );
};

export default CommunityPage;