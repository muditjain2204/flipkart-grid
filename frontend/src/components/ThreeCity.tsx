'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore, RoadTelemetry } from '../store/useStore';

// ─── TYPES & INTERFACES ───
interface BuildingData {
  id: string;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: string;
  flickerSpeed: number;
}

interface ParticleFlow {
  t: number; // progress (0 to 1)
  speed: number;
}

interface VehicleSim {
  id: string;
  type: 'sedan' | 'suv' | 'taxi' | 'bus' | 'truck';
  color: string;
  t: number;
  speed: number;
  maxSpeed: number;
  roadIndex: number;
  width: number;
  length: number;
  height: number;
}

// ─── DEFINE ROAD SPLINE PATHS (SPLINES) ───
// We build 4 distinct road splines that trace our network:
// Road 0: North-South Avenue (straight corridor)
// Road 1: East-West Avenue (straight corridor)
// Road 2: Roundabout Circle (centered)
// Road 3: Elevated Diagonal Highway (flyover arching in Z/Y height)
const createRoadCurves = () => {
  const curves = [
    // Curve 0: North-South
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-45, 0.1, -250),
      new THREE.Vector3(-45, 0.1, -60),
      new THREE.Vector3(-45, 0.1, 60),
      new THREE.Vector3(-45, 0.1, 250),
    ], true),

    // Curve 1: East-West
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-250, 0.1, -45),
      new THREE.Vector3(-60, 0.1, -45),
      new THREE.Vector3(60, 0.1, -45),
      new THREE.Vector3(250, 0.1, -45),
    ], true),

    // Curve 2: Roundabout Circular Loop
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(45, 0.15, 0),
      new THREE.Vector3(31.8, 0.15, 31.8),
      new THREE.Vector3(0, 0.15, 45),
      new THREE.Vector3(-31.8, 0.15, 31.8),
      new THREE.Vector3(-45, 0.15, 0),
      new THREE.Vector3(-31.8, 0.15, -31.8),
      new THREE.Vector3(0, 0.15, -45),
      new THREE.Vector3(31.8, 0.15, -31.8),
    ], true),

    // Curve 3: Elevated Flyover (arches in Y axis up to height 25)
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-220, 0.2, 100),
      new THREE.Vector3(-100, 10, 60),
      new THREE.Vector3(0, 24, 0),
      new THREE.Vector3(100, 10, -60),
      new THREE.Vector3(220, 0.2, -100),
    ], false),
  ];
  return curves;
};

// Road Details metadata mapping
const ROADS_METADATA: Record<number, Omit<RoadTelemetry, 'id'>> = {
  0: { name: 'Queens Avenue (North-South)', congestion: 38, vehiclesCount: 12, avgSpeed: 44, predictedJamTime: 'None', etaToCongestion: 'Normal Flow', status: 'green' },
  1: { name: 'MG Road Expressway (East-West)', congestion: 68, vehiclesCount: 24, avgSpeed: 18, predictedJamTime: '18 min', etaToCongestion: '28 min', status: 'yellow' },
  2: { name: 'Central Circle Roundabout', congestion: 89, vehiclesCount: 38, avgSpeed: 9, predictedJamTime: '6 min', etaToCongestion: '12 min', status: 'red' },
  3: { name: 'Outer Ring Flyover (Elevated Highway)', congestion: 18, vehiclesCount: 6, avgSpeed: 68, predictedJamTime: 'None', etaToCongestion: 'Smooth Flow', status: 'green' },
};

