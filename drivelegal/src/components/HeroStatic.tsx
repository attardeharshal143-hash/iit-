"use client";
import React, { useEffect, useRef } from "react";
import { useDriveContext } from "../context/DriveContext";
import { translations, Language } from "../lib/translations";

interface HeroStaticProps {
  onStartDriving: () => void;
}

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

    // â”€â”€ Data stream particles â”€â”€
    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      life: number; maxLife: number;
      size: number; hue: number;
    };
    let particles: Particle[] = [];

    // â”€â”€ Orbs (large glowing blobs) â”€â”€
    type Orb = { x: number; y: number; r: number; phase: number; speed: number; hue: number };
    let orbs: Orb[] = [];

    // â”€â”€ Data lines (horizontal scan streaks) â”€â”€
    type Line = { y: number; width: number; x: number; speed: number; opacity: number };
    let lines: Line[] = [];

    const init = () => {
      const W = canvas.width, H = canvas.height;

      // 5 large aurora orbs
      orbs = [
        { x: W * 0.15, y: H * 0.35, r: W * 0.28, phase: 0,    speed: 0.0008, hue: 195 },
        { x: W * 0.80, y: H * 0.25, r: W * 0.22, phase: 1.2,  speed: 0.0006, hue: 220 },
        { x: W * 0.50, y: H * 0.70, r: W * 0.30, phase: 2.4,  speed: 0.0007, hue: 260 },
        { x: W * 0.25, y: H * 0.75, r: W * 0.18, phase: 0.8,  speed: 0.0009, hue: 185 },
        { x: W * 0.85, y: H * 0.65, r: W * 0.20, phase: 3.1,  speed: 0.0005, hue: 240 },
      ];

      // Horizontal data scan lines
      lines = Array.from({ length: 8 }, () => ({
        y: Math.random() * H,
        width: 60 + Math.random() * 200,
        x: -300,
        speed: 1.5 + Math.random() * 2.5,
        opacity: 0.15 + Math.random() * 0.25,
      }));

      particles = [];
    };

    const spawnParticle = (W: number, H: number) => {
      if (particles.length > 120) return;
      particles.push({
        x: Math.random() * W,
        y: H + 10,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(0.4 + Math.random() * 0.8),
        life: 0,
        maxLife: 180 + Math.random() * 120,
        size: 1 + Math.random() * 2,
        hue: 185 + Math.random() * 80,
      });
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      init();
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      tick++;

      // Fade trail
      ctx.fillStyle = "rgba(6,8,12,0.18)";
      ctx.fillRect(0, 0, W, H);

      // â”€â”€ 1. Aurora orbs â”€â”€
      orbs.forEach(orb => {
        orb.phase += orb.speed;
        const ox = orb.x + Math.sin(orb.phase * 1.3) * W * 0.06;
        const oy = orb.y + Math.cos(orb.phase) * H * 0.08;

        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
        g.addColorStop(0,   `hsla(${orb.hue},100%,75%,0.18)`); // Brighter
        g.addColorStop(0.4, `hsla(${orb.hue},90%,60%,0.10)`); // Brighter
        g.addColorStop(1,   `hsla(${orb.hue},80%,50%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ox, oy, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // â”€â”€ 2. Floating particles â”€â”€
      if (tick % 3 === 0) spawnParticle(W, H);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const progress = p.life / p.maxLife;
        const alpha = progress < 0.2
          ? progress / 0.2 * 0.9 // Increased from 0.7
          : progress > 0.8
          ? (1 - progress) / 0.2 * 0.9 // Increased from 0.7
          : 0.9; // Increased from 0.7

        ctx.shadowColor = `hsla(${p.hue},100%,75%,0.95)`; // Brighter shadow
        ctx.shadowBlur = 10; // Increased blur
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,75%,${alpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.life >= p.maxLife || p.y < -10) particles.splice(i, 1);
      });

      // â”€â”€ 3. Horizontal data scan lines â”€â”€
      lines.forEach(line => {
        line.x += line.speed;
        if (line.x > W + 300) {
          line.x = -300;
          line.y = Math.random() * H;
          line.width = 100 + Math.random() * 300; // Longer lines
          line.opacity = 0.25 + Math.random() * 0.35; // Brighter
        }
        const lg = ctx.createLinearGradient(line.x, 0, line.x + line.width, 0);
        lg.addColorStop(0,   "rgba(0,229,255,0)");
        lg.addColorStop(0.3, `rgba(0,229,255,${line.opacity})`);
        lg.addColorStop(0.7, `rgba(0,229,255,${line.opacity})`);
        lg.addColorStop(1,   "rgba(0,229,255,0)");
        ctx.fillStyle = lg;
        ctx.fillRect(line.x, line.y - 0.5, line.width, 1);
      });

      // â”€â”€ 4. Subtle grid overlay (very faint) â”€â”€
      if (tick % 2 === 0) {
        ctx.strokeStyle = "rgba(0,229,255,0.025)";
        ctx.lineWidth = 0.5;
        const gridSize = 80;
        for (let gx = 0; gx < W; gx += gridSize) {
          ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
        }
        for (let gy = 0; gy < H; gy += gridSize) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
        }
      }

      // â”€â”€ 5. Corner bracket accents â”€â”€
      const bSize = 28;
      const corners = [
        [20, 20, 1, 1], [W - 20, 20, -1, 1],
        [20, H - 20, 1, -1], [W - 20, H - 20, -1, -1],
      ];
      ctx.strokeStyle = "rgba(0,229,255,0.65)"; // Brighter brackets
      ctx.lineWidth = 2.0;
      corners.forEach(([x, y, sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(x + sx * bSize, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + sy * bSize);
        ctx.stroke();
      });

      // â”€â”€ 6. Pulsing center ring â”€â”€
      const pulse = 0.5 + 0.5 * Math.sin(tick * 0.025);
      const ringR = 180 + pulse * 30;
      const rg = ctx.createRadialGradient(W/2, H/2, ringR - 2, W/2, H/2, ringR + 2);
      rg.addColorStop(0, "rgba(0,229,255,0)");
      rg.addColorStop(0.5, `rgba(0,229,255,${0.12 * pulse})`); // Brighter ring
      rg.addColorStop(1, "rgba(0,229,255,0)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(W/2, H/2, ringR, 0, Math.PI * 2);
      ctx.fill();

      animFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrame);
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

      {/* Soft center vignette to keep text readable */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(6,8,12,0.55) 0%, transparent 100%)"
      }} />

      <div style={{ maxWidth: "900px", position: "relative", zIndex: 10 }}>
        {/* Eyebrow badge */}
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
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            paddingRight: "0.15em", marginRight: "-0.15em" // Prevent italic clipping
          }}>{t.hero.title.split(".")[1]}</span>
        </h1>

        <p style={{
          fontSize: "clamp(1.125rem, 2vw, 1.35rem)", color: "rgba(255,255,255,0.92)", // Increased from 0.55
          maxWidth: "600px", margin: "0 auto 3.5rem", lineHeight: 1.6, fontWeight: 500,
          textShadow: "0 2px 4px rgba(0,0,0,0.3)" // Added subtle shadow for legibility
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
            {t.nav.finebook} â†’
          </a>
        </div>
      </div>
    </section>
  );
}