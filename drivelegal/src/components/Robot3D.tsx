"use client";
import dynamic from 'next/dynamic';

type RobotState = "idle" | "listening" | "speaking" | "alert";

// Dynamically import the Three.js canvas to avoid SSR issues
const RobotCanvas = dynamic(() => import('./RobotModel'), { 
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#0071E3" }}>
      <div style={{ width: "30px", height: "30px", border: "3px solid rgba(0, 113, 227, 0.2)", borderTopColor: "#0071E3", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
    </div>
  )
});

export default function Robot3D({ state, size = 200 }: { state: RobotState; size?: number }) {
  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      position: "relative",
      minHeight: size + "px",
      background: "transparent"
    }}>
      <RobotCanvas state={state} />
    </div>
  );
}
