"use client";

import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VehicleData } from "./VehicleDetailsHUD";

// Stylized Wheels
function Wheels({ wheelsRef, width = 0.8, length = 1.0, wheelRadius = 0.22, wheelThickness = 0.15 }: any) {
  return (
    <group ref={wheelsRef}>
      {/* Front Left */}
      <mesh position={[-width / 2 - wheelThickness / 2, -0.1, length / 2]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Front Right */}
      <mesh position={[width / 2 + wheelThickness / 2, -0.1, length / 2]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Rear Left */}
      <mesh position={[-width / 2 - wheelThickness / 2, -0.1, -length / 2]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Rear Right */}
      <mesh position={[width / 2 + wheelThickness / 2, -0.1, -length / 2]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelThickness, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  );
}

// 3D Vehicle Submodels
function SedanModel({ color, wheelsRef, isHovered }: any) {
  return (
    <group>
      {/* Glow Highlight Ring */}
      {isHovered && (
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.1, 0.8, 1.9]} />
          <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.3} />
        </mesh>
      )}
      {/* Chassis */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.3, 1.7]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.42, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.75, 0.28, 0.95]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Windshields */}
      <mesh position={[0, 0.42, 0.43]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.7, 0.25, 0.05]} />
        <meshStandardMaterial color="#111" roughness={0.1} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.42, -0.53]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.7, 0.25, 0.05]} />
        <meshStandardMaterial color="#111" roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.3, 0.15, 0.85]}>
        <boxGeometry args={[0.12, 0.08, 0.05]} />
        <meshBasicMaterial color="#fffae6" />
      </mesh>
      <mesh position={[0.3, 0.15, 0.85]}>
        <boxGeometry args={[0.12, 0.08, 0.05]} />
        <meshBasicMaterial color="#fffae6" />
      </mesh>
      {/* Taillights */}
      <mesh position={[-0.3, 0.15, -0.85]}>
        <boxGeometry args={[0.12, 0.08, 0.05]} />
        <meshBasicMaterial color="#ff3333" />
      </mesh>
      <mesh position={[0.3, 0.15, -0.85]}>
        <boxGeometry args={[0.12, 0.08, 0.05]} />
        <meshBasicMaterial color="#ff3333" />
      </mesh>
      <Wheels wheelsRef={wheelsRef} width={0.85} length={1.1} />
    </group>
  );
}

function SUVModel({ color, wheelsRef, isHovered }: any) {
  return (
    <group>
      {isHovered && (
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[1.2, 1.0, 2.1]} />
          <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.3} />
        </mesh>
      )}
      {/* Body */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.4, 1.9]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Upper Cabin */}
      <mesh position={[0, 0.52, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.35, 1.25]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.52, 0.53]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.05]} />
        <meshStandardMaterial color="#111" roughness={0.1} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.52, -0.73]}>
        <boxGeometry args={[0.8, 0.3, 0.05]} />
        <meshStandardMaterial color="#111" roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* Front Grille Details */}
      <mesh position={[0, 0.22, 0.96]}>
        <boxGeometry args={[0.6, 0.18, 0.05]} />
        <meshStandardMaterial color="#222" roughness={0.5} />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.35, 0.25, 0.95]}>
        <boxGeometry args={[0.15, 0.1, 0.05]} />
        <meshBasicMaterial color="#fffae6" />
      </mesh>
      <mesh position={[0.35, 0.25, 0.95]}>
        <boxGeometry args={[0.15, 0.1, 0.05]} />
        <meshBasicMaterial color="#fffae6" />
      </mesh>
      {/* Taillights */}
      <mesh position={[-0.35, 0.25, -0.96]}>
        <boxGeometry args={[0.15, 0.1, 0.05]} />
        <meshBasicMaterial color="#ff3333" />
      </mesh>
      <mesh position={[0.35, 0.25, -0.96]}>
        <boxGeometry args={[0.15, 0.1, 0.05]} />
        <meshBasicMaterial color="#ff3333" />
      </mesh>
      <Wheels wheelsRef={wheelsRef} width={0.95} length={1.25} wheelRadius={0.25} />
    </group>
  );
}

