"use client";
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

type RobotState = "idle" | "listening" | "speaking" | "alert";

const getColors = (state: RobotState) => {
  if (state === "alert") return { primary: "#FF3B30", glow: "#FF6961" };
  if (state === "speaking") return { primary: "#AF52DE", glow: "#D7B8F3" };
  if (state === "listening") return { primary: "#0071E3", glow: "#66A3FF" };
  return { primary: "#0071E3", glow: "#99C2FF" };
};

function RobotStructure({ state }: { state: RobotState }) {
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const chestGlow = useRef<THREE.Mesh>(null);
  const eyesGroup = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const mouthGeom = useRef<THREE.CapsuleGeometry>(null);

  const colors = getColors(state);

  // Materials
  const whiteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.1, metalness: 0.1 }), []);
  const blueMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0071E3", roughness: 0.2, metalness: 0.2 }), []);
  const screenMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#020617", roughness: 0.4, metalness: 0.8 }), []);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Arm animation
    if (leftArm.current) {
      if (state === "speaking") {
        leftArm.current.rotation.z = Math.sin(t * 10) * 0.3 - 0.5; // waving fast
      } else {
        leftArm.current.rotation.z = Math.sin(t * 2) * 0.2 - 0.4; // waving slow
      }
    }
    if (rightArm.current) {
      rightArm.current.rotation.z = Math.sin(t * 1.5 + 1) * 0.1 + 0.4;
    }

    // Chest pulse
    if (chestGlow.current) {
      const scale = state === "listening" ? 1 + Math.sin(t * 5) * 0.3 : 1 + Math.sin(t * 2) * 0.05;
      chestGlow.current.scale.set(scale, scale, scale);
    }
    
    // Eyes blink
    if (eyesGroup.current) {
      const blink = Math.sin(t * 4) > 0.95 ? 0.1 : 1;
      eyesGroup.current.scale.y = blink;
    }
    
    // Mouth speak
    if (mouth.current && state === "speaking") {
      mouth.current.scale.x = 1 + Math.abs(Math.sin(t * 15)) * 1.5;
      mouth.current.scale.y = 1 + Math.abs(Math.sin(t * 15)) * 0.5;
    } else if (mouth.current) {
      mouth.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group dispose={null}>
      <Float speed={state === "alert" ? 8 : 2} rotationIntensity={0.2} floatIntensity={0.5}>
        
        {/* --- HEAD --- */}
        <group position={[0, 0.8, 0]}>
          {/* Main Head Box */}
          <RoundedBox args={[2.2, 1.4, 1.4]} radius={0.4} smoothness={4} material={whiteMat} />
          
          {/* Screen */}
          <RoundedBox position={[0, 0, 0.65]} args={[1.7, 0.9, 0.2]} radius={0.15} smoothness={4} material={screenMat} />
          
          {/* Eyes Group */}
          <group ref={eyesGroup} position={[0, 0.1, 0.76]}>
            {state === "alert" ? (
              <>
                <mesh position={[-0.35, 0, 0]} rotation={[0, 0, -0.3]}>
                  <boxGeometry args={[0.4, 0.08, 0.05]} />
                  <meshBasicMaterial color={colors.glow} />
                </mesh>
                <mesh position={[0.35, 0, 0]} rotation={[0, 0, 0.3]}>
                  <boxGeometry args={[0.4, 0.08, 0.05]} />
                  <meshBasicMaterial color={colors.glow} />
                </mesh>
              </>
            ) : (
              <>
                {/* Curved happy eyes using Torus segments */}
                <mesh position={[-0.35, -0.05, 0]} rotation={[0, 0, 0]}>
                  <torusGeometry args={[0.15, 0.04, 8, 24, Math.PI]} />
                  <meshBasicMaterial color={colors.glow} />
                </mesh>
                <mesh position={[0.35, -0.05, 0]} rotation={[0, 0, 0]}>
                  <torusGeometry args={[0.15, 0.04, 8, 24, Math.PI]} />
                  <meshBasicMaterial color={colors.glow} />
                </mesh>
              </>
            )}
          </group>

          {/* Mouth */}
          <mesh ref={mouth} position={[0, -0.2, 0.76]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry ref={mouthGeom} args={[0.03, state === "alert" ? 0.3 : 0.1, 4, 8]} />
            <meshBasicMaterial color={colors.glow} />
          </mesh>
          
          {/* Ears */}
          <RoundedBox position={[-1.2, 0, 0]} args={[0.3, 0.6, 0.5]} radius={0.1} material={blueMat} />
          <RoundedBox position={[1.2, 0, 0]} args={[0.3, 0.6, 0.5]} radius={0.1} material={blueMat} />
          
          {/* Antennae */}
          <mesh position={[-0.8, 0.9, 0]} rotation={[0, 0, 0.3]}>
            <capsuleGeometry args={[0.06, 0.4, 8, 8]} />
            <meshStandardMaterial color={colors.primary} />
          </mesh>
          <mesh position={[0.8, 0.9, 0]} rotation={[0, 0, -0.3]}>
            <capsuleGeometry args={[0.06, 0.4, 8, 8]} />
            <meshStandardMaterial color={colors.primary} />
          </mesh>
        </group>

        {/* --- BODY --- */}
        <group position={[0, -0.8, 0]}>
          {/* Upper Body (Blue) */}
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.9, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={colors.primary} roughness={0.3} metalness={0.2} />
          </mesh>
          
          {/* Lower Body (White Bowl) */}
          <mesh position={[0, 0.4, 0]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.9, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
          </mesh>
          
          {/* Chest Light */}
          <mesh position={[0, 0.5, 0.88]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh ref={chestGlow} position={[0, 0.5, 0.9]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color={colors.glow} />
          </mesh>
        </group>

        {/* --- ARMS --- */}
        {/* Left Arm Group (Waving) */}
        <group ref={leftArm} position={[-1.1, -0.3, 0]}>
          <mesh position={[-0.4, -0.2, 0]} rotation={[0, 0, 0.4]}>
            <capsuleGeometry args={[0.18, 0.6, 16, 16]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-0.8, -0.8, 0]} rotation={[0, 0, 0.6]}>
            <capsuleGeometry args={[0.16, 0.5, 16, 16]} />
            <meshStandardMaterial color={colors.primary} />
          </mesh>
        </group>

        {/* Right Arm Group */}
        <group ref={rightArm} position={[1.1, -0.3, 0]}>
          <mesh position={[0.4, -0.2, 0]} rotation={[0, 0, -0.4]}>
            <capsuleGeometry args={[0.18, 0.6, 16, 16]} />
            <meshStandardMaterial color={colors.primary} />
          </mesh>
          <mesh position={[0.8, -0.8, 0]} rotation={[0, 0, -0.6]}>
            <capsuleGeometry args={[0.16, 0.5, 16, 16]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
        
      </Float>
    </group>
  );
}

export default function RobotCanvas({ state }: { state: RobotState }) {
  const colors = getColors(state);

  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-5, 5, 2]} intensity={0.8} color="#bae6fd" />
      <pointLight position={[0, 2, 4]} intensity={2} color={colors.glow} distance={10} />
      
      <RobotStructure state={state} />
    </Canvas>
  );
}
