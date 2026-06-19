import React from 'react';

interface SkySectionProps {
  headlineRef: React.RefObject<HTMLDivElement | null>;
  cloudLeftRef: React.RefObject<SVGSVGElement | null>;
  cloudRightRef: React.RefObject<SVGSVGElement | null>;
  subtitleRef: React.RefObject<HTMLParagraphElement | null>;
}

export const SkySection: React.FC<SkySectionProps> = ({
  headlineRef,
  cloudLeftRef,
  cloudRightRef,
  subtitleRef
}) => {
  return (
    <section className="scroll-section sky-container" style={{
      backgroundImage: 'linear-gradient(to bottom, rgba(5, 7, 10, 0.25) 0%, rgba(5, 7, 10, 0.85) 100%), url("/sky.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background stars / ambient dots */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        opacity: 0.7,
        pointerEvents: 'none'
      }} />

      {/* Floating Cloud Left */}
      <svg
        ref={cloudLeftRef}
        viewBox="0 0 100 60"
        style={{
          position: 'absolute',
          left: '-5%',
          top: '15%',
          width: '45vw',
          maxHeight: '350px',
          fill: 'rgba(255, 255, 255, 0.04)',
          filter: 'blur(8px)',
          pointerEvents: 'none',
          zIndex: 5
        }}
      >
        <path d="M 20 40 a 20 20 0 0 1 20 -20 a 25 25 0 0 1 30 -5 a 15 15 0 0 1 25 15 a 10 10 0 0 1 5 10 a 10 10 0 0 1 -10 10 L 10 50 a 10 10 0 0 1 -10 -10 Z" />
      </svg>

      {/* Floating Cloud Right */}
      <svg
        ref={cloudRightRef}
        viewBox="0 0 100 60"
        style={{
          position: 'absolute',
          right: '-5%',
          top: '30%',
          width: '50vw',
          maxHeight: '400px',
          fill: 'rgba(255, 255, 255, 0.05)',
          filter: 'blur(10px)',
          pointerEvents: 'none',
          zIndex: 5
        }}
      >
        <path d="M 10 40 a 18 18 0 0 1 20 -18 a 22 22 0 0 1 35 -2 a 12 12 0 0 1 25 10 a 8 8 0 0 1 5 10 a 8 8 0 0 1 -8 8 L 5 48 a 5 5 0 0 1 -5 -8 Z" />
      </svg>

      {/* Central Content */}
      <div
        ref={headlineRef}
        style={{
          textAlign: 'center',
          maxWidth: '850px',
          padding: '0 24px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        {/* Hackathon Category Tag */}
        <div style={{
          background: 'rgba(0, 255, 136, 0.1)',
          border: '1px solid rgba(0, 255, 136, 0.25)',
          color: '#00ff88',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          padding: '6px 16px',
          borderRadius: '50px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          boxShadow: '0 0 15px rgba(0, 255, 136, 0.1)',
          display: 'inline-block'
        }}>
          FLIPKART GRID 7.0 FINALIST PROTOTYPE
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 68px)',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          lineHeight: '1.05',
          background: 'linear-gradient(to bottom, #ffffff 40%, #8b949e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-2px',
          margin: 0
        }}>
          AI-Powered Intelligent Traffic Control System
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          style={{
            fontSize: 'clamp(15px, 2.5vw, 19px)',
            color: 'var(--text-secondary)',
            fontWeight: 400,
            maxWidth: '620px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}
        >
          Proactive congestion forecasting, real-time vehicle flow perception, and multi-agent coordination for urban corridor optimization.
        </p>

        {/* Floating elements hint */}
        <div style={{
          marginTop: '60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--text-muted)',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)'
        }}>
          <span>SCROLL TO DESCEND INTO CITY</span>
          <div style={{
            width: '1px',
            height: '40px',
            background: 'linear-gradient(to bottom, var(--text-muted), transparent)'
          }} />
        </div>
      </div>
    </section>
  );
};
