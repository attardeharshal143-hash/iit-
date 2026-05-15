"use client";
import { useEffect, useState, useRef } from "react";
import { useDriveContext } from "../../context/DriveContext";
import "../globals.css";
import Robot3D from "../../components/Robot3D";
import { carTranslations } from "../../lib/translations";
import { speak, createRecognition } from "../../lib/tts";

export default function DrivePhoneMode() {
  const { speed, limit, isCarMode, setIsCarMode, obdStatus, connectOBD, disconnectOBD, speedSource, obdSupported, appLanguage, askCoPilot, aiAlert, lastKnownLocation, riskAlert, drivingScore, roadContext, weather, tripDurationMinutes } = useDriveContext();
  const [aiCompanionState, setAiCompanionState] = useState<"idle" | "listening" | "speaking" | "alert">("idle");
  const [aiSpeechText, setAiSpeechText] = useState(`"Speed is good. Scanning local jurisdictions."`);
  const recognitionRef = useRef<any>(null);
  const [viewMode, setViewMode] = useState<"3d" | "map" | "dashcam">("3d");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dashcamActive, setDashcamActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ct = carTranslations[appLanguage] || carTranslations["en-IN"];

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOverLimit = speed > limit;

  // Activate drive context
  useEffect(() => {
    setIsCarMode(true);
    return () => setIsCarMode(false);
  }, [setIsCarMode]);

  // ── Speech Recognition — recreate on language change ──
  useEffect(() => {
    // Abort any active recognition before recreating
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    recognitionRef.current = createRecognition(appLanguage);
  }, [appLanguage]);

  // Listen to dynamic Llama 3.1 alerts from DriveContext
  useEffect(() => {
    if (aiAlert) {
      setAiCompanionState("alert");
      setAiSpeechText(`"${aiAlert}"`);
      // DriveContext already handles TTS via the shared speak() utility
    } else {
      setAiCompanionState("idle");
      const ct2 = carTranslations[appLanguage] || carTranslations["en-IN"];
      setAiSpeechText(isOverLimit
        ? `"${ct2.overspeedTitle}"`
        : `"Speed is good. No violations."`);
    }
  }, [aiAlert, isOverLimit, appLanguage]);

  const handleVoiceInput = () => {
    if (aiCompanionState === "listening" || aiCompanionState === "speaking") return;

    // If no recognition support, show error
    if (!recognitionRef.current) {
      setAiSpeechText(`"Speech recognition not supported in this browser."`);
      return;
    }

    const recognition = recognitionRef.current;

    recognition.onresult = async (e: any) => {
      // Use the last result (most confident)
      const result = e.results[e.results.length - 1];
      const transcript = result[0].transcript;
      setAiSpeechText(`"You: ${transcript}"`);

      if (result.isFinal) {
        setAiCompanionState("speaking");
        const reply = await askCoPilot(transcript);
        setAiSpeechText(`"${reply}"`);
        speak(reply, appLanguage, () => setAiCompanionState("idle"));
      }
    };

    recognition.onerror = (e: any) => {
      console.warn("Microphone error:", e.error);
      setAiCompanionState("alert");
      const msgs: Record<string, string> = {
        "not-allowed":     "Mic blocked! Allow microphone access in browser settings.",
        "audio-capture":   "No microphone detected. Check your hardware.",
        "network":         "Network error. Check your connection.",
        "no-speech":       "No speech detected. Please try again.",
        "aborted":         "",
        "service-not-allowed": "Speech service not allowed. Try Chrome or Edge.",
      };
      const msg = msgs[e.error] || `Microphone error (${e.error}). Please try again.`;
      if (msg) setAiSpeechText(`"${msg}"`);
      setTimeout(() => setAiCompanionState("idle"), 4000);
    };

    recognition.onend = () => {
      setAiCompanionState(prev => prev === "listening" ? "idle" : prev);
    };

    // Abort any previous session before starting a new one
    try { recognition.abort(); } catch {}
    setTimeout(() => {
      try {
        recognition.start();
        setAiCompanionState("listening");
        setAiSpeechText(`"${(carTranslations[appLanguage] || carTranslations["en-IN"]).listening}"`);
      } catch (err) {
        console.warn("Recognition start failed:", err);
        setAiCompanionState("idle");
      }
    }, 100);
  };

  // Dashcam Camera Setup
  useEffect(() => {
    if (viewMode === "dashcam" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
          setDashcamActive(true);
        })
        .catch(err => {
          console.error("Camera access denied:", err);
          setDashcamActive(false);
          setViewMode("3d");
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setDashcamActive(false);
    }
  }, [viewMode]);

  if (!mounted) return null;

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
      
      {/* Dynamic Background Modes */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
        {viewMode === "3d" && (
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 40%)" }}></div>
        )}
        
        {viewMode === "map" && lastKnownLocation && (
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            style={{ filter: "invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)", opacity: 0.6 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lastKnownLocation.lon - 0.02},${lastKnownLocation.lat - 0.02},${lastKnownLocation.lon + 0.02},${lastKnownLocation.lat + 0.02}&layer=mapnik&marker=${lastKnownLocation.lat},${lastKnownLocation.lon}`}
          ></iframe>
        )}

        {viewMode === "dashcam" && (
          <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
            {/* AI Bounding Box Overlay Simulation */}
            {dashcamActive && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
                <div style={{ position: "absolute", top: "20%", left: "30%", width: "100px", height: "100px", border: "2px solid #10b981", boxShadow: "0 0 15px #10b981", animation: "live-pulse 2s infinite" }}>
                  <span style={{ position: "absolute", top: "-25px", left: "-2px", background: "#10b981", color: "#000", fontSize: "0.7rem", fontWeight: 800, padding: "2px 6px" }}>SPEED LIMIT 50 99%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ width: "100%", maxWidth: "400px", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", zIndex: 10 }}>

        {/* Title */}
        <div style={{ textAlign: "center", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "0.1em", color: "#ffffff", textTransform: "uppercase", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>
          LexDrive <span style={{ color: "#818cf8", textShadow: "0 0 20px rgba(99, 102, 241, 0.5)" }}>{ct.terminal}</span>
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
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>{ct.currentSpeed}</div>
          <div style={{ fontSize: "6rem", fontWeight: 700, fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic", letterSpacing: "-0.05em", color: isOverLimit ? "#ef4444" : "#ffffff", lineHeight: 1, textShadow: "0 0 30px rgba(255,255,255,0.1)" }}>{speed}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>km/h</span>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "20px", background: speedSource === "obd" ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.15)", border: `1px solid ${speedSource === "obd" ? "#10b981" : "#6366f1"}`, color: speedSource === "obd" ? "#10b981" : "#818cf8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {speedSource === "obd" ? "OBD-II" : "GPS"}
            </span>
          </div>
        </div>

        {/* View Toggles */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "999px", padding: "4px" }}>
          <button onClick={() => setViewMode("3d")} style={{ flex: 1, padding: "0.5rem", borderRadius: "999px", border: "none", background: viewMode === "3d" ? "rgba(255,255,255,0.1)" : "transparent", color: viewMode === "3d" ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s ease", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>{ct.radar}</button>
          <button onClick={() => setViewMode("map")} style={{ flex: 1, padding: "0.5rem", borderRadius: "999px", border: "none", background: viewMode === "map" ? "rgba(255,255,255,0.1)" : "transparent", color: viewMode === "map" ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s ease", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>{ct.map}</button>
          <button onClick={() => setViewMode("dashcam")} style={{ flex: 1, padding: "0.5rem", borderRadius: "999px", border: "none", background: viewMode === "dashcam" ? "rgba(255,255,255,0.1)" : "transparent", color: viewMode === "dashcam" ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s ease", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>{ct.dashcam}</button>
        </div>

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
          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>{ct.limit}</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic", color: "#ffffff" }}>{limit}</span>
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
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>{ct.safetyScore}</div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#ffffff", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>{drivingScore}</div>
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
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>Trip Info</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>{ct.tripInfo ?? "Trip Info"}</span>
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
            <div style={{ fontSize: "0.75rem", color: isOverLimit ? "#ef4444" : "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "8px", height: "8px", background: isOverLimit ? "#ef4444" : "#10b981", borderRadius: "50%", boxShadow: `0 0 10px ${isOverLimit ? "#ef4444" : "#10b981"}` }}></div>
              Law {ct.violations?.split(" ")[0] ?? "Status"}
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", lineHeight: 1.3 }}>
              {isOverLimit ? ct.overspeedTitle : ct.noViolations}
            </div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginTop: "0.25rem" }}>
              {isOverLimit ? ct.overspeedDesc?.split(".")[0] : (ct.noViolationsDesc ?? "Scanning zone...")}
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
            <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.1em", textTransform:"uppercase", fontSize:"0.65rem", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>LexDrive AI // </span>
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
              {obdStatus === "connected" ? `🔌 ${ct.obdLive}` : obdStatus === "connecting" ? ct.connecting : ct.connectObd}
            </button>
          )}
          <a href="/summary" style={{ flex: 1, padding: "1.25rem", background: "#ffffff", border: "none", borderRadius: "980px", color: "#0a0a0f", fontWeight: 700, textDecoration: "none", textAlign: "center", cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", transition: "all 0.2s ease" }}>
            {ct.endTrip}
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
