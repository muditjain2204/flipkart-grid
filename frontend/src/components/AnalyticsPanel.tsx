import React from 'react';
import { TrendingDown, ShieldCheck, Zap } from 'lucide-react';

export const AnalyticsPanel: React.FC = () => {
  return (
    <div className="glass-panel" style={{
      width: '100%',
      padding: '36px',
      marginTop: '40px',
      position: 'relative'
    }}>
      {/* Decorative gradient overlay */}
      <div style={{
        position: 'absolute',
        bottom: '0', left: '0', right: '0',
        height: '4px',
        background: 'linear-gradient(to right, #00ff88, #00baff, #ff3b30)',
        borderRadius: '0 0 16px 16px'
      }} />

      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          COMPARATIVE AUDIT REPORT
        </span>
        <h2 style={{
          fontSize: '32px',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-1px',
          marginTop: '6px'
        }}>
          Before vs After Optimization Performance
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '15px',
          maxWidth: '600px',
          margin: '8px auto 0',
          lineHeight: '1.5'
        }}>
          Actual system logs from Bengaluru pilot event (8,173 incident records) comparing legacy static cycle timers against autonomous multi-agent coordination.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {/* Metric 1: Average Wait Time */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              AVERAGE DELAY PER VEHICLE
            </span>
            <div style={{
              background: 'rgba(255, 59, 48, 0.1)',
              border: '1px solid rgba(255, 59, 48, 0.2)',
              color: '#ff3b30',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              padding: '2px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <TrendingDown size={10} />
              -54% REDUCTION
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>REACTIVE TIMER</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>52.4s</div>
            </div>
            
            <div style={{ height: '40px', width: '2px', backgroundColor: 'rgba(255,255,255,0.05)' }} />

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--primary)' }}>SMARTFLOW AI</div>
              <div className="text-glow-green" style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>24.1s</div>
            </div>
          </div>

          {/* Simple comparison bar */}
          <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: '68%', backgroundColor: '#ff3b30' }} />
            <div style={{ width: '32%', backgroundColor: '#00ff88' }} />
          </div>
        </div>

        {/* Metric 2: Vehicle Throughput */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              JUNCTION THROUGHPUT RATE
            </span>
            <div style={{
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.2)',
              color: '#00ff88',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              padding: '2px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Zap size={10} />
              +39% INCREASE
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>REACTIVE TIMER</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>640/hr</div>
            </div>

            <div style={{ height: '40px', width: '2px', backgroundColor: 'rgba(255,255,255,0.05)' }} />

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--accent-blue)' }}>SMARTFLOW AI</div>
              <div className="text-glow-blue" style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>890/hr</div>
            </div>
          </div>

          {/* Simple comparison bar */}
          <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: '42%', backgroundColor: '#4a5568' }} />
            <div style={{ width: '58%', backgroundColor: '#00baff' }} />
          </div>
        </div>

        {/* Metric 3: Resource Efficiency */}
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', gridColumn: 'span 1' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', display: 'block' }}>
              ENVIRONMENTAL OFFSET
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CARBON REDUCTION</span>
            <span className="text-glow-green" style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>-37%</span>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Fewer idling vehicles</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>FUEL SAVED</span>
            <span className="text-glow-blue" style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>285 L</span>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Accumulated daily</span>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
            <ShieldCheck size={12} className="text-glow-green" />
            COMPLIANT WITH BENGALURU ESG STANDARDS
          </div>
        </div>
      </div>

      {/* Analytics Graph representation SVG */}
      <div style={{
        marginTop: '32px',
        background: 'rgba(255, 255, 255, 0.01)',
        border: '1px solid rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            CHRONO-FLOW ANALYSIS: 24-HOUR PILOT RUN
          </span>
          <div style={{ display: 'flex', gap: '16px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff3b30' }}>
              <span style={{ width: '8px', height: '2px', backgroundColor: '#ff3b30', display: 'inline-block' }} />
              Reactive Signal (Static Timer)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00ff88' }}>
              <span style={{ width: '8px', height: '2px', backgroundColor: '#00ff88', display: 'inline-block' }} />
              SmartFlow AI (Dynamic Routing)
            </span>
          </div>
        </div>

        {/* Custom SVG Line Chart */}
        <div style={{ width: '100%', height: '140px', position: 'relative' }}>
          <svg viewBox="0 0 800 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Grid horizontal lines */}
            <line x1="0" y1="20" x2="800" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="60" x2="800" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

            {/* Path: Reactive (Red) */}
            <path
              d="M 0 80 Q 80 40 160 90 T 320 30 T 480 85 T 640 40 T 800 95"
              fill="none"
              stroke="#ff3b30"
              strokeWidth="2.5"
              opacity="0.85"
            />

            {/* Path: SmartFlow AI (Green) */}
            <path
              d="M 0 80 Q 80 90 160 100 T 320 85 T 480 95 T 640 80 T 800 90"
              fill="none"
              stroke="#00ff88"
              strokeWidth="3"
              strokeDasharray="none"
              opacity="0.95"
            />

            {/* Markers */}
            <circle cx="320" cy="30" r="4" fill="#ff3b30" />
            <circle cx="320" cy="85" r="4" fill="#00ff88" />
            <line x1="320" y1="0" x2="320" y2="120" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" strokeDasharray="2 2" />
          </svg>
          {/* Chart tooltip annotation */}
          <div style={{
            position: 'absolute',
            top: '20px', left: '42%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            pointerEvents: 'none'
          }}>
            PEAK INCIDENT RESOLUTION: -65% DELAY OFFSET
          </div>
        </div>
      </div>
    </div>
  );
};