// ─── SUB-COMPONENT: PROCEDURAL BUILDINGS ───
const ProceduralCity: React.FC = () => {
  const buildings = useMemo(() => {
    const list: BuildingData[] = [];
    const gridSpacing = 40;
    const count = 7; // Grid size

    for (let x = -count; x <= count; x++) {
      for (let z = -count; z <= count; z++) {
        // Compute coordinates
        const posX = x * gridSpacing + (Math.random() - 0.5) * 8;
        const posZ = z * gridSpacing + (Math.random() - 0.5) * 8;

        // Skip buildings that overlap with center roundabout and road coordinates
        const distFromCenter = Math.sqrt(posX * posX + posZ * posZ);
        if (distFromCenter < 65) continue;
        
        // Skip roads (main streets)
        if (Math.abs(posX - (-45)) < 24) continue;
        if (Math.abs(posZ - (-45)) < 24) continue;

        // Random height types
        const rand = Math.random();
        let h = 18 + Math.random() * 20; // default medium office
        let w = 12 + Math.random() * 6;
        let d = 12 + Math.random() * 6;
        let typeColor = '#0e1622'; // deep slate/grey

        if (rand < 0.12) {
          // Skyscraper
          h = 75 + Math.random() * 65;
          w = 18 + Math.random() * 8;
          d = 18 + Math.random() * 8;
          typeColor = '#090e18';
        } else if (rand < 0.35) {
          // Small residence
          h = 8 + Math.random() * 8;
          w = 8 + Math.random() * 4;
          d = 8 + Math.random() * 4;
          typeColor = '#121824';
        }

        list.push({
          id: `build-${x}-${z}`,
          x: posX,
          z: posZ,
          w,
          d,
          h,
          color: typeColor,
          flickerSpeed: 0.2 + Math.random() * 0.8
        });
      }
    }
    return list;
  }, []);

  return (
    <group>
      {buildings.map((b) => (
        <group key={b.id} position={[b.x, b.h / 2, b.z]}>
          {/* Building Structural Box */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial 
              color={b.color} 
              roughness={0.6}
              metalness={0.8}
            />
          </mesh>

          {/* Emissive window grids */}
          {b.h > 15 && (
            <mesh position={[0, 0, b.d / 2 + 0.1]}>
              <planeGeometry args={[b.w * 0.8, b.h * 0.8]} />
              <meshStandardMaterial
                color="#030712"
                emissive="#00baff"
                emissiveIntensity={0.25}
                transparent
                opacity={0.7}
                roughness={0.1}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

// ─── SUB-COMPONENT: ROAD PATHS & FLOWING NEON PARTICLES ───
interface RoadMeshProps {
  curves: THREE.CatmullRomCurve3[];
  hoveredRoad: number | null;
  setHoveredRoad: (idx: number | null) => void;
  onRoadClick: (idx: number) => void;
}

const RoadNetwork: React.FC<RoadMeshProps> = ({
  curves,
  hoveredRoad,
  setHoveredRoad,
  onRoadClick
}) => {
  const selectedRoad = useStore((state) => state.selectedRoad);
  const selectedRoadIndex = selectedRoad ? parseInt(selectedRoad.id) : null;

  // Road geometry parameters
  const roadWidth = 9;

  return (
    <group>
      {curves.map((curve, idx) => {
        // Determine road glow color based on road index status
        const meta = ROADS_METADATA[idx];
        let color = '#2d3748';
        let opacity = 0.55;

        // Custom highlight
        const isHovered = hoveredRoad === idx;
        const isSelected = selectedRoadIndex === idx;

        if (isSelected) {
          color = meta.status === 'red' ? '#ff3b30' : meta.status === 'yellow' ? '#ffaa00' : '#00ff88';
          opacity = 0.95;
        } else if (isHovered) {
          color = '#00baff';
          opacity = 0.8;
        }

        // Draw flat road lane
        
        return (
          <group key={idx}>
            {/* Clickable Hover/Highlight Road Tube */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onRoadClick(idx);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredRoad(idx);
              }}
              onPointerOut={() => setHoveredRoad(null)}
            >
              <tubeGeometry args={[curve, 80, roadWidth / 2, 8, false]} />
              <meshBasicMaterial 
                color={color} 
                transparent 
                opacity={opacity * 0.4}
                wireframe={false}
              />
            </mesh>
            
            {/* Visual dashed divider overlay */}
            <mesh>
              <tubeGeometry args={[curve, 80, 0.1, 4, false]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
            </mesh>
          </group>
        );
      })}

      {/* RENDER EMBEDDED TRAFFIC LIGHT STANDS IN 3D */}
      <SignalLightsStand />
    </group>
  );
};

// ─── 3D SIGNAL STANDS ───
const SignalLightsStand: React.FC = () => {
  const storeSignals = useStore((state) => state.signals);
  const toggleSignal = useStore((state) => state.toggleSignal);

  // 4 main signal poles near junctions
  const signalPoles = [
    { id: 'S1', x: -60, z: -45, state: storeSignals.S1.state },
    { id: 'S2', x: -45, z: 60, state: storeSignals.S2.state },
    { id: 'S3', x: 60, z: -45, state: storeSignals.S3.state },
    { id: 'S4', x: -45, z: -60, state: storeSignals.S4.state },
  ];

  return (
    <group>
      {signalPoles.map((sp) => (
        <group key={sp.id} position={[sp.x, 0, sp.z]}>
          {/* Main vertical pole */}
          <mesh castShadow>
            <cylinderGeometry args={[0.5, 0.7, 18, 8]} />
            <meshStandardMaterial color="#2d3748" metalness={0.7} />
          </mesh>

          {/* Glowing indicator mesh sphere */}
          <mesh 
            position={[0, 9.5, 0]}
            onClick={(e) => {
              e.stopPropagation();
              toggleSignal(sp.id);
            }}
          >
            <sphereGeometry args={[2.2, 16, 16]} />
            <meshStandardMaterial
              color={sp.state === 'GREEN' ? '#00ff88' : '#ff3b30'}
              emissive={sp.state === 'GREEN' ? '#00ff88' : '#ff3b30'}
              emissiveIntensity={1.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ─── SUB-COMPONENT: DYNAMIC VEHICLE INSTANCES & FLOW PARTICLES ───
interface VehicleGroupProps {
  curves: THREE.CatmullRomCurve3[];
}

const ActiveVehicles: React.FC<VehicleGroupProps> = ({ curves }) => {
  const signals = useStore((state) => state.signals);
  const emergencyActive = useStore((state) => state.emergencyActive);
  const simulationPlaying = useStore((state) => state.simulationPlaying);

  // Allocate 18 vehicles at start
  const [vehicles, setVehicles] = useState<VehicleSim[]>(() => {
    const list: VehicleSim[] = [];
    const types: VehicleSim['type'][] = ['sedan', 'suv', 'taxi', 'bus', 'truck'];
    const colors = ['#00baff', '#8b949e', '#ecc94b', '#aa3bff', '#ffaa00'];

    for (let i = 0; i < 28; i++) {
      const roadIndex = i % 4; // distribute across roads
      const t = (i * 0.12) % 1.0;
      const type = types[i % types.length];
      
      let width = 2.0;
      let length = 4.0;
      let height = 1.8;

      if (type === 'bus') {
        width = 2.4; length = 7.5; height = 2.8;
      } else if (type === 'truck') {
        width = 2.6; length = 6.5; height = 2.8;
      }

      list.push({
        id: `v-${i}`,
        type,
        color: type === 'taxi' ? '#ecc94b' : colors[i % colors.length],
        t,
        speed: 0.05 + Math.random() * 0.04,
        maxSpeed: 0.06 + Math.random() * 0.04,
        roadIndex,
        width,
        length,
        height
      });
    }
    return list;
  });

  // Track particle streams
  const [flowParticles, setFlowParticles] = useState<ParticleFlow[]>(() => {
    const list: ParticleFlow[] = [];
    for (let i = 0; i < 48; i++) {
      list.push({
        t: (i * 0.08) % 1.0,
        speed: 0.08,
      });
    }
    return list;
  });

  // Simulation Render update loop
  useFrame((state, delta) => {
    if (!simulationPlaying) return;
    
    // 1. Update vehicle positions and collision queues
    setVehicles((prev) => {
      return prev.map((v) => {
        let targetSpeed = v.maxSpeed;

        // Respect traffic lights at intersection stop lines
        // Stop point progress is roughly at t ~ 0.40 on road splines
        const isRedSignal = 
          (v.roadIndex === 0 && signals.S2.state === 'RED') || // N-S signal
          (v.roadIndex === 1 && signals.S1.state === 'RED');   // E-W signal

        const stopProgress = 0.38;

        if (isRedSignal && v.t < stopProgress && (stopProgress - v.t) < 0.12) {
          // Slow down and stop at stop line
          targetSpeed = 0;
        }

        // Emergency corridor clearance logic: if emergency is active, ambulance corridor clears out
        if (emergencyActive && v.roadIndex === 0) {
          targetSpeed = v.maxSpeed * 1.5; // clear out quickly
        }

        // Collision safety: check vehicle in front
        // Query vehicles on the same road index
        const leadVehicles = prev.filter(
          (other) => other.id !== v.id && other.roadIndex === v.roadIndex
        );

        leadVehicles.forEach((lead) => {
          // Check if lead vehicle is ahead and within safe headway buffer
          let diff = lead.t - v.t;
          if (diff < 0) diff += 1.0; // handle loop wrapping

          const safeGap = v.type === 'bus' || v.type === 'truck' ? 0.09 : 0.06;
          if (diff < safeGap && diff > 0.001) {
            targetSpeed = Math.min(targetSpeed, lead.speed * 0.8);
            if (diff < 0.025) {
              targetSpeed = 0; // complete stop
            }
          }
        });

        // Accelerate/Brake physics
        let speed = v.speed;
        if (speed < targetSpeed) {
          speed += 0.35 * delta;
        } else if (speed > targetSpeed) {
          speed -= 0.7 * delta;
        }
        if (speed < 0) speed = 0;

        // Advance progress
        let t = v.t + speed * delta;
        if (t >= 1.0) t = 0.0;

        return { ...v, t, speed };
      });
    });

    // 2. Update flowing particles streams
    setFlowParticles((prev) => {
      return prev.map((p) => {
        let t = p.t + p.speed * delta;
        if (t >= 1.0) t = 0.0;
        return { ...p, t };
      });
    });
  });

  return (
    <group>
      {/* RENDER SIMULATED VEHICLES */}
      {vehicles.map((v, idx) => {
        const curve = curves[v.roadIndex];
        const pos = curve.getPointAt(v.t);
        const tangent = curve.getTangentAt(v.t);

        // Compute rotation angle to face direction of road
        const angle = Math.atan2(-tangent.z, tangent.x);

        // Emergency vehicle flashing lights
        const isEmergency = emergencyActive && v.roadIndex === 0 && idx === 0;
        const color = isEmergency ? '#ffffff' : v.color;

        // Calculate height offsets for compound low-poly models
        const chassisHeight = v.height * 0.45;
        const cabinHeight = v.height * 0.55;
        const totalHeightOffset = chassisHeight / 2 + 0.15; // Raised slightly above wheels/road

        return (
          <group 
            key={v.id} 
            position={[pos.x, pos.y + totalHeightOffset, pos.z]}
            rotation={[0, angle, 0]}
          >
            {/* 1. Main Chassis (Base body) */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[v.length, chassisHeight, v.width]} />
              <meshStandardMaterial 
                color={color} 
                roughness={0.2}
                metalness={0.7}
              />
            </mesh>

            {/* 2. Cabin depending on vehicle type */}
            {v.type === 'sedan' || v.type === 'taxi' ? (
              <mesh castShadow position={[-v.length * 0.05, chassisHeight * 0.9, 0]}>
                <boxGeometry args={[v.length * 0.5, cabinHeight, v.width * 0.85]} />
                <meshStandardMaterial color="#0d1117" roughness={0.1} metalness={0.8} />
              </mesh>
            ) : v.type === 'suv' ? (
              <mesh castShadow position={[-v.length * 0.1, chassisHeight * 0.9, 0]}>
                <boxGeometry args={[v.length * 0.65, cabinHeight * 1.1, v.width * 0.9]} />
                <meshStandardMaterial color="#0d1117" roughness={0.1} metalness={0.8} />
              </mesh>
            ) : v.type === 'bus' ? (
              <mesh castShadow position={[0, chassisHeight * 0.9, 0]}>
                <boxGeometry args={[v.length * 0.95, cabinHeight * 1.2, v.width * 0.95]} />
                <meshStandardMaterial color="#0d1117" roughness={0.1} metalness={0.8} />
              </mesh>
            ) : v.type === 'truck' ? (
              <>
                {/* Cab */}
                <mesh castShadow position={[v.length * 0.3, chassisHeight * 0.9, 0]}>
                  <boxGeometry args={[v.length * 0.35, cabinHeight * 1.2, v.width * 0.9]} />
                  <meshStandardMaterial color="#0d1117" roughness={0.1} metalness={0.8} />
                </mesh>
                {/* Cargo Container */}
                <mesh castShadow position={[-v.length * 0.18, chassisHeight * 1.0, 0]}>
                  <boxGeometry args={[v.length * 0.62, cabinHeight * 1.5, v.width * 0.95]} />
                  <meshStandardMaterial color="#e2e8f0" roughness={0.6} metalness={0.4} />
                </mesh>
              </>
            ) : null}

            {/* Taxi sign (if taxi) */}
            {v.type === 'taxi' && (
              <mesh position={[-v.length * 0.05, chassisHeight + cabinHeight * 0.9, 0]}>
                <boxGeometry args={[0.8, 0.4, v.width * 0.35]} />
                <meshBasicMaterial color="#ecc94b" />
              </mesh>
            )}

            {/* 3. Wheels (4 cylinders) */}
            {/* Front Left */}
            <mesh position={[v.length * 0.25, -chassisHeight * 0.5, v.width * 0.46]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[v.height * 0.22, v.height * 0.22, 0.4, 12]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
            {/* Front Right */}
            <mesh position={[v.length * 0.25, -chassisHeight * 0.5, -v.width * 0.46]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[v.height * 0.22, v.height * 0.22, 0.4, 12]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
            {/* Rear Left */}
            <mesh position={[-v.length * 0.25, -chassisHeight * 0.5, v.width * 0.46]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[v.height * 0.22, v.height * 0.22, 0.4, 12]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
            {/* Rear Right */}
            <mesh position={[-v.length * 0.25, -chassisHeight * 0.5, -v.width * 0.46]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[v.height * 0.22, v.height * 0.22, 0.4, 12]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>

            {/* 4. Headlights (Two glowing yellow-white spheres in front) */}
            <mesh position={[v.length * 0.5, -chassisHeight * 0.05, v.width * 0.32]}>
              <sphereGeometry args={[0.22, 8, 8]} />
              <meshStandardMaterial color="#fffbe6" emissive="#fffaee" emissiveIntensity={3} />
            </mesh>
            <mesh position={[v.length * 0.5, -chassisHeight * 0.05, -v.width * 0.32]}>
              <sphereGeometry args={[0.22, 8, 8]} />
              <meshStandardMaterial color="#fffbe6" emissive="#fffaee" emissiveIntensity={3} />
            </mesh>

            {/* 5. Taillights (Two glowing red spheres in rear) */}
            <mesh position={[-v.length * 0.5, -chassisHeight * 0.05, v.width * 0.32]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial color="#ff3333" emissive="#ff0000" emissiveIntensity={3} />
            </mesh>
            <mesh position={[-v.length * 0.5, -chassisHeight * 0.05, -v.width * 0.32]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial color="#ff3333" emissive="#ff0000" emissiveIntensity={3} />
            </mesh>

            {/* Glowing ambulance beacons (if emergency) */}
            {isEmergency && (
              <mesh position={[0, chassisHeight + cabinHeight * 0.85, 0]}>
                <boxGeometry args={[1.2, 0.4, 0.6]} />
                <meshBasicMaterial color={Math.floor(Date.now() / 200) % 2 === 0 ? '#ff3b30' : '#00baff'} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* RENDER ROAD GLOW FLOW PARTICLES */}
      {flowParticles.map((p, idx) => {
        // Distribute particles across the 4 curves
        const roadIdx = idx % 4;
        const curve = curves[roadIdx];
        const pos = curve.getPointAt(p.t);
        
        // Match particle color to road congestion status
        const status = ROADS_METADATA[roadIdx].status;
        const pColor = status === 'red' ? '#ff3b30' : status === 'yellow' ? '#ffaa00' : '#00ff88';

        return (
          <mesh key={`p-${idx}`} position={[pos.x, pos.y + 0.3, pos.z]}>
            <boxGeometry args={[1.5, 0.4, 1.5]} />
            <meshBasicMaterial 
              color={pColor} 
              transparent 
              opacity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ─── SUB-COMPONENT: INTERSECTION RADAR ALERT AND FLOATING MAP PIN ───
const JunctionAlert: React.FC = () => {
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const ringRef3 = useRef<THREE.Mesh>(null);
  const pinRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    
    // Float and rotate pin
    if (pinRef.current) {
      pinRef.current.position.y = 8 + Math.sin(elapsed * 2.5) * 1.2;
      pinRef.current.rotation.y = elapsed * 1.5;
    }

    // Concentric pulsing rings
    if (ringRef1.current) {
      const progress = (elapsed * 0.5) % 1.0;
      ringRef1.current.scale.setScalar(5 + progress * 28);
      const mat = ringRef1.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = (1 - progress) * 0.7;
    }
    if (ringRef2.current) {
      const progress = (elapsed * 0.5 + 0.33) % 1.0;
      ringRef2.current.scale.setScalar(5 + progress * 28);
      const mat = ringRef2.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = (1 - progress) * 0.7;
    }
    if (ringRef3.current) {
      const progress = (elapsed * 0.5 + 0.66) % 1.0;
      ringRef3.current.scale.setScalar(5 + progress * 28);
      const mat = ringRef3.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = (1 - progress) * 0.7;
    }
  });

  return (
    <group position={[-45, 0.15, -45]}>
      {/* Dynamic Concentric Rings */}
      <mesh ref={ringRef1} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.05, 32]} />
        <meshBasicMaterial color="#ff3b30" transparent opacity={0.7} />
      </mesh>
      <mesh ref={ringRef2} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.05, 32]} />
        <meshBasicMaterial color="#ff3b30" transparent opacity={0.7} />
      </mesh>
      <mesh ref={ringRef3} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.05, 32]} />
        <meshBasicMaterial color="#ff3b30" transparent opacity={0.7} />
      </mesh>

      {/* Floating 3D Map Pin */}
      <group ref={pinRef}>
        {/* Needle Pin Shaft */}
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.15, 6, 8]} />
          <meshStandardMaterial color="#ff3b30" roughness={0.1} metalness={0.9} />
        </mesh>
        {/* Floating Cone Head (Pointing Down) */}
        <mesh position={[0, 4.2, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[1.8, 3.2, 16]} />
          <meshStandardMaterial 
            color="#ff3b30" 
            emissive="#ff1100" 
            emissiveIntensity={2.5} 
            roughness={0.1} 
            metalness={0.9} 
          />
        </mesh>
        {/* Glowing warning core sphere */}
        <mesh position={[0, 4.2, 0]}>
          <sphereGeometry args={[0.65, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
};

// ─── SUB-COMPONENT: FLOATING ROAD HUD Badges ───
const RoadTooltips: React.FC = () => {
  const selectedRoad = useStore((state) => state.selectedRoad);
  const selectedRoadIndex = selectedRoad ? parseInt(selectedRoad.id) : null;

  const tooltipPoints = [
    { idx: 0, name: 'Queens Ave', pos: [-45, 14, 80], status: 'green', label: 'Smooth' },
    { idx: 1, name: 'MG Road', pos: [110, 14, -45], status: 'yellow', label: 'Moderate' },
    { idx: 2, name: 'Central Circle', pos: [0, 14, 55], status: 'red', label: 'Heavy' },
    { idx: 3, name: 'Outer Ring Flyover', pos: [40, 30, -25], status: 'green', label: 'Smooth' },
  ];

  return (
    <group>
      {tooltipPoints.map((tp) => {
        const isSelected = selectedRoadIndex === tp.idx;
        const colorClass = 
          tp.status === 'red' 
            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
            : tp.status === 'yellow' 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';

        return (
          <Html 
            key={tp.idx} 
            position={[tp.pos[0], tp.pos[1], tp.pos[2]]}
            center
            distanceFactor={90}
          >
            <div className={`px-4 py-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-white/10 text-white font-sans text-xs shadow-2xl flex flex-col gap-1 min-w-[125px] transition-all pointer-events-none select-none ${
              isSelected ? 'scale-105 border-cyan-500/50 shadow-[0_0_15px_rgba(0,186,255,0.25)]' : ''
            }`}>
              <span className="font-bold tracking-tight text-[11px] text-slate-200">{tp.name}</span>
              <span className={`inline-block self-start px-2 py-0.5 rounded-full text-[9px] font-mono border ${colorClass}`}>
                {tp.label}
              </span>
            </div>
          </Html>
        );
      })}
    </group>
  );
};

// ─── MAIN COMPONENT CANVAS WRAPPER ───
export const ThreeCity: React.FC = () => {
  const curves = useMemo(() => createRoadCurves(), []);
  const [hoveredRoad, setHoveredRoad] = useState<number | null>(null);
  
  const setSelectedRoad = useStore((state) => state.setSelectedRoad);
  const updateTelemetry = useStore((state) => state.updateTelemetry);

  // Sync state intervals to trigger visual updates
  useEffect(() => {
    const timer = setInterval(() => {
      updateTelemetry();
    }, 2000);
    return () => clearInterval(timer);
  }, [updateTelemetry]);

  const handleRoadClick = (idx: number) => {
    const meta = ROADS_METADATA[idx];
    setSelectedRoad({
      id: idx.toString(),
      name: meta.name,
      congestion: meta.congestion,
      vehiclesCount: meta.vehiclesCount,
      avgSpeed: meta.avgSpeed,
      predictedJamTime: meta.predictedJamTime,
      etaToCongestion: meta.etaToCongestion,
      status: meta.status as 'green' | 'yellow' | 'red',
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
      <Canvas shadows>
        {/* Twilight slate-blue night sky */}
        <color attach="background" args={['#0a0f18']} />
        
        {/* Soft Cyberpunk Fog */}
        <fog attach="fog" args={['#0a0f18', 120, 280]} />

        {/* Isometric aerial camera positioning */}
        <PerspectiveCamera
          makeDefault
          position={[-120, 110, 150]}
          fov={38}
          near={10}
          far={1000}
        />

        {/* Controls - Orbit with inertia and underground lock limits */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          maxPolarAngle={Math.PI / 2.1} // locks camera above ground level
          minDistance={35}
          maxDistance={350}
        />

        {/* Twilight Hemisphere sky bounce lighting */}
        <hemisphereLight color="#14213d" groundColor="#050914" intensity={0.7} />

        {/* Ambient base lighting */}
        <ambientLight intensity={0.25} color="#161f30" />

        {/* Localized warm light cast by intersection alert gantry */}
        <pointLight position={[-45, 1.2, -45]} intensity={18} distance={80} color="#ff6200" decay={1.5} />

        {/* Low angle moonlight casting shadows */}
        <directionalLight
          castShadow
          position={[-80, 120, 60]}
          intensity={0.55}
          color="#c0d6f2"
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={10}
          shadow-camera-far={400}
          shadow-camera-left={-150}
          shadow-camera-right={150}
          shadow-camera-top={150}
          shadow-camera-bottom={-150}
        />

        {/* Ground grid floor plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
          <planeGeometry args={[600, 600]} />
          <meshStandardMaterial 
            color="#07090e" 
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
        
        {/* Procedural grid lines visual */}
        <gridHelper 
          args={[600, 50, '#101726', '#090d16']} 
          position={[0, 0.05, 0]} 
        />

        {/* City buildings */}
        <ProceduralCity />

        {/* Road layout & signal lights */}
        <RoadNetwork 
          curves={curves}
          hoveredRoad={hoveredRoad}
          setHoveredRoad={setHoveredRoad}
          onRoadClick={handleRoadClick}
        />

        {/* Floating status tooltips */}
        <RoadTooltips />

        {/* Concentric rings & Warning map pin alert at central intersection */}
        <JunctionAlert />

        {/* Animated Vehicles and neon particle flow */}
        <ActiveVehicles curves={curves} />
      </Canvas>
    </div>
  );
};
