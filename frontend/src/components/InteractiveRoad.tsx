'use client';

import React, { useRef, useState, useEffect } from 'react';
import { audioSynth } from '../utils/audio-synth';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface CarState {
  id: number;
  name: string;
  color: string;
  textColor: string;
  type: 'sports' | 'ev' | 'taxi';
  progress: number; // 0 to 1 along the path
  speed: number; // current speed
  maxSpeed: number; // baseline target speed
  isStopped: boolean; // stopped by user click
  stopTimer: number; // countdown in seconds
  isBlocked: boolean; // blocked by collision queue
  x: number;
  y: number;
  angle: number;
}

export const InteractiveRoad: React.FC = () => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [isLightRed, setIsLightRed] = useState(false);
  
  // Initialize three cars spread out along the curve
  const [cars, setCars] = useState<CarState[]>([
    {
      id: 1,
      name: 'Car 1 (Red Sports)',
      color: 'url(#red-grad)',
      textColor: 'text-red-400',
      type: 'sports',
      progress: 0.65,
      speed: 0.05,
      maxSpeed: 0.055,
      isStopped: false,
      stopTimer: 0,
      isBlocked: false,
      x: 0,
      y: 0,
      angle: 0
    },
    {
      id: 2,
      name: 'Car 2 (Cyan EV)',
      color: 'url(#cyan-grad)',
      textColor: 'text-cyan-400',
      type: 'ev',
      progress: 0.35,
      speed: 0.05,
      maxSpeed: 0.052,
      isStopped: false,
      stopTimer: 0,
      isBlocked: false,
      x: 0,
      y: 0,
      angle: 0
    },
    {
      id: 3,
      name: 'Car 3 (Yellow Taxi)',
      color: 'url(#yellow-grad)',
      textColor: 'text-amber-400',
      type: 'taxi',
      progress: 0.05,
      speed: 0.05,
      maxSpeed: 0.05,
      isStopped: false,
      stopTimer: 0,
      isBlocked: false,
      x: 0,
      y: 0,
      angle: 0
    }
  ]);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  // requestAnimationFrame Physics Loop
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const updatePhysics = (time: number) => {
      const delta = (time - lastTime) / 1000; // in seconds
      lastTime = time;

      if (pathLength === 0 || !pathRef.current) {
        frameId = requestAnimationFrame(updatePhysics);
        return;
      }

      setCars((prevCars) => {
        // Create deep copy
        const next = prevCars.map(c => ({ ...c }));

        // 1. Decrement user stop timers
        next.forEach((car) => {
          if (car.isStopped && car.stopTimer > 0) {
            car.stopTimer -= delta;
            if (car.stopTimer <= 0) {
              car.isStopped = false;
              car.stopTimer = 0;
            }
          }
        });

        // 2. Traffic Light Gantry Stop Zone (for Car 1, the leader)
        // Position on path: 0.72 is stop line. Light is at 0.75.
        const stopLine = 0.71;
        const stopZoneStart = 0.65;
        
        const car1 = next[0];
        const atLightZone = car1.progress >= stopZoneStart && car1.progress <= stopLine;
        if (isLightRed && atLightZone) {
          car1.speed = 0;
          car1.isBlocked = true;
        } else if (car1.isBlocked && !isLightRed && !car1.isStopped) {
          // Restart leader if light turns green
          car1.isBlocked = false;
        }

        // 3. Collision queue & sequential restart calculations
        // Collision threshold: 0.15 (cars get too close at larger scale)
        // Safe release threshold: 0.24 (wait for preceding car to pull away)
        const collisionLimit = 0.15;
        const releaseLimit = 0.24;

        // Check Car 2 following Car 1
        let d21 = next[0].progress - next[1].progress;
        if (d21 < 0) d21 += 1.0; // wrap around loop

        const isCar1Stopped = next[0].isStopped || next[0].isBlocked || next[0].speed === 0;
        if (next[1].isBlocked) {
          // If already blocked, stay blocked until gap opens to release limit
          if (d21 >= releaseLimit) {
            next[1].isBlocked = false;
          } else {
            next[1].speed = 0;
          }
        } else {
          // Check for new block
          if (d21 < collisionLimit && isCar1Stopped) {
            next[1].isBlocked = true;
            next[1].speed = 0;
            audioSynth.playWarning(); // Trigger warning sound on collision
          }
        }

        // Check Car 3 following Car 2
        let d32 = next[1].progress - next[2].progress;
        if (d32 < 0) d32 += 1.0;

        const isCar2Stopped = next[1].isStopped || next[1].isBlocked || next[1].speed === 0;
        if (next[2].isBlocked) {
          // Stay blocked until gap opens
          if (d32 >= releaseLimit) {
            next[2].isBlocked = false;
          } else {
            next[2].speed = 0;
          }
        } else {
          // Check for new block
          if (d32 < collisionLimit && isCar2Stopped) {
            next[2].isBlocked = true;
            next[2].speed = 0;
            audioSynth.playWarning(); // Warning sound
          }
        }

        // 4. Update coordinates & apply velocities
        next.forEach((car) => {
          // Target speed depends on block/stop states
          const targetSpeed = (car.isStopped || car.isBlocked) ? 0 : car.maxSpeed;
          
          // Smooth braking/acceleration physics
          if (car.speed < targetSpeed) {
            car.speed = Math.min(targetSpeed, car.speed + 0.15 * delta);
          } else if (car.speed > targetSpeed) {
            car.speed = Math.max(targetSpeed, car.speed - 0.35 * delta);
          }

          // Advance progress along road curve
          car.progress += car.speed * delta;
          if (car.progress >= 1.0) {
            car.progress -= 1.0;
          }

          // Calculate 2D coordinates along the SVG curve
          if (pathRef.current && pathLength > 0) {
            const currentLen = car.progress * pathLength;
            const p1 = pathRef.current.getPointAtLength(currentLen);
            // Query a point slightly ahead to compute rotation tangent angle
            const p2 = pathRef.current.getPointAtLength(Math.min(pathLength, currentLen + 2) % pathLength);
            
            car.x = p1.x;
            car.y = p1.y;
            car.angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
          }
        });

        return next;
      });

      frameId = requestAnimationFrame(updatePhysics);
    };

    frameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(frameId);
  }, [pathLength, isLightRed]);

  // Click on a car: halts it immediately for 3 seconds
  const handleCarClick = (id: number) => {
    audioSynth.playClick();
    setCars((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            isStopped: true,
            stopTimer: 3.0,
            speed: 0
          };
        }
        return c;
      })
    );
  };

  const resetSimulation = () => {
    audioSynth.playClick();
    setIsLightRed(false);
    setCars([
      {
        id: 1,
        name: 'Car 1 (Red Sports)',
        color: 'url(#red-grad)',
        textColor: 'text-red-400',
        type: 'sports',
        progress: 0.65,
        speed: 0.05,
        maxSpeed: 0.055,
        isStopped: false,
        stopTimer: 0,
        isBlocked: false,
        x: 0,
        y: 0,
        angle: 0
      },
      {
        id: 2,
        name: 'Car 2 (Cyan EV)',
        color: 'url(#cyan-grad)',
        textColor: 'text-cyan-400',
        type: 'ev',
        progress: 0.35,
        speed: 0.05,
        maxSpeed: 0.052,
        isStopped: false,
        stopTimer: 0,
        isBlocked: false,
        x: 0,
        y: 0,
        angle: 0
      },
      {
        id: 3,
        name: 'Car 3 (Yellow Taxi)',
        color: 'url(#yellow-grad)',
        textColor: 'text-amber-400',
        type: 'taxi',
        progress: 0.05,
        speed: 0.05,
        maxSpeed: 0.05,
        isStopped: false,
        stopTimer: 0,
        isBlocked: false,
        x: 0,
        y: 0,
        angle: 0
      }
    ]);
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 relative mt-16 max-w-5xl mx-auto px-4 z-20">
      {/* ─── HUD CONTROL BOARD ─── */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Feed */}
        <div className="rounded-2xl border border-white/5 bg-slate-950/60 backdrop-blur-md p-4 flex flex-col gap-3">
          <span className="font-mono text-[9px] tracking-wider text-slate-500 uppercase">SYS_LOGS_STREAM</span>
          <div className="flex flex-col gap-2 font-mono text-xs">
            {cars.map((c) => {
              let statusLabel = 'RUNNING';
              let statusColor = 'text-emerald-400';
              if (c.isStopped) {
                statusLabel = `STOPPED (${c.stopTimer.toFixed(1)}s)`;
                statusColor = 'text-red-400 animate-pulse';
              } else if (c.isBlocked) {
                statusLabel = 'COLLISION BLOCKED';
                statusColor = 'text-amber-400 animate-pulse';
              }
              return (
                <div key={c.id} className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-300">{c.name}:</span>
                  <span className={`font-bold ${statusColor}`}>{statusLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Telemetry meters */}
        <div className="rounded-2xl border border-white/5 bg-slate-950/60 backdrop-blur-md p-4 flex flex-col gap-2 justify-center items-center text-center">
          <div className="flex items-center gap-1.5 text-amber-500 font-mono text-[10px] tracking-wider uppercase border border-amber-500/20 px-2 py-0.5 rounded-full bg-amber-500/5">
            <AlertCircle className="w-3.5 h-3.5" />
            Active Collision Safety
          </div>
          <p className="text-slate-300 text-xs mt-1.5 max-w-[220px]">
            Click any car to halt it. Trailing cars will cascade-stop and auto-restart sequentially.
          </p>
        </div>

        {/* Global actions */}
        <div className="rounded-2xl border border-white/5 bg-slate-950/60 backdrop-blur-md p-4 flex items-center justify-around">
          {/* Traffic Light Toggle */}
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-1">Gantry Signal</span>
            <button
              onClick={() => {
                audioSynth.playClick();
                setIsLightRed(!isLightRed);
              }}
              className="flex flex-col gap-1.5 p-2 bg-slate-900 border border-white/10 rounded-xl w-10 items-center hover:border-white/20 transition-all shadow-inner"
              title="Click to toggle traffic light"
            >
              {/* Red Light Bulb */}
              <div className={`w-5 h-5 rounded-full border transition-all duration-300 ${
                isLightRed 
                  ? 'bg-red-500 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.85)]' 
                  : 'bg-red-950/40 border-red-900/30'
              }`} />
              {/* Green Light Bulb */}
              <div className={`w-5 h-5 rounded-full border transition-all duration-300 ${
                !isLightRed 
                  ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.85)]' 
                  : 'bg-emerald-950/40 border-emerald-900/30'
              }`} />
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={resetSimulation}
            className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs flex items-center gap-2 tracking-wide transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Loop
          </button>
        </div>
      </div>

      {/* ─── INTERACTIVE ROAD PATH SVG ─── */}
      <div className="relative w-full aspect-[1000/320] rounded-3xl overflow-hidden border border-white/5 bg-slate-950/40 backdrop-blur-sm shadow-inner py-6">
        <svg 
          viewBox="0 0 1000 320" 
          className="w-full h-full select-none"
        >
          {/* Definitions for Gradients and Filters */}
          <defs>
            {/* Soft backdrop radial shadow */}
            <radialGradient id="road-glow" cx="50%" cy="100%" r="95%">
              <stop offset="0%" stopColor="rgba(235, 94, 40, 0.09)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            {/* Glowing neon road color */}
            <linearGradient id="road-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="50%" stopColor="#374151" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>

            {/* Red sports car gradient */}
            <linearGradient id="red-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff4d4d" />
              <stop offset="100%" stopColor="#cc0000" />
            </linearGradient>

            {/* Cyan EV gradient */}
            <linearGradient id="cyan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#4facfe" />
            </linearGradient>

            {/* Yellow taxi gradient */}
            <linearGradient id="yellow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f6d365" />
              <stop offset="100%" stopColor="#fda085" />
            </linearGradient>
            
            {/* Glass glow filter */}
            <filter id="glow-light" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Underlay glow */}
          <rect width="1000" height="320" fill="url(#road-glow)" />

          {/* Curved road reference guide (hidden for computing path length, rendered as styled lanes) */}
          <path
            ref={pathRef}
            d="M 0,270 Q 500,-20 1000,270"
            fill="none"
            stroke="transparent"
            strokeWidth="1"
          />

          {/* Asphalt road base tube */}
          <path
            d="M 0,270 Q 500,-20 1000,270"
            fill="none"
            stroke="url(#road-grad)"
            strokeWidth="78"
            strokeLinecap="round"
            className="shadow-2xl"
          />

          {/* Road inner lane */}
          <path
            d="M 0,270 Q 500,-20 1000,270"
            fill="none"
            stroke="#111827"
            strokeWidth="72"
            strokeLinecap="round"
          />

          {/* White dashed center divider line */}
          <path
            d="M 0,270 Q 500,-20 1000,270"
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="2"
            strokeDasharray="14,16"
            strokeLinecap="round"
          />

          {/* Traffic Light Gantry Graphic */}
          <g transform="translate(755, 120)">
            {/* Pole */}
            <line x1="0" y1="0" x2="0" y2="50" stroke="#4b5563" strokeWidth="5" />
            {/* Signal box */}
            <rect x="-10" y="-30" width="20" height="40" rx="5" fill="#1f2937" stroke="#374151" strokeWidth="2" />
            {/* Light bulb */}
            <circle 
              cx="0" 
              cy={isLightRed ? -20 : -8} 
              r="6" 
              fill={isLightRed ? '#ef4444' : '#10b981'} 
              filter={isLightRed ? 'url(#glow-light)' : ''}
              className="transition-all duration-300"
            />
          </g>

          {/* ─── RENDER CARS INSIDE SVG FOR PERFECT SCALING ─── */}
          {pathLength > 0 && cars.map((car) => {
            const hasIndicator = car.isStopped || car.isBlocked;
            
            return (
              <g 
                key={car.id}
                transform={`translate(${car.x}, ${car.y}) rotate(${car.angle})`}
                className="cursor-pointer group"
                onClick={() => handleCarClick(car.id)}
              >
                {/* Visual click collision pulse indicator */}
                {hasIndicator && (
                  <circle
                    cx="0"
                    cy="0"
                    r="40"
                    fill="none"
                    stroke={car.isStopped ? '#ef4444' : '#f59e0b'}
                    strokeWidth="2"
                    className="animate-ping"
                    style={{ transformOrigin: 'center', animationDuration: '2s' }}
                  />
                )}

                {/* Car Shadow */}
                <rect 
                  x="-34" 
                  y="-16" 
                  width="68" 
                  height="32" 
                  rx="8" 
                  fill="rgba(0,0,0,0.55)" 
                  transform="translate(2, 3)"
                />

                {/* Car main chassis */}
                <rect 
                  x="-32" 
                  y="-14" 
                  width="64" 
                  height="28" 
                  rx="7" 
                  fill={car.color} 
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1.2"
                  className="transition-transform group-hover:scale-[1.03]"
                />

                {/* Windshield / Cab Glass */}
                {car.type === 'sports' ? (
                  <path d="M -16,-10 L 10,-8 L 10,8 L -16,10 Z" fill="#0f172a" opacity="0.85" />
                ) : car.type === 'ev' ? (
                  <path d="M -20,-8 L 14,-6 L 14,6 L -20,8 Z" fill="#0f172a" opacity="0.85" />
                ) : (
                  // Taxi cab block
                  <>
                    <path d="M -18,-8 L 8,-6 L 8,6 L -18,8 Z" fill="#0f172a" opacity="0.85" />
                    {/* Taxi Yellow roof beacon sign */}
                    <rect x="-6" y="-3" width="12" height="6" fill="#000" rx="1" />
                    <rect x="-4" y="-2" width="8" height="4" fill="#ecc94b" />
                  </>
                )}

                {/* Headlights (yellow emissive dots on front nose - right-facing x direction) */}
                <circle cx="30" cy="-9" r="2.4" fill="#fffbeb" />
                <circle cx="30" cy="9" r="2.4" fill="#fffbeb" />

                {/* Taillights (red emissive dots on rear tail) */}
                <circle cx="-31" cy="-8" r="2" fill="#ef4444" />
                <circle cx="-31" cy="8" r="2" fill="#ef4444" />

                {/* Tiny dashboard telemetry label floating above the car */}
                <foreignObject 
                  x="-60" 
                  y="-60" 
                  width="120" 
                  height="40"
                  className="pointer-events-none select-none text-center transform -rotate-0"
                  style={{ transform: `rotate(${-car.angle}deg)`, transformOrigin: 'center' }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    {car.isStopped ? (
                      <span className="px-2 py-0.5 rounded bg-red-500 text-slate-950 font-mono text-[9px] font-bold border border-red-400 animate-bounce leading-none">
                        STOP: {car.stopTimer.toFixed(1)}s
                      </span>
                    ) : car.isBlocked ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono text-[9px] font-bold border border-amber-400 leading-none">
                        COLLISION
                      </span>
                    ) : null}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Curved Arch Road Label */}
      <span className="font-display font-black text-6xl tracking-widest text-[#151922] uppercase absolute bottom-4 select-none pointer-events-none uppercase text-center z-10 animate-pulse">
        Roads
      </span>
    </div>
  );
};
