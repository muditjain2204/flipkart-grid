import React, { useEffect, useState, useRef } from 'react';
import type { Direction, SimulationState } from '../utils/simulator-physics';
import { initSignals } from '../utils/simulator-physics';
import { Activity, Focus, AlertTriangle } from 'lucide-react';

interface TrafficSimulatorProps {
  onStateChange: (state: SimulationState) => void;
  audio: {
    playClick: () => void;
    playWarning: () => void;
    startSiren: () => void;
    stopSiren: () => void;
  };
  onSelectSignal: (dir: Direction) => void;
  selectedSignal: Direction;
  triggerEmergency: boolean;
  onEmergencyTriggerHandled: () => void;
  onTriggerEmergency: () => void;
}

export const TrafficSimulator: React.FC<TrafficSimulatorProps> = ({
  onStateChange,
  audio,
  onSelectSignal,
  selectedSignal,
  triggerEmergency,
  onEmergencyTriggerHandled,
  onTriggerEmergency
}) => {
  // Telemetry state simulation
  const [signals, setSignals] = useState(() => initSignals());
  const [queues, setQueues] = useState<Record<Direction, number>>({ N: 4, S: 2, E: 7, W: 3 });
  const [waitTimes, setWaitTimes] = useState<Record<Direction, number>>({ N: 12, S: 5, E: 24, W: 8 });
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyDirection, setEmergencyDirection] = useState<Direction | null>(null);

  const stateRef = useRef({ signals, queues, waitTimes, emergencyActive, emergencyDirection });
  stateRef.current = { signals, queues, waitTimes, emergencyActive, emergencyDirection };

  // Hotspot positions overlaid on traffic.jpg
  // Coordinates mapped specifically to the gantry posts in the image
  const hotspots: { id: Direction; label: string; x: string; y: string }[] = [
    { id: 'S', label: 'South Corridor Gantry', x: '17%', y: '67%' },
    { id: 'N', label: 'North Corridor Gantry', x: '26%', y: '15%' },
    { id: 'E', label: 'East Corridor Gantry', x: '58%', y: '5%' },
    { id: 'W', label: 'West Corridor Gantry', x: '83%', y: '45%' },
  ];

  // Handle click on signal hotspot
  const handleSignalClick = (dir: Direction) => {
    audio.playClick();
    onSelectSignal(dir);

    setSignals(prev => {
      const updated = { ...prev };
      // Turn clicked signal green, make all others red
      (Object.keys(updated) as Direction[]).forEach(k => {
        updated[k] = {
          ...updated[k],
          state: k === dir ? 'GREEN' : 'RED',
        };
      });
      return updated;
    });
  };

  // Trigger ambulance simulated sequence
  useEffect(() => {
    if (triggerEmergency && !emergencyActive) {
      audio.playWarning();
      audio.startSiren();
      setEmergencyActive(true);
      
      // Pick a corridor to spawn ambulance (e.g. North)
      const targetDir: Direction = 'N';
      setEmergencyDirection(targetDir);
      onSelectSignal(targetDir);

      // Trigger Priority green corridor
      setSignals(prev => {
        const updated = { ...prev };
        (Object.keys(updated) as Direction[]).forEach(k => {
          updated[k] = {
            ...updated[k],
            state: k === targetDir ? 'GREEN' : 'RED',
          };
        });
        return updated;
      });

      // Clear the queues on the ambulance corridor
      setQueues(prev => ({ ...prev, [targetDir]: 0 }));
      setWaitTimes(prev => ({ ...prev, [targetDir]: 0 }));

      // Resolved after 8 seconds of priority clear
      const timer = setTimeout(() => {
        setEmergencyActive(false);
        setEmergencyDirection(null);
        audio.stopSiren();
      }, 8000);

      onEmergencyTriggerHandled();
      return () => clearTimeout(timer);
    }
  }, [triggerEmergency]);

  // Dynamic Telemetry loop
  useEffect(() => {
    const interval = setInterval(() => {
      const current = stateRef.current;

      setQueues(prev => {
        const next = { ...prev };
        (Object.keys(next) as Direction[]).forEach(k => {
          const isGreen = current.signals[k].state === 'GREEN';
          
          if (isGreen) {
            // green lights drain vehicles
            next[k] = Math.max(0, next[k] - 1);
          } else {
            // red lights accumulate vehicles
            // randomly spawn new vehicles
            if (Math.random() < 0.4) {
              next[k] = Math.min(15, next[k] + 1);
            }
          }
        });
        return next;
      });

      setWaitTimes(prev => {
        const next = { ...prev };
        (Object.keys(next) as Direction[]).forEach(k => {
          const isGreen = current.signals[k].state === 'GREEN';
          if (isGreen) {
            next[k] = Math.max(0, next[k] - 2);
          } else {
            if (current.queues[k] > 0) {
              next[k] += 1;
            }
          }
        });
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Sync state up to parent metrics panel
  useEffect(() => {
    const totalVehicles = Object.values(queues).reduce((a, b) => a + b, 0) + 12; // active flow base
    const totalQueue = Object.values(queues).reduce((a, b) => a + b, 0);
    const activeSignalsCount = Object.values(signals).filter(s => s.state === 'GREEN').length;

    const congestionLevel = Math.min(100, Math.round((totalQueue / 24) * 100));
    const averageWaitTime = Math.round(Object.values(waitTimes).reduce((a, b) => a + b, 0) / 4);
    const trafficFlowScore = Math.max(10, Math.min(100, 100 - congestionLevel + (activeSignalsCount * 5)));

    onStateChange({
      vehicles: [], // simulated
      signals,
      queueLengths: queues,
      averageWaitTimes: waitTimes,
      metrics: {
        totalVehicles,
        activeSignals: activeSignalsCount,
        congestionLevel,
        averageWaitTime,
        trafficFlowScore
      },
      emergencyActive,
      emergencyDirection
    });
  }, [signals, queues, waitTimes, emergencyActive, emergencyDirection]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
      height: '100%'
    }}>
      {/* Simulation Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Focus size={16} className="text-glow-blue" />
          <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            ROUNDABOUT TELEMETRY CAM FEED
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="glass-panel" style={{ fontSize: '10px', padding: '4px 10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            MODE: IMAGE_HOTSPOT_SIM
          </span>
        </div>
      </div>

      {/* Main Image Hotspot container */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1000 / 650',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Background traffic roundabout image */}
        <img
          src="/traffic.jpg"
          alt="Junction Roundabout Feed"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none'
          }}
        />

        {/* Ambient grid scanning lines overlay */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(rgba(18, 18, 18, 0.05) 50%, rgba(0, 0, 0, 0.15) 50%)',
          backgroundSize: '100% 4px',
          pointerEvents: 'none'
        }} />

        {/* Hotspot buttons overlaid on coordinates */}
        {hotspots.map((spot) => {
          const isGreen = signals[spot.id].state === 'GREEN';
          const isSelected = selectedSignal === spot.id;

          return (
            <button
              key={spot.id}
              onClick={() => handleSignalClick(spot.id)}
              style={{
                position: 'absolute',
                left: spot.x,
                top: spot.y,
                transform: 'translate(-50%, -50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px'
              }}
              title={`Click to turn ${isGreen ? 'RED' : 'GREEN'} and view prediction`}
            >
              {/* Outer pulsing ring */}
              <div style={{
                position: 'absolute',
                width: isSelected ? '46px' : '32px',
                height: isSelected ? '46px' : '32px',
                borderRadius: '50%',
                border: `2px solid ${isGreen ? '#00ff88' : '#ff3b30'}`,
                boxShadow: `0 0 15px ${isGreen ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 59, 48, 0.5)'}`,
                animation: 'pulse-glow 1.5s infinite',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }} />

              {/* Inner core LED bulb */}
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: isGreen ? '#00ff88' : '#ff3b30',
                border: '2px solid #ffffff',
                boxShadow: `0 0 8px #ffffff, 0 0 12px ${isGreen ? '#00ff88' : '#ff3b30'}`
              }} />

              {/* Overlay direction code indicator */}
              <span style={{
                position: 'absolute',
                top: '-20px',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                background: 'rgba(5, 7, 10, 0.75)',
                border: `1px solid ${isSelected ? '#00baff' : 'rgba(255,255,255,0.1)'}`,
                padding: '1px 6px',
                borderRadius: '3px',
                pointerEvents: 'none'
              }}>
                {spot.id === 'N' ? 'N (L-TOP)' : spot.id === 'S' ? 'S (L-BOT)' : spot.id === 'E' ? 'E (R-TOP)' : 'W (R-BOT)'}
              </span>
            </button>
          );
        })}

        {/* Floating region telemetry overlay */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(14, 17, 23, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '8px 14px',
          borderRadius: '8px',
          color: 'var(--text-primary)',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          pointerEvents: 'none'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={10} className="text-glow-green" />
            FEED STATUS: FEED_SYNCHRONIZED
          </span>
          <span>FPS: 60 (CAMERA FEED LAYER)</span>
        </div>

        {/* Emergency Vehicle warning overlay banner */}
        {emergencyActive && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 59, 48, 0.9)',
            border: '1px solid #ffffff',
            padding: '8px 14px',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'pulse-glow 1s infinite',
            pointerEvents: 'none'
          }}>
            <AlertTriangle size={12} />
            AMBULANCE ACTIVE ON NORTH ROUTE
          </div>
        )}
      </div>

      {/* Manual ambulance triggers and guides */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 8px'
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          *Click on any glowing signal bulb on the map image to select a route and clear its queue.
        </span>

        <button
          onClick={() => {
            if (!emergencyActive) {
              onTriggerEmergency();
            }
          }}
          className="glass-panel"
          style={{
            padding: '8px 16px',
            color: '#ffffff',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '1px',
            border: '1px solid rgba(255,59,48,0.3)',
            background: 'rgba(255, 59, 48, 0.1)',
            cursor: 'pointer',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <span style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#ff3b30',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'pulse-glow 1s infinite'
          }} />
          FORCE AMBULANCE SPAWN
        </button>
      </div>
    </div>
  );
};
