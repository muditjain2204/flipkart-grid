"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Lush round-canopy tree (matching reference's dense, round, bright green trees)
function RoundTree({ position, scale = 1.0, seed = 0 }: { position: [number, number, number]; scale?: number; seed?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [isClicked, setIsClicked] = useState(false);
  const swaySpeed = 0.6 + seed * 0.4;
  const swayAmount = 0.012 + seed * 0.008;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() * swaySpeed;
    groupRef.current.rotation.z = Math.sin(t) * swayAmount;
    groupRef.current.rotation.x = Math.cos(t * 0.7) * swayAmount * 0.5;

    if (isClicked) {
      groupRef.current.scale.lerp(new THREE.Vector3(scale * 1.15, scale * 0.85, scale * 1.15), 0.2);
      if (groupRef.current.scale.x > scale * 1.1) setIsClicked(false);
    } else {
      groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  // Vary green shades
  const greens = ["#16a34a", "#15803d", "#22c55e", "#059669", "#166534"];
  const mainGreen = greens[Math.floor(seed * greens.length) % greens.length];
  const lightGreen = greens[Math.floor((seed * 3 + 1) * greens.length) % greens.length];

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        setIsClicked(true);
      }}
      onPointerOver={() => document.body.style.cursor = "pointer"}
      onPointerOut={() => document.body.style.cursor = "default"}
    >
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1.0, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Main canopy sphere — large, lush, round */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.7, 10, 8]} />
        <meshStandardMaterial color={mainGreen} roughness={0.65} flatShading />
      </mesh>
      {/* Top canopy cluster */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial color={lightGreen} roughness={0.6} flatShading />
      </mesh>
      {/* Side clusters for fullness */}
      <mesh position={[-0.35, 1.1, 0.15]} castShadow>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial color={mainGreen} roughness={0.65} flatShading />
      </mesh>
      <mesh position={[0.3, 1.15, -0.2]} castShadow>
        <sphereGeometry args={[0.38, 8, 6]} />
        <meshStandardMaterial color={lightGreen} roughness={0.6} flatShading />
      </mesh>
    </group>
  );
}

// Cloud puff cluster
function Cloud({ position, speed, scale = 1.0 }: { position: [number, number, number]; speed: number; scale?: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (!ref.current) return;
    ref.current.position.x += speed * 10 * delta;
    if (ref.current.position.x > 50) ref.current.position.x = -50;
  });

  return (
    <group ref={ref} position={position} scale={[scale, scale * 0.6, scale]}>
      <mesh>
        <sphereGeometry args={[2.0, 10, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={1.0} flatShading />
      </mesh>
      <mesh position={[-1.6, -0.3, 0.3]}>
        <sphereGeometry args={[1.5, 8, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={1.0} flatShading />
      </mesh>
      <mesh position={[1.7, -0.2, -0.2]}>
        <sphereGeometry args={[1.4, 8, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={1.0} flatShading />
      </mesh>
      <mesh position={[0.4, 0.7, 0]}>
        <sphereGeometry args={[1.2, 8, 6]} />
        <meshStandardMaterial color="#fafafa" roughness={1.0} flatShading />
      </mesh>
      <mesh position={[-0.8, 0.5, -0.3]}>
        <sphereGeometry args={[1.0, 8, 6]} />
        <meshStandardMaterial color="#fafafa" roughness={1.0} flatShading />
      </mesh>
    </group>
  );
}

export default function Environment3D() {
  const [trees] = useState(() => {
    const list: { pos: [number, number, number]; scale: number; seed: number }[] = [];

    // Inner island: dense cluster of trees (radius < 7.5)
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.3;
      const r = 2.5 + Math.random() * 4.5;
      list.push({
        pos: [r * Math.cos(angle), 0.04, r * Math.sin(angle)],
        scale: 0.8 + Math.random() * 0.6,
        seed: Math.random(),
      });
    }

    // Extra inner small trees for density
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + 0.4;
      const r = 1.5 + Math.random() * 2.0;
      list.push({
        pos: [r * Math.cos(angle), 0.04, r * Math.sin(angle)],
        scale: 0.5 + Math.random() * 0.4,
        seed: Math.random(),
      });
    }

    // Outer perimeter: dense ring of trees (radius > 17)
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const r = 17.5 + Math.random() * 5.0;
      list.push({
        pos: [r * Math.cos(angle), 0, r * Math.sin(angle)],
        scale: 1.0 + Math.random() * 0.8,
        seed: Math.random(),
      });
    }

    // Second outer ring for depth
    for (let i = 0; i < 24; i++) {
      const angle = ((i + 0.5) / 24) * Math.PI * 2;
      const r = 22 + Math.random() * 6.0;
      list.push({
        pos: [r * Math.cos(angle), 0, r * Math.sin(angle)],
        scale: 1.2 + Math.random() * 0.8,
        seed: Math.random(),
      });
    }

    return list;
  });

  return (
    <group>
      {/* Clouds — positioned behind scene (negative Z) where sky is visible */}
      <Cloud position={[-20, 12, -35]} speed={0.03} scale={2.5} />
      <Cloud position={[8, 15, -38]} speed={0.02} scale={2.0} />
      <Cloud position={[-35, 11, -30]} speed={0.04} scale={1.8} />
      <Cloud position={[25, 14, -32]} speed={0.025} scale={2.2} />
      <Cloud position={[-10, 16, -42]} speed={0.035} scale={1.9} />
      <Cloud position={[18, 13, -36]} speed={0.03} scale={1.6} />
      <Cloud position={[-28, 14, -28]} speed={0.02} scale={2.0} />
      <Cloud position={[0, 13, -40]} speed={0.015} scale={2.8} />
      <Cloud position={[35, 12, -34]} speed={0.028} scale={1.7} />
      <Cloud position={[-15, 15, -45]} speed={0.018} scale={2.3} />

      {/* Lush round trees */}
      {trees.map((t, idx) => (
        <RoundTree key={idx} position={t.pos} scale={t.scale} seed={t.seed} />
      ))}
    </group>
  );
}
