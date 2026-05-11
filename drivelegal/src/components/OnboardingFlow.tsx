"use client";
import React, { useState } from "react";
import { useDriveContext } from "../context/DriveContext";

interface OnboardingFlowProps { onComplete: () => void; }

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [vehicle, setVehicle] = useState("");
  const { setAppLanguage } = useDriveContext();

  const handleLangSelect = (label: string) => {
    let code = "en-IN";
    if (label.includes("Hindi")) code = "hi-IN";
    else if (label.includes("Marathi")) code = "mr-IN";
    else if (label.includes("Kannada")) code = "kn-IN";
    setAppLanguage(code);
    localStorage.setItem("LexDrive_language", code);
    setStep(1);
  };

  const tutorials = [
    { title:"AI Legal Co-Pilot", desc:"Ask about traffic laws, fines, and your rights in your language — by voice or text.", icon:"🤖" },
    { title:"Proactive Speed Advisor", desc:"Get real-time alerts before you enter a speed zone to prevent violations.", icon:"🏎️" },
    { title:"Global Finebook", desc:"Search and understand all traffic penalties across India and 5 other countries.", icon:"📖" },
  ];

  const wrap: React.CSSProperties = { position:"fixed",inset:0,background:"var(--bg)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem" };
  const box: React.CSSProperties = { background:"var(--bg-white)",border:"1px solid var(--border)",borderRadius:"var(--radius-2xl)",padding:"3rem 2.5rem",maxWidth:480,width:"100%",boxShadow:"var(--shadow-2xl)",textAlign:"center" };

  if (step === 0) return (
    <div style={wrap}>
      <div style={box}>
        <div style={{ width:56,height:56,borderRadius:"var(--radius-lg)",background:"linear-gradient(135deg,var(--brand),var(--violet))",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.5rem" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <h1 style={{ fontSize:"1.875rem",fontWeight:800,letterSpacing:"-0.04em",marginBottom:"0.5rem" }}>Welcome to LexDrive <span style={{ color:"var(--brand)" }}>AI</span></h1>
        <p style={{ color:"var(--fg-muted)",marginBottom:"2rem",fontSize:"0.9375rem" }}>Select your preferred language to get started.</p>
        <div style={{ display:"flex",flexDirection:"column",gap:"0.75rem" }}>
          {["English","हिंदी (Hindi)","मराठी (Marathi)","ಕನ್ನಡ (Kannada)"].map(lang => (
            <button key={lang} onClick={() => handleLangSelect(lang)} style={{ padding:"0.875rem 1.5rem",borderRadius:"var(--radius-lg)",border:"1px solid var(--border)",background:"var(--bg-white)",color:"var(--fg)",fontSize:"1rem",fontWeight:600,cursor:"pointer",textAlign:"left",transition:"all 0.15s ease",display:"flex",alignItems:"center",justifyContent:"space-between" }}
              onMouseOver={e => { e.currentTarget.style.borderColor="var(--brand)"; e.currentTarget.style.background="var(--brand-light)"; e.currentTarget.style.color="var(--brand)"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.background="var(--bg-white)"; e.currentTarget.style.color="var(--fg)"; }}>
              {lang}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (step >= 1 && step <= 3) {
    const t = tutorials[step - 1];
    return (
      <div style={wrap}>
        <div style={box}>
          <div style={{ display:"flex",justifyContent:"center",gap:"0.5rem",marginBottom:"2rem" }}>
            {[1,2,3].map(i => <div key={i} style={{ width: step===i ? 24 : 8,height:8,borderRadius:4,background: step===i ? "var(--brand)" : "var(--border)",transition:"all 0.3s ease" }} />)}
          </div>
          <div style={{ fontSize:"3.5rem",marginBottom:"1.25rem" }}>{t.icon}</div>
          <h2 style={{ fontSize:"1.625rem",fontWeight:800,letterSpacing:"-0.04em",marginBottom:"0.75rem" }}>{t.title}</h2>
          <p style={{ color:"var(--fg-muted)",fontSize:"0.9375rem",lineHeight:1.7,marginBottom:"2.5rem" }}>{t.desc}</p>
          <button onClick={() => setStep(s => s + 1)} className="btn-primary" style={{ width:"100%",padding:"0.875rem",fontSize:"1rem" }}>
            {step === 3 ? "Continue" : "Next →"}
          </button>
        </div>
      </div>
    );
  }

  if (step === 4) return (
    <div style={wrap}>
      <div style={box}>
        <h2 style={{ fontSize:"1.625rem",fontWeight:800,letterSpacing:"-0.04em",marginBottom:"0.5rem" }}>Select Your Vehicle</h2>
        <p style={{ color:"var(--fg-muted)",marginBottom:"2rem",fontSize:"0.9375rem" }}>Helps us tailor speed limits and fine details for you.</p>
        <div style={{ display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"2rem" }}>
          {["Two-Wheeler","Four-Wheeler","Commercial Heavy Vehicle"].map(v => (
            <button key={v} onClick={() => setVehicle(v)} style={{ padding:"1rem 1.5rem",borderRadius:"var(--radius-lg)",fontSize:"0.9375rem",fontWeight:600,border: vehicle===v ? "2px solid var(--brand)" : "1px solid var(--border)",background: vehicle===v ? "var(--brand-light)" : "var(--bg-white)",color: vehicle===v ? "var(--brand)" : "var(--fg)",cursor:"pointer",transition:"all 0.15s ease",textAlign:"left" }}>
              {v}
            </button>
          ))}
        </div>
        <button onClick={() => setStep(5)} disabled={!vehicle} className="btn-primary" style={{ width:"100%",padding:"0.875rem",fontSize:"1rem",opacity: vehicle ? 1 : 0.4 }}>
          Confirm Vehicle
        </button>
      </div>
    </div>
  );

  return (
    <div style={wrap}>
      <div style={box}>
        <div style={{ width:56,height:56,borderRadius:"50%",background:"var(--success-bg)",border:"1px solid var(--success-border)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.5rem" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <h2 style={{ fontSize:"1.625rem",fontWeight:800,letterSpacing:"-0.04em",marginBottom:"0.5rem" }}>Enable Permissions</h2>
        <p style={{ color:"var(--fg-muted)",marginBottom:"2.5rem",fontSize:"0.9375rem",lineHeight:1.7 }}>LexDrive needs <strong>Microphone</strong> for voice commands and <strong>GPS</strong> for speed monitoring.</p>
        <button onClick={async () => {
          // Request GPS permission
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(() => {}, () => {});
          }
          // Request microphone permission
          if (navigator.mediaDevices?.getUserMedia) {
            try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach(t => t.stop()); } catch {}
          }
          onComplete();
        }} className="btn-primary" style={{ width:"100%",padding:"0.875rem",fontSize:"1rem",marginBottom:"0.75rem" }}>
          Grant Permissions
        </button>
        <button onClick={onComplete} style={{ width:"100%",padding:"0.875rem",fontSize:"0.9375rem",background:"transparent",border:"none",color:"var(--fg-muted)",cursor:"pointer",fontWeight:500 }}>
          Skip for now
        </button>
      </div>
    </div>
  );
}
