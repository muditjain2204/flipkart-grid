"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Road from "./Road";
import Environment3D from "./Environment3D";
import VehicleGroup from "./VehicleGroup";
import { VehicleData } from "./VehicleDetailsHUD";

interface ThreeSceneProps {
  onSelectVehicle: (data: VehicleData | null) => void;
}

export default function ThreeScene({ onSelectVehicle }: ThreeSceneProps) {
  return (
    <div className="absolute inset-0 w-full h-full select-none z-10 cursor-move">
      <Canvas
        shadows
        camera={{ position: [0, 15, 45], fov: 40, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "url('/sky-bg.jpg') center bottom / cover no-repeat, linear-gradient(180deg, #1e90ff 0%, #87cefa 50%, #ffffff 100%)" }}
      >
        {/* Bright warm daylight */}
        <ambientLight intensity={2.0} color="#fff8ee" />

        {/* Strong sun from above-right */}
        <directionalLight
          castShadow
          intensity={3.0}
          position={[15, 35, 20]}
          color="#fff5e0"
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-camera-near={0.1}
          shadow-camera-far={80}
          shadow-bias={-0.0003}
        />

        {/* Fill light from the other side */}
        <directionalLight
          intensity={1.0}
          position={[-15, 20, -10]}
          color="#bae6fd"
        />

        {/* Hemisphere: blue sky + green ground bounce */}
        <hemisphereLight args={["#87ceeb", "#4ade80", 0.8]} />

        {/* Fog for depth/atmosphere — matches sky gradient */}
        <fog attach="fog" args={["#a8daf5", 40, 80]} />

        {/* Scene Objects */}
        <Road />
        <Environment3D />
        <VehicleGroup onSelectVehicle={onSelectVehicle} />

        {/* OrbitControls allows user to scroll, pan, and rotate the view freely */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={true} 
          enableRotate={true}
          maxDistance={100}
          minDistance={10}
        />
      </Canvas>
    </div>
  );
}
