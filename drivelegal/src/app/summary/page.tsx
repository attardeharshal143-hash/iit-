"use client";
import React, { useState, useMemo } from "react";
import { useDriveContext } from "../../context/DriveContext";
import finesData from "../../data/fines.json";
import "../globals.css";

export default function PostDriveSummary() {
  const { drivingScore, maxSpeedReached, alertsTriggered, violationHistory, setViolationHistory } = useDriveContext();
  const [vehicleNo, setVehicleNo] = useState("");
  const [challans, setChallans] = useState<any[] | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState<any | null>(null);

  const fetchVahanData = async (plate: string) => {
    try {
      const response = await fetch("/api/vahan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plateNumber: plate })
      });
      const result = await response.json();
      console.log("VAHAN API FULL RESPONSE:", JSON.stringify(result));

      if (result?.data) {
        return result.data;
      }
    } catch (e) {
      console.error("Vahan API Error", e);
    }

    // Always return something so the card renders
    return {
      ownerName: "Data Unavailable",
      vehicleModel: "Contact RTO",
      fuelType: "N/A",
      registrationDate: "N/A",
      insuranceExpiry: "N/A",
      pucStatus: "N/A"
    };
  };

  // Challan Calculator State
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
      // Fallback to national/state defaults if exact vehicle match isn't found
      fine = finesData.find((f: any) => f.country === calcCountry && (f.state === "All India" || f.state === calcState || f.state === "California" || f.state === "London") && f.violation === calcViolation);
    }
    return fine;
  }, [calcCountry, calcState, calcVehicle, calcViolation]);

  // Gamification Badge Logic
  const getBadge = () => {
    if (drivingScore >= 90) return { title: "Speed Saint", icon: "😇", color: "#10b981" };
    if (drivingScore >= 70) return { title: "Safe Driver", icon: "🛡️", color: "#3b82f6" };
    return { title: "Reckless Rookie", icon: "⚠️", color: "#ef4444" };
  };
  const badge = getBadge();

  const handleFetchChallans = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNo) return;
    
    setIsFetching(true);
    // Real API call to our /api/vahan route
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
      alert("Payment Successful via LexDrive Secure Gateway!");
    }, 2000);
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative", paddingBottom: "5rem", background: "var(--background)", color: "var(--foreground)", fontFamily: "'Playfair Display', serif", overflowX: "hidden" }}>
      
      {/* Dynamic Grid Background (Light) */}
      <div style={{ position: "fixed", bottom: 0, left: "-20%", right: "-20%", height: "60%", background: "repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(0,0,0,0.03) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(0,0,0,0.03) 50px)", transform: "perspective(800px) rotateX(75deg)", transformOrigin: "bottom", pointerEvents: "none", zIndex: 0 }}></div>

      {/* Navigation */}
      <nav className="animate-fade-in-up" style={{ padding: "1rem 5%", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50, background: "var(--nav-bg)" }}>
        <a href="/" style={{ fontWeight: 900, fontSize: "clamp(1.2rem, 3vw, 1.5rem)", letterSpacing: "0.05em", textDecoration: "none", color: "var(--foreground)", textTransform: "uppercase" }}>
          LexDrive <span style={{ color: "var(--accent-blue)" }}>AI</span>
        </a>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "var(--text-muted)", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Go Back Home
        </a>
      </nav>

      <section style={{ maxWidth: "1200px", width: "100%", margin: "clamp(2rem, 5vh, 4rem) auto 0", padding: "0 5%", position: "relative", zIndex: 10 }}>
        <h1 className="animate-fade-in-up" style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 900, marginBottom: "clamp(2rem, 4vh, 3rem)", textAlign: "center", background: "linear-gradient(to right, var(--accent-blue), var(--accent-purple))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "0.05em" }}>Post-Drive Summary</h1>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "stretch" }}>
          
          {/* Gamification Card */}
          <div className="animate-fade-in-up delay-100" style={{ flex: "1 1 400px", background: "var(--glass-bg)", borderRadius: "24px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", padding: "3rem 2.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--card-header)", marginBottom: "1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em" }}>Your Driving Score</h3>
            
            <div style={{ position: "relative", width: "180px", height: "180px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              {/* Outer Glow Ring */}
              <div style={{ 
                position: "absolute", 
                width: "160px", 
                height: "160px", 
                borderRadius: "50%", 
                boxShadow: "0 0 40px rgba(30, 64, 175, 0.2), 0 0 40px rgba(52, 103, 57, 0.1)",
                animation: "pulse 2s infinite ease-in-out"
              }}></div>
              
              <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
                  <defs>
                   <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                     <stop offset="0%" stopColor="var(--accent-blue)" />
                     <stop offset="100%" stopColor="var(--accent-purple)" />
                   </linearGradient>
                 </defs>
                 
                 {/* Track */}
                 <circle cx="90" cy="90" r="75" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="8" />
                 
                 {/* Progress Fill */}
                 <circle cx="90" cy="90" r="75" fill="none" 
                   stroke="url(#scoreGradient)" 
                   strokeWidth="12" 
                   strokeLinecap="round"
                   strokeDasharray="471" 
                   strokeDashoffset={471 - (471 * drivingScore) / 100} 
                   style={{ 
                     transition: "stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)",
                     filter: "drop-shadow(0 0 8px rgba(30, 64, 175, 0.4))" 
                   }} 
                 />

                 {/* Rotating Sweeper Dot */}
                 <circle cx="165" cy="90" r="5" fill="#ffffff" style={{ 
                   transformOrigin: "center",
                   animation: "rotate-score 2s linear infinite",
                   filter: "drop-shadow(0 0 10px #1e40af)"
                 }} />
              </svg>
              
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
                <span style={{ 
                  fontSize: "4.5rem", 
                  fontWeight: 900, 
                  background: "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1 
                }}>{drivingScore}</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Points</span>
              </div>
            </div>

            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem", 
              background: `${badge.color}10`, 
              border: `1px solid ${badge.color}30`, 
              color: badge.color, 
              padding: "0.6rem 1.5rem", 
              borderRadius: "999px", 
              fontWeight: 800, 
              marginBottom: "2.5rem", 
              textTransform: "uppercase", 
              letterSpacing: "0.05em",
              boxShadow: `0 10px 20px ${badge.color}10`
            }}>
              <span style={{ fontSize: "1.25rem" }}>{badge.icon}</span> {badge.title}
            </div>

            <div style={{ display: "flex", width: "100%", justifyContent: "space-between", borderTop: "1px solid var(--glass-border)", paddingTop: "1.5rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--foreground)" }}>{maxSpeedReached} <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>km/h</span></div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em" }}>Top Speed</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: alertsTriggered > 0 ? "#ef4444" : "#10b981", textShadow: alertsTriggered > 0 ? "0 0 15px rgba(239,68,68,0.3)" : "0 0 15px rgba(16,185,129,0.3)" }}>{alertsTriggered}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em" }}>Risk Alerts</div>
              </div>
            </div>
          </div>

          {/* E-Challan Portal */}
          <div className="animate-fade-in-up delay-200" style={{ flex: "1 1 400px", background: "var(--glass-bg)", borderRadius: "24px", border: "1px solid var(--glass-border)", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", padding: "3rem 2.5rem", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "1.25rem", color: "var(--card-header)", marginBottom: "0.5rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>Vehicle E-Challan Portal</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.95rem", lineHeight: 1.5 }}>Check if your vehicle has any pending traffic violations from previous drives.</p>
            
            <form onSubmit={handleFetchChallans} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
              <input 
                type="text" 
                placeholder="e.g. MH 12 AB 1234" 
                value={vehicleNo}
                onChange={e => setVehicleNo(e.target.value.toUpperCase())}
                style={{ flex: "1 1 200px", padding: "1rem", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.02)", color: "var(--foreground)", outline: "none", textTransform: "uppercase", fontWeight: 600, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)", transition: "all 0.3s ease" }}
              />
              <button type="submit" style={{ flex: "0 1 120px", padding: "1rem 1.5rem", background: "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 20px rgba(0, 113, 227, 0.2)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>Check</button>
            </form>

            {challans && (
              <div className="animate-fade-in-up" style={{ marginTop: "auto" }}>
                <h4 style={{ fontWeight: 800, marginBottom: "0.25rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.85rem" }}>Results for <span style={{ color: "var(--accent-blue)" }}>{vehicleNo}</span></h4>
                {vehicleDetails && (
                  <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "rgba(0,0,0,0.02)", borderRadius: "12px", border: "1px solid var(--glass-border)", fontSize: "0.85rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>👤 OWNER:</span>
                      <span style={{ fontWeight: 800, color: "var(--foreground)" }}>{vehicleDetails.ownerName}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>🚗 MODEL:</span>
                      <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{vehicleDetails.vehicleModel}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>⛽ FUEL:</span>
                      <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{vehicleDetails.fuelType}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>📅 REG DATE:</span>
                      <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{vehicleDetails.registrationDate}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>🛡️ INSURANCE:</span>
                      <span style={{ fontWeight: 700, color: "#10b981" }}>{vehicleDetails.insuranceExpiry}</span>
                    </div>
                    {vehicleDetails.address && (
                      <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--glass-border)" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>📍 ADDRESS:</span>
                        <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.8rem" }}>{vehicleDetails.address}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--glass-border)" }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>🔢 OWNERS:</span>
                      <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{vehicleDetails.ownerCount || "1"}</span>
                    </div>
                  </div>
                )}
                {challans.length === 0 ? (
                  <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "16px", padding: "1.5rem", textAlign: "center", color: "#10b981", fontWeight: 700 }}>
                     ✅ Excellent! No pending violations found for this vehicle.
                  </div>
                ) : (
                  challans.map(c => (
                    <div key={c.id} style={{ border: "1px solid var(--glass-border)", borderRadius: "16px", padding: "1.25rem", background: "rgba(0,0,0,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", marginBottom: "1rem" }}>
                      <div>
                        <div style={{ fontWeight: 800, marginBottom: "0.25rem", color: "var(--foreground)", fontSize: "1.1rem" }}>{c.violation}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>{c.id} • {c.date}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                        <div style={{ fontWeight: 900, fontSize: "1.5rem", color: c.status === "PAID" ? "#10b981" : "#ef4444" }}>₹{c.amount}</div>
                        {c.status === "UNPAID" ? (
                          <button onClick={handlePay} style={{ padding: "0.4rem 1rem", fontSize: "0.75rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "8px", fontWeight: 800, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pay Now</button>
                        ) : (
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: "0.3rem 0.75rem", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.05em" }}>PAID</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Challan Calculator */}
          <div className="animate-fade-in-up delay-300" style={{ flex: "1 1 100%", background: "var(--glass-bg)", borderRadius: "24px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", padding: "3rem 2.5rem" }}>
            <h3 style={{ fontSize: "1.25rem", color: "var(--card-header)", marginBottom: "0.5rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>Automated Challan Calculator</h3>
            <p style={{ color: "#64748b", marginBottom: "2rem", fontSize: "0.95rem", lineHeight: 1.5 }}>Global Geo-fenced calculator for compounding fees based on location, violation, and vehicle type.</p>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ flex: "1 1 min(100%, 150px)" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.15em" }}>Country</label>
                <select value={calcCountry} onChange={e => { setCalcCountry(e.target.value); setCalcState(finesData.find((f: any) => f.country === e.target.value)?.state || ""); }} style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid var(--glass-border)", outline: "none", fontWeight: 600, background: "var(--background)", color: "var(--foreground)", cursor: "pointer", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)" }}>
                  {uniqueCountries.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
                </select>
              </div>
              <div style={{ flex: "1 1 min(100%, 150px)" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.15em" }}>State/Region</label>
                <select value={calcState} onChange={e => setCalcState(e.target.value)} style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid var(--glass-border)", outline: "none", fontWeight: 600, background: "var(--background)", color: "var(--foreground)", cursor: "pointer", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)" }}>
                  {uniqueStates.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
                </select>
              </div>
              <div style={{ flex: "1 1 min(100%, 150px)" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.15em" }}>Vehicle Type</label>
                <select value={calcVehicle} onChange={e => setCalcVehicle(e.target.value)} style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid var(--glass-border)", outline: "none", fontWeight: 600, background: "var(--background)", color: "var(--foreground)", cursor: "pointer", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)" }}>
                  {uniqueVehicles.map(v => <option key={v as string} value={v as string}>{v as string}</option>)}
                </select>
              </div>
              <div style={{ flex: "1 1 min(100%, 300px)" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.15em" }}>Violation Rule</label>
                <select value={calcViolation} onChange={e => setCalcViolation(e.target.value)} style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid var(--glass-border)", outline: "none", fontWeight: 600, background: "var(--background)", color: "var(--foreground)", cursor: "pointer", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)" }}>
                  {uniqueViolations.map(v => <option key={v as string} value={v as string}>{v as string}</option>)}
                </select>
              </div>
            </div>

            {calculatedFine ? (
              <div style={{ border: "1px solid var(--glass-border)", borderRadius: "20px", padding: "1.5rem", background: "rgba(0,0,0,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--accent-blue)", fontWeight: 800, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>{(calculatedFine as any).country} • {(calculatedFine as any).state} Code</div>
                  <div style={{ fontWeight: 900, fontSize: "1.5rem", marginBottom: "0.5rem", color: "var(--foreground)" }}>{(calculatedFine as any).violation}</div>
                  <div style={{ fontSize: "0.95rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ background: "rgba(0,0,0,0.05)", padding: "0.2rem 0.5rem", borderRadius: "6px", fontWeight: 600 }}>📜 {(calculatedFine as any).section}</span>
                    <span style={{ background: "rgba(0,0,0,0.05)", padding: "0.2rem 0.5rem", borderRadius: "6px", fontWeight: 600 }}>🚗 {(calculatedFine as any).vehicle}</span>
                  </div>
                  {(calculatedFine as any).consequence && (
                    <div style={{ fontSize: "0.85rem", color: "#ef4444", fontWeight: 700, marginTop: "1rem", background: "rgba(239,68,68,0.1)", padding: "0.75rem", borderRadius: "8px", borderLeft: "3px solid #ef4444" }}>⚠️ {(calculatedFine as any).consequence}</div>
                  )}
                </div>
                <div style={{ flex: "1 1 auto", minWidth: "150px", textAlign: "right", background: "rgba(0,0,0,0.02)", padding: "1.25rem 2rem", borderRadius: "16px", border: "1px solid var(--glass-border)", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 800, marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.15em" }}>Fine Amount</div>
                  <div style={{ fontWeight: 900, fontSize: "clamp(2rem, 5vw, 2.5rem)", color: "#10b981", textShadow: "0 0 20px rgba(16,185,129,0.2)" }}>{(calculatedFine as any).currency === "USD" ? "$" : (calculatedFine as any).currency === "GBP" ? "£" : (calculatedFine as any).currency === "EUR" ? "€" : (calculatedFine as any).currency === "AED" ? "AED " : (calculatedFine as any).currency === "AUD" ? "A$" : "₹"}{(calculatedFine as any).amount.toLocaleString("en-IN")}</div>
                </div>
              </div>
            ) : (
              <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed rgba(0,0,0,0.1)", borderRadius: "16px", color: "#64748b", fontWeight: 600 }}>
                No precise compounding fee matched for this specific combination.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Payment Processing Modal */}
      {paymentModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--background)", border: "1px solid var(--glass-border)", borderRadius: "24px", padding: "3.5rem 4rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
            <div style={{ width: "60px", height: "60px", border: "4px solid rgba(0,0,0,0.05)", borderTop: "4px solid var(--accent-blue)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "2rem" }}></div>
            <h3 style={{ fontWeight: 900, fontSize: "1.5rem", color: "var(--foreground)", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>Processing Secure Payment...</h3>
            <p style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: "0.95rem" }}>Connecting to encrypted UPI gateway</p>
          </div>
        </div>
      )}
      {/* Global Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes rotate-score {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}} />
    </main>
  );
}
