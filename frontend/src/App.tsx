import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAudio } from './hooks/useAudio';
import { SkySection } from './components/SkySection';
import { TrafficSimulator } from './components/TrafficSimulator';
import { ControlPanel } from './components/ControlPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { PipelineRunner } from './components/PipelineRunner';
import { initSignals } from './utils/simulator-physics';
import type { Direction, SimulationState } from './utils/simulator-physics';
import { Radio, Cpu, Heart, Activity, Terminal, Compass, Layout } from 'lucide-react';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Section Scroll Targets
  const skySectionRef = useRef<HTMLDivElement>(null);
  const controlCenterRef = useRef<HTMLDivElement>(null);

  // Sky Refs for Parallax
  const headlineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cloudLeftRef = useRef<SVGSVGElement>(null);
  const cloudRightRef = useRef<SVGSVGElement>(null);

  // Audio Hook
  const audio = useAudio();

  // Navigation tab for the right-side prediction dashboard
  const [activeTab, setActiveTab] = useState<'live' | 'pipeline' | 'analytics'>('live');

  // Interactive selected signal direction
  const [selectedSignal, setSelectedSignal] = useState<Direction>('S');

  // Emergency triggers
  const [triggerEmergency, setTriggerEmergency] = useState(false);

  // Shared state from simulator
  const [simState, setSimState] = useState<SimulationState>(() => ({
    vehicles: [],
    signals: initSignals(),
    queueLengths: { N: 4, S: 2, E: 7, W: 3 },
    averageWaitTimes: { N: 12, S: 5, E: 24, W: 8 },
    metrics: {
      totalVehicles: 28,
      activeSignals: 1,
      congestionLevel: 45,
      averageWaitTime: 12,
      trafficFlowScore: 78,
    },
    emergencyActive: false,
    emergencyDirection: null
  }));

  // Handle first interaction to initialize Audio Context and start ambient hum
  const handleUserInteraction = () => {
    audio.initContext();
    audio.startAmbient();
    window.removeEventListener('click', handleUserInteraction);
    window.removeEventListener('scroll', handleUserInteraction);
  };

  useEffect(() => {
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction);
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
    };
  }, []);

  // GSAP ScrollTrigger cloud fade out
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: '.sky-container',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          pin: true,
          pinSpacing: false
        }
      })
      .to(cloudLeftRef.current, { x: -450, scale: 1.8, opacity: 0, ease: 'power1.inOut' }, 0)
      .to(cloudRightRef.current, { x: 450, scale: 1.8, opacity: 0, ease: 'power1.inOut' }, 0)
      .to(headlineRef.current, { y: -100, scale: 0.85, opacity: 0, ease: 'power1.inOut' }, 0);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Smooth scroll handler
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, tab?: 'live' | 'pipeline' | 'analytics') => {
    audio.playClick();
    if (tab) {
      setActiveTab(tab);
    }
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div ref={containerRef} className="scroll-container">
      {/* ─── Pinned Top Navigation Bar ─── */}
      <nav className="glass-panel" style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 40px)',
        maxWidth: '1280px',
        height: '60px',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {/* Navbar Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => scrollToSection(skySectionRef)}>
          <div style={{
            background: 'linear-gradient(135deg, #00ff88, #00baff)',
            padding: '5px',
            borderRadius: '6px',
            color: '#05070a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cpu size={16} />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
            SmartFlow AI
          </span>
        </div>

        {/* Options of our functions of predictions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => scrollToSection(controlCenterRef, 'live')}
            style={{
              background: activeTab === 'live' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 16px',
              color: activeTab === 'live' ? '#00ff88' : 'var(--text-secondary)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Activity size={12} />
            LIVE FORECASTS
          </button>
          
          <button 
            onClick={() => scrollToSection(controlCenterRef, 'pipeline')}
            style={{
              background: activeTab === 'pipeline' ? 'rgba(0, 186, 255, 0.1)' : 'transparent',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 16px',
              color: activeTab === 'pipeline' ? '#00baff' : 'var(--text-secondary)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Terminal size={12} />
            MULTI-AGENT CASCADE
          </button>

          <button 
            onClick={() => scrollToSection(controlCenterRef, 'analytics')}
            style={{
              background: activeTab === 'analytics' ? 'rgba(255, 170, 0, 0.1)' : 'transparent',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 16px',
              color: activeTab === 'analytics' ? '#ffaa00' : 'var(--text-secondary)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Compass size={12} />
            PERFORMANCE AUDITS
          </button>
        </div>

        {/* System telemetry diagnostic tag */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#00ff88', borderRadius: '50%', boxShadow: '0 0 8px #00ff88' }} />
            <span>SYS_ONLINE</span>
          </div>
        </div>
      </nav>

      {/* ─── SECTION 1: Sky Landing Experience ─── */}
      <div ref={skySectionRef}>
        <SkySection 
          headlineRef={headlineRef}
          cloudLeftRef={cloudLeftRef}
          cloudRightRef={cloudRightRef}
          subtitleRef={subtitleRef}
        />
      </div>

      {/* ─── SECTION 2: Split Roundabout Simulator & AI Dashboard ─── */}
      <div 
        ref={controlCenterRef}
        className="control-center-section"
        style={{
          width: '100vw',
          minHeight: '100vh',
          background: '#05070a',
          padding: '100px max(2vw, 20px) 40px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Command center telemetry banner */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '16px',
          marginBottom: '28px',
          maxWidth: '1380px',
          width: '100%',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layout size={18} className="text-glow-blue" />
            <div>
              <h2 style={{ fontSize: '16px', color: '#ffffff', fontWeight: 700, fontFamily: 'var(--font-display)', margin: 0 }}>
                Autonomous Neural Dispatch Center
              </h2>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
                SECTOR MAP: BENGALURU_EAST_04 // ACTIVE CORRIDORS
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: 'var(--text-muted)' }}>
              UTC TIME: 2026-06-19 01:19:00
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00ff88' }}>
              <Radio size={11} className="text-glow-green" />
              MODEL_READY
            </div>
          </div>
        </header>

        {/* Split Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(400px, 1.4fr) minmax(320px, 1fr)',
          gap: '30px',
          maxWidth: '1380px',
          width: '100%',
          margin: '0 auto',
          alignItems: 'start'
        }}>
          {/* Left Side: Interactive Roundabout map feed */}
          <div style={{ width: '100%' }}>
            <TrafficSimulator 
              onStateChange={(state) => setSimState(state)}
              audio={audio}
              onSelectSignal={(dir) => setSelectedSignal(dir)}
              selectedSignal={selectedSignal}
              triggerEmergency={triggerEmergency}
              onEmergencyTriggerHandled={() => setTriggerEmergency(false)}
              onTriggerEmergency={() => setTriggerEmergency(true)}
            />
          </div>

          {/* Right Side: Tabbed AI predictions dashboard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* Embedded Inner Tab Headers */}
            <div className="glass-panel" style={{
              display: 'flex',
              padding: '6px',
              borderRadius: '12px',
              gap: '6px'
            }}>
              <button
                onClick={() => { audio.playClick(); setActiveTab('live'); }}
                style={{
                  flex: 1,
                  background: activeTab === 'live' ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border: activeTab === 'live' ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: activeTab === 'live' ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                LIVE RUN
              </button>
              <button
                onClick={() => { audio.playClick(); setActiveTab('pipeline'); }}
                style={{
                  flex: 1,
                  background: activeTab === 'pipeline' ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border: activeTab === 'pipeline' ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: activeTab === 'pipeline' ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                AGENTS DEMO
              </button>
              <button
                onClick={() => { audio.playClick(); setActiveTab('analytics'); }}
                style={{
                  flex: 1,
                  background: activeTab === 'analytics' ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border: activeTab === 'analytics' ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: activeTab === 'analytics' ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                AUDIT METRICS
              </button>
            </div>

            {/* Dynamic Tab Body rendering */}
            <div style={{ width: '100%' }}>
              {activeTab === 'live' && (
                <ControlPanel 
                  simState={simState}
                  selectedSignal={selectedSignal}
                />
              )}
              {activeTab === 'pipeline' && (
                <PipelineRunner />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsPanel />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 3: Footer Credits ─── */}
      <footer style={{
        background: '#040609',
        borderTop: '1px solid var(--border-light)',
        padding: '30px 20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        zIndex: 5,
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>SMARTFLOW AI TRAFFIC OPTIMIZER • BENGALURU PILOT HUB</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
          <span>FLIPKART GRID HACKATHON PROTOYPE. CODED WITH</span>
          <Heart size={10} fill="#ff3b30" color="#ff3b30" />
          <span>BY TEAM MULTI-AGENT INTELLIGENCE. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
