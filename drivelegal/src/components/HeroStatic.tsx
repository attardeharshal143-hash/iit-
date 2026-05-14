"use client";
import React, { useEffect, useRef } from "react";
import { useDriveContext } from "../context/DriveContext";
import { translations, Language } from "../lib/translations";

interface HeroStaticProps {
  onStartDriving: () => void;
}

const LEGAL_TAGS = [
  "SEC 184", "₹2000", "MV ACT", "IPC 279",
  "₹500", "SEC 177", "₹1000", "E-CHALLAN",
  "AI SCAN", "RTO DATA", "DL CHECK", "CHALLAN",
];

export default function HeroStatic({ onStartDriving }: HeroStaticProps) {
  const { appLanguage } = useDriveContext();
  const t = translations[appLanguage as Language] || translations["en-IN"];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let tick = 0;
    let isVisible = false;

    type Car = { progress: number; speed: number; fromNode: number; toNode: number; trail: {x:number,y:number}[] };
    type Node = { x: number; y: number; pulse: number; size: number };
    type Tag = { x: number; y: number; vy: number; label: string; opacity: number };

    let nodes: Node[] = [];
    let edges: [number,number][] = [];
    let cars: Car[] = [];
    let tags: Tag[] = [];

    const init = () => {
      const W = canvas.width, H = canvas.height;
      const horizon = H * 0.55;

      // Create network nodes (only in top 55% — above horizon)
      nodes = Array.from({ length: 18 }, () => ({
        x: W * 0.05 + Math.random() * W * 0.9,
        y: H * 0.04 + Math.random() * horizon * 0.88,
        pulse: Math.random() * Math.PI * 2,
        size: 3 + Math.random() * 2,
      }));

      // Build edges
      edges = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          if (Math.sqrt(dx*dx+dy*dy) < W * 0.30 && edges.length < 28) {
            edges.push([i, j]);
          }
        }
      }

      // Cars with trails
      cars = edges.slice(0, 12).map(([a,b]) => ({
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
        fromNode: a,
        toNode: b,
        trail: [],
      }));

      // Floating legal tags — left and right sides
      tags = Array.from({ length: 12 }, (_, i) => ({
        x: i < 6 ? 10 + Math.random() * W * 0.18 : W * 0.82 + Math.random() * W * 0.16,
        y: Math.random() * H,
        vy: -(0.2 + Math.random() * 0.3),
        label: LEGAL_TAGS[i % LEGAL_TAGS.length],
        opacity: 0.25 + Math.random() * 0.2,
      }));
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      init();
    };
    resize();
    window.addEventListener("resize", resize);

    let drawLoop: (() => void) | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (!wasVisible && entry.isIntersecting) {
          if (drawLoop) drawLoop(); // Restart animation
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Glow helper
    const setGlow = (color: string, blur: number) => {
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
    };
    const clearGlow = () => { ctx.shadowBlur = 0; };

    const draw = () => {
      if (!isVisible) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      tick++;

      const horizon = H * 0.55;
      const cx = W / 2;

      // ════════════════════════════════════════
      // 1. PERSPECTIVE ROAD GRID — BRIGHT NEON
      // ════════════════════════════════════════
      for (let i = 0; i < 14; i++) {
        const p = ((i / 14) + (tick * 0.004)) % 1;
        const ease = Math.pow(p, 2.0);
        const y = horizon + ease * (H - horizon);
        const hw = ease * W * 0.68;
        const alpha = ease * 0.7;
        setGlow("#00e5ff", ease * 12);
        ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
        ctx.lineWidth = ease * 1.5 + 0.3;
        ctx.beginPath();
        ctx.moveTo(cx - hw, y);
        ctx.lineTo(cx + hw, y);
        ctx.stroke();
      }
      clearGlow();

      // Lane lines
      for (let i = 0; i <= 8; i++) {
        const frac = i / 8;
        const bx = W * frac;
        const isCenter = Math.abs(frac - 0.5) < 0.08;
        const alpha = isCenter ? 0.55 : 0.18;
        setGlow("#00e5ff", isCenter ? 10 : 4);
        ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
        ctx.lineWidth = isCenter ? 1.8 : 0.7;
        ctx.beginPath();
        ctx.moveTo(cx, horizon);
        ctx.lineTo(bx, H);
        ctx.stroke();
      }
      clearGlow();

      // Bright horizon glow line
      setGlow("#00e5ff", 20);
      const hGrad = ctx.createLinearGradient(0, 0, W, 0);
      hGrad.addColorStop(0, "rgba(0,229,255,0)");
      hGrad.addColorStop(0.5, "rgba(0,229,255,0.9)");
      hGrad.addColorStop(1, "rgba(0,229,255,0)");
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, horizon - 1, W, 2);
      clearGlow();

      // ════════════════════════════════════════
      // 2. ROAD NETWORK — GLOWING NODES + EDGES
      // ════════════════════════════════════════
      // Draw edges
      edges.forEach(([a, b]) => {
        const na = nodes[a], nb = nodes[b];
        const alpha = 0.22 + 0.1 * Math.sin(tick * 0.02 + na.pulse);
        ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([5, 10]);
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw nodes with glow
      nodes.forEach(node => {
        const pulse = 0.5 + 0.5 * Math.sin(tick * 0.05 + node.pulse);

        // Outer halo
        setGlow("#00e5ff", 20);
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + 4 + pulse * 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,229,255,${0.25 * pulse})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        clearGlow();

        // Core dot
        setGlow("#00e5ff", 15);
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${0.7 + 0.3 * pulse})`;
        ctx.fill();
        clearGlow();
      });

      // ════════════════════════════════════════
      // 3. CARS WITH GLOWING TRAILS
      // ════════════════════════════════════════
      cars.forEach(car => {
        car.progress += car.speed;
        if (car.progress > 1) {
          car.progress = 0;
          car.trail = [];
          // Pick a new edge
          const newEdge = edges[Math.floor(Math.random() * edges.length)];
          car.fromNode = newEdge[0];
          car.toNode = newEdge[1];
        }

        const na = nodes[car.fromNode], nb = nodes[car.toNode];
        if (!na || !nb) return;

        const x = na.x + (nb.x - na.x) * car.progress;
        const y = na.y + (nb.y - na.y) * car.progress;

        car.trail.push({ x, y });
        if (car.trail.length > 18) car.trail.shift();

        // Draw trail
        car.trail.forEach((pt, i) => {
          const a = (i / car.trail.length) * 0.6;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,229,255,${a})`;
          ctx.fill();
        });

        // Draw car dot
        setGlow("#00e5ff", 18);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#00e5ff";
        ctx.fill();
        clearGlow();
      });

      // ════════════════════════════════════════
      // 4. BRIGHT LIDAR SWEEP
      // ════════════════════════════════════════
      const beamX = ((tick * 2.5) % (W + 200)) - 100;
      const beamGrad = ctx.createLinearGradient(beamX - 80, 0, beamX + 80, 0);
      beamGrad.addColorStop(0, "rgba(0,229,255,0)");
      beamGrad.addColorStop(0.4, "rgba(0,229,255,0.08)");
      beamGrad.addColorStop(0.5, "rgba(0,229,255,0.35)");
      beamGrad.addColorStop(0.6, "rgba(0,229,255,0.08)");
      beamGrad.addColorStop(1, "rgba(0,229,255,0)");
      ctx.fillStyle = beamGrad;
      ctx.fillRect(beamX - 80, 0, 160, H);

      // Bright beam edge line
      setGlow("#00e5ff", 15);
      ctx.strokeStyle = "rgba(0,229,255,0.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(beamX, 0);
      ctx.lineTo(beamX, H);
      ctx.stroke();
      clearGlow();

      // ════════════════════════════════════════
      // 5. FLOATING LEGAL TAGS — GLOWING TEXT
      // ════════════════════════════════════════
      ctx.font = `700 11px 'JetBrains Mono', monospace`;
      tags.forEach(tag => {
        tag.y += tag.vy;
        if (tag.y < -20) {
          tag.y = H + 10;
          tag.label = LEGAL_TAGS[Math.floor(Math.random() * LEGAL_TAGS.length)];
        }
        setGlow("#00e5ff", 8);
        ctx.fillStyle = `rgba(0,229,255,${tag.opacity})`;
        ctx.fillText(tag.label, tag.x, tag.y);
        clearGlow();
      });

      // ════════════════════════════════════════
      // 6. RADAR RIPPLES FROM HORIZON
      // ════════════════════════════════════════
      [0, 100, 200].forEach((offset, i) => {
        const r = ((tick * 1.2 + offset) % 320);
        const a = Math.max(0, 0.5 - r / 640);
        const color = i % 2 === 0 ? "0,229,255" : "124,58,237";
        setGlow(`rgb(${color})`, 12);
        ctx.beginPath();
        ctx.arc(cx, horizon, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${color},${a})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        clearGlow();
      });

      animFrame = requestAnimationFrame(draw);
    };

    drawLoop = draw;
    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section style={{
      minHeight: "90vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "0 5%",
      background: "#06080c",
      position: "relative",
      overflow: "hidden",
      textAlign: "center"
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }} />

      {/* Light vignette only at far edges — let the animation breathe */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 50%, rgba(6,8,12,0.5) 100%)"
      }} />

      <div style={{ maxWidth: "900px", position: "relative", zIndex: 10 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          marginBottom: "2.5rem",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "8px 16px", borderRadius: "99px"
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ffa3", boxShadow: "0 0 10px #00ffa3" }} />
          <span style={{
            fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.6)", textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace"
          }}>{t.hero.tag}</span>
        </div>

        <h1 style={{
          fontSize: "clamp(3.5rem, 9vw, 6rem)", fontWeight: 900,
          lineHeight: 0.95, letterSpacing: "-0.05em", color: "#fff",
          marginBottom: "1.5rem", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic"
        }}>
          {t.hero.title.split(".")[0]}.<br />
          <span style={{
            background: "linear-gradient(90deg, #00e5ff, #3b82f6 50%, #a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
          }}>{t.hero.title.split(".")[1]}</span>
        </h1>

        <p style={{
          fontSize: "clamp(1.125rem, 2vw, 1.35rem)", color: "rgba(255,255,255,0.55)",
          maxWidth: "600px", margin: "0 auto 3.5rem", lineHeight: 1.6, fontWeight: 500
        }}>{t.hero.desc}</p>

        <div style={{ display: "flex", gap: "1.25rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onStartDriving} style={{
            padding: "1rem 2.5rem",
            background: "linear-gradient(135deg, #00e5ff, #3b82f6)",
            color: "#000", fontWeight: 800, borderRadius: "9999px",
            border: "none", cursor: "pointer", fontSize: "1.0625rem",
            boxShadow: "0 20px 40px rgba(0,229,255,0.3)", transition: "all 0.3s ease"
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 25px 50px rgba(0,229,255,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,229,255,0.3)"; }}>
            {t.nav.startDriving}
          </button>
          <a href="/finebook" style={{
            display: "inline-flex", alignItems: "center",
            padding: "1rem 2.5rem",
            background: "rgba(255,255,255,0.03)", color: "#fff", fontWeight: 600,
            borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.12)",
            fontSize: "1.0625rem", textDecoration: "none", transition: "all 0.3s ease"
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}>
            {t.nav.finebook} →
          </a>
        </div>
      </div>
    </section>
  );
}
