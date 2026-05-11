"use client";
import { useEffect, useState, useRef } from "react";
import { useDriveContext } from "../../context/DriveContext";
import finesData from "../../data/fines.json";
import "../globals.css";
import Robot3D from "../../components/Robot3D";

export default function DrivePhoneMode() {
  const { speed, limit, setIsCarMode, riskAlert, drivingScore, askCoPilot, appLanguage, obdStatus, speedSource, connectOBD, disconnectOBD, obdSupported, aiAlert, roadContext, weather, tripDurationMinutes } = useDriveContext();
  const [aiCompanionState, setAiCompanionState] = useState<"idle" | "listening" | "speaking" | "alert">("idle");
  const [aiSpeechText, setAiSpeechText] = useState(`"Speed is good. Scanning local jurisdictions."`);
  const recognitionRef = useRef<any>(null);

  const isOverLimit = speed > limit;
  const overspeedAmount = Math.max(0, speed - limit);

  // Activate drive context
  useEffect(() => {
    setIsCarMode(true);
    return () => setIsCarMode(false);
  }, [setIsCarMode]);

  // Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = appLanguage;
      recognition.interimResults = true;
      recognitionRef.current = recognition;
    }
  }, [appLanguage]);

  // Auto-push speed alerts
  useEffect(() => {
    if (isOverLimit && speed > 0) {
      setAiCompanionState("alert");
      setAiSpeechText(`"Speed limit reached. Slow down. Fine of ₹1,000 to ₹2,000 applies."`);
      
      // Auto-speak the violation
      if ("speechSynthesis" in window) {
         let text = "Speed limit reached. Slow down. Fine of 1500 rupees applies.";
         if (appLanguage === "hi-IN") text = "गति सीमा पार हो गई है। कृपया गति कम करें। 1500 रुपये का जुर्माना लागू है।";
         if (appLanguage === "mr-IN") text = "वेग मर्यादा ओलांडली आहे. कृपया वेग कमी करा. 1500 रुपये दंड लागू आहे.";
         if (appLanguage === "kn-IN") text = "ವೇಗದ ಮಿತಿ ಮೀರಿದೆ. ನಿಧಾನವಾಗಿ. 1500 ರೂಪಾಯಿ ದಂಡ ವಿಧಿಸಲಾಗುತ್ತದೆ.";

         const u = new SpeechSynthesisUtterance(text);
         u.lang = appLanguage;
         u.rate = 0.9;
         u.onend = () => { setAiCompanionState("idle"); setAiSpeechText(`"Please maintain the speed limit."`); };
         window.speechSynthesis.speak(u);
      }
    } else {
      setAiCompanionState("idle");
      setAiSpeechText(`"Speed is good. No violations."`);
    }
  }, [isOverLimit, limit, speed]);

  const handleVoiceInput = () => {
    if (aiCompanionState === "listening" || aiCompanionState === "speaking") return;
    const recognition = recognitionRef.current;
    
    if (!recognition) {
      setAiSpeechText(`"Speech recognition not supported in this browser."`);
      return;
    }
    
    recognition.onresult = async (e: any) => {
      const transcript = e.results[0][0].transcript;
      setAiSpeechText(`"You: ${transcript}"`);
      
      if (e.results[0].isFinal) {
        setAiCompanionState("speaking");
        const reply = await askCoPilot(transcript);
        setAiSpeechText(`"${reply}"`);
        
        if ("speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(reply);
          u.lang = appLanguage;
          u.rate = 0.9;
          u.onend = () => setAiCompanionState("idle");
          window.speechSynthesis.speak(u);
        } else {
          setTimeout(() => setAiCompanionState("idle"), 3000);
        }
      }
    };

    recognition.onerror = (e: any) => {
      console.warn("Microphone error:", e.error);
      setAiCompanionState("alert");
      if (e.error === "not-allowed") {
        setAiSpeechText(`"Mic blocked! Please allow microphone access in your browser."`);
      } else if (e.error === "audio-capture") {
        setAiSpeechText(`"No microphone detected! Please check your hardware."`);
      } else {
        setAiSpeechText(`"Microphone error (${e.error}). Please try again."`);
      }
      setTimeout(() => setAiCompanionState("idle"), 4000);
    };

    recognition.onend = () => {
       setAiCompanionState(prev => prev === "listening" ? "idle" : prev);
    };

    try {
      recognition.start();
      setAiCompanionState("listening");
      setAiSpeechText(`"Listening..."`);
    } catch (e) {
      console.warn("Recognition already started");
    }
  };

  return (
    <main style={{ 
      minHeight: "100vh", 
      background: "#0a0a0f", 
      color: "#ffffff", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      
      {/* Animated Plasma Background */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 40%)", zIndex: 0 }}></div>

      {/* Main Content */}
      <div style={{ width: "100%", maxWidth: "400px", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", zIndex: 10 }}>

        {/* Title */}
        <div style={{ textAlign: "center", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "0.1em", color: "#ffffff", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" }}>
          LexDrive <span style={{ color: "#818cf8", textShadow: "0 0 20px rgba(99, 102, 241, 0.5)" }}>Terminal</span>
        </div>

        {/* ── AI Proactive Alert Banner ── */}
        {aiAlert && (
          <div style={{ width:"100%", background: isOverLimit ? "rgba(239, 68, 68, 0.15)" : "rgba(99, 102, 241, 0.15)", border:`1px solid ${isOverLimit ? "#ef4444" : "#6366f1"}`, borderRadius:"16px", padding:"0.875rem 1rem", display:"flex", alignItems:"flex-start", gap:"0.625rem", animation:"fadeInUp 0.3s ease" }}>
            <span style={{ fontSize:"1.1rem", flexShrink:0 }}>{isOverLimit ? "🚨" : "🤖"}</span>
            <p style={{ fontSize:"0.9rem", fontWeight:600, color: "#ffffff", lineHeight:1.5, margin:0 }}>{aiAlert}</p>
          </div>
        )}

        {/* ── Road Context Strip ── */}
        {(roadContext?.nearbyZones?.length > 0 || roadContext?.hasSpeedCamera || roadContext?.hasTollBooth || roadContext?.hasRailwayCrossing) && (
          <div style={{ width:"100%", display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
            {roadContext.nearbyZones?.map((z: string) => (
              <span key={z} style={{ fontSize:"0.7rem", fontWeight:700, padding:"0.25rem 0.625rem", borderRadius:"20px", background:"rgba(245, 158, 11, 0.1)", border:"1px solid rgba(245, 158, 11, 0.3)", color:"#fbbf24", textTransform:"uppercase", letterSpacing:"0.04em" }}>
                ⚠️ {z}
              </span>
            ))}
            {roadContext.hasSpeedCamera && (
              <span style={{ fontSize:"0.7rem", fontWeight:700, padding:"0.25rem 0.625rem", borderRadius:"20px", background:"rgba(239, 68, 68, 0.1)", border:"1px solid rgba(239, 68, 68, 0.3)", color:"#f87171", textTransform:"uppercase", letterSpacing:"0.04em" }}>
                📷 Speed Camera
              </span>
            )}
            {roadContext.hasTollBooth && (
              <span style={{ fontSize:"0.7rem", fontWeight:700, padding:"0.25rem 0.625rem", borderRadius:"20px", background:"rgba(99, 102, 241, 0.1)", border:"1px solid rgba(99, 102, 241, 0.3)", color:"#818cf8", textTransform:"uppercase", letterSpacing:"0.04em" }}>
                🛣️ Toll Ahead
              </span>
            )}
            {roadContext.hasRailwayCrossing && (
              <span style={{ fontSize:"0.7rem", fontWeight:700, padding:"0.25rem 0.625rem", borderRadius:"20px", background:"rgba(239, 68, 68, 0.1)", border:"1px solid rgba(239, 68, 68, 0.3)", color:"#f87171", textTransform:"uppercase", letterSpacing:"0.04em" }}>
                🚂 Railway Crossing
              </span>
            )}
          </div>
        )}

        <div style={{ 
          background: "rgba(255,255,255,0.03)", 
          backdropFilter: "blur(40px)", 
          borderRadius: "32px", 
          padding: "2.5rem 1.5rem", 
          border: isOverLimit ? "2px solid #ef4444" : "1px solid rgba(99, 102, 241, 0.3)",
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          gap: "0.5rem",
          boxShadow: "0 30px 60px rgba(0,0,0,0.3)"
        }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" }}>Current Speed</div>
          <div style={{ fontSize: "6rem", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.05em", color: isOverLimit ? "#ef4444" : "#ffffff", lineHeight: 1, textShadow: "0 0 30px rgba(255,255,255,0.1)" }}>{speed}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>km/h</span>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "20px", background: speedSource === "obd" ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.15)", border: `1px solid ${speedSource === "obd" ? "#10b981" : "#6366f1"}`, color: speedSource === "obd" ? "#10b981" : "#818cf8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {speedSource === "obd" ? "OBD-II" : "GPS"}
            </span>
          </div>        </div>

        {/* Speed Limit Card */}
        <div style={{ 
          background: "rgba(255,255,255,0.03)", 
          backdropFilter: "blur(40px)", 
          borderRadius: "24px", 
          padding: "1.25rem", 
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}>
          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" }}>Zone Limit</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#ffffff" }}>{limit}</span>
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>KM/H</span>
          </div>
        </div>

        {/* Score & Info Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          
          {/* Driving Score */}
          <div style={{ 
            background: "rgba(255,255,255,0.03)", 
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px", 
            padding: "1.25rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>Safety Score</div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>{drivingScore}</div>
            <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginTop: "0.5rem", overflow: "hidden" }}>
              <div style={{ width: `${drivingScore}%`, height: "100%", background: "#6366f1", boxShadow: "0 0 10px #6366f1" }}></div>
            </div>
          </div>

          {/* Trip Stats */}
          <div style={{ 
            background: "rgba(255,255,255,0.03)", 
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px", 
            padding: "1.25rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}>Trip Info</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>Duration</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ffffff" }}>{tripDurationMinutes}m</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>Weather</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ffffff" }}>{weather ? `${weather.temp}°C` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Robot and Law Status */}
        <div style={{ display: "flex", gap: "1rem", width: "100%", height: "180px" }}>
          
          {/* AI Companion */}
          <div style={{ 
            flex: 1, 
            background: "rgba(255,255,255,0.03)", 
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px", 
            padding: "0.75rem", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "space-between",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            position: "relative",
            overflow: "hidden",
          }}>
            <Robot3D state={aiCompanionState} size={140} />
          </div>

          {/* Law Status */}
          <div style={{ 
            flex: 1, 
            background: isOverLimit ? "rgba(239, 68, 68, 0.05)" : "rgba(255,255,255,0.03)", 
            backdropFilter: "blur(40px)",
            border: isOverLimit ? "2px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px", 
            padding: "1.25rem", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontSize: "0.75rem", color: isOverLimit ? "#ef4444" : "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "8px", height: "8px", background: isOverLimit ? "#ef4444" : "#10b981", borderRadius: "50%", boxShadow: `0 0 10px ${isOverLimit ? "#ef4444" : "#10b981"}` }}></div>
              Law Status
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", lineHeight: 1.3 }}>
              {isOverLimit ? "Speed Violation" : "Perfect Compliance"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginTop: "0.25rem" }}>
              {isOverLimit ? "Slow down immediately" : "Scanning zone..."}
            </div>
          </div>
        </div>

        {/* Cyberpunk Chat Interface */}
        <div 
          onClick={handleVoiceInput}
          style={{ 
            width: "100%", 
            background: "rgba(255,255,255,0.03)", 
            backdropFilter: "blur(40px)",
            borderRadius: "24px", 
            padding: "1.25rem", 
            cursor: "pointer",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
            minHeight: "100px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden"
          }}>
          <div style={{ fontSize: "0.95rem", lineHeight: 1.5, color: "#ffffff" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.1em", textTransform:"uppercase", fontSize:"0.65rem", fontFamily: "'Space Grotesk', sans-serif" }}>LexDrive AI // </span>
            {aiSpeechText}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", width: "100%" }}>
          {obdSupported && (
            <button
              onClick={obdStatus === "connected" ? disconnectOBD : connectOBD}
              disabled={obdStatus === "connecting"}
              style={{
                flex: 1,
                padding: "1.25rem",
                background: obdStatus === "connected" ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.15)",
                border: `1px solid ${obdStatus === "connected" ? "#10b981" : "#6366f1"}`,
                borderRadius: "980px",
                color: obdStatus === "connected" ? "#10b981" : "#818cf8",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: obdStatus === "connecting" ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: obdStatus === "connecting" ? 0.6 : 1,
              }}
            >
              {obdStatus === "connected" ? "🔌 OBD-II Live" : obdStatus === "connecting" ? "Connecting…" : "Connect OBD-II"}
            </button>
          )}
          <a href="/summary" style={{ flex: 1, padding: "1.25rem", background: "#ffffff", border: "none", borderRadius: "980px", color: "#0a0a0f", fontWeight: 700, textDecoration: "none", textAlign: "center", cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", transition: "all 0.2s ease" }}>
            End Trip
          </a>
        </div>

      </div>

      {/* Global Styles for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave-pulse {
          0% { height: 6px; }
          100% { height: 24px; }
        }
        @keyframes scan {
          0% { top: 0; opacity: 1; }
          50% { opacity: 0.5; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes live-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 96%, 100% { transform: scaleY(1); }
          98% { transform: scaleY(0.1); }
        }
        @keyframes speak-mouth {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1.5); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-5px); }
        }
        @keyframes head-bob {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-3deg); }
          100% { transform: translateY(0px) rotate(3deg); }
        }
        @keyframes scan-eyes {
          0%, 15% { transform: translateX(0); }
          25%, 35% { transform: translateX(-5px); }
          45%, 55% { transform: translateX(5px); }
          45%, 55% { transform: translateX(5px); }
          65%, 100% { transform: translateX(0); }
        }
        @keyframes ear-pulse {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(1.5); }
        }
      `}} />

    </main>
  );
}