function BusModel({ color, wheelsRef, isHovered }: any) {
  return (
    <group>
      {isHovered && (
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.4, 1.3, 4.2]} />
          <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.3} />
        </mesh>
      )}
      {/* Main Bus Body */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.95, 3.9]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Front Windshield */}
      <mesh position={[0, 0.5, 1.96]}>
        <boxGeometry args={[1.1, 0.5, 0.05]} />
        <meshStandardMaterial color="#111" roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* Side Windows */}
      <mesh position={[-0.61, 0.55, 0]}>
        <boxGeometry args={[0.02, 0.3, 3.2]} />
        <meshStandardMaterial color="#111" roughness={0.1} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.61, 0.55, 0]}>
        <boxGeometry args={[0.02, 0.3, 3.2]} />
        <meshStandardMaterial color="#111" roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.45, 0.18, 1.96]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 10]} />
        <meshBasicMaterial color="#fffae6" />
      </mesh>
      <mesh position={[0.45, 0.18, 1.96]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 10]} />
        <meshBasicMaterial color="#fffae6" />
      </mesh>
      <Wheels wheelsRef={wheelsRef} width={1.15} length={2.6} wheelRadius={0.28} />
    </group>
  );
}

function TruckModel({ color, wheelsRef, isHovered }: any) {
  return (
    <group>
      {isHovered && (
        <mesh position={[0, 0.45, 0.15]}>
          <boxGeometry args={[1.4, 1.4, 4.3]} />
          <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.3} />
        </mesh>
      )}
      {/* Driver Cab */}
      <mesh position={[0, 0.4, 1.35]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 0.9, 1.1]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.55, 1.91]}>
        <boxGeometry args={[1.05, 0.4, 0.02]} />
        <meshStandardMaterial color="#111" roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* Cargo Trailer */}
      <mesh position={[0, 0.52, -0.45]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.15, 2.5]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Connection Frame */}
      <mesh position={[0, 0.1, 0.6]}>
        <boxGeometry args={[0.4, 0.12, 1.0]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.45, 0.18, 1.91]}>
        <boxGeometry args={[0.15, 0.1, 0.02]} />
        <meshBasicMaterial color="#fffae6" />
      </mesh>
      <mesh position={[0.45, 0.18, 1.91]}>
        <boxGeometry args={[0.15, 0.1, 0.02]} />
        <meshBasicMaterial color="#fffae6" />
      </mesh>
      <Wheels wheelsRef={wheelsRef} width={1.15} length={2.6} wheelRadius={0.3} />
    </group>
  );
}

function VanModel({ color, wheelsRef, isHovered }: any) {
  return (
    <group>
      {isHovered && (
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[1.15, 1.1, 2.6]} />
          <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.3} />
        </mesh>
      )}
      {/* Van Body */}
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.98, 0.76, 2.3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.48, 1.16]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.88, 0.35, 0.05]} />
        <meshStandardMaterial color="#111" roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* Side Windows */}
      <mesh position={[-0.5, 0.48, 0.3]}>
        <boxGeometry args={[0.02, 0.28, 0.8]} />
        <meshStandardMaterial color="#111" roughness={0.1} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.5, 0.48, 0.3]}>
        <boxGeometry args={[0.02, 0.28, 0.8]} />
        <meshStandardMaterial color="#111" roughness={0.1} transparent opacity={0.8} />
      </mesh>
      <Wheels wheelsRef={wheelsRef} width={0.95} length={1.4} wheelRadius={0.24} />
    </group>
  );
}

