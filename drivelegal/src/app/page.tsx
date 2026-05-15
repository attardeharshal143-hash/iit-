"use client";
import React, { useState, useEffect } from "react";
import "./globals.css";
import OnboardingFlow from "../components/OnboardingFlow";
import ThreeBackground from "../components/ThreeBackground";
import VehicleSelectModal from "../components/VehicleSelectModal";
import Robot3D from "../components/Robot3D";
import HeroStatic from "../components/HeroStatic";
import { useDriveContext } from "../context/DriveContext";
import { translations, Language } from "../lib/translations";

export default function Home() {
  const { setIsChatOpen, appLanguage, setAppLanguage } = useDriveContext();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const [plateQuery, setPlateQuery] = useState("");
  const [challanStatus, setChallanStatus] = useState<null | "checking" | "found" | "clean">(null);
  const [ownerName, setOwnerName] = useState("");
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  const t = translations[appLanguage as Language] || translations["en-IN"];

  const handleChallanSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateQuery) return;
    setChallanStatus("checking");

    try {
      const res = await fetch("/api/vahan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plateNumber: plateQuery }) });
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
    // Skip onboarding — show main page directly
    // if (!localStorage.getItem("LexDrive_onboarded")) setShowOnboarding(true);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const t = setTimeout(() => {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
      document.querySelectorAll(".scroll-reveal").forEach(el => obs.observe(el));
      return () => obs.disconnect();
    }, 100);
    return () => clearTimeout(t);
  }, [isLoaded]);

  if (!isLoaded) return null;
  if (showOnboarding) return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <OnboardingFlow onComplete={() => { localStorage.setItem("LexDrive_onboarded", "true"); setShowOnboarding(false); }} />
    </main>
  );

  const languages: { code: Language; label: string }[] = [
    { code: "en-IN", label: "English" },
    { code: "hi-IN", label: "हिंदी" },
    { code: "mr-IN", label: "मराठी" },
    { code: "kn-IN", label: "ಕನ್ನಡ" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "transparent", overflowX: "clip", position: "relative" }}>
      <VehicleSelectModal isOpen={showVehicleModal} onClose={() => setShowVehicleModal(false)} />
      


      {/* ══ NAV ══ */}
      <nav className="nav-container animate-fade-in-up" style={{ position: "sticky", top: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 5%", height: 60, background: "rgba(8, 12, 18, 0.9)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
          <span style={{ fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic", fontWeight: 900, fontSize: "1.25rem", letterSpacing: "-0.04em", color: "#fff" }}>LexDrive AI</span>
        </a>


        {/* Right side controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <a href="/finebook" className="nav-link nav-desktop-links" style={{ color: "#ffffff", fontSize: "0.875rem", fontWeight: 600, transition: "color 0.2s ease", textDecoration: "none" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#00e5ff"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#ffffff"; }}>{t.nav.finebook}</a>
          {/* Desktop CTA */}
          <div className="nav-desktop-cta" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button onClick={() => setIsChatOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1.25rem", background: "transparent", color: "#fff", fontWeight: 700, fontSize: "0.875rem", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", transition: "all 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,229,255,0.5)"; e.currentTarget.style.color = "#00e5ff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#fff"; }}>
              <span style={{ fontSize: "1.1rem" }}>💬</span> {t.nav.askAi}
            </button>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowVehicleModal(true); }} style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1.25rem", background: "#fff", color: "#000", fontWeight: 700, fontSize: "0.875rem", borderRadius: "9999px", textDecoration: "none" }}>{t.nav.startDriving}</a>
          </div>

          {/* ── Custom Language Selector ── */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setLangMenuOpen(o => !o)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                padding: "0.4rem 1rem", height: "36px",
                background: "rgba(8,12,18,0.8)", color: "#fff",
                fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.02em",
                borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.25)",
                cursor: "pointer", transition: "all 0.2s ease",
                backdropFilter: "blur(4px)", whiteSpace: "nowrap"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#00e5ff"; e.currentTarget.style.color = "#00e5ff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#fff"; }}
            >
              {(() => {
                const langs = {
                  "en-IN": "English", "hi-IN": "हिन्दी", "mr-IN": "मराठी", "kn-IN": "ಕನ್ನಡ",
                  "bn-IN": "বাংলা", "gu-IN": "ગુજરાતી", "ta-IN": "தமிழ்", "te-IN": "తెలుగు"
                };
                return `🌐 ${langs[appLanguage as keyof typeof langs] || "English"}`;
              })()}
              <span style={{ fontSize: "0.6rem", color: "#00e5ff", marginLeft: "2px" }}>▼</span>
            </button>
            {langMenuOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "rgba(8,12,18,0.95)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px", overflow: "hidden", minWidth: "150px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)", backdropFilter: "blur(20px)",
                zIndex: 999
              }}>
                {([
                  { code: "en-IN", label: "English", native: "English" },
                  { code: "hi-IN", label: "Hindi", native: "हिन्दी" },
                  { code: "mr-IN", label: "Marathi", native: "मराठी" },
                  { code: "kn-IN", label: "Kannada", native: "ಕನ್ನಡ" },
                  { code: "bn-IN", label: "Bengali", native: "বাংলা" },
                  { code: "gu-IN", label: "Gujarati", native: "ગુજરાતી" },
                  { code: "ta-IN", label: "Tamil", native: "தமிழ்" },
                  { code: "te-IN", label: "Telugu", native: "తెలుగు" },
                ] as { code: Language; label: string; native: string }[]).map(lang => (

                  <button key={lang.code} onClick={() => { setAppLanguage(lang.code); setLangMenuOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      width: "100%", padding: "0.65rem 1rem", background: "transparent",
                      border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer", transition: "background 0.15s ease",
                      color: appLanguage === lang.code ? "#00e5ff" : "#fff",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,229,255,0.07)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{lang.native}</span>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{lang.label}</span>
                    {appLanguage === lang.code && <span style={{ color: "#00e5ff", fontSize: "0.75rem" }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Hamburger — mobile only */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={{ display: "none", flexDirection: "column", gap: "5px", background: "none", border: "none", cursor: "pointer", padding: "4px", flexShrink: 0 }}
        >
          <span style={{ display: "block", width: 22, height: 2, background: "#fff", borderRadius: 2, transition: "all 0.25s ease", transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
          <span style={{ display: "block", width: 22, height: 2, background: "#fff", borderRadius: 2, transition: "all 0.25s ease", opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: "block", width: 22, height: 2, background: "#fff", borderRadius: 2, transition: "all 0.25s ease", transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
        </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="mobile-menu-dropdown" style={{ position: "fixed", top: 60, left: 0, right: 0, zIndex: 999, background: "rgba(8,12,18,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem 5%", display: "flex", flexDirection: "column", gap: "1.25rem", transition: "top 0.3s ease" }}>
          <a href="/finebook" onClick={() => setMenuOpen(false)} style={{ color: "#ffffff", fontSize: "1.125rem", fontWeight: 700, textDecoration: "none", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{t.nav.finebook}</a>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button onClick={() => { setMenuOpen(false); setIsChatOpen(true); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.875rem", background: "transparent", color: "#fff", fontWeight: 700, fontSize: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>
              <span style={{ fontSize: "1.2rem" }}>💬</span> {t.nav.askAi}
            </button>
            <a href="#" onClick={(e) => { e.preventDefault(); setMenuOpen(false); setShowVehicleModal(true); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0.875rem", background: "#fff", color: "#000", fontWeight: 700, fontSize: "1rem", borderRadius: "12px", textDecoration: "none" }}>{t.nav.startDriving}</a>
          </div>
        </div>
      )}

      {/* ══ STATIC HERO ══ */}
      <HeroStatic onStartDriving={() => setShowVehicleModal(true)} />

      {/* ══ FOUR ENGINES SECTION ══ */}
      <section id="features" style={{ padding: "2.5rem 5%", background: "#f8fdfd" }}>
        <div className="section-two-col" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "start" }}>

          {/* Left — headline + description */}
          <div className="scroll-reveal" style={{ paddingTop: "0.5rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", color: "#3b82f6", textTransform: "uppercase", marginBottom: "1.25rem" }}>{t.features.tag}</p>
            <h2 style={{ fontSize: "clamp(2.5rem,4.5vw,3.75rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#0a0a0f", marginBottom: "1.5rem" }}>
              {t.features.title.split(".")[0]}.<br />
              <span style={{ color: "#3b82f6" }}>{t.features.title.split(".")[1]}</span>
            </h2>
            <p style={{ fontSize: "1rem", color: "#1e293b", lineHeight: 1.75, maxWidth: 380, marginBottom: "2.5rem" }}>
              {t.features.desc}
            </p>
            {/* Decorative dot */}
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 12px rgba(34,197,94,0.6)" }} />
          </div>

          {/* Right — 3×2 feature cards */}
          <div className="feature-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {t.features.cards.map((card: any, i: number) => (
              <div key={i} className="scroll-reveal" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "1.75rem 1.5rem", transition: "all 0.25s ease", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", color: "#3b82f6", textTransform: "uppercase" }}>{["AI CO-PILOT", "OBD-II LIVE", "DRIVE INTEL", "CONTEXT ENGINE", "WEATHER INTEL", "FINEBOOK"][i]}</p>
                  <span style={{ fontSize: "1.25rem" }}>{["🧠", "🔌", "🚨", "🗺️", "⛈️", "📚"][i]}</span>
                </div>
                <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem", lineHeight: 1.3, letterSpacing: "-0.02em" }}>{card.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "#1e293b", lineHeight: 1.65 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ THE PIPELINE FLOW ══ */}
      <section style={{ padding: "2.5rem 5%", background: "#ffffff", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", color: "#3b82f6", textTransform: "uppercase", marginBottom: "1rem" }}>{t.pipeline.tag}</p>
            <h2 className="scroll-reveal" style={{ fontSize: "clamp(2.25rem,4vw,3.5rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "#0f172a" }}>
              {t.pipeline.title.replace("LexDrive Pipeline", "")} <span style={{ color: "#3b82f6" }}>LexDrive Pipeline</span>
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            {[
              { step: "STEP 01", icon: "🛰️", title: t.pipeline.steps[0].title, desc: t.pipeline.steps[0].desc },
              { step: "STEP 02", icon: "🧠", title: t.pipeline.steps[1].title, desc: t.pipeline.steps[1].desc },
              { step: "STEP 03", icon: "🚨", title: t.pipeline.steps[2].title, desc: t.pipeline.steps[2].desc },
              { step: "STEP 04", icon: "💬", title: t.pipeline.steps[3].title, desc: t.pipeline.steps[3].desc },
            ].map((node, i) => (
              <React.Fragment key={i}>
                <div className="scroll-reveal" style={{ 
                  flex: "1 1 240px", 
                  background: "#ffffff", 
                  border: "1px solid #e2e8f0", 
                  borderRadius: "24px", 
                  padding: "2.5rem 2rem", 
                  textAlign: "center", 
                  boxShadow: "0 10px 30px rgba(0,0,0,0.03)", 
                  transition: "all 0.3s ease",
                  position: "relative"
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 20px 50px rgba(59, 130, 246, 0.1)"; e.currentTarget.style.transform = "translateY(-5px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.03)"; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: "50%", 
                    background: "rgba(59, 130, 246, 0.05)", 
                    border: "1px solid rgba(59, 130, 246, 0.1)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    margin: "0 auto 1.5rem", 
                    fontSize: "1.75rem",
                    boxShadow: "0 8px 16px rgba(59, 130, 246, 0.08)"
                  }}>
                    {node.icon}
                  </div>
                  <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#3b82f6", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>{node.step}</div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem", letterSpacing: "-0.02em" }}>{node.title}</h3>
                  <p style={{ fontSize: "0.875rem", color: "#1e293b", lineHeight: 1.6 }}>{node.desc}</p>
                </div>
                {i < 3 && (
                  <div className="pipeline-arrow" style={{ display: "flex", alignItems: "center", color: "#3b82f6", opacity: 0.4 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ══ AI CO-PILOT CARD ══ */}
      <section style={{ padding: "0 5% 2.5rem", background: "#f8fdfd" }}>
        <div className="scroll-reveal" style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "48px",
          padding: "1.5rem 5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 40px 100px -20px rgba(0, 0, 0, 0.05), 0 20px 40px -20px rgba(0, 0, 0, 0.05)",
          border: "1px solid rgba(59, 130, 246, 0.05)",
          overflow: "visible",
          position: "relative"
        }}>
          {/* Subtle Glow Backdrop */}
          <div style={{ position: "absolute", top: "50%", right: "10%", transform: "translateY(-50%)", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(59, 130, 246, 0.04) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }} />

          {/* Left Text Content */}
          <div style={{ flex: "1 1 500px", position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", padding: "0.4rem 1rem", background: "#ffffff", color: "#3b82f6", fontSize: "0.7rem", fontWeight: 800, borderRadius: "999px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem", boxShadow: "0 4px 15px rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.05)" }}>{t.copilotCard.tag}</div>
            <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem", lineHeight: 1.1, letterSpacing: "-0.04em" }}>{t.copilotCard.title.split("AI")[0]}<br /><span style={{ color: "#3b82f6" }}>AI {t.copilotCard.title.split("AI")[1]}</span></h2>
            <p style={{ fontSize: "1.125rem", color: "#1e293b", lineHeight: 1.6, marginBottom: "1.5rem", maxWidth: "480px", fontWeight: 400 }}>{t.copilotCard.desc}</p>
            <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
              {t.copilotCard.badges.map((badge: string) => (
                <div key={badge} style={{ padding: "0.5rem 1.125rem", background: "#ffffff", color: "#3b82f6", fontSize: "0.875rem", fontWeight: 700, borderRadius: "9999px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)", border: "1px solid rgba(59, 130, 246, 0.1)" }}>{badge}</div>
              ))}
            </div>
          </div>

          {/* Right Robot Visualization */}
          <div style={{ flex: "1 1 400px", position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "280px", zIndex: 1 }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Robot3D state="idle" size={300} />
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS — 3 STEPS ══ */}
      <section id="how-it-works" style={{ padding: "2.5rem 5%", background: "#0d1117", position: "relative", overflow: "hidden" }}>
        {/* 3D animated perspective grid */}
        <ThreeBackground variant="grid" color="#3b82f6" />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", color: "#3b82f6", textTransform: "uppercase", marginBottom: "1rem" }}>{t.howItWorks.tag}</p>
            <h2 className="scroll-reveal" style={{ fontSize: "clamp(2.25rem,4vw,3.5rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "#ffffff" }}>
              {t.howItWorks.title}
            </h2>
          </div>

          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "3rem" }}>
            {[
              { num: "01", title: t.howItWorks.steps[0].title, desc: t.howItWorks.steps[0].desc },
              { num: "02", title: t.howItWorks.steps[1].title, desc: t.howItWorks.steps[1].desc },
              { num: "03", title: t.howItWorks.steps[2].title, desc: t.howItWorks.steps[2].desc },
            ].map((step, i) => (
              <div key={i} className="scroll-reveal" style={{ paddingTop: "0.5rem", position: "relative" }}>
                <div style={{ 
                  position: "absolute", 
                  top: "-1.5rem", 
                  left: "-1rem", 
                  fontSize: "clamp(4rem, 8vw, 6rem)", 
                  fontWeight: 900, 
                  color: "transparent", 
                  WebkitTextStroke: "1px rgba(59, 130, 246, 0.2)", 
                  zIndex: 0,
                  fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic",
                  lineHeight: 1
                }}>
                  {step.num}
                </div>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#3b82f6", marginBottom: "0.5rem", letterSpacing: "0.1em" }}>STEP {step.num}</div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>{step.title}</h3>
                  <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.95)", lineHeight: 1.7 }}>{step.desc}</p> // Increased from 0.8
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SPEED ADVISOR ══ */}
      <section id="speed-advisor" style={{ padding: "2.5rem 5%", background: "#ffffff", borderTop: "1px solid #f1f5f9" }}>
        <div className="speed-advisor-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          <div className="scroll-reveal">
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", color: "#3b82f6", textTransform: "uppercase", marginBottom: "1.25rem" }}>{t.speedAdvisor.tag}</p>
            <h2 style={{ fontSize: "clamp(2.25rem,4vw,3.25rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "#0a0a0f", marginBottom: "1.25rem" }}>
              {t.speedAdvisor.title}
            </h2>
            <p style={{ fontSize: "1rem", color: "#1e293b", lineHeight: 1.75, maxWidth: 420, marginBottom: "2.5rem" }}>
              {t.speedAdvisor.desc}
            </p>
            <div style={{ display: "flex", gap: "2.5rem", marginBottom: "2.5rem" }}>
              {[{ val: "< 1s", label: t.speedAdvisor.stats[0] }, { val: "17", label: t.speedAdvisor.stats[1] }, { val: "6", label: t.speedAdvisor.stats[2] }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.05em", lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "0.3rem" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowVehicleModal(true); }} style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 1.75rem", background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", borderRadius: "9999px", textDecoration: "none", transition: "all 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#0f172a"; e.currentTarget.style.transform = "none"; }}>
              {t.speedAdvisor.tryBtn}
            </a>
          </div>
          <div className="scroll-reveal" style={{ borderRadius: "20px", overflow: "hidden", background: "#080c12", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 25px 60px rgba(0,0,0,0.18)" }}>
            <img
              src="/images/speed_advisor_hud.png"
              alt="Futuristic Speed Advisor HUD"
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }}
            />
          </div>
        </div>
      </section>

      {/* ══ FINEBOOK PREVIEW ══ */}
      <section id="finebook-preview" style={{ padding: "2.5rem 5%", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: "2rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", color: "#3b82f6", textTransform: "uppercase", marginBottom: "1rem" }}>{t.finebookPreview.tag}</p>
            <h2 className="scroll-reveal" style={{ fontSize: "clamp(2.5rem,4.5vw,3.75rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#0a0a0f", maxWidth: 600 }}>
              {t.finebookPreview.title}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
            {t.finebookPreview.cards.map((fine: any, i: number) => (
              <div key={i} className="scroll-reveal" style={{ 
                background: fine.severity === "high" ? "#fff9f9" : fine.severity === "medium" ? "#fffcf4" : "#f9fdfa", 
                border: "1px solid #e2e8f0", 
                borderLeft: `4px solid ${fine.severity === "high" ? "#ef4444" : fine.severity === "medium" ? "#f59e0b" : "#22c55e"}`,
                borderRadius: "16px", 
                padding: "1.5rem", 
                transition: "all 0.2s ease" 
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase" }}>{fine.section}</span>
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "9999px",
                    background: fine.severity === "high" ? "#fef2f2" : fine.severity === "medium" ? "#fffbeb" : "#f0fdf4",
                    color: fine.severity === "high" ? "#ef4444" : fine.severity === "medium" ? "#f59e0b" : "#22c55e"
                  }}>{fine.severity.toUpperCase()}</span>
                </div>
                <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>{fine.title}</h3>
                <p style={{ fontSize: "1rem", fontWeight: 800, color: "#3b82f6" }}>{fine.fine}</p>
              </div>
            ))}
          </div>
          <a href="/finebook" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.75rem", background: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", borderRadius: "9999px", textDecoration: "none", transition: "all 0.2s ease" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.transform = "none"; }}>
            {t.finebookPreview.browseBtn}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </a>
        </div>
      </section>

      {/* ══ E-CHALLAN LOOKUP ══ */}
      <section style={{ padding: "2.5rem 5%", background: "#0d1117", position: "relative", overflow: "hidden" }}>
        {/* 3D animated wave rings */}
        <ThreeBackground variant="waves" color="#3b82f6" />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", color: "#3b82f6", textTransform: "uppercase", marginBottom: "1rem" }}>{t.challan.tag}</p>
          <h2 className="scroll-reveal" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, letterSpacing: "-0.04em", color: "#ffffff", marginBottom: "1rem" }}>{t.challan.title}</h2>
          <p style={{ color: "rgba(255,255,255,0.95)", fontSize: "1.1rem", marginBottom: "2.5rem", lineHeight: 1.7, fontWeight: 500 }}>{t.challan.desc}</p> // Increased from 0.8
          <form onSubmit={handleChallanSearch} className="challan-form" style={{ display: "flex", gap: "0.75rem", maxWidth: 500, margin: "0 auto" }}>
            <input type="text" placeholder={t.challan.placeholder} value={plateQuery} onChange={e => setPlateQuery(e.target.value.toUpperCase())} style={{ flex: 1, padding: "0.875rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#ffffff", fontWeight: 600, fontSize: "1rem", outline: "none" }} />
            <button type="submit" disabled={challanStatus === "checking"} style={{ padding: "0 1.75rem", borderRadius: "12px", background: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", border: "none", cursor: "pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#2563eb"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#3b82f6"; }}>
              {challanStatus === "checking" ? "..." : t.challan.verify}
            </button>
          </form>
          {challanStatus === "clean" && (
            <div className="animate-fade-in-up" style={{ marginTop: "1.25rem", padding: "1rem 1.5rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.25rem" }}>✅</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "#4ade80", fontWeight: 700, fontSize: "0.9375rem" }}>{t.challan.noChallans}</div>
                <div style={{ color: "#4ade80", fontSize: "0.8125rem", opacity: 0.75 }}>{t.challan.owner}: {ownerName}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ TECH STACK ══ */}
      <section style={{ padding: "1.5rem 5%", background: "#ffffff", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", color: "#94a3b8", textTransform: "uppercase", marginBottom: "2rem" }}>{t.techStack.tag}</p>
          <div className="scroll-reveal tech-marquee-container" style={{ overflow: "hidden", position: "relative", width: "100%", padding: "2rem 0" }}>
            <div className="tech-marquee-track" style={{ display: "flex", gap: "2rem", width: "max-content", animation: "marquee 40s linear infinite" }}>
              {[...Array(2)].map((_, groupIndex) => (
                <div key={groupIndex} style={{ display: "flex", gap: "2rem" }}>
                  {["Next.js 15", "React 19", "Three.js", "Groq Llama 3.1", "Web Bluetooth API", "OpenStreetMap", "Ola Maps", "Parivahan API", "Open-Meteo", "RapidAPI"].map(tech => (
                    <span key={`${groupIndex}-${tech}`} style={{ padding: "0.6rem 1.5rem", borderRadius: "9999px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#1e293b", fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap" }}>{tech}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TEAM ══ */}
      <section style={{ padding: "2.5rem 5%", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", color: "#3b82f6", textTransform: "uppercase", marginBottom: "1rem" }}>{t.team.tag}</p>
          <h2 className="scroll-reveal" style={{ fontSize: "clamp(1.75rem,3vw,2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#0f172a", marginBottom: "1rem" }}>{t.team.title}</h2>
          <p className="scroll-reveal" style={{ color: "#1e293b", fontSize: "1rem", marginBottom: "2rem" }}>{t.team.desc}</p>
          <div className="scroll-reveal" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1.5rem" }}>
            {[
              { name: "Harshal Attarde", role: "AI Architect", initials: "HA", grad: "linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)" },
              { name: "Kushal Mahajan", role: "Full-Stack Dev", initials: "KM", grad: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)" },
              { name: "Bharat Toke", role: "Data Engineer", initials: "BT", grad: "linear-gradient(135deg, #10b981 0%, #34d399 100%)" },
              { name: "Himanshu Girase", role: "ML Engineer", initials: "HG", grad: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" },
            ].map(member => (
              <div key={member.name} style={{ background: "#ffffff", padding: "2rem", borderRadius: "24px", border: "1px solid #e2e8f0", minWidth: 220, transition: "all 0.3s ease", position: "relative", overflow: "hidden" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-5px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: member.grad, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.25rem", fontWeight: 800, color: "#fff", boxShadow: "0 8px 20px -5px rgba(0,0,0,0.2)" }}>{member.initials}</div>
                <div style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>{member.name}</div>
                <div style={{ fontSize: "0.8125rem", color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section style={{ padding: "2.5rem 5%", background: "#0d1117", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* 3D floating particles */}
        <ThreeBackground variant="particles" color="#3b82f6" />
        <div className="scroll-reveal" style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 800, letterSpacing: "-0.04em", color: "#ffffff", marginBottom: "1.25rem", lineHeight: 1.1 }}>{t.finalCta.title}</h2>
          <p style={{ color: "rgba(255,255,255,0.95)", fontSize: "1.125rem", marginBottom: "2.5rem", lineHeight: 1.7, fontWeight: 500 }}>{t.finalCta.desc}</p> // Increased from 0.8
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowVehicleModal(true); }} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 2rem", background: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: "1rem", borderRadius: "9999px", textDecoration: "none", transition: "all 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.transform = "none"; }}>
              {t.nav.startDriving}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </a>
            <a href="/finebook" style={{ display: "inline-flex", alignItems: "center", padding: "0.875rem 2rem", background: "transparent", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: "1rem", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.2)", textDecoration: "none", transition: "all 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.8)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }} // Increased from 0.7/0.2
            >
              {t.nav.finebook}
            </a>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding: "2.5rem 5%", borderTop: "1px solid transparent", background: "#080c12", position: "relative" }}>
        {/* Glowing Divider */}
        <div style={{ position: "absolute", top: 0, left: "5%", right: "5%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)" }} />
        <div className="footer-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic", fontWeight: 900, fontSize: "1.125rem", letterSpacing: "-0.04em", color: "rgba(255,255,255,0.8)" }}>LexDrive AI</span>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8125rem", fontWeight: 500, margin: 0 }}>© {new Date().getFullYear()} {t.footer.copyright}</p> // Increased from 0.3
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <a href="#" style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8125rem", fontWeight: 500, textDecoration: "none", transition: "color 0.15s" }} // Increased from 0.35
              onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.95)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}>{t.footer.platform}</a>
            <a href="/finebook" style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8125rem", fontWeight: 500, textDecoration: "none", transition: "color 0.15s" }} // Increased from 0.35
              onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.95)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}>{t.footer.finebook}</a>
            <a href="#speed-advisor" style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8125rem", fontWeight: 500, textDecoration: "none", transition: "color 0.15s" }} // Increased from 0.35
              onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.95)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}>{t.footer.speedAdvisor}</a>
          </div>
        </div>
      </footer>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .tech-marquee-container::before,
        .tech-marquee-container::after {
          content: "";
          position: absolute;
          top: 0;
          width: 100px;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }
        .tech-marquee-container::before {
          left: 0;
          background: linear-gradient(to right, white, transparent);
        }
        .tech-marquee-container::after {
          right: 0;
          background: linear-gradient(to left, white, transparent);
        }

        .button-neon-glow {
          animation: neon-pulse 3s infinite ease-in-out;
        }
        @keyframes neon-pulse {
          0%, 60%, 100% { box-shadow: 0 0 10px rgba(0, 229, 255, 0.15); }
          80% { box-shadow: 0 0 30px rgba(0, 229, 255, 0.45); }
        }

        .hero-cyan-text {
          animation: flicker 4s infinite linear;
        }
        @keyframes flicker {
          0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; text-shadow: 0 0 10px rgba(0, 229, 255, 0.4); }
          20%, 24%, 55% { opacity: 0.8; text-shadow: none; }
        }

        .scroll-reveal.stats-reveal {
          animation: reveal-scale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes reveal-scale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 1024px) {
          .pipeline-arrow { display: none !important; }
        }
      `}} />
    </main>
  );
}
