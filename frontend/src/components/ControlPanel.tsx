import React from 'react';
import type { Direction, SimulationState } from '../utils/simulator-physics';
import { Shield, Activity, AlertTriangle, CheckCircle, Lightbulb, Compass, Navigation } from 'lucide-react';

interface ControlPanelProps {
  simState: SimulationState;
  selectedSignal: Direction;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ simState, selectedSignal }) => {
  const { metrics, emergencyActive, emergencyDirection } = simState;

  // Congestion helpers
  const getCongestionColor = (val: number) => {
    if (val < 30) return 'text-glow-green';
    if (val < 65) return 'text-glow-amber';
    return 'text-glow-red';
  };

  const getCongestionLabel = (val: number) => {
    if (val < 30) return 'OPTIMIZED';
    if (val < 65) return 'MODERATE';
    return 'CRITICAL CONGESTION';
  };

  // Get dynamic corridor prediction details based on selected hotspot direction
  const getCorridorPrediction = (dir: Direction) => {
    switch (dir) {
      case 'N':
        return {
          name: 'North Link (MG Road / Queens Rd)',
          risk: 'MODERATE INCIDENT RISK',
          riskColor: 'var(--amber)',
          flowRate: '12 cars/min',
          recommendation: 'Extend green phase by 12s to clear stadium exit backlog.',
          prediction: 'Congestion expected to reduce by 22% within 5 minutes if green corridor is maintained.',
          incidentNotes: 'Spillover traffic from Central Metro Station ongoing.'
        };
      case 'S':
        return {
          name: 'South Link (Hosur Road / Richmond Flyover)',
          risk: 'HIGH INCIDENT RISK',
          riskColor: 'var(--red)',
          flowRate: '8 cars/min',
          recommendation: 'Restrict heavy vehicle entry. Redirect to double-road bypass lanes.',
          prediction: 'Underpass bottleneck detected. Cycle retiming triggered to prevent gridlock.',
          incidentNotes: 'Historical logs report high hazard rate at Hosur junction intersection.'
        };
      case 'E':
        return {
          name: 'East Link (Outer Ring Road / Silk Board Link)',
          risk: 'CRITICAL BOTTLENECK',
          riskColor: 'var(--red)',
          flowRate: '4 cars/min',
          recommendation: 'Immediate signal override. Set green time to 60s.',
          prediction: 'Queue queue backing up due to construction narrowing. Alternate routes advised.',
          incidentNotes: 'Astram logs report 8 prior incident instances near this link this week.'
        };
      case 'W':
      default:
        return {
          name: 'West Link (Majestic Interchange Bypass)',
          risk: 'LOW RISK - OPTIMIZED',
          riskColor: 'var(--primary)',
          flowRate: '18 cars/min',
          recommendation: 'Maintain active neural offset timers. No overrides needed.',
          prediction: 'Traffic moving at steady speed (34 km/h). Level of Service: B.',
          incidentNotes: 'Zero incidents reported within a 2.5km radius.'
        };
    }
  };

  const currentPredict = getCorridorPrediction(selectedSignal);

  // Recommendations list
  const getRecommendations = () => {
    const list = [];
    if (emergencyActive) {
      list.push({
        id: 'rec-1',
        title: 'Emergency Override Active',
        desc: `Ambulance detected on ${emergencyDirection} Corridor. Priority bypass route cleared.`,
        type: 'critical',
        icon: <Shield size={16} className="text-glow-red" />
      });
    }

    // Lane specific recs
    list.push({
      id: 'rec-lane',
      title: `${selectedSignal}-Corridor Recommendation`,
      desc: currentPredict.recommendation,
      type: selectedSignal === 'E' || selectedSignal === 'S' ? 'warning' : 'info',
      icon: <Lightbulb size={16} style={{ color: currentPredict.riskColor }} />
    });

    list.push({
      id: 'rec-default-1',
      title: 'Neural Coordination Offset',
      desc: 'SmartFlow coordination offset decreased general delays by 32%.',
      type: 'success',
      icon: <CheckCircle size={16} className="text-glow-green" />
    });

    return list.slice(0, 3);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '380px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* ─── Telemetry Dashboard ─── */}
      <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow corner background */}
        <div style={{
          position: 'absolute',
          top: '-40px', right: '-40px',
          width: '100px', height: '100px',
          background: 'rgba(0, 255, 136, 0.1)',
          filter: 'blur(30px)',
          borderRadius: '50%'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
            TELEMETRY NODE: CENTRAL_HUB_01
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            color: '#00ff88',
            fontFamily: 'var(--font-mono)'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#00ff88',
              borderRadius: '50%',
              boxShadow: '0 0 8px #00ff88'
            }} />
            LIVE
          </span>
        </div>

        {/* Big efficiency score */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            TRAFFIC FLOW SCORE
          </div>
          <div className="text-glow-green" style={{
            fontSize: '52px',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            lineHeight: '1',
            margin: '4px 0'
          }}>
            {metrics.trafficFlowScore}%
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Optimized by SmartFlow AI Agent
          </span>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="glass-card">
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              TOTAL VEHICLES
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              {metrics.totalVehicles}
            </div>
          </div>
          
          <div className="glass-card">
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              ACTIVE SECTORS
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              {metrics.activeSignals} / 4
            </div>
          </div>

          <div className="glass-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                CONGESTION INDEX
              </span>
              <span className={getCongestionColor(metrics.congestionLevel)} style={{ fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {getCongestionLabel(metrics.congestionLevel)}
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, margin: '2px 0', fontFamily: 'var(--font-mono)' }}>
              {metrics.congestionLevel}%
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: `${metrics.congestionLevel}%`,
                height: '100%',
                backgroundColor: metrics.congestionLevel < 30 ? '#00ff88' : metrics.congestionLevel < 65 ? '#ffaa00' : '#ff3b30',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          <div className="glass-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              AVERAGE QUEUE WAIT TIME
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              {metrics.averageWaitTime}
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 400 }}>seconds</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── NEW: Selected Corridor Predictions ─── */}
      <div className="glass-panel" style={{
        padding: '24px',
        border: `1px dashed ${currentPredict.riskColor}`,
        background: 'rgba(255, 255, 255, 0.01)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '12px', right: '12px',
          fontSize: '9px',
          fontFamily: 'var(--font-mono)',
          padding: '2px 8px',
          borderRadius: '4px',
          fontWeight: 700,
          color: '#ffffff',
          backgroundColor: currentPredict.riskColor
        }}>
          {currentPredict.risk}
        </div>

        <h3 style={{
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
          letterSpacing: '1px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Navigation size={14} className="text-glow-blue" />
          ACTIVE LINK PREDICTION
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>SELECTED ROADWAY</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-sans)', marginTop: '2px' }}>
              {currentPredict.name}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>FLOW VELOCITY</span>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{currentPredict.flowRate}</div>
            </div>
            <div>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>QUEUE DELAY</span>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{simState.averageWaitTimes[selectedSignal]}s</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--accent-blue)', fontWeight: 600 }}>
              <Compass size={12} />
              AI FORECAST RUN
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {currentPredict.prediction}
            </p>
          </div>

          {currentPredict.incidentNotes && (
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>
              <AlertTriangle size={12} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: '1px' }} />
              <span>{currentPredict.incidentNotes}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── AI Recommendations ─── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
          letterSpacing: '1px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Activity size={14} className="text-glow-green" />
          AI COORDINATION OFFSETS
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {getRecommendations().map((rec) => (
            <div key={rec.id} className="glass-card" style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              borderLeft: rec.type === 'critical' ? '2px solid #ff3b30' : rec.type === 'warning' ? '2px solid #ffaa00' : '1px solid rgba(255,255,255,0.04)'
            }}>
              <div style={{ marginTop: '2px' }}>
                {rec.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
                  {rec.title}
                </h4>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {rec.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