function AmbulanceModel({ wheelsRef, isHovered, sirenState }: any) {
  return (
    <group>
      {isHovered && (
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.2, 1.2, 2.7]} />
          <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.3} />
        </mesh>
      )}
      {/* White Body */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.85, 2.4]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Red Decal Stripes */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.02, 0.15, 2.42]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.52, 1.21]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.9, 0.35, 0.05]} />
        <meshStandardMaterial color="#111" roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* Cross Logo */}
      <mesh position={[0.51, 0.35, -0.2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.2, 0.06, 0.01]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0.51, 0.35, -0.2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.06, 0.2, 0.01]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      {/* Sirens */}
      <mesh position={[-0.22, 0.88, 0.8]}>
        <boxGeometry args={[0.15, 0.08, 0.15]} />
        <meshBasicMaterial color={sirenState ? "#ef4444" : "#3b82f6"} />
      </mesh>
      <mesh position={[0.22, 0.88, 0.8]}>
        <boxGeometry args={[0.15, 0.08, 0.15]} />
        <meshBasicMaterial color={sirenState ? "#3b82f6" : "#ef4444"} />
      </mesh>
      <Wheels wheelsRef={wheelsRef} width={0.98} length={1.5} wheelRadius={0.24} />
    </group>
  );
}

// Main Interactive Vehicle Component
interface VehicleWrapperProps {
  vehicle: VehicleData;
  activeStopId: string | null;
  onVehicleClick: (data: VehicleData) => void;
  updateTheta: (id: string, theta: number, speed: number) => void;
  globalSpeedFactors: { [lane: number]: number };
  positionsRef: React.MutableRefObject<Record<string, { lane: number; theta: number }>>;
}

