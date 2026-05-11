"use client";
import { useEffect, useState, useRef } from "react";
import { useDriveContext } from "../../context/DriveContext";
import Robot3D from "../../components/Robot3D";

const Waveform = ({ active }: { active: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "20px" }}>
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} style={{
        width: "4px",
        background: "#38bdf8",
        borderRadius: "4px",
        height: active ? `${10 + Math.random() * 15}px` : "6px",
        animation: active ? `wave-pulse 0.3s infinite alternate ${i * 0.1}s` : "none",
        transition: "height 0.3s ease"
      }} />
    ))}
  </div>
);

const darkCard = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(40px)",
  WebkitBackdropFilter: "blur(40px)",
  border: "1px solid rgba(99,102,241,0.3)",
  borderRadius: "24px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
  ...extra,
});

export default function CarDisplayMode() {
  const { speed, limit, setIsCarMode, drivingScore, askCoPilot, appLanguage, aiAlert, roadContext, weather } = useDriveContext();

  const [aiCompanionState, setAiCompanionState] = useState<"idle" | "listening" | "speaking" | "alert">("idle");
  const [aiSpeechText, setAiSpeechText] = useState(`"Cruising perfectly. The view of the city is clear tonight."`);
  const recognitionRef = useRef<any>(null);
  const [currentTime, setCurrentTime] = useState("");

  const isOverLimit = speed > limit;

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR && !recognitionRef.current) {
      const r = new SR(); r.lang = appLanguage; r.interimResults = true;
      recognitionRef.current = r;
    }
  }, [appLanguage]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { setIsCarMode(true); return () => setIsCarMode(false); }, [setIsCarMode]);

  useEffect(() => {
    if (isOverLimit && speed > 0) {
      setAiCompanionState("alert");
      setAiSpeechText(`"Speed limit reached. Slow down. Fine applies."`);
      if ("speechSynthesis" in window) {
        let text = "Speed limit reached. Slow down.";
        if (appLanguage === "hi-IN") text = "गति सीमा पार हो गई है। कृपया गति कम करें।";
        if (appLanguage === "mr-IN") text = "वेग मर्यादा ओलांडली आहे. कृपया वेग कमी करा.";
        if (appLanguage === "kn-IN") text = "ವೇಗದ ಮಿತಿ ಮೀರಿದೆ. ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ.";
        const u = new SpeechSynthesisUtterance(text);
        u.lang = appLanguage; u.rate = 0.9;
        u.onend = () => { setAiCompanionState("idle"); setAiSpeechText(`"Please maintain the speed limit."`); };
        window.speechSynthesis.speak(u);
      }
    } else {
      setAiCompanionState("idle");
      setAiSpeechText(`"Speed is optimal. Cruising safely."`);
    }
  }, [isOverLimit, limit, speed]);

  const handleVoiceInput = () => {
    if (aiCompanionState === "listening" || aiCompanionState === "speaking") return;
    const recognition = recognitionRef.current;
    if (!recognition) { setAiSpeechText(`"Speech recognition not supported in this browser."`); return; }

    recognition.onresult = async (e: any) => {
      const transcript = e.results[0][0].transcript;
      setAiSpeechText(`"You: ${transcript}"`);
      if (e.results[0].isFinal) {
        setAiCompanionState("speaking");
        const reply = await askCoPilot(transcript);
        setAiSpeechText(`"${reply}"`);
        if ("speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(reply);
          u.lang = appLanguage; u.rate = 0.9;
          u.onend = () => setAiCompanionState("idle");
          window.speechSynthesis.speak(u);
        } else { setTimeout(() => setAiCompanionState("idle"), 3000); }
      }
    };
    recognition.onerror = (e: any) => {
      setAiCompanionState("alert");
      if (e.error === "not-allowed") setAiSpeechText(`"Mic blocked! Please allow microphone access."`);
      else if (e.error === "audio-capture") setAiSpeechText(`"No microphone detected!"`);
      else setAiSpeechText(`"Microphone error (${e.error}). Please try again."`);
      setTimeout(() => setAiCompanionState("idle"), 4000);
    };
    recognition.onend = () => setAiCompanionState(prev => prev === "listening" ? "idle" : prev);
    try { recognition.start(); setAiCompanionState("listening"); setAiSpeechText(`"Listening..."`); }
    catch { /* already started */ }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", color: "#ffffff", padding: "1.5rem", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" }}>

      {/* Plasma background */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 30%, rgba(99,102,241,0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(168,85,247,0.15) 0%, transparent 40%)", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: 0, left: "-20%", right: "-20%", height: "40%", background: "repeating-linear-gradient(0deg,transparent,transparent 49px,rgba(99,102,241,0.08) 50px),repeating-linear-gradient(90deg,transparent,transparent 49px,rgba(99,102,241,0.08) 50px)", transform: "perspective(800px) rotateX(75deg)", transformOrigin: "bottom", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", position: "relative", zIndex: 10 }}>
        <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.1em" }}>
          TEMP: <span style={{ color: "#ffffff" }}>{weather ? `${weather.temp}°C` : "—"}</span>
        </div>
        <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.05em", fontFamily: "'Space Grotesk', sans-serif" }}>
          LEXDRIVE <span style={{ color: "#818cf8", textShadow: "0 0 20px rgba(99,102,241,0.5)" }}>TERMINAL</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.1em" }}>
            TIME: <span style={{ color: "#ffffff" }}>{currentTime}</span>
          </span>
          <a href="/summary" style={{ padding: "0.6rem 1.25rem", background: "#ffffff", color: "#0a0a0f", borderRadius: "980px", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none" }}>
            End Trip
          </a>
        </div>
      </div>

      {/* AI Alert Banner */}
      {(aiAlert || roadContext?.nearbyZones?.length > 0 || roadContext?.hasSpeedCamera) && (
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.75rem", zIndex: 10, flexWrap: "wrap", position: "relative" }}>
          {aiAlert && (
            <div style={{ flex: 1, minWidth: 300, background: isOverLimit ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.15)", border: `1px solid ${isOverLimit ? "#ef4444" : "#6366f1"}`, borderRadius: "12px", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>{isOverLimit ? "🚨" : "🤖"}</span>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, color: isOverLimit ? "#f87171" : "#a5b4fc", lineHeight: 1.4 }}>{aiAlert}</span>
            </div>
          )}
          {roadContext?.nearbyZones?.map((z: string) => (
            <span key={z} style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.375rem 0.875rem", borderRadius: "999px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)", color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>⚠️ {z}</span>
          ))}
          {roadContext?.hasSpeedCamera && (
            <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.375rem 0.875rem", borderRadius: "999px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>📷 Speed Camera Ahead</span>
          )}
        </div>
      )}

      {/* 3-COLUMN LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "1.5rem", position: "relative", zIndex: 10 }}>

        {/* ── LEFT: GPS & SPEED ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={darkCard({ flex: 1, padding: "1.25rem", display: "flex", flexDirection: "column", overflow: "hidden" })}>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem", fontFamily: "'Space Grotesk', sans-serif" }}>GPS & Radar</div>
            <div style={{ flex: 1, position: "relative", background: "rgba(0,113,227,0.02)", borderRadius: "16px", border: "1px solid rgba(0,113,227,0.1)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", top: 0, bottom: 0, left: "45%", width: "10px", background: "#2563eb", boxShadow: "0 0 30px #2563eb", filter: "blur(2px)", transform: "skew(-15deg)" }} />
              <div style={{ width: "300px", height: "300px", borderRadius: "50%", border: "1px solid rgba(0,113,227,0.1)", position: "absolute" }} />
              <div style={{ width: "200px", height: "200px", borderRadius: "50%", border: "1px solid rgba(0,113,227,0.2)", position: "absolute" }} />
              <div style={{ width: "100px", height: "100px", borderRadius: "50%", border: "2px solid rgba(0,113,227,0.3)", position: "absolute" }} />
              <div style={{ width: "300px", height: "300px", background: "conic-gradient(from 0deg, transparent 70%, rgba(0,113,227,0.15) 100%)", borderRadius: "50%", position: "absolute", animation: "spin 3s linear infinite" }} />
              {isOverLimit && <div style={{ width: "12px", height: "12px", background: "#FF3B30", borderRadius: "50%", position: "absolute", top: "30%", left: "60%", boxShadow: "0 0 20px #FF3B30", animation: "live-pulse 1s infinite" }} />}
              <div style={{ position: "absolute", top: "60%", left: "46%", transform: "translate(-50%,-50%)", width: "40px", height: "40px", background: "#2563eb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(37,99,235,0.4)", zIndex: 2 }}>
                <div style={{ width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderBottom: "16px solid white", transform: "translateY(-2px)" }} />
              </div>
              <div style={{ position: "absolute", top: "1rem", left: "1rem", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", padding: "0.5rem 1rem", borderRadius: "980px", fontSize: "0.75rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }}>OBD-II Telemetry</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={darkCard({ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", border: isOverLimit ? "2px solid #ef4444" : "1px solid rgba(99,102,241,0.3)" })}>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>Speed</div>
              <div style={{ fontSize: "4.5rem", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.04em", color: isOverLimit ? "#ef4444" : "#ffffff", lineHeight: 1, textShadow: isOverLimit ? "0 0 20px rgba(239,68,68,0.5)" : "0 0 20px rgba(255,255,255,0.1)" }}>{speed}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: "5px" }}>KM/H</div>
            </div>
            <div style={darkCard({ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center" })}>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>Limit</div>
              <div style={{ fontSize: "4.5rem", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.04em", color: "#ffffff", lineHeight: 1 }}>{limit}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: "5px" }}>KM/H</div>
            </div>
          </div>
        </div>

        {/* ── CENTER: ROBOT + VOICE ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ position: "absolute", inset: 0, background: aiCompanionState === "alert" ? "radial-gradient(circle at center, rgba(255,59,48,0.12) 0%, transparent 70%)" : aiCompanionState === "listening" ? "radial-gradient(circle at center, rgba(99,102,241,0.12) 0%, transparent 70%)" : aiCompanionState === "speaking" ? "radial-gradient(circle at center, rgba(168,85,247,0.08) 0%, transparent 70%)" : "transparent" }} />
            <div style={{ zIndex: 1, width: "100%", height: "100%" }}>
              <Robot3D state={aiCompanionState} size={190} />
            </div>
          </div>

          <div onClick={handleVoiceInput} style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", borderRadius: "18px", padding: "1.5rem", border: aiCompanionState === "listening" ? "1px solid #6366f1" : "1px solid rgba(99,102,241,0.3)", cursor: "pointer", position: "relative", overflow: "hidden", minHeight: "150px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            {aiCompanionState === "listening" && <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px", background: "#6366f1", animation: "scan 2s linear infinite", boxShadow: "0 0 15px #6366f1" }} />}
            <div style={{ fontSize: "1.05rem", lineHeight: 1.6, color: "#ffffff", zIndex: 1, fontWeight: 400 }}>
              <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.65rem", fontFamily: "'Space Grotesk', sans-serif" }}>LexDrive AI // </span><br />
              <span style={{ color: aiCompanionState === "alert" ? "#f87171" : "#ffffff", textShadow: aiCompanionState === "alert" ? "0 0 10px rgba(239,68,68,0.5)" : "none" }}>{aiSpeechText}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1 }}>
              <Waveform active={aiCompanionState === "listening" || aiCompanionState === "speaking"} />
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {aiCompanionState === "listening" && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FF3B30", animation: "live-pulse 1s infinite" }} />}
                {aiCompanionState === "listening" ? "Listening..." : "Tap to Transmit"}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: ANALYTICS + VIOLATIONS + COMPLIANCE ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Analytics */}
          <div style={darkCard({ padding: "1.5rem" })}>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem", fontFamily: "'Space Grotesk', sans-serif" }}>Driving Analytics</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Safety Score</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0.25rem 0", color: "#ffffff", letterSpacing: "-0.03em" }}>{drivingScore} / 100</div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{drivingScore >= 90 ? "Excellent 😇" : drivingScore >= 70 ? "Good 🛡️" : "Needs work ⚠️"}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "70px", height: "35px", borderTopLeftRadius: "35px", borderTopRightRadius: "35px", background: "conic-gradient(from 270deg at 50% 100%, #FF3B30 0deg, #FF9500 45deg, #34C759 90deg, transparent 90deg)", position: "relative" }}>
                  <div style={{ position: "absolute", bottom: 0, left: "6px", right: "6px", top: "6px", background: "#0a0a0f", borderTopLeftRadius: "30px", borderTopRightRadius: "30px" }} />
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: "4px", color: "#ffffff" }}>{drivingScore}%</div>
              </div>
            </div>
          </div>

          {/* Violations */}
          <div style={darkCard({ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", background: isOverLimit ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.03)", border: isOverLimit ? "2px solid #ef4444" : "1px solid rgba(99,102,241,0.3)" })}>
            <div style={{ fontSize: "0.75rem", color: isOverLimit ? "#f87171" : "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem", fontFamily: "'Space Grotesk', sans-serif" }}>Active Law Violations</div>
            {isOverLimit ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flex: 1 }}>
                <div style={{ fontSize: "1.5rem", animation: "live-pulse 1s infinite" }}>🚨</div>
                <div>
                  <div style={{ fontWeight: 700, color: "#ff6b6b", fontSize: "1rem", marginBottom: "0.375rem" }}>Overspeeding Detected</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.5 }}>Section 183 MVA. Fine ₹1,000–₹2,000. Slow down immediately.</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flex: 1 }}>
                <div style={{ fontSize: "1.5rem" }}>✅</div>
                <div>
                  <div style={{ fontWeight: 700, color: "#34C759", fontSize: "1rem", marginBottom: "0.375rem" }}>No Violations Detected</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.5 }}>Perfect compliance. Scanning surroundings...</div>
                </div>
              </div>
            )}
          </div>

          {/* Compliance */}
          <div style={darkCard({ padding: "1.5rem" })}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem", fontFamily: "'Space Grotesk', sans-serif" }}>Compliance Check //</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { label: "Seatbelts Mandatory", color: "#34C759" },
                { label: "No Mobile Phones", color: "#34C759" },
                { label: "Lane Discipline Enforced", color: "#FF9500" },
              ].map(({ label, color }, i, arr) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none", paddingBottom: i < arr.length - 1 ? "0.5rem" : 0 }}>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.875rem", fontWeight: 500 }}>{label}</span>
                  <span style={{ color, fontSize: "1.2rem" }}>•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wave-pulse { 0% { height: 6px; } 100% { height: 25px; } }
        @keyframes live-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes scan { 0% { top: 0; opacity: 1; } 50% { opacity: 0.5; } 100% { top: 100%; opacity: 0; } }
      ` }} />
    </main>
  );
}
