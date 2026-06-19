import React from 'react';

interface CitySectionProps {
  cityContainerRef: React.RefObject<HTMLDivElement | null>;
  gridMeshRef: React.RefObject<SVGSVGElement | null>;
}

export const CitySection: React.FC<CitySectionProps> = ({
  cityContainerRef,
  gridMeshRef
}) => {
  return (
    <section 
      ref={cityContainerRef}
      className="scroll-section city-container" 
      style={{
        background: 'linear-gradient(to bottom, #0a0e21 0%, #06080c 100%)',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 2
      }}
    >
      {/* City Wireframe grid overlay */}
      <svg
        ref={gridMeshRef}
        viewBox="0 0 1000 600"
        style={{
          position: 'absolute',
          width: '90%',
          height: '80%',
          opacity: 0,
          transform: 'scale(0.8) translateY(100px)',
          transition: 'transform 0.1s ease-out',
          pointerEvents: 'none'
        }}
      >
        {/* Isometric grid background lines */}
        <defs>
          <linearGradient id="grid-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#00baff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ff3b30" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Road networks mesh */}
        <g stroke="url(#grid-glow)" strokeWidth="1.5" fill="none">
          {/* Vertical road outlines */}
          <line x1="100" y1="50" x2="400" y2="550" />
          <line x1="180" y1="30" x2="480" y2="530" />
          <line x1="500" y1="50" x2="800" y2="550" />
          <line x1="580" y1="30" x2="880" y2="530" />

          {/* Horizontal road outlines */}
          <line x1="50" y1="200" x2="750" y2="50" />
          <line x1="150" y1="380" x2="850" y2="230" />
          <line x1="250" y1="550" x2="950" y2="400" />
        </g>

        {/* Wireframe Buildings */}
        {/* Building 1 (West) */}
        <path d="M 200 250 L 250 220 L 300 250 L 250 280 Z" fill="rgba(0, 186, 255, 0.03)" stroke="#00baff" strokeWidth="1" opacity="0.6"/>
        <path d="M 200 250 L 200 150 L 250 120 L 250 220 Z" fill="rgba(0, 186, 255, 0.02)" stroke="#00baff" strokeWidth="1" opacity="0.6"/>
        <path d="M 250 220 L 250 120 L 300 150 L 300 250 Z" fill="rgba(0, 186, 255, 0.04)" stroke="#00baff" strokeWidth="1" opacity="0.6"/>

        {/* Building 2 (North) */}
        <path d="M 450 150 L 500 120 L 550 150 L 500 180 Z" fill="rgba(0, 255, 136, 0.03)" stroke="#00ff88" strokeWidth="1" opacity="0.5"/>
        <path d="M 450 150 L 450 70 L 500 40 L 500 120 Z" fill="rgba(0, 255, 136, 0.02)" stroke="#00ff88" strokeWidth="1" opacity="0.5"/>
        <path d="M 500 120 L 500 40 L 550 70 L 550 150 Z" fill="rgba(0, 255, 136, 0.04)" stroke="#00ff88" strokeWidth="1" opacity="0.5"/>

        {/* Building 3 (East) */}
        <path d="M 700 320 L 760 290 L 820 320 L 760 350 Z" fill="rgba(0, 186, 255, 0.03)" stroke="#00baff" strokeWidth="1" opacity="0.7"/>
        <path d="M 700 320 L 700 200 L 760 170 L 760 290 Z" fill="rgba(0, 186, 255, 0.02)" stroke="#00baff" strokeWidth="1" opacity="0.7"/>
        <path d="M 760 290 L 760 170 L 820 200 L 820 320 Z" fill="rgba(0, 186, 255, 0.04)" stroke="#00baff" strokeWidth="1" opacity="0.7"/>

        {/* Telemetry Dots / Glowing Sensors */}
        <circle cx="280" cy="300" r="4" fill="#00ff88" opacity="0.8" className="pulse-green" />
        <circle cx="530" cy="220" r="4" fill="#00baff" opacity="0.8" />
        <circle cx="430" cy="360" r="4" fill="#ffaa00" opacity="0.8" />
        <circle cx="730" cy="420" r="4" fill="#ff3b30" opacity="0.8" />

        {/* Connections */}
        <line x1="280" y1="300" x2="430" y2="360" stroke="#00ff88" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
        <line x1="530" y1="220" x2="430" y2="360" stroke="#00baff" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
        <line x1="730" y1="420" x2="430" y2="360" stroke="#ffaa00" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
      </svg>

      {/* Fly-in information cards overlay */}
      <div 
        style={{
          position: 'absolute',
          bottom: '12%',
          maxWidth: '800px',
          padding: '0 24px',
          zIndex: 10,
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <div style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent-blue)',
          fontSize: '13px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          SYSTEM PERCEPTION ACTIVE
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 4vw, 36px)',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-1px'
        }}>
          Reconstructing the Urban Grid
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 'clamp(14px, 1.8vw, 16px)',
          maxWidth: '560px',
          margin: '10px auto 0',
          lineHeight: '1.5'
        }}>
          Perceiving vehicles and intersections as active network nodes. Instantiating real-time coordinate projections from database logs.
        </p>
      </div>
    </section>
  );
};