function VehicleWrapper({
  vehicle,
  activeStopId,
  onVehicleClick,
  updateTheta,
  globalSpeedFactors,
  positionsRef,
}: VehicleWrapperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [sirenState, setSirenState] = useState(false);

  // Constants
  const baseSpeed = vehicle.type === "bus" || vehicle.type === "truck" ? 0.007 : 0.012;
  const targetSpeedRef = useRef(baseSpeed);
  const currentSpeedRef = useRef(baseSpeed);
  const thetaRef = useRef(vehicle.theta ?? 0);
  const isCrashedRef = useRef(false);
  const ignoreCollisionRef = useRef(false);

  // Siren Blink (Ambulance only)
  useEffect(() => {
    if (vehicle.type !== "ambulance") return;
    const interval = setInterval(() => {
      setSirenState((prev) => !prev);
    }, 250);
    return () => clearInterval(interval);
  }, [vehicle.type]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // 1. Update shared positions reference for collision detection
    positionsRef.current[vehicle.id] = { lane: vehicle.lane, theta: thetaRef.current };

    // 2. Collision detection
    if (!ignoreCollisionRef.current) {
      let hasCollision = false;
      for (const [id, data] of Object.entries(positionsRef.current)) {
        if (id !== vehicle.id && data.lane === vehicle.lane) {
          let diff = data.theta - thetaRef.current;
          // Normalize angular difference to [-PI, PI]
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;

          // If another vehicle is directly ahead (between 0.05 and 0.4 radians)
          if (diff > 0.05 && diff < 0.4) {
            hasCollision = true;
            break;
          }
        }
      }

      if (hasCollision && !isCrashedRef.current) {
        // Stop the vehicle
        isCrashedRef.current = true;
        
        // Auto-resume after 1 second
        setTimeout(() => {
          isCrashedRef.current = false;
          ignoreCollisionRef.current = true;
          // Ignore collisions for 1.5 seconds so it can pull away or pass through
          setTimeout(() => {
            ignoreCollisionRef.current = false;
          }, 1500);
        }, 1000);
      }
    }

    // 3. Determine target speed
    let target = baseSpeed * (globalSpeedFactors[vehicle.lane] ?? 1);

    if (activeStopId === vehicle.id || isCrashedRef.current) {
      target = 0;
    }

    targetSpeedRef.current = target;

    // Smooth speed transition
    currentSpeedRef.current += (targetSpeedRef.current - currentSpeedRef.current) * 0.1;

    // Update theta angle
    thetaRef.current += currentSpeedRef.current * 60 * delta * 0.2; // frame rate normalization
    if (thetaRef.current > Math.PI * 2) {
      thetaRef.current -= Math.PI * 2;
    }

    // Sync theta back to parent component occasionally
    updateTheta(vehicle.id, thetaRef.current, Math.round(currentSpeedRef.current * 3600));

    // 2. Position Calculation (Polar coordinates)
    const radius = vehicle.radius ?? 10;
    const x = radius * Math.cos(thetaRef.current);
    const z = radius * Math.sin(thetaRef.current);

    // Suspension bouncing
    let bounce = 0;
    if (currentSpeedRef.current > 0.001) {
      const frequency = vehicle.type === "bus" || vehicle.type === "truck" ? 8 : 14;
      const amplitude = vehicle.type === "bus" || vehicle.type === "truck" ? 0.015 : 0.025;
      bounce = Math.sin(state.clock.getElapsedTime() * frequency) * amplitude;
    }

    groupRef.current.position.set(x, bounce, z);

    // Tangent rotation around Y axis
    const angle = -thetaRef.current;
    groupRef.current.rotation.y = angle;

    // 3. Wheel Spin
    if (wheelsRef.current && currentSpeedRef.current > 0.001) {
      wheelsRef.current.children.forEach((wheel: any) => {
        wheel.rotation.x += currentSpeedRef.current * 10;
      });
    }
  });
  const renderModel = () => {
    const props = {
      color: vehicle.color,
      wheelsRef,
      isHovered,
      sirenState,
    };

    switch (vehicle.type) {
      case "sedan":
        return <SedanModel {...props} />;
      case "suv":
        return <SUVModel {...props} />;
      case "bus":
        return <BusModel {...props} />;
      case "truck":
        return <TruckModel {...props} />;
      case "van":
        return <VanModel {...props} />;
      case "ambulance":
        return <AmbulanceModel {...props} />;
      default:
        return <SedanModel {...props} />;
    }
  };

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setIsHovered(false);
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        // Reset crash state and temporarily ignore collisions so the vehicle can break free
        isCrashedRef.current = false;
        ignoreCollisionRef.current = true;
        setTimeout(() => { ignoreCollisionRef.current = false; }, 2000);
        
        onVehicleClick(vehicle);
      }}
    >
      {renderModel()}
    </group>
  );
}

// Parent Group Coordinating All Vehicles
interface VehicleGroupProps {
  onSelectVehicle: (data: VehicleData | null) => void;
}

