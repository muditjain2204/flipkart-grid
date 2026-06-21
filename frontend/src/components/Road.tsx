"use client";

import React from "react";
import * as THREE from "three";

export default function Road() {
  const laneRadii = [9.5, 11.2, 12.9, 14.6];

  // Dashed lane markings around a circle
  const renderDashedLane = (radius: number) => {
    const dashes = 56;
    const items = [];
    for (let i = 0; i < dashes; i++) {
      const angle = (i * (Math.PI * 2)) / dashes;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      items.push(
        <mesh key={i} position={[x, 0.02, z]} rotation={[0, -angle, 0]}>
          <boxGeometry args={[0.06, 0.01, 0.4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>
      );
    }
    return items;
  };

  // Solid edge lines
  const renderSolidEdge = (radius: number) => {
    const segments = 96;
    const items = [];
    for (let i = 0; i < segments; i++) {
      const angle = (i * (Math.PI * 2)) / segments;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      items.push(
        <mesh key={i} position={[x, 0.02, z]} rotation={[0, -angle, 0]}>
          <boxGeometry args={[0.05, 0.01, 0.5]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      );
    }
    return items;
  };

  return (
    <group>
      {/* Main Circular Asphalt Road — lighter grey */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <ringGeometry args={[8.2, 15.8, 80]} />
        <meshStandardMaterial color="#5a6370" roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Slightly darker road surface texture layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
        <ringGeometry args={[8.4, 15.6, 80]} />
        <meshStandardMaterial color="#4b5563" roughness={0.85} metalness={0.02} />
      </mesh>

      {/* Inner Curb */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} castShadow receiveShadow>
        <ringGeometry args={[8.0, 8.3, 80]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.4} />
      </mesh>

      {/* Outer Curb */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} castShadow receiveShadow>
        <ringGeometry args={[15.7, 16.0, 80]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.4} />
      </mesh>

      {/* Solid edge lines */}
      {renderSolidEdge(8.5)}
      {renderSolidEdge(15.5)}

      {/* Lane Separator dashed lines */}
      {renderDashedLane(10.35)}
      {renderDashedLane(12.05)}
      {renderDashedLane(13.75)}

      {/* Center Grass Island */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[7.9, 7.9, 0.06, 64]} />
        <meshStandardMaterial color="#2dd36f" roughness={0.85} />
      </mesh>

      {/* Outer Ground (bright green grass) — sized to not cover sky */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[40, 64]} />
        <meshStandardMaterial color="#22c55e" roughness={0.9} />
      </mesh>

      {/* Center Island "AI Smartflow System" sign */}
      <group position={[0, 0.8, 0]}>
        {/* Pillars */}
        <mesh position={[-1.0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.7, 10]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[1.0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.7, 10]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Board */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[2.6, 0.55, 0.12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.1} />
        </mesh>
        {/* Face of the board */}
        <mesh position={[0, 0.15, 0.065]}>
          <planeGeometry args={[2.4, 0.4]} />
          <meshBasicMaterial color="#1e3a8a" />
        </mesh>
      </group>

      {/* Streetlights on outer perimeter */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
        const angle = (i * (Math.PI * 2)) / 12;
        const radius = 17.0;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Pole */}
            <mesh position={[0, 1.0, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.07, 2.0, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Arm */}
            <mesh position={[0.15, 1.95, 0]} rotation={[0, 0, -Math.PI / 5]}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 6]} />
              <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Light */}
            <mesh position={[0.32, 2.1, 0]}>
              <boxGeometry args={[0.08, 0.2, 0.12]} />
              <meshBasicMaterial color="#fef9c3" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
