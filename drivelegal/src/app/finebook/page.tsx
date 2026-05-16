"use client";
import { useState, useMemo } from "react";
import finesData from "../../data/fines.json";
import "../globals.css";
import VehicleSelectModal from "../../components/VehicleSelectModal";

// ── Education data ──
const lawCards = [
  {
    id: "speed", icon: "🚗", color: "var(--danger)", bg: "var(--danger-bg)", border: "var(--danger-border)",
    title: "Overspeeding", section: "Section 183 MV Act 2019",
    rule: "No person shall drive a motor vehicle at a speed exceeding the maximum speed limit fixed for that road.",
    fines: ["LMV: ₹1,000 (1st) / ₹2,000 (repeat)", "Medium vehicle: ₹2,000 / ₹4,000", "Heavy vehicle: ₹4,000 / ₹6,000"],
    tip: "Speed limits: 50 km/h in cities, 100 km/h on highways, 25 km/h near schools."
  },
  {
    id: "drunk", icon: "🍺", color: "#7C3AED", bg: "var(--violet-light)", border: "rgba(124,58,237,0.2)",
    title: "Drunk Driving", section: "Section 185 MV Act 2019",
    rule: "Driving with blood alcohol content exceeding 30 mg per 100 ml of blood is a criminal offence.",
    fines: ["1st offence: ₹10,000 and/or 6 months jail", "Repeat: ₹15,000 and/or 2 years jail"],
    tip: "Zero tolerance for commercial vehicle drivers. BAC limit: 30 mg/100 ml blood."
  },
  {
    id: "helmet", icon: "⛑️", color: "var(--warning)", bg: "var(--warning-bg)", border: "var(--warning-border)",
    title: "No Helmet", section: "Section 194D MV Act 2019",
    rule: "Every person driving or riding on a two-wheeler must wear a protective headgear conforming to BIS standards.",
    fines: ["Fine: ₹1,000", "3-month license suspension"],
    tip: "Helmet must be ISI marked. Applies to both rider and pillion passenger."
  },
  {
    id: "seatbelt", icon: "🪢", color: "var(--brand)", bg: "var(--brand-light)", border: "rgba(37,99,235,0.2)",
    title: "No Seatbelt", section: "Section 194B MV Act 2019",
    rule: "Every person driving or riding in a motor vehicle must wear a seatbelt while the vehicle is in motion.",
    fines: ["Fine: ₹1,000"],
    tip: "Applies to all occupants including rear seat passengers. Children under 14 must use child restraints."
  },
  {
    id: "phone", icon: "📱", color: "var(--danger)", bg: "var(--danger-bg)", border: "var(--danger-border)",
    title: "Mobile Phone While Driving", section: "Section 184 MV Act 2019",
    rule: "Using a handheld communication device while driving constitutes dangerous driving.",
    fines: ["Fine: ₹1,000–₹5,000", "Repeat: up to ₹10,000"],
    tip: "Hands-free devices are permitted. Even stopping at a red light counts as 'driving'."
  },
  {
    id: "signal", icon: "🚦", color: "var(--danger)", bg: "var(--danger-bg)", border: "var(--danger-border)",
    title: "Jumping Red Light", section: "Section 184 MV Act 2019",
    rule: "Disobeying traffic signals is classified as dangerous driving and carries criminal liability.",
    fines: ["Fine: ₹1,000–₹5,000"],
    tip: "CCTV cameras at major intersections automatically generate challans. No human officer needed."
  },
  {
    id: "license", icon: "🪪", color: "var(--fg)", bg: "var(--bg-subtle)", border: "var(--border)",
    title: "Driving Without License", section: "Section 3/181 MV Act 2019",
    rule: "No person shall drive a motor vehicle in any public place unless they hold an effective driving license.",
    fines: ["Fine: ₹5,000", "Community service for first offence"],
    tip: "Learner's license holders must be accompanied by a licensed driver. DigiLocker DL is legally valid."
  },
  {
    id: "insurance", icon: "📋", color: "var(--success)", bg: "var(--success-bg)", border: "var(--success-border)",
    title: "Driving Without Insurance", section: "Section 196 MV Act 2019",
    rule: "No person shall use a motor vehicle in a public place without a valid third-party insurance policy.",
    fines: ["1st offence: ₹2,000 and/or 3 months jail", "Repeat: ₹4,000 and/or 3 months jail"],
    tip: "Third-party insurance is mandatory. Comprehensive insurance is optional but recommended."
  },
  {
    id: "juvenile", icon: "👦", color: "var(--danger)", bg: "var(--danger-bg)", border: "var(--danger-border)",
    title: "Juvenile Driving", section: "Section 199A MV Act 2019",
    rule: "If a juvenile drives a vehicle, the guardian or owner of the vehicle shall be deemed guilty.",
    fines: ["Guardian fine: ₹25,000", "3 years imprisonment for guardian", "Vehicle registration cancelled"],
    tip: "The juvenile will be tried under the Juvenile Justice Act. Vehicle cannot be re-registered for 12 months."
  },
  {
    id: "puc", icon: "💨", color: "var(--success)", bg: "var(--success-bg)", border: "var(--success-border)",
    title: "No PUC Certificate", section: "Section 190(2) MV Act 2019",
    rule: "Every motor vehicle must have a valid Pollution Under Control certificate at all times.",
    fines: ["Fine: ₹10,000 and/or 6 months jail"],
    tip: "PUC validity: 1 year for new vehicles (first 2 years), then 6 months. Available at petrol pumps."
  },
  {
    id: "emergency", icon: "🚑", color: "var(--danger)", bg: "var(--danger-bg)", border: "var(--danger-border)",
    title: "Not Giving Way to Emergency Vehicles", section: "Section 194E MV Act 2019",
    rule: "Every driver must immediately give way to ambulances, fire engines, and police vehicles with sirens.",
    fines: ["Fine: ₹10,000"],
    tip: "Pull to the left and stop. Do not follow emergency vehicles through red lights."
  },
  {
    id: "hitrun", icon: "⚠️", color: "var(--danger)", bg: "var(--danger-bg)", border: "var(--danger-border)",
    title: "Hit and Run", section: "Section 161 MV Act 2019",
    rule: "Fleeing the scene of an accident without reporting to police or assisting the victim is a serious criminal offence.",
    fines: ["Death caused: ₹2,00,000 compensation + up to 10 years jail", "Grievous injury: ₹50,000 compensation"],
    tip: "Good Samaritans who help accident victims are legally protected from harassment under the MV Act."
  },
];