export default function VehicleGroup({ onSelectVehicle }: VehicleGroupProps) {
  // Hardcoded initial list of diverse vehicles
  const [vehicles, setVehicles] = useState<VehicleData[]>(() => {
    const types = ["sedan", "suv", "bus", "truck", "van", "ambulance"];
    const colors = ["#2563eb", "#dc2626", "#eab308", "#16a34a", "#ea580c", "#ffffff"];
    const impacts: ("LOW" | "MODERATE" | "HIGH" | "CRITICAL")[] = ["LOW", "MODERATE", "HIGH", "CRITICAL"];

    const agentLogs = [
      [
        "Agent 1 (Event Intel): Triggered sports event risk window.",
        "Agent 2 (Traffic Perception): Detected normal speeds, density level MODERATE.",
        "Agent 3 (Congestion): Risk window 17:30 to 20:00. Projected speed 32 km/h.",
        "Agent 4 (Resource): Safe corridor status. No officer dispatch required.",
        "Agent 6 (Synthesis): Standard operational parameters. Continue routing monitoring."
      ],
      [
        "Agent 1 (Event Intel): Moderate risk political rally in Sector 4.",
        "Agent 2 (Traffic Perception): Local queue length 180m. Speed drop to 18 km/h.",
        "Agent 3 (Congestion): Impending bottleneck at stadium link.",
        "Agent 4 (Resource): Alerted Zone B. Dispatch 6 officers with barriers.",
        "Agent 5 (Diversion): Re-routing traffic via SP Ring Road."
      ],
      [
        "Agent 1 (Event Intel): High density festival. 80,000 expected crowd.",
        "Agent 2 (Traffic Perception): Queue: 850m. Density: HIGH. Speed: 9 km/h.",
        "Agent 3 (Congestion): Severe congestion threshold reached on Central Avenue.",
        "Agent 4 (Resource): 24 officers deployed. 15 barricades planned.",
        "Agent 5 (Diversion): Restricting central radius. Advisory SMS dispatched."
      ],
      [
        "Agent 1 (Event Intel): Critical concert event. 120,500 expected attendees.",
        "Agent 2 (Traffic Perception): Queue: 1.4km. Speed: 4 km/h. Gridlock risk.",
        "Agent 3 (Congestion): Major congestion. Outer ring road completely affected.",
        "Agent 4 (Resource): Maximum deployment: 65 officers + 42 barricades.",
        "Agent 5 (Diversion): Complete road closure on Boulevard. Active detour maps."
      ]
    ];

    // Distribute vehicles evenly across 4 lanes matching Road.tsx radii
    const list: VehicleData[] = [];
    const laneRadii = [9.5, 11.2, 12.9, 14.6];
    const vehicleCount = 32; // More vehicles for lively scene

    for (let i = 0; i < vehicleCount; i++) {
      const laneIndex = i % 4;
      const type = types[i % types.length];
      const color = type === "ambulance" ? "#ffffff" : colors[(i * 7 + 3) % colors.length];
      const lane = laneIndex + 1;
      const radius = laneRadii[laneIndex];

      // Stagger angles so they don't spawn on top of each other
      const vehiclesPerLane = Math.ceil(vehicleCount / 4);
      const laneOffset = Math.floor(i / 4);
      const theta = (laneOffset * (Math.PI * 2)) / vehiclesPerLane + (laneIndex * Math.PI) / 5;
      const impact = impacts[i % impacts.length];

      list.push({
        id: `v-${i}`,
        type,
        speed: 40,
        color,
        congestionImpact: impact,
        lane,
        agentAnalysis: agentLogs[i % agentLogs.length],
      });
      // Set precise polar theta
      (list[list.length - 1] as any).radius = radius;
      (list[list.length - 1] as any).theta = theta;
    }

    return list;
  });

  const positionsRef = useRef<Record<string, { lane: number; theta: number }>>({});
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [globalSpeedFactors, setGlobalSpeedFactors] = useState<{ [lane: number]: number }>({
    1: 1.0,
    2: 1.0,
    3: 1.0,
    4: 1.0,
  });

  const updateTheta = (id: string, theta: number, speed: number) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, theta, speed } : v))
    );
  };

  const handleVehicleClick = (clickedVehicle: VehicleData) => {
    setActiveStopId(clickedVehicle.id);
    onSelectVehicle(clickedVehicle);

    // Traffic congestion physics simulation
    // Trailing vehicles in the same lane slow down
    setGlobalSpeedFactors((prev) => ({
      ...prev,
      [clickedVehicle.lane]: 0.15, // dramatically slow down the lane
    }));

    // Reset after exactly 1 second
    setTimeout(() => {
      setActiveStopId(null);
      setGlobalSpeedFactors((prev) => ({
        ...prev,
        [clickedVehicle.lane]: 1.0, // restore speed factor
      }));
    }, 1000);
  };

  return (
    <group>
      {vehicles.map((v) => (
        <VehicleWrapper
          key={v.id}
          vehicle={v}
          activeStopId={activeStopId}
          onVehicleClick={handleVehicleClick}
          updateTheta={updateTheta}
          globalSpeedFactors={globalSpeedFactors}
          positionsRef={positionsRef}
        />
      ))}
    </group>
  );
}
