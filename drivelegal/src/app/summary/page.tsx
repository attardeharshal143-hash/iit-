"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useDriveContext } from "../../context/DriveContext";
import finesData from "../../data/fines.json";
import "../globals.css";
import { translations, Language, carTranslations, summaryTranslations } from "../../lib/translations";

export default function PostDriveSummary() {
  const { drivingScore, maxSpeedReached, alertsTriggered, violationHistory, setViolationHistory, appLanguage } = useDriveContext();
  const t = translations[appLanguage as Language] || translations["en-IN"];
  const ct = carTranslations[appLanguage] || carTranslations["en-IN"];
  const st = summaryTranslations[appLanguage] || summaryTranslations["en-IN"];
  const [vehicleNo, setVehicleNo] = useState("");
  const [challans, setChallans] = useState<any[] | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const win = window as any;
    if (win.google && win.google.translate && win.google.translate.TranslateElement) {
      setTimeout(() => {
        const el = document.getElementById('google_translate_element');
        if (el && el.innerHTML.trim() === '') {
          new win.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr,kn,ta,te,gu,bn',
            layout: win.google.translate.TranslateElement.InlineLayout.SIMPLE
          }, 'google_translate_element');
        }
      }, 500);
    }
  }, []);

  const fetchVahanData = async (plate: string) => {
    try {
      const response = await fetch("/api/vahan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plateNumber: plate })
      });
      const result = await response.json();
      if (result?.data) return result.data;
    } catch (e) {
      console.error("Vahan API Error", e);
    }
    return {
      ownerName: "Data Unavailable",
      vehicleModel: "Contact RTO",
      fuelType: "N/A",
      registrationDate: "N/A",
      insuranceExpiry: "N/A",
      pucStatus: "N/A"
    };
  };

  const [calcCountry, setCalcCountry] = useState("India");
  const [calcState, setCalcState] = useState("All India");
  const [calcVehicle, setCalcVehicle] = useState("All Vehicles");
  const [calcViolation, setCalcViolation] = useState(finesData[0].violation);
  
  const uniqueCountries = useMemo(() => Array.from(new Set(finesData.map((f: any) => f.country))), []);
  const uniqueStates = useMemo(() => Array.from(new Set(finesData.filter((f: any) => f.country === calcCountry).map((f: any) => f.state))), [calcCountry]);
  const uniqueVehicles = useMemo(() => Array.from(new Set(finesData.map((f: any) => f.vehicle))), []);
  const uniqueViolations = useMemo(() => Array.from(new Set(finesData.map((f: any) => f.violation))), []);

  const calculatedFine = useMemo(() => {
    let fine = finesData.find((f: any) => f.country === calcCountry && f.state === calcState && f.violation === calcViolation && (f.vehicle === calcVehicle || f.vehicle === "All Vehicles"));
    if (!fine) {
      fine = finesData.find((f: any) => f.country === calcCountry && (f.state === "All India" || f.state === calcState) && f.violation === calcViolation);
    }
    return fine;
  }, [calcCountry, calcState, calcVehicle, calcViolation]);

  const getBadge = () => {
    if (drivingScore >= 90) return { title: st.eliteDriver, icon: "⚡", color: "#0ea5e9" }; 
    if (drivingScore >= 70) return { title: st.safeDriver, icon: "🛡️", color: "#3b82f6" };
    return { title: st.highRisk, icon: "⚠️", color: "#ef4444" };
  };
  const badge = getBadge();

  const handleFetchChallans = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNo) return;
    setIsFetching(true);
    const data = await fetchVahanData(vehicleNo);
    setIsFetching(false);
    setVehicleDetails(data);
    setChallans(violationHistory);
  };

  const handlePay = () => {
    setPaymentModal(true);
    setTimeout(() => {
      setPaymentModal(false);
      const updated = violationHistory.map(v => ({...v, status: "PAID"}));
      setViolationHistory(updated);
      localStorage.setItem("LexDrive_violations", JSON.stringify(updated));
      setChallans(updated);
      alert("Payment Successful via Secure Gateway!");
    }, 2000);
  };

  if (!mounted) return null;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f0f4f8", position: "relative", color: "#0f172a", fontFamily: "system-ui, -apple-system, sans-serif", overflowX: "hidden" }}>
      
      {/* Background Decor */}
      <div style={{ position: "fixed", top: "-10%", left: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(240, 244, 248, 0) 70%)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-10%", right: "-10%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(240, 244, 248, 0) 70%)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)", backgroundSize: "40px 40px", zIndex: 0, pointerEvents: "none", opacity: 0.5 }} />

      {/* Floating Particles */}
      {/* Floating Particles - fixed to avoid SSR hydration mismatch */}
      {[
        { top: "10%",  left: "5%",  w: 120, h: 120, delay: "0s"  },
        { top: "60%",  left: "80%", w: 90,  h: 90,  delay: "2s"  },
        { top: "30%",  left: "90%", w: 80,  h: 80,  delay: "4s"  },
        { top: "80%",  left: "20%", w: 110, h: 110, delay: "6s"  },
        { top: "50%",  left: "50%", w: 70,  h: 70,  delay: "8s"  },
        { top: "15%",  left: "60%", w: 100, h: 100, delay: "10s" },
      ].map((p, i) => (
        <div key={i} className="floating-particle" style={{
          position: "fixed",
          top: p.top,
          left: p.left,
          width: `${p.w}px`,
          height: `${p.h}px`,
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, rgba(14, 165, 233, 0) 70%)",
          borderRadius: "50%",
          animationDelay: p.delay,
          pointerEvents: "none",
          zIndex: 0
        }} />
      ))}

      {/* ══ NAV ══ */}
      <nav className="nav-container" style={{ 
        position: "sticky", 
        top: 0, 
        zIndex: 1000, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: "0 5%", 
        height: 64, 
        background: "transparent"
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <span style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em", color: "#0f172a" }}>LexDrive AI</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div className="pulse-dot" style={{ width: 8, height: 8, background: "#10b981", borderRadius: "50%", boxShadow: "0 0 10px #10b981" }} />
            <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>{st.systemLive}</span>
          </div>
          
          <div id="google_translate_element" style={{ height: "36px", overflow: "hidden", display: "flex", alignItems: "center" }}></div>
          
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, color: "#64748b", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.2s ease" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            {st.backHome}
          </a>
        </div>
      </nav>

      <section style={{ maxWidth: 1200, margin: "3rem auto", padding: "0 5%", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div className="animate-fade-in" style={{ display: "inline-block", padding: "0.5rem 1rem", background: "rgba(14, 165, 233, 0.1)", borderRadius: "99px", border: "1px solid rgba(14, 165, 233, 0.2)", marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", color: "#0ea5e9", textTransform: "uppercase", margin: 0 }}>{st.missionComplete}</p>
          </div>
          <h1 className="gradient-text" style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            {st.postDriveSummary}
          </h1>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "2.5rem" }}>
          
          {/* Card 1: Score */}
          <div className="scroll-reveal glass-card" style={{ animationDelay: "0.1s" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2.5rem" }}>{st.driverPerformance}</h3>
            
            <div style={{ position: "relative", width: "180px", height: "180px", margin: "0 auto 2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: "rotate(-90deg)" }}>
                 <circle cx="90" cy="90" r="75" fill="none" stroke="rgba(14, 165, 233, 0.1)" strokeWidth="6" />
                 <circle cx="90" cy="90" r="75" fill="none" 
                   stroke="url(#blueGrad)" 
                   strokeWidth="12" 
                   strokeLinecap="round"
                   strokeDasharray="471" 
                   className="progress-ring"
                   style={{ '--target-offset': 471 - (471 * drivingScore) / 100 } as React.CSSProperties}
                 />
                 <defs>
                   <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                     <stop offset="0%" stopColor="#0ea5e9" />
                     <stop offset="100%" stopColor="#3b82f6" />
                   </linearGradient>
                 </defs>
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <div style={{ fontSize: "3.5rem", fontWeight: 900, color: "#0f172a", lineHeight: 1, letterSpacing: "-0.05em" }}>{drivingScore}</div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.1em" }}>SYS SCORE</div>
              </div>
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255, 255, 255, 0.9)", border: `1px solid ${badge.color}30`, padding: "0.75rem 1.5rem", borderRadius: "12px", fontWeight: 700, color: badge.color, boxShadow: "0 4px 15px rgba(0,0,0,0.03)", marginBottom: "2.5rem" }}>
              <span style={{ fontSize: "1.25rem" }}>{badge.icon}</span> {badge.title}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "2rem" }}>
              <div>
                <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a" }}>{maxSpeedReached} <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 600 }}>km/h</span></div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{st.peakVelocity}</div>
              </div>
              <div>
                <div style={{ fontSize: "1.75rem", fontWeight: 900, color: alertsTriggered > 0 ? "#ef4444" : "#0ea5e9" }}>{alertsTriggered}</div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{st.systemAlerts}</div>
              </div>
            </div>
          </div>

          {/* Card 2: E-Challan */}
          <div className="scroll-reveal glass-card" style={{ animationDelay: "0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ width: "8px", height: "8px", background: "#0ea5e9", borderRadius: "50%", boxShadow: "0 0 10px #0ea5e9" }} />
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>{st.echallanPortal}</h3>
            </div>
            <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem", fontWeight: 500 }}>{st.echallanDesc}</p>
            
            <form onSubmit={handleFetchChallans} style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
              <input 
                type="text" 
                placeholder="MH 12 AB 1234" 
                value={vehicleNo}
                onChange={e => setVehicleNo(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: "0.875rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(14, 165, 233, 0.2)", background: "rgba(255, 255, 255, 0.9)", color: "#0f172a", fontWeight: 600, outline: "none", fontFamily: "monospace" }}
              />
              <button type="submit" className="button-glow">{st.run}</button>
            </form>

            {challans && (
              <div style={{ marginTop: "auto" }}>
                {vehicleDetails && (
                  <div style={{ marginBottom: "1.5rem", padding: "1.25rem", background: "rgba(240, 244, 248, 0.5)", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      {[{l:"OWNER",v:vehicleDetails.ownerName},{l:"MODEL",v:vehicleDetails.vehicleModel},{l:"FUEL",v:vehicleDetails.fuelType},{l:"REG DATE",v:vehicleDetails.registrationDate}].map(item => (
                        <div key={item.l}>
                          <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#64748b", marginBottom: "0.25rem" }}>{item.l}</div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{item.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {challans.length === 0 ? (
                  <div className="clean-record-badge">✅ {st.cleanRecord}</div>
                ) : (
                  challans.map(c => (
                    <div key={c.id} className="challan-item">
                      <div>
                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{c.violation}</div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "monospace" }}>{c.id}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, color: c.status === "PAID" ? "#059669" : "#ef4444" }}>₹{c.amount}</div>
                        {c.status === "UNPAID" && <button onClick={handlePay} className="settle-button">{st.settle}</button>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Card 3: Matrix */}
          <div className="scroll-reveal glass-card" style={{ gridColumn: "1 / -1", animationDelay: "0.3s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
              <div style={{ width: "8px", height: "8px", background: "#3b82f6", borderRadius: "50%", boxShadow: "0 0 10px #3b82f6" }} />
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>{st.assessmentMatrix}</h3>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
              {[{l:"Jurisdiction",v:calcCountry,s:setCalcCountry,o:uniqueCountries},{l:"Zone",v:calcState,s:setCalcState,o:uniqueStates},{l:"Class",v:calcVehicle,s:setCalcVehicle,o:uniqueVehicles},{l:"Infraction",v:calcViolation,s:setCalcViolation,o:uniqueViolations}].map(f => (
                <div key={f.l}>
                  <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#64748b", marginBottom: "0.5rem", textTransform: "uppercase" }}>{f.l}</label>
                  <select value={f.v as string} onChange={e => (f.s as any)(e.target.value)} className="futuristic-select">
                    {f.o.map(opt => <option key={opt as string} value={opt as string}>{opt as string}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {calculatedFine && (
              <div className="matrix-result">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <span className="section-badge">SEC {(calculatedFine as any).section}</span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#475569" }}>{(calculatedFine as any).country} REGULATION</span>
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>{(calculatedFine as any).violation}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{st.estimatedLiability}</div>
                  <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#0ea5e9", letterSpacing: "-0.05em" }}>₹{(calculatedFine as any).amount.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes reveal { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes float { 0% { transform: translate(0, 0); } 50% { transform: translate(20px, 20px); } 100% { transform: translate(0, 0); } }
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes drawRing { from { stroke-dashoffset: 471; } to { stroke-dashoffset: var(--target-offset); } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.8); } 70% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }

        .scroll-reveal { opacity: 0; animation: reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .pulse-dot { animation: pulse 2s infinite ease-in-out; }
        .floating-particle { animation: float 10s infinite ease-in-out; }
        
        .progress-ring {
          animation: drawRing 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.5s;
          stroke-dashoffset: 471;
        }

        .animate-fade-in { animation: popIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .gradient-text {
          background: linear-gradient(90deg, #0f172a, #0ea5e9, #3b82f6, #0f172a);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient 8s infinite linear;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.05);
          padding: 3rem 2.5rem;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease;
        }
        .glass-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(14, 165, 233, 0.4);
          box-shadow: 0 25px 50px rgba(14, 165, 233, 0.15);
        }

        .button-glow {
          padding: 0 1.5rem;
          background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
          transition: all 0.2s ease;
        }
        .button-glow:hover { transform: scale(1.05); box-shadow: 0 8px 25px rgba(14, 165, 233, 0.4); }

        .futuristic-select {
          width: 100%; padding: 0.875rem; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05);
          background: rgba(255,255,255,0.9); fontWeight: 600; color: #0f172a; cursor: pointer; outline: none; appearance: none;
          transition: all 0.2s ease;
        }
        .futuristic-select:hover { border-color: #0ea5e9; }

        .challan-item {
          border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; padding: 1.25rem; background: #fff;
          display: flex; justify-content: space-between; alignItems: center; margin-bottom: 0.75rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02); transition: all 0.2s ease;
        }
        .challan-item:hover { transform: translateX(5px); border-color: rgba(14, 165, 233, 0.2); }

        .settle-button {
          margin-top: 0.25rem; padding: 0.25rem 0.75rem; font-size: 0.65rem; background: rgba(239, 68, 68, 0.1);
          color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 6px; font-weight: 700; cursor: pointer; text-transform: uppercase;
        }

        .matrix-result {
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%); border-radius: 16px; padding: 2rem;
          border: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2rem;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        .section-badge { padding: 0.25rem 0.5rem; background: rgba(14, 165, 233, 0.1); color: #0ea5e9; borderRadius: 4px; fontSize: 0.65rem; fontWeight: 800; }
        .clean-record-badge { padding: 1.25rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; textAlign: center; color: #059669; fontWeight: 600; font-size: 0.85rem; }


      `}} />
    </main>
  );
}