const currencySymbol = (c: string) => ({ USD:"$", GBP:"£", EUR:"€", AED:"AED ", AUD:"A$" }[c] || "₹");

export default function Finebook() {
  const [activeTab, setActiveTab] = useState<"learn"|"fines">("learn");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Vehicles");
  const [countryFilter, setCountryFilter] = useState("All Countries");
  const [stateFilter, setStateFilter] = useState("All States");
  const [expandedLaw, setExpandedLaw] = useState<string|null>(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  const uniqueCountries = useMemo(() => ["All Countries", ...Array.from(new Set(finesData.map((f: any) => f.country)))], []);
  const uniqueStates = useMemo(() => ["All States", ...Array.from(new Set(finesData.filter((f: any) => countryFilter === "All Countries" || f.country === countryFilter).map((f: any) => f.state)))], [countryFilter]);

  const filteredFines = useMemo(() => finesData.filter(fine => {
    const q = searchQuery.toLowerCase();
    let amountMatch = true;
    if (q.includes("above") || q.includes("over") || q.includes(">")) {
      const num = parseInt(q.replace(/\D/g, ""));
      if (!isNaN(num)) amountMatch = fine.amount > num;
    } else if (q.includes("below") || q.includes("under") || q.includes("<")) {
      const num = parseInt(q.replace(/\D/g, ""));
      if (!isNaN(num)) amountMatch = fine.amount < num;
    }
    const isNumeric = q.includes("above")||q.includes("over")||q.includes("below")||q.includes("under")||q.includes(">")||q.includes("<");
    const matchesSearch = fine.violation.toLowerCase().includes(q) || fine.section.toLowerCase().includes(q) || q.includes(fine.amount.toString());
    const searchOk = isNumeric ? amountMatch : (q === "" ? true : matchesSearch);
    const vehicleOk = activeFilter === "All Vehicles" ? true : (fine as any).vehicle.includes(activeFilter) || (fine as any).vehicle === "All Vehicles";
    const countryOk = countryFilter === "All Countries" ? true : (fine as any).country === countryFilter;
    const stateOk = stateFilter === "All States" ? true : (fine as any).state === stateFilter;
    return searchOk && vehicleOk && countryOk && stateOk;
  }), [searchQuery, activeFilter, countryFilter, stateFilter]);

  return (
    <main style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <VehicleSelectModal isOpen={showVehicleModal} onClose={() => setShowVehicleModal(false)} />
      <div className="bg-mesh" />

      {/* NAV */}
      <nav className="finebook-nav" style={{ position:"sticky",top:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 5%",height:64,background:"var(--nav-bg)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"1px solid var(--nav-border)" }}>
        <a href="/" className="finebook-brand" style={{ display:"flex",alignItems:"center",gap:"0.625rem" }}>
          <div style={{ width:34,height:34,borderRadius:"var(--radius-md)",background:"linear-gradient(135deg,var(--brand),var(--violet))",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span style={{ fontFamily:"'Latin Modern Roman', serif", fontStyle: "italic", fontWeight:700,fontSize:"1.125rem",letterSpacing:"-0.03em",color:"var(--fg)" }}>LexDrive <span style={{ color:"var(--brand)" }}>AI</span></span>
        </a>
        <div className="finebook-nav-links" style={{ display:"flex",gap:"2rem" }}>
          <a href="/" className="nav-link">Home</a>
          <a href="/finebook" className="nav-link" style={{ color:"var(--brand)" }}>Finebook</a>
          <a href="/summary" className="nav-link">Summary</a>
        </div>
        <a href="#" onClick={(e) => { e.preventDefault(); setShowVehicleModal(true); }} className="btn-primary finebook-nav-cta" style={{ padding:"0.5rem 1.25rem",fontSize:"0.875rem" }}>Start Driving</a>
      </nav>

      {/* HEADER */}
      <section className="finebook-header" style={{ maxWidth:1000,margin:"0 auto",padding:"4rem 5% 2rem",textAlign:"center" }}>
        <div className="badge badge-violet animate-fade-in-up" style={{ marginBottom:"1.25rem" }}>Traffic Law Education + Fine Database</div>
        <h1 className="animate-fade-in-up delay-100" style={{ fontSize:"clamp(2.25rem,5vw,3.5rem)",fontWeight:800,letterSpacing:"-0.05em",marginBottom:"1rem" }}>
          Know the law.<br /><span className="text-gradient-accent">Avoid the fine.</span>
        </h1>
        <p className="animate-fade-in-up delay-200" style={{ fontSize:"1.0625rem",color:"var(--fg-muted)",maxWidth:600,margin:"0 auto 2rem",lineHeight:1.7 }}>
          Every traffic rule explained in plain language — with the exact section number, fine amount, and what happens if you break it.
        </p>

        {/* Tab switcher */}
        <div className="finebook-tabs animate-fade-in-up delay-300" style={{ display:"inline-flex",background:"var(--bg-subtle)",borderRadius:"var(--radius-full)",padding:"0.25rem",border:"1px solid var(--border)" }}>
          <button onClick={() => setActiveTab("learn")} style={{ padding:"0.625rem 1.5rem",borderRadius:"var(--radius-full)",border:"none",fontWeight:600,fontSize:"0.9rem",cursor:"pointer",transition:"all 0.2s ease",background: activeTab==="learn" ? "var(--bg-white)" : "transparent",color: activeTab==="learn" ? "var(--fg)" : "var(--fg-muted)",boxShadow: activeTab==="learn" ? "var(--shadow-sm)" : "none" }}>
            📚 Learn the Laws
          </button>
          <button onClick={() => setActiveTab("fines")} style={{ padding:"0.625rem 1.5rem",borderRadius:"var(--radius-full)",border:"none",fontWeight:600,fontSize:"0.9rem",cursor:"pointer",transition:"all 0.2s ease",background: activeTab==="fines" ? "var(--bg-white)" : "transparent",color: activeTab==="fines" ? "var(--fg)" : "var(--fg-muted)",boxShadow: activeTab==="fines" ? "var(--shadow-sm)" : "none" }}>
            📋 Fine Database
          </button>
        </div>
      </section>

      {/* ── LEARN TAB ── */}
      {activeTab === "learn" && (
        <section className="finebook-section" style={{ maxWidth:1000,margin:"0 auto",padding:"0 5% 5rem" }}>
          {/* Stats bar */}
          <div className="finebook-stats-grid" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"1rem",marginBottom:"2.5rem" }}>
            {[
              { label:"Laws covered", value:"12", color:"var(--brand)" },
              { label:"MV Act sections", value:"15+", color:"var(--violet)" },
              { label:"Max fine", value:"₹2L", color:"var(--danger)" },
              { label:"Countries", value:"6", color:"var(--success)" },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ textAlign:"center" }}>
                <div style={{ fontSize:"1.75rem",fontWeight:800,color:s.color,fontFamily:"'Latin Modern Roman', serif", fontStyle: "italic", letterSpacing:"-0.03em" }}>{s.value}</div>
                <div style={{ fontSize:"0.75rem",color:"var(--fg-muted)",fontWeight:600,marginTop:"0.25rem",textTransform:"uppercase",letterSpacing:"0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Law cards */}
          <div style={{ display:"flex",flexDirection:"column",gap:"1rem" }}>
            {lawCards.map(law => (
              <div key={law.id} className="card" style={{ overflow:"hidden",cursor:"pointer" }} onClick={() => setExpandedLaw(expandedLaw === law.id ? null : law.id)}>
                {/* Card header */}
                <div className="finebook-law-header" style={{ padding:"1.25rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem" }}>
                  <div className="finebook-law-title-row" style={{ display:"flex",alignItems:"center",gap:"1rem" }}>
                    <div style={{ width:44,height:44,borderRadius:"var(--radius-md)",background:law.bg,border:`1px solid ${law.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.25rem",flexShrink:0 }}>
                      {law.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight:700,fontSize:"1rem",color:"var(--fg)" }}>{law.title}</div>
                      <div style={{ fontSize:"0.8rem",color:"var(--fg-muted)",marginTop:"0.125rem",fontFamily:"'Latin Modern Roman', serif", fontStyle: "italic" }}>{law.section}</div>
                    </div>
                  </div>
                  <div className="finebook-law-meta" style={{ display:"flex",alignItems:"center",gap:"0.75rem",flexShrink:0 }}>
                    <span style={{ fontSize:"0.8rem",fontWeight:700,color:law.color,background:law.bg,border:`1px solid ${law.border}`,padding:"0.25rem 0.75rem",borderRadius:"var(--radius-full)" }}>
                      {law.fines[0].split(":")[1]?.trim() || law.fines[0]}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" strokeWidth="2.5" style={{ transform: expandedLaw===law.id ? "rotate(180deg)" : "none", transition:"transform 0.2s ease" }}><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>

                {/* Expanded content */}
                {expandedLaw === law.id && (
                  <div style={{ borderTop:"1px solid var(--border)",padding:"1.5rem",background:"var(--bg-subtle)",display:"flex",flexDirection:"column",gap:"1.25rem" }}>
                    {/* Rule text */}
                    <div>
                      <div style={{ fontSize:"0.7rem",fontWeight:700,color:"var(--fg-muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.5rem" }}>What the law says</div>
                      <p style={{ fontSize:"0.9375rem",color:"var(--fg-secondary)",lineHeight:1.7,margin:0,fontStyle:"italic",borderLeft:"3px solid var(--border)",paddingLeft:"1rem" }}>"{law.rule}"</p>
                    </div>

                    {/* Fines */}
                    <div>
                      <div style={{ fontSize:"0.7rem",fontWeight:700,color:"var(--fg-muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.625rem" }}>Penalties</div>
                      <div style={{ display:"flex",flexDirection:"column",gap:"0.375rem" }}>
                        {law.fines.map((f,i) => (
                          <div key={i} style={{ display:"flex",alignItems:"center",gap:"0.625rem",fontSize:"0.9rem",color:"var(--fg-secondary)" }}>
                            <span style={{ width:6,height:6,borderRadius:"50%",background:law.color,flexShrink:0,display:"inline-block" }} />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tip */}
                    <div style={{ background:"var(--bg-white)",border:"1px solid var(--border)",borderRadius:"var(--radius-md)",padding:"0.875rem 1rem",display:"flex",gap:"0.625rem",alignItems:"flex-start" }}>
                      <span style={{ fontSize:"1rem",flexShrink:0 }}>💡</span>
                      <p style={{ fontSize:"0.875rem",color:"var(--fg-secondary)",lineHeight:1.6,margin:0 }}>{law.tip}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA to fines tab */}
          <div className="finebook-cta-panel" style={{ marginTop:"3rem",textAlign:"center",padding:"3rem",background:"linear-gradient(135deg,var(--brand) 0%,var(--violet) 100%)",borderRadius:"var(--radius-2xl)",color:"#fff" }}>
            <h3 style={{ fontSize:"1.5rem",fontWeight:800,letterSpacing:"-0.04em",marginBottom:"0.75rem" }}>Want to see all fines by state?</h3>
            <p style={{ opacity:0.85,marginBottom:"1.5rem",fontSize:"0.9375rem" }}>Browse 80+ violations across India, USA, UK, UAE, Australia and Germany.</p>
            <button onClick={() => setActiveTab("fines")} style={{ padding:"0.75rem 2rem",background:"#fff",color:"var(--brand)",borderRadius:"var(--radius-full)",fontWeight:700,fontSize:"0.9375rem",border:"none",cursor:"pointer" }}>
              Open Fine Database →
            </button>
          </div>
        </section>
      )}

      {/* ── FINES TAB ── */}
      {activeTab === "fines" && (
        <section className="finebook-section" style={{ maxWidth:1000,margin:"0 auto",padding:"0 5% 5rem" }}>
          {/* Filters */}
          <div className="card finebook-filters" style={{ padding:"1.25rem",display:"flex",gap:"1rem",alignItems:"center",flexWrap:"wrap",marginBottom:"1.5rem" }}>
            <div style={{ flex:"1 1 260px",position:"relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--fg-faint)" strokeWidth="2" style={{ position:"absolute",left:"0.875rem",top:"50%",transform:"translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search... e.g. 'helmet' or 'above 5000'" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input" style={{ paddingLeft:"2.75rem" }} />
            </div>
            <div className="finebook-filter-controls" style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap",alignItems:"center" }}>
              {["All Vehicles","Two-Wheeler","Four-Wheeler"].map(t => (
                <button key={t} onClick={() => setActiveFilter(t)} style={{ padding:"0.5rem 0.875rem",borderRadius:"var(--radius-full)",fontSize:"0.8125rem",fontWeight:600,cursor:"pointer",border: activeFilter===t ? "1.5px solid var(--brand)" : "1px solid var(--border)",background: activeFilter===t ? "var(--brand-light)" : "var(--bg-white)",color: activeFilter===t ? "var(--brand)" : "var(--fg-muted)",transition:"all 0.15s ease" }}>{t}</button>
              ))}
              <select className="finebook-select" value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setStateFilter("All States"); }} style={{ padding:"0.5rem 0.875rem",borderRadius:"var(--radius-full)",fontSize:"0.8125rem",fontWeight:600,border:"1px solid var(--border)",background:"var(--bg-white)",color:"var(--fg)",outline:"none",cursor:"pointer" }}>
                {uniqueCountries.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
              </select>
              <select className="finebook-select" value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={{ padding:"0.5rem 0.875rem",borderRadius:"var(--radius-full)",fontSize:"0.8125rem",fontWeight:600,border:"1px solid var(--border)",background:"var(--bg-white)",color:"var(--fg)",outline:"none",cursor:"pointer" }}>
                {uniqueStates.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="finebook-stats-grid" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"1rem",marginBottom:"1.5rem" }}>
            {[
              { label:"Total Violations", value: finesData.length, color:"var(--brand)" },
              { label:"Jurisdictions", value: new Set(finesData.map(f => f.state)).size, color:"var(--violet)" },
              { label:"Max Fine (INR)", value: "₹"+Math.max(...finesData.filter(f => f.currency==="INR").map(f => f.amount)).toLocaleString("en-IN"), color:"var(--danger)" },
              { label:"Showing", value: filteredFines.length, color:"var(--success)" },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ textAlign:"center" }}>
                 <div style={{ fontSize:"1.5rem",fontWeight:800,color:s.color,fontFamily:"'Latin Modern Roman', serif", fontStyle: "italic", letterSpacing:"-0.03em" }}>{s.value}</div>
                <div style={{ fontSize:"0.75rem",color:"var(--fg-muted)",fontWeight:600,marginTop:"0.25rem",textTransform:"uppercase",letterSpacing:"0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card finebook-table-card" style={{ overflow:"hidden",padding:0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Violation</th>
                  <th style={{ width:"15%" }}>Section / Rule</th>
                  <th style={{ width:"13%" }}>Vehicle</th>
                  <th style={{ width:"13%" }}>State</th>
                  <th style={{ width:"12%",textAlign:"right" }}>Fine</th>
                </tr>
              </thead>
              <tbody>
                {filteredFines.map(fine => (
                  <tr key={fine.id}>
                    <td data-label="Violation">
                      <div style={{ fontWeight:600,color:"var(--fg)",marginBottom: (fine as any).consequence ? "0.25rem" : 0 }}>{fine.violation}</div>
                      {(fine as any).consequence && <div style={{ fontSize:"0.8rem",color:"var(--danger)",fontWeight:500 }}>{(fine as any).consequence}</div>}
                    </td>
                    <td data-label="Section / Rule">
                      <div style={{ fontWeight:600,fontSize:"0.875rem",color:"var(--fg-secondary)",fontFamily:"'Latin Modern Roman', serif", fontStyle: "italic" }}>{fine.section}</div>
                      <div style={{ fontSize:"0.75rem",color:"var(--fg-faint)",marginTop:"0.125rem" }}>{fine.state === "All India" ? "Parivahan Verified" : `${fine.state} Traffic Police`}</div>
                    </td>
                    <td data-label="Vehicle"><span className="chip chip-gray">{fine.vehicle}</span></td>
                    <td data-label="State"><span className="chip chip-blue">{fine.state}</span></td>
                    <td data-label="Fine" style={{ textAlign:"right",fontWeight:800,fontSize:"1rem",color:"var(--fg)",fontFamily:"'Latin Modern Roman', serif", fontStyle: "italic" }}>
                      {currencySymbol((fine as any).currency)}{(fine as any).amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
                {filteredFines.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign:"center",padding:"3rem",color:"var(--fg-muted)" }}>No fines match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Back to learn */}
          <div style={{ marginTop:"2rem",textAlign:"center" }}>
            <button onClick={() => setActiveTab("learn")} className="btn-secondary" style={{ fontSize:"0.875rem" }}>
              ← Back to Law Education
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
