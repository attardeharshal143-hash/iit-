"use client";
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

type RobotState = "idle" | "listening" | "speaking" | "alert";

/* ── Color palette per state ── */
const PALETTE: Record<RobotState, { primary: string; accent: string; glow: string; emissive: string }> = {
  idle:      { primary: "#0a0e1a", accent: "#0071E3", glow: "#66a3ff", emissive: "#001a40" },
  listening: { primary: "#001830", accent: "#00c2ff", glow: "#80e0ff", emissive: "#002244" },
  speaking:  { primary: "#1a0030", accent: "#a855f7", glow: "#d8b4fe", emissive: "#2d0050" },
  alert:     { primary: "#1a0500", accent: "#ff4d30", glow: "#ff8c70", emissive: "#3d1000" },
};

/* ── Smooth lerp utility ── */
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/* ─────────────────────────────────────────────────────────────
   AUDIO BARS — visualizer that appears when speaking/listening
───────────────────────────────────────────────────────────── */
function AudioBars({ state }: { state: RobotState }) {
  const groupRef = useRef<THREE.Group>(null);
  const bars = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ i, phase: i * 0.6 })), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const active = state === "speaking" || state === "listening";
    groupRef.current.children.forEach((child, i) => {
      const target = active
        ? 0.05 + Math.abs(Math.sin(t * (4 + i * 0.8) + i * 0.6)) * 0.35
        : 0.04;
      child.scale.y = lerp(child.scale.y, target, 0.12);
    });
    groupRef.current.visible = active || groupRef.current.children.some(c => c.scale.y > 0.05);
  });

  const pal = PALETTE[state];
  return (
    <group ref={groupRef} position={[0, -0.15, 0.72]}>
      {bars.map(({ i }) => (
        <mesh key={i} position={[(i - 3) * 0.13, 0, 0]} scale={[0.07, 0.04, 0.07]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={pal.glow} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   EYE — smart blinking + emotion shapes
───────────────────────────────────────────────────────────── */
function Eye({ x, state }: { x: number; state: RobotState }) {
  const scaleY = useRef(1);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    // Natural blink every 3–5 seconds
    const blinkCycle = Math.sin(t * 0.7);
    const blinking = blinkCycle > 0.97;
    const target = blinking ? 0.08 : 1;
    scaleY.current = lerp(scaleY.current, target, 0.25);

    if (state === "alert") {
      // Angry: angled inward brow-like squint
      meshRef.current.scale.set(1, scaleY.current * 0.5, 1);
      meshRef.current.rotation.z = x < 0 ? 0.4 : -0.4;
    } else {
      meshRef.current.scale.set(1, scaleY.current, 1);
      meshRef.current.rotation.z = 0;
    }
  });

  const pal = PALETTE[state];

  return (
    <mesh ref={meshRef} position={[x, 0.05, 0.76]}>
      {state === "alert" ? (
        <boxGeometry args={[0.32, 0.08, 0.04]} />
      ) : (
        <torusGeometry args={[0.14, 0.045, 10, 28, Math.PI]} />
      )}
      <meshBasicMaterial color={pal.glow} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────
   MOUTH — speaks with capsule morph + idle smile
───────────────────────────────────────────────────────────── */
function Mouth({ state }: { state: RobotState }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    if (state === "speaking") {
      ref.current.scale.x = 1 + Math.abs(Math.sin(t * 14)) * 1.2;
      ref.current.scale.y = 1 + Math.abs(Math.sin(t * 18)) * 0.6;
    } else if (state === "alert") {
      ref.current.scale.x = 0.5;
      ref.current.scale.y = 0.7;
    } else {
      ref.current.scale.x = lerp(ref.current.scale.x, 1, 0.1);
      ref.current.scale.y = lerp(ref.current.scale.y, 1, 0.1);
    }
  });

  const pal = PALETTE[state];

  return (
    <mesh ref={ref} position={[0, -0.22, 0.76]} rotation={[0, 0, Math.PI / 2]}>
      <capsuleGeometry args={[0.035, state === "alert" ? 0.12 : 0.22, 6, 12]} />
      <meshBasicMaterial color={pal.glow} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────
   CHEST ORB — pulsing status light
───────────────────────────────────────────────────────────── */
function ChestOrb({ state }: { state: RobotState }) {
  const ref = useRef<THREE.Mesh>(null);
  const pal = PALETTE[state];

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const rate = state === "listening" ? 5 : state === "speaking" ? 10 : state === "alert" ? 8 : 1.8;
    const amp  = state === "idle" ? 0.04 : 0.18;
    const s = 1 + Math.sin(t * rate) * amp;
    ref.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={ref} position={[0, 0.46, 0.91]}>
      <sphereGeometry args={[0.19, 20, 20]} />
      <meshBasicMaterial color={pal.glow} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────
   FULL ROBOT STRUCTURE
───────────────────────────────────────────────────────────── */
function RobotStructure({ state }: { state: RobotState }) {
  const leftArm  = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const headRef  = useRef<THREE.Group>(null);

  const pal = PALETTE[state];

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#f0f4ff", roughness: 0.08, metalness: 0.15,
  }), []);
  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#07090f", roughness: 0.4, metalness: 0.85,
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Arm sway
    if (leftArm.current) {
      const target = state === "speaking"
        ? -0.5 + Math.sin(t * 9) * 0.35
        : -0.4 + Math.sin(t * 1.9) * 0.18;
      leftArm.current.rotation.z = lerp(leftArm.current.rotation.z, target, 0.1);
    }
    if (rightArm.current) {
      const target = 0.4 + Math.sin(t * 1.4 + 1) * 0.1;
      rightArm.current.rotation.z = lerp(rightArm.current.rotation.z, target, 0.08);
    }

    // Head subtle look-around on idle
    if (headRef.current) {
      if (state === "idle") {
        headRef.current.rotation.y = Math.sin(t * 0.4) * 0.12;
      } else if (state === "listening") {
        headRef.current.rotation.y = lerp(headRef.current.rotation.y, Math.sin(t * 0.6) * 0.08, 0.04);
      } else {
        headRef.current.rotation.y = lerp(headRef.current.rotation.y, 0, 0.05);
      }
    }
  });

  return (
    <group>
      <Float
        speed={state === "alert" ? 7 : 2.2}
        rotationIntensity={state === "alert" ? 0.35 : 0.18}
        floatIntensity={0.55}
      >
        {/* ── HEAD ── */}
        <group position={[0, 0.78, 0]} ref={headRef}>
          {/* Main head */}
          <RoundedBox args={[2.1, 1.35, 1.35]} radius={0.38} smoothness={5}>
            <meshStandardMaterial color={pal.primary} roughness={0.05} metalness={0.4} />
          </RoundedBox>

          {/* Screen face inset */}
          <RoundedBox position={[0, 0, 0.64]} args={[1.65, 0.88, 0.18]} radius={0.14} smoothness={5}>
            <meshStandardMaterial color="#050810" roughness={0.35} metalness={0.9} />
          </RoundedBox>

          {/* Eyes */}
          <Eye x={-0.38} state={state} />
          <Eye x={ 0.38} state={state} />

          {/* Mouth */}
          <Mouth state={state} />

          {/* Audio bars */}
          <AudioBars state={state} />

          {/* Ears */}
          <RoundedBox position={[-1.15, 0.02, 0]} args={[0.28, 0.58, 0.48]} radius={0.1} smoothness={4}>
            <meshStandardMaterial color={pal.accent} roughness={0.2} metalness={0.3} />
          </RoundedBox>
          <RoundedBox position={[ 1.15, 0.02, 0]} args={[0.28, 0.58, 0.48]} radius={0.1} smoothness={4}>
            <meshStandardMaterial color={pal.accent} roughness={0.2} metalness={0.3} />
          </RoundedBox>

          {/* Antennae */}
          {[-0.75, 0.75].map((ax, i) => (
            <group key={i} position={[ax, 0.88, 0]} rotation={[0, 0, ax < 0 ? 0.28 : -0.28]}>
              <mesh>
                <capsuleGeometry args={[0.055, 0.38, 8, 10]} />
                <meshStandardMaterial color={pal.accent} roughness={0.2} metalness={0.4} emissive={pal.emissive} emissiveIntensity={1.5} />
              </mesh>
              {/* Tip orb */}
              <mesh position={[0, 0.26, 0]}>
                <sphereGeometry args={[0.1, 12, 12]} />
                <meshBasicMaterial color={pal.glow} />
              </mesh>
            </group>
          ))}
        </group>

        {/* ── BODY ── */}
        <group position={[0, -0.72, 0]}>
          {/* Upper torso dome */}
          <mesh position={[0, 0.38, 0]}>
            <sphereGeometry args={[0.88, 36, 36, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={pal.accent} roughness={0.22} metalness={0.28} />
          </mesh>
          {/* Lower torso */}
          <mesh position={[0, 0.38, 0]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.88, 36, 36, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f0f4ff" roughness={0.12} metalness={0.18} />
          </mesh>
          {/* Chest port ring */}
          <mesh position={[0, 0.48, 0.88]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.04, 12, 32]} />
            <meshStandardMaterial color={pal.accent} roughness={0.2} metalness={0.5} emissive={pal.emissive} emissiveIntensity={2} />
          </mesh>
          {/* Chest screen inset */}
          <mesh position={[0, 0.48, 0.88]}>
            <circleGeometry args={[0.18, 24]} />
            <meshStandardMaterial color="#050810" roughness={0.3} metalness={0.95} />
          </mesh>
          {/* Chest orb */}
          <ChestOrb state={state} />
        </group>

        {/* ── LEFT ARM (waving) ── */}
        <group ref={leftArm} position={[-1.05, -0.22, 0]}>
          <mesh position={[-0.38, -0.18, 0]} rotation={[0, 0, 0.4]}>
            <capsuleGeometry args={[0.17, 0.58, 14, 14]} />
            <meshStandardMaterial color="#f0f4ff" roughness={0.1} metalness={0.15} />
          </mesh>
          {/* Forearm */}
          <mesh position={[-0.76, -0.76, 0]} rotation={[0, 0, 0.55]}>
            <capsuleGeometry args={[0.15, 0.48, 14, 14]} />
            <meshStandardMaterial color={pal.accent} roughness={0.2} metalness={0.3} />
          </mesh>
          {/* Hand */}
          <mesh position={[-1.08, -1.22, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#f0f4ff" roughness={0.1} />
          </mesh>
        </group>

        {/* ── RIGHT ARM (steady) ── */}
        <group ref={rightArm} position={[1.05, -0.22, 0]}>
          <mesh position={[0.38, -0.18, 0]} rotation={[0, 0, -0.4]}>
            <capsuleGeometry args={[0.17, 0.58, 14, 14]} />
            <meshStandardMaterial color={pal.accent} roughness={0.2} metalness={0.3} />
          </mesh>
          <mesh position={[0.76, -0.76, 0]} rotation={[0, 0, -0.55]}>
            <capsuleGeometry args={[0.15, 0.48, 14, 14]} />
            <meshStandardMaterial color="#f0f4ff" roughness={0.1} metalness={0.15} />
          </mesh>
          <mesh position={[1.08, -1.22, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color={pal.accent} roughness={0.2} />
          </mesh>
        </group>

      </Float>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   CANVAS EXPORT
───────────────────────────────────────────────────────────── */
export default function RobotCanvas({ state }: { state: RobotState }) {
  const pal = PALETTE[state];

  return (
    <Canvas
      camera={{ position: [0, 0.4, 5.8], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 10, 6]}  intensity={1.6} color="#ffffff" />
      <directionalLight position={[-5, 4, 3]}  intensity={0.7} color="#bae6fd" />
      <pointLight position={[0, 2, 4.5]} intensity={2.2} color={pal.glow} distance={12} />
      {/* Rim light from behind for depth */}
      <pointLight position={[0, 1, -4]}  intensity={0.6} color={pal.accent} distance={10} />

      <RobotStructure state={state} />
    </Canvas>
  );
}
