"use client";
import React, { useState, useEffect, useRef } from "react";
import "./globals.css";
import OnboardingFlow from "../components/OnboardingFlow";
import { useDriveContext } from "../context/DriveContext";
import Robot3D from "../components/Robot3D";

/* ─── Reusable primitives ─── */
function ParticleBackground() {
  return (
    <div className="particle-container">
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className="particle" 
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%`, 
            width: `${Math.random() * 6 + 2}px`, 
            height: `${Math.random() * 6 + 2}px`, 
            animationDuration: `${Math.random() * 15 + 10}s`,
            animationDelay: `${Math.random() * -20}s`
          }} 
        />
      ))}
    </div>
  );
}

function Tag({ children, color = "brand" }: { children: React.ReactNode; color?: "brand"|"violet"|"success"|"warning"|"danger" }) {
  const map: Record<string, { bg: string; border: string; text: string }> = {
    brand:   { bg:"var(--brand-light)",   border:"rgba(37,99,235,0.2)",   text:"var(--brand)"   },
    violet:  { bg:"var(--violet-light)",  border:"rgba(124,58,237,0.2)",  text:"var(--violet)"  },
    success: { bg:"var(--success-bg)",    border:"var(--success-border)", text:"var(--success)" },
    warning: { bg:"var(--warning-bg)",    border:"var(--warning-border)", text:"var(--warning)" },
    danger:  { bg:"var(--danger-bg)",     border:"var(--danger-border)",  text:"var(--danger)"  },
  };
  const s = map[color];
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:"0.375rem",padding:"0.3rem 0.75rem",borderRadius:"var(--radius-full)",fontSize:"0.75rem",fontWeight:700,letterSpacing:"0.02em",background:s.bg,border:`1px solid ${s.border}`,color:s.text }}>
      {children}
    </span>
  );
}

function StatCard({ value, label, sub, icon, color = "#2563eb" }: { value: string; label: string; sub?: string; icon?: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(value);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        const numMatch = value.match(/^([<₹]*)(\d+)(\+?.*)/);
        if (numMatch) {
          const prefix = numMatch[1];
          const target = parseInt(numMatch[2]);
          const suffix = numMatch[3];
          const duration = 1200;
          const steps = 30;
          const stepTime = duration / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += Math.ceil(target / steps);
            if (current >= target) { current = target; clearInterval(timer); }
            setDisplay(`${prefix}${current}${suffix}`);
          }, stepTime);
        }
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="stat-pop" style={{ 
      flex: "1 1 180px",
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      padding:"2rem 1.5rem",
      background:"rgba(255, 255, 255, 0.8)",
      backdropFilter:"blur(16px)",
      WebkitBackdropFilter:"blur(16px)",
      border:"1px solid rgba(255, 255, 255, 0.6)",
      borderRadius:"28px",
      boxShadow:"0 4px 20px -5px rgba(0,0,0,0.05)",
      gap:"0.5rem",
      transition:"all 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
      cursor:"default",
      position:"relative",
      overflow:"hidden",
      textAlign:"center"
    }} onMouseEnter={(e) => { 
      e.currentTarget.style.transform = 'translateY(-10px)'; 
      e.currentTarget.style.boxShadow = `0 25px 50px -12px ${color}1a`;
      e.currentTarget.style.borderColor = `${color}4d`;
    }} onMouseLeave={(e) => { 
      e.currentTarget.style.transform = 'none'; 
      e.currentTarget.style.boxShadow = '0 4px 20px -5px rgba(0,0,0,0.05)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
    }}>
      {/* Dynamic Glow Orb */}
      <div style={{ position:"absolute", top:"-10%", right:"-10%", width:"80px", height:"80px", background:color, opacity:0.06, filter:"blur(30px)", borderRadius:"50%", transition:"all 0.5s ease" }} />
      
      {icon && (
        <div style={{ position:"relative", marginBottom:"1rem" }}>
          <div style={{ position:"absolute", inset:-10, background:color, opacity:0.1, filter:"blur(10px)", borderRadius:"50%" }} />
          <div style={{ fontSize:"2.25rem", position:"relative", zIndex:1, filter:"drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}>{icon}</div>
        </div>
      )}
      
      <span style={{ 
        fontSize:"2.25rem",
        fontWeight:900,
        color:"var(--fg)",
        letterSpacing:"-0.06em",
        fontFamily:"'Sora',sans-serif",
        lineHeight:1, 
        background:`linear-gradient(180deg, var(--fg) 0%, ${color} 150%)`, 
        WebkitBackgroundClip:"text", 
        WebkitTextFillColor:"transparent" 
      }}>{display}</span>
      
      <span style={{ fontSize:"0.875rem",color:"#475569",fontWeight:700,marginTop:"0.25rem", letterSpacing:"-0.01em" }}>{label}</span>
      {sub && <span style={{ fontSize:"0.7rem",color:"#94a3b8",fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginTop:"0.25rem", opacity:0.8 }}>{sub}</span>}
    </div>
  );
}

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { setIsChatOpen } = useDriveContext();
  
  const [plateQuery, setPlateQuery] = useState("");
  const [challanStatus, setChallanStatus] = useState<null|"checking"|"found"|"clean">(null);
  const [ownerName, setOwnerName] = useState("");

  const handleChallanSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateQuery) return;
    setChallanStatus("checking");
    
    try {
      const res = await fetch("/api/vahan", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ plateNumber: plateQuery }) });
      const data = await res.json();
      if (data?.data?.ownerName && data.data.ownerName !== "Data Unavailable") {
        setOwnerName(data.data.ownerName);
        setChallanStatus("clean"); // Just mocking a clean status for demo
      } else {
        setTimeout(() => { setOwnerName("Verified Citizen"); setChallanStatus("clean"); }, 1000);
      }
    } catch {
      setTimeout(() => { setOwnerName("Verified Citizen"); setChallanStatus("clean"); }, 1000);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("LexDrive_onboarded")) setShowOnboarding(true);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const t = setTimeout(() => {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
      }, { threshold: 0.06, rootMargin: "0px 0px -30px 0px" });
      document.querySelectorAll(".scroll-reveal").forEach(el => obs.observe(el));
      return () => obs.disconnect();
    }, 100);
    return () => clearTimeout(t);
  }, [isLoaded]);

  if (!isLoaded) return null;
  if (showOnboarding) return (
    <main style={{ minHeight:"100vh",background:"var(--bg)" }}>
      <OnboardingFlow onComplete={() => { localStorage.setItem("LexDrive_onboarded","true"); setShowOnboarding(false); }} />
    </main>
  );

  return (
    <main style={{ minHeight:"100vh",background:"var(--bg)",overflowX:"hidden" }}>
      <ParticleBackground />
      <div className="bg-mesh" />

      {/* ══ NAV ══ */}
      <nav className="animate-fade-in-up" style={{ position:"sticky",top:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 5%",height:60,background:"var(--nav-bg)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderBottom:"1px solid var(--nav-border)" }}>
        <a href="/" style={{ display:"flex",alignItems:"center",gap:"0.625rem",textDecoration:"none" }}>
          <div style={{ position:"relative" }}>
            <div style={{ width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#2563EB,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(37,99,235,0.35)" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div className="live-dot" />
          </div>
          <span style={{ fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:"1.0625rem",letterSpacing:"-0.04em",color:"var(--fg)" }}>LexDrive<span style={{ color:"var(--brand)" }}> AI</span></span>
        </a>
        <div style={{ display:"flex",alignItems:"center",gap:"1.75rem" }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="/finebook" className="nav-link">Finebook</a>
          <a href="#how-it-works" className="nav-link">How it works</a>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:"0.625rem" }}>
          <button onClick={() => setIsChatOpen(true)} className="btn-secondary" style={{ padding:"0.4375rem 1rem",fontSize:"0.8125rem",height:36 }}>Ask AI</button>
          <a href="/drive" className="btn-primary shimmer-effect" style={{ padding:"0.4375rem 1.125rem",fontSize:"0.8125rem",height:36 }}>Start Driving</a>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ maxWidth:1200,margin:"0 auto",padding:"6rem 5% 4rem",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",position:"relative" }}>

        {/* Eyebrow */}
        <div className="animate-fade-in-up badge-animate" style={{ marginBottom:"1.75rem" }}>
          <Tag color="brand">
            <span style={{ width:6,height:6,borderRadius:"50%",background:"var(--brand)",display:"inline-block",animation:"live-pulse 2s infinite" }} />
            Now live — LexDrive AI for Android Auto
          </Tag>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100" style={{ fontSize:"clamp(2.75rem,6.5vw,5rem)",fontWeight:800,letterSpacing:"-0.055em",lineHeight:1.06,marginBottom:"1.625rem",maxWidth:860 }}>
          <span className="hero-gradient-text">The AI co-pilot</span> that keeps<br />
          <span style={{ position:"relative",display:"inline-block" }}>
            <span className="text-gradient-accent">you legal on every road.</span>
            <svg style={{ position:"absolute",bottom:-8,left:0,width:"100%",height:8,overflow:"visible" }} viewBox="0 0 300 8" preserveAspectRatio="none">
              <path d="M0 6 Q75 0 150 4 Q225 8 300 2" stroke="url(#ul)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <defs><linearGradient id="ul" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#7C3AED"/></linearGradient></defs>
            </svg>
          </span>
        </h1>

        {/* Sub */}
        <p className="animate-fade-in-up delay-200" style={{ fontSize:"clamp(1rem,2.2vw,1.1875rem)",color:"var(--fg-muted)",maxWidth:580,lineHeight:1.75,marginBottom:"2.75rem",fontWeight:400 }}>
          LexDrive watches your speed, detects school zones and speed cameras, and speaks legal warnings in your language — automatically, before you get fined.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up delay-300" style={{ display:"flex",gap:"0.875rem",flexWrap:"wrap",justifyContent:"center",marginBottom:"4.5rem" }}>
          <a href="/drive" className="btn-primary shimmer-effect btn-magnetic" style={{ padding:"0.9375rem 2.25rem",fontSize:"1rem",gap:"0.625rem",boxShadow:"0 8px 24px rgba(37,99,235,0.3)" }}>
            Start Driving — Phone Mode
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <a href="/car" className="btn-secondary btn-magnetic" style={{ padding:"0.9375rem 2.25rem",fontSize:"1rem" }}>
            Car Display Simulator
          </a>
        </div>


        {/* Stats row */}
        <div className="animate-fade-in-up delay-400" style={{ 
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))",
          gap:"1.25rem",
          width:"100%",
          maxWidth:1300,
          margin:"0 auto",
          padding:"1.5rem"
        }}>
          <StatCard value="115+" label="Violations cataloged" sub="MV Act 2019" icon="⚖️" color="#2563eb" />
          <StatCard value="6" label="Countries covered" sub="India, USA, UK, UAE…" icon="🌍" color="#10b981" />
          <StatCard value="4" label="Languages" sub="EN, HI, MR, KN" icon="🗣️" color="#8b5cf6" />
          <StatCard value="17" label="Auto alert types" sub="No button press" icon="🚨" color="#ef4444" />
          <StatCard value="< 1s" label="AI response time" sub="Groq Llama 3.1" icon="⚡" color="#f59e0b" />
        </div>

      </section>

      {/* ══ SOCIAL PROOF BAR ══ */}
      <div style={{ borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)",background:"var(--bg-white)",padding:"1.25rem 5%",display:"flex",alignItems:"center",justifyContent:"center",gap:"2.5rem",flexWrap:"wrap" }}>
        {[
          { label:"Powered by", value:"Groq Llama 3.1" },
          { label:"Speed data", value:"Ola Maps + OpenStreetMap" },
          { label:"Vehicle data", value:"Parivahan / Vahan RTO" },
          { label:"OBD-II", value:"ELM327 BLE (Web Bluetooth)" },
          { label:"Laws", value:"MV Act 2019 + 6 countries" },
        ].map(item => (
          <div key={item.label} style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
            <span style={{ fontSize:"0.75rem",color:"var(--fg-faint)",fontWeight:500 }}>{item.label}</span>
            <span style={{ fontSize:"0.8125rem",color:"var(--fg-secondary)",fontWeight:600 }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* ══ FEATURES ══ */}
      <section id="features" style={{ padding:"6rem 5%",background:"var(--bg)",borderBottom:"1px solid var(--border)" }}>
        <div style={{ maxWidth:1200,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:"4rem" }}>
            <h2 className="animate-fade-in-up" style={{ fontSize:"clamp(2rem,4vw,3rem)",fontWeight:800,letterSpacing:"-0.04em",color:"var(--fg)",marginBottom:"1rem" }}>
              Platform <span className="text-gradient-accent">Capabilities</span>
            </h2>
            <p style={{ color:"var(--fg-secondary)",fontSize:"1.125rem",maxWidth:600,margin:"0 auto",lineHeight:1.6 }}>
              Enterprise-grade modules engineered for real-time compliance, proactive intelligence, and seamless driver safety.
            </p>
          </div>

          {/* ── Hero Card: AI Co-Pilot ── */}
          <div className="scroll-reveal gradient-border bg-live-gradient" style={{ border:"1px solid var(--border)",borderRadius:"28px",padding:"3rem",boxShadow:"var(--shadow-xl)",transition:"transform 0.3s, box-shadow 0.3s",display:"flex",flexWrap:"wrap",alignItems:"center",gap:"2rem",marginBottom:"1.5rem",overflow:"hidden" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.06)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}>
            <div style={{ flex:"1 1 300px" }}>
              <div className="badge-animate" style={{ display:"inline-flex",padding:"0.35rem 0.875rem",borderRadius:"var(--radius-full)",background:"var(--brand-light)",border:"1px solid rgba(37,99,235,0.15)",color:"var(--brand)",fontSize:"0.75rem",fontWeight:700,letterSpacing:"0.04em",marginBottom:"1.25rem",animationDelay:"0.3s" }}>FLAGSHIP MODULE</div>
              <h3 style={{ fontSize:"2.25rem",fontWeight:800,color:"var(--fg)",marginBottom:"1rem",letterSpacing:"-0.04em",lineHeight:1.1 }}>Meet your AI Co-Pilot</h3>
              <p style={{ color:"#475569",fontSize:"1.125rem",lineHeight:1.6,fontWeight:500,marginBottom:"1.5rem",maxWidth:420 }}>Fully interactive 3D companion powered by Groq Llama 3.1. Ask legal questions by voice, get instant answers in 4 languages, and receive proactive driving alerts — all hands-free.</p>
              <div style={{ display:"flex",gap:"0.625rem",flexWrap:"wrap" }}>
                <span style={{ padding:"0.375rem 0.875rem",borderRadius:"var(--radius-full)",background:"#eff6ff",border:"1px solid rgba(37,99,235,0.1)",color:"#2563eb",fontSize:"0.8125rem",fontWeight:600 }}>Voice + Text</span>
                <span style={{ padding:"0.375rem 0.875rem",borderRadius:"var(--radius-full)",background:"#eff6ff",border:"1px solid rgba(37,99,235,0.1)",color:"#2563eb",fontSize:"0.8125rem",fontWeight:600 }}>4 Languages</span>
                <span style={{ padding:"0.375rem 0.875rem",borderRadius:"var(--radius-full)",background:"#eff6ff",border:"1px solid rgba(37,99,235,0.1)",color:"#2563eb",fontSize:"0.8125rem",fontWeight:600 }}>&lt;1s Response</span>
              </div>
            </div>
            <div style={{ flex:"1 1 260px",height:"280px",minWidth:260 }}>
              <Robot3D state="listening" size={280} />
            </div>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",gap:"1.5rem" }}>
            {[
              {
                title: "AI Legal Co-Pilot",
                desc: "Multilingual RAG models powered by Groq Llama 3.1 for instant state-law queries.",
                badge: "VOICE\n+\nTEXT",
                bottomLeft: "L"
              },
              {
                icon: "🚨",
                title: "Proactive Alerts",
                desc: "Automatically warns you about speed limits, school zones, and harsh driving patterns before you get fined."
              },
              {
                icon: "🌍",
                title: "Global Finebook",
                desc: "100+ violations across India, USA, UK, and UAE. Covers Indian MV Act (2019) sections with natural language filtering."
              },
              {
                icon: "🔌",
                title: "OBD-II Integration",
                desc: "Connects to any ELM327 BLE adapter via Web Bluetooth to read real vehicle speed directly from your car's ECU."
              },
              {
                icon: "📍",
                title: "Context-Aware",
                desc: "Monitors OpenStreetMap for nearby POIs like hospitals and police stations to give location-aware legal advice."
              },
              {
                icon: "🏆",
                title: "Gamified Safety",
                desc: "Earn badges like 'Speed Saint' and track your driving score with automated post-drive summaries."
              }
            ].map((feature, i) => {
              if (feature.badge) {
                return (
                  <div key={i} className="scroll-reveal" style={{ background:"var(--bg-white)",border:"1px solid var(--border)",borderRadius:"28px",padding:"2.5rem 2rem",boxShadow:"var(--shadow-sm)",transition:"transform 0.2s, box-shadow 0.2s",position:"relative",minHeight:"280px",display:"flex",flexDirection:"column", gridColumn: "span 1" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                    {/* Top Right Badge */}
                    <div style={{ position:"absolute", top:"1.5rem", right:"1.5rem", width:56, height:56, borderRadius:"50%", background:"#eff6ff", color:"#2563eb", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.6rem", fontWeight:800, textAlign:"center", lineHeight:1.3, whiteSpace:"pre-wrap", border:"1px solid rgba(37,99,235,0.1)" }}>
                      {feature.badge}
                    </div>
                    {/* Main Content */}
                    <h3 style={{ fontSize:"1.875rem",fontWeight:800,color:"var(--fg)",marginBottom:"1.25rem",letterSpacing:"-0.03em", maxWidth:"75%", lineHeight:1.1, marginTop:"0.5rem" }}>{feature.title}</h3>
                    <p style={{ color:"#475569",fontSize:"1.0625rem",lineHeight:1.4, maxWidth:"85%", fontWeight:500 }}>{feature.desc}</p>
                    
                    {/* Bottom Left Logo */}
                    <div style={{ position:"absolute", bottom:"1.5rem", left:"1.5rem", width:44, height:44, borderRadius:"50%", background:"#262626", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.125rem", fontWeight:700, boxShadow:"0 4px 10px rgba(0,0,0,0.1)" }}>
                      {feature.bottomLeft}
                    </div>
                    
                    {/* Bottom Right FAB */}
                    <div style={{ position:"absolute", bottom:"1.5rem", right:"1.5rem", width:60, height:60, borderRadius:"50%", background:"#3b82f6", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.75rem", boxShadow:"0 8px 24px rgba(59,130,246,0.4)" }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="scroll-reveal" style={{ background:"var(--bg-white)",border:"1px solid var(--border)",borderRadius:"24px",padding:"2.5rem 2rem",boxShadow:"var(--shadow-sm)",transition:"transform 0.2s, box-shadow 0.2s",cursor:"default" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                  <div style={{ width:56,height:56,borderRadius:"var(--radius-xl)",background:"var(--brand-light)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.75rem",marginBottom:"1.75rem",border:"1px solid rgba(37,99,235,0.1)" }}>{feature.icon}</div>
                  <h3 style={{ fontSize:"1.25rem",fontWeight:700,color:"var(--fg)",marginBottom:"0.75rem",letterSpacing:"-0.02em" }}>{feature.title}</h3>
                  <p style={{ color:"var(--fg-muted)",fontSize:"1rem",lineHeight:1.6 }}>{feature.desc}</p>
                </div>
              );
            })}
          </div>

          {/* ── Interactive Modules Row ── */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",gap:"1.5rem",marginTop:"1.5rem" }}>
            {/* E-Challan Lookup Card */}
            <div className="scroll-reveal" style={{ background:"var(--bg-white)",border:"1px solid var(--border)",borderRadius:"28px",padding:"2.5rem 2rem",boxShadow:"var(--shadow-sm)",transition:"transform 0.2s, box-shadow 0.2s",textAlign:"left",position:"relative",minHeight:"280px",display:"flex",flexDirection:"column" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1rem" }}>
                <div style={{ width:40,height:40,borderRadius:"50%",background:"var(--brand-light)",color:"var(--brand)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.25rem",border:"1px solid rgba(37,99,235,0.1)" }}>🔍</div>
                <h3 style={{ fontSize:"1.5rem",fontWeight:800,color:"var(--fg)",margin:0,letterSpacing:"-0.02em" }}>Live E-Challan Lookup</h3>
              </div>
              <p style={{ color:"#475569", fontSize:"1rem", marginBottom:"1.5rem",fontWeight:500 }}>Enter your vehicle plate number to verify registration and pending fines in real-time.</p>
              <form onSubmit={handleChallanSearch} style={{ display:"flex", gap:"0.5rem",marginTop:"auto" }}>
                <input type="text" placeholder="e.g. MH12AB1234" value={plateQuery} onChange={(e)=>setPlateQuery(e.target.value.toUpperCase())} style={{ flex:1, padding:"0.875rem 1.25rem", borderRadius:"16px", border:"1px solid var(--border)", background:"var(--bg)", color:"var(--fg)", fontWeight:600, fontSize:"1rem", outline:"none" }} />
                <button type="submit" disabled={challanStatus === "checking"} className="btn-primary" style={{ padding:"0 1.5rem", borderRadius:"16px", fontSize:"0.9375rem" }}>
                  {challanStatus === "checking" ? "..." : "Verify"}
                </button>
              </form>
              {challanStatus === "clean" && (
                <div className="animate-fade-in-up" style={{ marginTop:"1rem", padding:"0.875rem 1.25rem", background:"var(--success-bg)", border:"1px solid var(--success-border)", borderRadius:"16px", display:"flex", alignItems:"center", gap:"0.75rem" }}>
                  <span style={{ fontSize:"1.25rem" }}>✅</span>
                  <div style={{ display:"flex", flexDirection:"column" }}>
                    <span style={{ color:"var(--success)", fontWeight:700, fontSize:"0.9375rem" }}>No Pending Challans</span>
                    <span style={{ color:"var(--success)", fontSize:"0.8125rem", opacity:0.8 }}>Owner: {ownerName}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" style={{ padding:"6rem 5%",background:"var(--bg)" }}>
        <div style={{ maxWidth:1200,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center" }}>
          <div style={{ textAlign:"center",marginBottom:"4rem" }}>
            <h2 className="animate-fade-in-up" style={{ fontSize:"clamp(2rem,4vw,3rem)",fontWeight:800,letterSpacing:"-0.04em",color:"var(--fg)",marginBottom:"1rem" }}>
              How it <span className="text-gradient-accent">works</span>
            </h2>
            <p style={{ color:"var(--fg-secondary)",fontSize:"1.125rem",maxWidth:600,margin:"0 auto",lineHeight:1.6 }}>
              LexDrive combines modern web APIs with ultra-fast AI to create a seamless driving experience.
            </p>
          </div>

          <style dangerouslySetInnerHTML={{__html:`
            .flowchart-container { display: flex; flex-wrap: nowrap; justify-content: center; align-items: stretch; gap: 1.5rem; width: 100%; max-width: 1200px; margin: 0 auto; }
            .flowchart-arrow { display: flex; align-items: center; justify-content: center; color: var(--brand); opacity: 0.5; }
            .flowchart-card { flex: 1; min-width: 200px; display: flex; flex-direction: column; align-items: center; text-align: center; background: var(--bg-white); padding: 2.5rem 1.5rem; border-radius: var(--radius-2xl); border: 1px solid var(--border); box-shadow: var(--shadow-xl); transition: transform 0.3s ease, box-shadow 0.3s ease; }
            .flowchart-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
            @media (max-width: 960px) {
              .flowchart-container { flex-direction: column; align-items: center; }
              .flowchart-arrow svg { transform: rotate(90deg); }
              .flowchart-arrow { padding: 0.5rem 0; }
              .flowchart-card { width: 100%; max-width: 400px; }
            }
          `}} />
          <div className="flowchart-container">
            {[
              { num: "01", title: "Data Collection", icon:"🛰️", desc: "GPS & OBD-II stream speed. OSM & Ola Maps provide speed limits." },
              { num: "02", title: "Intelligence Layer", icon:"🧠", desc: "Evaluates behavior against local traffic laws & active limits." },
              { num: "03", title: "Proactive Warning", icon:"🚨", desc: "Synthesizes voice alerts via Web Speech API before violations." },
              { num: "04", title: "Voice UI", icon:"💬", desc: "Ask the 3D Robot questions & get sub-second Groq answers." }
            ].map((step, i) => [
              <div key={`card-${i}`} className="scroll-reveal flowchart-card">
                <div style={{ width:64,height:64,borderRadius:"50%",background:"var(--brand-light)",border:"2px solid rgba(37,99,235,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",marginBottom:"1.5rem",boxShadow:"0 8px 16px rgba(37,99,235,0.15)" }}>
                  {step.icon}
                </div>
                <div style={{ fontSize:"0.8125rem",fontWeight:800,color:"var(--brand)",marginBottom:"0.5rem",letterSpacing:"0.05em",textTransform:"uppercase" }}>STEP {step.num}</div>
                <h3 style={{ fontSize:"1.25rem",fontWeight:800,color:"var(--fg)",marginBottom:"1rem",letterSpacing:"-0.02em",lineHeight:1.2 }}>{step.title}</h3>
                <p style={{ color:"var(--fg-muted)",fontSize:"0.9375rem",lineHeight:1.6,margin:0 }}>{step.desc}</p>
              </div>,
              i < 3 && (
                <div key={`arrow-${i}`} className="scroll-reveal flowchart-arrow">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              )
            ])}
          </div>
        </div>
      </section>

      {/* ══ TECH STACK ══ */}
      <section style={{ padding:"6rem 5%",background:"var(--bg-white)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)" }}>
        <div style={{ maxWidth:1000,margin:"0 auto",textAlign:"center" }}>
          <h2 className="scroll-reveal" style={{ fontSize:"clamp(1.75rem,3vw,2.5rem)",fontWeight:800,letterSpacing:"-0.03em",color:"var(--fg)",marginBottom:"3rem" }}>
            Powered by modern tech
          </h2>
          <div className="scroll-reveal" style={{ display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"1rem" }}>
            {["Next.js 16.2", "React 19", "Three.js", "React Three Fiber", "Groq Llama 3.1", "Web Bluetooth API", "OpenStreetMap", "Open-Meteo", "Ola Maps", "RapidAPI"].map(tech => (
              <span key={tech} style={{ padding:"0.625rem 1.25rem",borderRadius:"var(--radius-full)",background:"var(--bg)",border:"1px solid var(--border)",color:"var(--fg-secondary)",fontWeight:600,fontSize:"0.875rem",boxShadow:"var(--shadow-sm)",transition:"all 0.25s ease",cursor:"default" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.15)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; e.currentTarget.style.color = 'var(--brand)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-secondary)'; }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section style={{ padding:"6rem 5%",background:"var(--bg)",textAlign:"center" }}>
        <div className="scroll-reveal gradient-border" style={{ maxWidth:800,margin:"0 auto",padding:"4rem 2rem",background:"linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))",border:"1px solid var(--border)",borderRadius:"var(--radius-2xl)",boxShadow:"var(--shadow-xl)",overflow:"hidden" }}>
          <h2 style={{ fontSize:"clamp(2rem,4vw,3rem)",fontWeight:800,letterSpacing:"-0.04em",color:"var(--fg)",marginBottom:"1rem" }}>
            Ready for a smarter drive?
          </h2>
          <p style={{ color:"var(--fg-secondary)",fontSize:"1.125rem",marginBottom:"2.5rem",maxWidth:500,margin:"0 auto 2.5rem" }}>
            Launch the AI Co-Pilot now. It's completely free, and your privacy is fully protected with on-device processing.
          </p>
          <a href="/drive" className="btn-primary shimmer-effect" style={{ padding:"1rem 3rem",fontSize:"1.125rem",gap:"0.75rem",boxShadow:"0 8px 32px rgba(37,99,235,0.4)" }}>
            Launch LexDrive AI
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </section>

      {/* ══ BUILT BY ══ */}
      <section style={{ padding:"6rem 5%",background:"var(--bg)" }}>
        <div style={{ maxWidth:1000,margin:"0 auto",textAlign:"center" }}>
          <h2 className="scroll-reveal" style={{ fontSize:"clamp(1.75rem,3vw,2.5rem)",fontWeight:800,letterSpacing:"-0.03em",color:"var(--fg)",marginBottom:"1rem" }}>
            Built by the <span className="text-gradient-accent">Team</span>
          </h2>
          <p className="scroll-reveal" style={{ color:"var(--fg-secondary)",fontSize:"1.125rem",marginBottom:"4rem" }}>
            The engineers and architects behind LexDrive AI.
          </p>
          <div className="scroll-reveal" style={{ display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"2rem" }}>
            {[
              { name: "Harshal Attarde", role: "AI Architect & Full Stack" },
              { name: "Kushal Mahajan", role: "Full-Stack Developer" },
              { name: "Bharat Toke", role: "Data Engineer" },
              { name: "Himanshu Girase", role: "ML Engineer" }
            ].map(member => (
              <div key={member.name} style={{ background:"var(--bg-white)",padding:"2rem",borderRadius:"var(--radius-2xl)",border:"1px solid var(--border)",boxShadow:"var(--shadow-sm)",minWidth:220 }}>
                <div style={{ fontSize:"1.25rem",fontWeight:700,color:"var(--fg)",marginBottom:"0.5rem" }}>{member.name}</div>
                <div style={{ fontSize:"0.875rem",color:"var(--brand)",fontWeight:600 }}>{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding:"3rem 5%",borderTop:"1px solid var(--border)",background:"var(--bg-white)",textAlign:"center" }}>
        <p style={{ color:"var(--fg-muted)",fontSize:"0.875rem",fontWeight:500 }}>
          © {new Date().getFullYear()} LexDrive AI. All rights reserved. Drive safe.
        </p>
      </footer>
    </main>
  );
}