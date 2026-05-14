"use client";
import { useEffect, useRef } from "react";

interface ThreeBackgroundProps {
  variant?: "particles" | "grid" | "waves";
  color?: string;
}

export default function ThreeBackground({
  variant = "particles",
  color = "#3b82f6",
}: ThreeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", resize);

    let drawLoop: (() => void) | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisibleRef.current;
        isVisibleRef.current = entry.isIntersecting;
        if (!wasVisible && entry.isIntersecting) {
          if (drawLoop) drawLoop(); // Restart animation loop
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const hexToRgb = (hex: string) => ({
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    });
    const rgb = hexToRgb(color);
    const c = `${rgb.r},${rgb.g},${rgb.b}`;

    /* ══════════════════════════════════════
       PARTICLES — Neural Network with data pulses
    ══════════════════════════════════════ */
    if (variant === "particles") {
      const COUNT = 55;
      type Node = {
        x: number; y: number; vx: number; vy: number;
        size: number; pulsePhase: number; energy: number;
      };
      type Pulse = { from: number; to: number; t: number; speed: number };

      const nodes: Node[] = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 1.2,
        pulsePhase: Math.random() * Math.PI * 2,
        energy: Math.random(),
      }));

      const pulses: Pulse[] = [];
      let frameCount = 0;

      const spawnPulse = () => {
        const from = Math.floor(Math.random() * COUNT);
        // find nearest neighbor
        let best = -1, bestDist = Infinity;
        for (let j = 0; j < COUNT; j++) {
          if (j === from) continue;
          const dx = nodes[from].x - nodes[j].x;
          const dy = nodes[from].y - nodes[j].y;
          const d = dx * dx + dy * dy;
          if (d < 22500 && d < bestDist) { bestDist = d; best = j; }
        }
        if (best >= 0) pulses.push({ from, to: best, t: 0, speed: 0.018 + Math.random() * 0.012 });
      };

      const draw = () => {
        if (!isVisibleRef.current) return;
        animRef.current = requestAnimationFrame(draw);
        frameCount++;

        ctx.clearRect(0, 0, W, H);

        // Spawn data pulses periodically
        if (frameCount % 18 === 0) spawnPulse();

        // Draw connection lines
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < 22500) {
              const alpha = (1 - Math.sqrt(dist2) / 150) * 0.4;
              ctx.beginPath();
              ctx.strokeStyle = `rgba(${c},${alpha})`;
              ctx.lineWidth = 0.8;
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }

        // Draw data pulses traveling along edges
        for (let i = pulses.length - 1; i >= 0; i--) {
          const p = pulses[i];
          p.t += p.speed;
          if (p.t >= 1) { pulses.splice(i, 1); continue; }
          const a = nodes[p.from], b = nodes[p.to];
          const px = a.x + (b.x - a.x) * p.t;
          const py = a.y + (b.y - a.y) * p.t;
          const glowAlpha = Math.sin(p.t * Math.PI) * 0.9;

          // Glow halo
          const grad = ctx.createRadialGradient(px, py, 0, px, py, 8);
          grad.addColorStop(0, `rgba(${c},${glowAlpha})`);
          grad.addColorStop(1, `rgba(${c},0)`);
          ctx.beginPath();
          ctx.arc(px, py, 8, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${glowAlpha})`;
          ctx.fill();
        }

        // Draw nodes
        for (const n of nodes) {
          n.pulsePhase += 0.03;
          const pulse = Math.sin(n.pulsePhase) * 0.5 + 0.5;
          const r = n.size + pulse * 1.5;
          const alpha = 0.5 + pulse * 0.5;

          // Outer ring
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${c},${alpha * 0.3})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Core
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c},${alpha})`;
          ctx.fill();

          // White highlight
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.8})`;
          ctx.fill();

          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > W) n.vx *= -1;
          if (n.y < 0 || n.y > H) n.vy *= -1;
        }
      };
      drawLoop = draw;
      draw();

    /* ══════════════════════════════════════
       GRID — Hyperspeed warp with neon road lines
    ══════════════════════════════════════ */
    } else if (variant === "grid") {
      let offset = 0;
      let glowPulse = 0;

      // Speed streaks
      type Streak = { x: number; y: number; len: number; speed: number; alpha: number };
      const streaks: Streak[] = Array.from({ length: 20 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H * 0.45,
        len: Math.random() * 60 + 20,
        speed: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
      }));

      const draw = () => {
        if (!isVisibleRef.current) return;
        animRef.current = requestAnimationFrame(draw);

        ctx.clearRect(0, 0, W, H);
        offset = (offset + 0.8) % 60;
        glowPulse += 0.025;

        const horizon = H * 0.42;
        const vp = { x: W / 2, y: horizon };
        const pulseIntensity = 0.3 + Math.sin(glowPulse) * 0.15;

        // Horizontal grid lines with gradient color
        for (let i = 0; i < 18; i++) {
          const t = i / 17;
          const y = horizon + (H - horizon) * Math.pow(t, 1.5) + offset * Math.pow(t, 1.5);
          if (y > H) continue;
          const spread = (y - horizon) / (H - horizon);
          const x0 = vp.x - spread * W * 0.78;
          const x1 = vp.x + spread * W * 0.78;
          const alpha = (0.08 + spread * 0.5) * (i === 0 ? 0 : 1);

          const lineGrad = ctx.createLinearGradient(x0, y, x1, y);
          lineGrad.addColorStop(0, `rgba(${c},0)`);
          lineGrad.addColorStop(0.3, `rgba(${c},${alpha})`);
          lineGrad.addColorStop(0.7, `rgba(${c},${alpha})`);
          lineGrad.addColorStop(1, `rgba(${c},0)`);

          ctx.beginPath();
          ctx.strokeStyle = lineGrad;
          ctx.lineWidth = 0.6 + spread * 1.8;
          ctx.moveTo(x0, y);
          ctx.lineTo(x1, y);
          ctx.stroke();
        }

        // Vertical perspective lines
        const VLINES = 18;
        for (let i = 0; i <= VLINES; i++) {
          const t = i / VLINES;
          const xBottom = W * t * 1.6 - W * 0.3;
          const distFromCenter = Math.abs(t - 0.5) * 2;
          const alpha = (0.5 - distFromCenter * 0.3) * pulseIntensity * 1.5;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${c},${alpha})`;
          ctx.lineWidth = distFromCenter < 0.1 ? 2 : 1;
          ctx.moveTo(vp.x, vp.y);
          ctx.lineTo(xBottom, H);
          ctx.stroke();
        }

        // Center road marking dashes
        const dashOffset = offset * 3;
        ctx.setLineDash([18, 22]);
        ctx.lineDashOffset = -dashOffset;
        ctx.beginPath();
        ctx.moveTo(vp.x, horizon + 10);
        ctx.lineTo(vp.x, H);
        ctx.strokeStyle = `rgba(${c},0.6)`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;

        // Pulsing horizon glow
        const horizonGlow = ctx.createLinearGradient(0, horizon - 60, 0, horizon + 100);
        horizonGlow.addColorStop(0, `rgba(${c},0)`);
        horizonGlow.addColorStop(0.5, `rgba(${c},${pulseIntensity})`);
        horizonGlow.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = horizonGlow;
        ctx.fillRect(0, horizon - 60, W, 160);

        // Wide horizon beam
        const beamGrad = ctx.createRadialGradient(W / 2, horizon, 0, W / 2, horizon, W * 0.6);
        beamGrad.addColorStop(0, `rgba(${c},${pulseIntensity * 0.4})`);
        beamGrad.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, horizon - 30, W, 60);

        // Speed streaks in upper half
        for (const s of streaks) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${c},${s.alpha * 0.5})`;
          ctx.lineWidth = 1;
          const spread = (s.y - horizon) / (H - horizon + 1);
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + s.len * spread, s.y);
          ctx.stroke();
          s.x -= s.speed;
          if (s.x + s.len < 0) { s.x = W + 10; s.y = Math.random() * H * 0.42; }
        }
      };
      drawLoop = draw;
      draw();

    /* ══════════════════════════════════════
       WAVES → AI Legal Radar Scanner
    ══════════════════════════════════════ */
    } else if (variant === "waves") {
      let angle = 0;
      let frame = 0;

      const legalLabels = ["CHALLAN", "PUC VALID", "INSURED", "SEC 183", "SPEED OK", "MV ACT", "RC VALID"];
      type Blip = {
        bx: number; by: number; age: number; maxAge: number;
        size: number; label: string; lit: boolean; fadeAlpha: number;
      };
      const blips: Blip[] = [];

      const spawnBlip = () => {
        const cx = W / 2, cy = H / 2;
        const maxR = Math.min(W, H) * 0.44;
        const r = Math.random() * maxR * 0.85 + maxR * 0.08;
        const a = Math.random() * Math.PI * 2;
        blips.push({
          bx: cx + Math.cos(a) * r,
          by: cy + Math.sin(a) * r,
          age: 0,
          maxAge: 140 + Math.random() * 80,
          size: Math.random() * 3 + 2,
          label: legalLabels[Math.floor(Math.random() * legalLabels.length)],
          lit: false,
          fadeAlpha: 0,
        });
      };

      for (let i = 0; i < 10; i++) spawnBlip();

      const draw = () => {
        if (!isVisibleRef.current) return;
        animRef.current = requestAnimationFrame(draw);
        frame++;

        ctx.clearRect(0, 0, W, H);

        const cx = W / 2, cy = H / 2;
        const maxR = Math.min(W, H) * 0.44;

        // Subtle background radial
        const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        bgGrad.addColorStop(0, `rgba(${c},0.04)`);
        bgGrad.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = bgGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
        ctx.fill();

        // Range rings with glow
        const RINGS = 4;
        for (let i = 1; i <= RINGS; i++) {
          const r = (i / RINGS) * maxR;
          // Glow ring
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${c},0.06)`;
          ctx.lineWidth = 6;
          ctx.stroke();
          // Sharp ring
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${c},0.28)`;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = `rgba(${c},0.4)`;
          ctx.font = `10px 'JetBrains Mono', monospace`;
          ctx.fillText(`${i * 25}km`, cx + r + 4, cy - 4);
        }

        // Crosshair dashes
        ctx.strokeStyle = `rgba(${c},0.18)`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([5, 8]);
        ctx.beginPath(); ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy); ctx.stroke();
        ctx.setLineDash([]);

        // Degree tick marks
        for (let deg = 0; deg < 360; deg += 30) {
          const rad = (deg * Math.PI) / 180;
          const isMain = deg % 90 === 0;
          const inner = maxR - (isMain ? 12 : 6);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(rad) * inner, cy + Math.sin(rad) * inner);
          ctx.lineTo(cx + Math.cos(rad) * maxR, cy + Math.sin(rad) * maxR);
          ctx.strokeStyle = `rgba(${c},${isMain ? 0.6 : 0.25})`;
          ctx.lineWidth = isMain ? 2 : 1;
          ctx.stroke();
          if (isMain) {
            ctx.fillStyle = `rgba(${c},0.55)`;
            ctx.font = `9px 'JetBrains Mono', monospace`;
            ctx.fillText(`${deg}°`, cx + Math.cos(rad) * (maxR + 14) - 7, cy + Math.sin(rad) * (maxR + 14) + 4);
          }
        }

        // Sweep beam — smooth gradient fan
        angle += 0.020;
        const sweepLen = Math.PI * 0.6;
        const SEGS = 20;
        for (let s = 0; s < SEGS; s++) {
          const startA = angle - sweepLen * (s / SEGS);
          const endA = angle - sweepLen * ((s + 1) / SEGS);
          const alpha = (1 - s / SEGS) * 0.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, maxR, startA, endA, true);
          ctx.closePath();
          ctx.fillStyle = `rgba(${c},${alpha})`;
          ctx.fill();
        }

        // Leading edge beam
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
        ctx.strokeStyle = `rgba(255,255,255,0.9)`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Leading edge glow
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
        ctx.strokeStyle = `rgba(${c},0.5)`;
        ctx.lineWidth = 8;
        ctx.stroke();

        // Blips with legal labels
        for (let i = blips.length - 1; i >= 0; i--) {
          const b = blips[i];
          b.age++;

          const blipAngle = Math.atan2(b.by - cy, b.bx - cx);
          const diff = ((angle - blipAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          const freshlyLit = diff < sweepLen && diff > 0;

          if (freshlyLit) {
            b.lit = true;
            b.fadeAlpha = Math.max(0, 1 - diff / sweepLen);
          } else {
            b.fadeAlpha = Math.max(0, b.fadeAlpha - 0.008);
          }

          if (b.fadeAlpha > 0.02) {
            // Blip glow
            const bg = ctx.createRadialGradient(b.bx, b.by, 0, b.bx, b.by, b.size * 4);
            bg.addColorStop(0, `rgba(${c},${b.fadeAlpha * 0.8})`);
            bg.addColorStop(1, `rgba(${c},0)`);
            ctx.beginPath();
            ctx.arc(b.bx, b.by, b.size * 4, 0, Math.PI * 2);
            ctx.fillStyle = bg;
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(b.bx, b.by, b.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${b.fadeAlpha})`;
            ctx.fill();

            // Label
            if (b.fadeAlpha > 0.15) {
              ctx.font = `bold 9px 'JetBrains Mono', monospace`;
              ctx.fillStyle = `rgba(${c},${b.fadeAlpha * 0.9})`;
              ctx.fillText(b.label, b.bx + b.size + 5, b.by - b.size - 2);
            }
          }

          if (b.age > b.maxAge) { blips.splice(i, 1); spawnBlip(); }
        }

        // Center pulsing dot
        const cpulse = 0.7 + Math.sin(frame * 0.08) * 0.3;
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
        cg.addColorStop(0, `rgba(255,255,255,${cpulse})`);
        cg.addColorStop(0.4, `rgba(${c},${cpulse * 0.6})`);
        cg.addColorStop(1, `rgba(${c},0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fillStyle = cg;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,0.95)`;
        ctx.fill();

        // HUD corner brackets
        const bSize = 20;
        const corners = [
          [cx - maxR - 4, cy - maxR - 4, 1, 1],
          [cx + maxR + 4, cy - maxR - 4, -1, 1],
          [cx - maxR - 4, cy + maxR + 4, 1, -1],
          [cx + maxR + 4, cy + maxR + 4, -1, -1],
        ];
        ctx.strokeStyle = `rgba(${c},0.65)`;
        ctx.lineWidth = 2;
        for (const [x, y, sx, sy] of corners) {
          ctx.beginPath();
          ctx.moveTo(x + sx * bSize, y);
          ctx.lineTo(x, y); ctx.lineTo(x, y + sy * bSize);
          ctx.stroke();
        }

        // Status bar
        const az = Math.round(((angle % (Math.PI * 2)) / (Math.PI * 2)) * 360);
        ctx.fillStyle = `rgba(${c},0.6)`;
        ctx.font = `10px 'JetBrains Mono', monospace`;
        ctx.fillText("LEXDRIVE AI — SCANNING", cx - maxR + 4, cy + maxR + 18);
        ctx.fillText(`AZ: ${az}°  TARGETS: ${blips.length}`, cx + maxR - 140, cy + maxR + 18);
      };
      drawLoop = draw;
      draw();
    }

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [variant, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
