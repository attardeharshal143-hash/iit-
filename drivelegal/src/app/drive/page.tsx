"use client";
import { useEffect, useState, useRef } from "react";
import { useDriveContext } from "../../context/DriveContext";
import "../globals.css";
import Robot3D from "../../components/Robot3D";
import { carTranslations } from "../../lib/translations";
import { speak, createRecognition } from "../../lib/tts";

const lightCard = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: "rgba(255,255,255,0.86)",
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  border: "1px solid rgba(14,165,233,0.18)",
  boxShadow: "0 18px 42px rgba(15,23,42,0.1)",
  ...extra,
});

const lightText = {
  strong: "#0f172a",
  body: "#1e293b",
  muted: "#475569",
  faint: "#64748b",
  accent: "#0284c7",
};

export default function DrivePhoneMode() {
  const { speed, limit, isCarMode, setIsCarMode, obdStatus, connectOBD, disconnectOBD, speedSource, obdSupported, gpsStatus, gpsError, requestGPS, appLanguage, askCoPilot, aiAlert, lastKnownLocation, currentLocationName, riskAlert, drivingScore, roadContext, weather, tripDurationMinutes, speedLimitSource, speedLimitStatus } = useDriveContext();
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
      minHeight: "100dvh",
      background: "#edf7fd", 
      color: lightText.strong, 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflowX: "hidden",
      overflowY: "auto"
    }}>
      
      {/* Dynamic Background Modes */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
        {viewMode === "3d" && (
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 18% 25%, rgba(14,165,233,0.2) 0%, transparent 42%), radial-gradient(circle at 82% 68%, rgba(59,130,246,0.14) 0%, transparent 45%), linear-gradient(180deg, #f8fbff 0%, #e8f5fb 100%)" }}></div>
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

        {viewMode === "map" && !lastKnownLocation && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", background:"radial-gradient(circle at center, rgba(99,102,241,0.18), transparent 60%)" }}>
            <div style={{ maxWidth:320, textAlign:"center", padding:"1.25rem", border:"1px solid rgba(14,165,233,0.22)", borderRadius:24, background:"rgba(255,255,255,0.88)", backdropFilter:"blur(20px)" }}>
              <div style={{ fontSize:"1.5rem", marginBottom:"0.5rem" }}>📍</div>
              <div style={{ fontSize:"0.95rem", fontWeight:800, color:lightText.strong, marginBottom:"0.35rem" }}>GPS required</div>
              <div style={{ fontSize:"0.78rem", color:lightText.muted, lineHeight:1.45, marginBottom:"0.9rem" }}>{gpsError || "Allow location access to show the live map."}</div>
              <button onClick={requestGPS} disabled={gpsStatus === "requesting"} style={{ padding:"0.6rem 1rem", borderRadius:"999px", border:"1px solid rgba(14,165,233,0.35)", background:"rgba(14,165,233,0.12)", color:lightText.accent, fontSize:"0.78rem", fontWeight:800, cursor:gpsStatus === "requesting" ? "wait" : "pointer" }}>
                {gpsStatus === "requesting" ? "Waiting for GPS" : "Enable GPS"}
              </button>
            </div>
          </div>
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

      {/* ── Main Content — no scroll ── */}
      <div style={{ width:"100%", maxWidth:"420px", minHeight:"100dvh", padding:"0.75rem 1rem 1.5rem", display:"flex", flexDirection:"column", gap:"0.5rem", zIndex:10, boxSizing:"border-box", position:"relative" }}>

        {/* Title Only */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", width: "100%", flexShrink:0 }}>
          <div style={{ fontSize:"1.1rem", fontWeight:800, letterSpacing:"0.12em", color:lightText.strong, textTransform:"uppercase", fontFamily:"'Latin Modern Roman',serif", fontStyle:"italic" }}>
            LexDrive <span style={{ color:lightText.accent }}>{ct.terminal}</span>
          </div>
        </div>

        {/* AI Alert — only when active */}
        {aiAlert && (
          <div style={{ flexShrink:0, background: isOverLimit ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.15)", border:`1px solid ${isOverLimit ? "#ef4444" : "#6366f1"}`, borderRadius:"12px", padding:"0.5rem 0.875rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <span style={{ fontSize:"1rem", flexShrink:0 }}>{isOverLimit ? "🚨" : "🤖"}</span>
            <p style={{ fontSize:"0.78rem", fontWeight:600, color:lightText.strong, lineHeight:1.35, margin:0 }}>{aiAlert}</p>
          </div>
        )}

        {(gpsStatus !== "active" || !lastKnownLocation) && (
          <div style={{ position:"absolute", top:"2.8rem", left:"1rem", right:"1rem", zIndex:30, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(18px)", border:"1px solid rgba(14,165,233,0.28)", borderRadius:"12px", padding:"0.55rem 0.75rem", display:"flex", alignItems:"center", gap:"0.65rem", boxShadow:"0 12px 34px rgba(15,23,42,0.12)" }}>
            <span style={{ fontSize:"1rem", flexShrink:0 }}>📍</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:"0.78rem", fontWeight:800, color:lightText.strong, lineHeight:1.25 }}>
                {gpsStatus === "requesting" ? "Turning on GPS..." : "Turn on GPS"}
              </div>
              <div style={{ fontSize:"0.68rem", color:lightText.muted, lineHeight:1.3, marginTop:"0.1rem" }}>
                {gpsError || "Allow location access to show live speed and local road rules."}
              </div>
            </div>
            <button
              onClick={requestGPS}
              disabled={gpsStatus === "requesting"}
              style={{ flexShrink:0, padding:"0.45rem 0.7rem", borderRadius:"999px", border:"1px solid rgba(14,165,233,0.35)", background:"rgba(14,165,233,0.12)", color:lightText.accent, fontSize:"0.72rem", fontWeight:800, cursor:gpsStatus === "requesting" ? "wait" : "pointer" }}
            >
              {gpsStatus === "requesting" ? "Waiting" : "Enable"}
            </button>
          </div>
        )}

        {gpsStatus === "active" && lastKnownLocation && (
          <div style={{ flexShrink:0, display:"flex", justifyContent:"center" }}>
            <span style={{ fontSize:"0.66rem", fontWeight:800, color:"#86efac", letterSpacing:"0.08em", textTransform:"uppercase", padding:"0.25rem 0.6rem", borderRadius:"999px", border:"1px solid rgba(34,197,94,0.35)", background:"rgba(34,197,94,0.1)" }}>
              GPS locked · {currentLocationName || `${lastKnownLocation.lat.toFixed(4)}, ${lastKnownLocation.lon.toFixed(4)}`}
            </span>
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
          background: "rgba(255,255,255,0.86)", 
          backdropFilter: "blur(40px)", 
          borderRadius: "24px", 
          padding: "1.25rem 1.5rem", 
          border: isOverLimit ? "2px solid #ef4444" : "1px solid rgba(99, 102, 241, 0.3)",
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          gap: "0.25rem",
          boxShadow: "0 18px 42px rgba(15,23,42,0.12)"
        }}>
          <div style={{ fontSize: "0.7rem", color: lightText.muted, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>{ct.currentSpeed}</div>
          <div style={{ fontSize: "4.5rem", fontWeight: 700, fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic", letterSpacing: "-0.05em", color: isOverLimit ? "#ef4444" : lightText.strong, lineHeight: 1 }}>{speed}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1rem", color: lightText.muted, fontWeight: 600 }}>km/h</span>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "20px", background: speedSource === "obd" ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.15)", border: `1px solid ${speedSource === "obd" ? "#10b981" : "#6366f1"}`, color: speedSource === "obd" ? "#10b981" : "#818cf8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {speedSource === "obd" ? "OBD-II" : "GPS"}
            </span>
          </div>
        </div>

        {/* View Toggles */}
        <div style={{ display: "flex", background: "rgba(14,165,233,0.08)", borderRadius: "999px", padding: "4px" }}>
          <button onClick={() => setViewMode("3d")} style={{ flex: 1, padding: "0.5rem", borderRadius: "999px", border: "none", background: viewMode === "3d" ? "#ffffff" : "transparent", color: viewMode === "3d" ? lightText.accent : lightText.faint, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s ease", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>{ct.radar}</button>
          <button onClick={() => setViewMode("map")} style={{ flex: 1, padding: "0.5rem", borderRadius: "999px", border: "none", background: viewMode === "map" ? "#ffffff" : "transparent", color: viewMode === "map" ? lightText.accent : lightText.faint, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s ease", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>{ct.map}</button>
          <button onClick={() => setViewMode("dashcam")} style={{ flex: 1, padding: "0.5rem", borderRadius: "999px", border: "none", background: viewMode === "dashcam" ? "#ffffff" : "transparent", color: viewMode === "dashcam" ? lightText.accent : lightText.faint, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s ease", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>{ct.dashcam}</button>
        </div>

        {/* Speed Limit Card */}
        <div style={{ 
          background: "rgba(255,255,255,0.86)", 
          backdropFilter: "blur(40px)", 
          borderRadius: "24px", 
          padding: "1.1rem 1.25rem", 
          border: "1px solid rgba(14,165,233,0.18)",
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          gap: "1rem",
          boxShadow: "0 12px 30px rgba(15,23,42,0.08)"
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.75rem", color: lightText.muted, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>{ct.limit}</div>
            <div style={{ marginTop: "0.25rem", fontSize: "0.62rem", color: speedLimitStatus === "live" ? "#059669" : speedLimitStatus === "detecting" ? lightText.accent : lightText.faint, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "11rem" }}>
              {speedLimitStatus === "detecting" ? "Detecting..." : speedLimitStatus === "live" ? speedLimitSource : speedLimitStatus === "error" ? "Backend error" : "Default"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic", color: lightText.strong }}>{limit}</span>
            <span style={{ fontSize: "0.75rem", color: lightText.muted, fontWeight: 600 }}>KM/H</span>
          </div>
        </div>

        {/* Score & Info Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          
          {/* Driving Score */}
          <div style={{ 
            background: "linear-gradient(180deg, rgba(224,242,254,0.92), rgba(255,255,255,0.9))", 
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(14,165,233,0.18)",
            borderRadius: "24px", 
            padding: "1.25rem",
            boxShadow: "0 18px 42px rgba(15,23,42,0.1)"
          }}>
            <div style={{ fontSize: "0.65rem", color: lightText.muted, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>{ct.safetyScore}</div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: lightText.strong, fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>{drivingScore}</div>
            <div style={{ width: "100%", height: "4px", background: "rgba(14,165,233,0.08)", borderRadius: "2px", marginTop: "0.5rem", overflow: "hidden" }}>
              <div style={{ width: `${drivingScore}%`, height: "100%", background: "#6366f1", boxShadow: "0 0 10px #6366f1" }}></div>
            </div>
          </div>

          {/* Trip Stats */}
          <div style={{ 
            background: "linear-gradient(180deg, rgba(224,242,254,0.92), rgba(255,255,255,0.9))", 
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(14,165,233,0.18)",
            borderRadius: "24px", 
            padding: "1.25rem",
            boxShadow: "0 18px 42px rgba(15,23,42,0.1)"
          }}>
            <div style={{ fontSize: "0.65rem", color: lightText.muted, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>Trip Info</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.8rem", color: lightText.muted }}>{ct.tripInfo ?? "Trip Info"}</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: lightText.strong }}>{tripDurationMinutes}m</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.8rem", color: lightText.muted }}>Weather</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: lightText.strong }}>{weather ? `${weather.temp}°C` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Robot and Law Status */}
        <div style={{ display: "flex", gap: "1rem", width: "100%", height: "180px" }}>
          
          {/* AI Companion */}
          <div style={{ 
            flex: 1, 
            background: "rgba(255,255,255,0.86)", 
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(14,165,233,0.18)",
            borderRadius: "24px", 
            padding: "0.75rem", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "space-between",
            boxShadow: "0 18px 42px rgba(15,23,42,0.1)",
            position: "relative",
            overflow: "hidden",
          }}>
            <Robot3D state={aiCompanionState} size={140} />
          </div>

          {/* Law Status */}
          <div style={{ 
            flex: 1, 
            background: isOverLimit ? "rgba(254,242,242,0.92)" : "rgba(255,255,255,0.86)", 
            backdropFilter: "blur(40px)",
            border: isOverLimit ? "2px solid #ef4444" : "1px solid rgba(14,165,233,0.18)",
            borderRadius: "24px", 
            padding: "1.25rem", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center",
            boxShadow: "0 18px 42px rgba(15,23,42,0.1)"
          }}>
            <div style={{ fontSize: "0.75rem", color: isOverLimit ? "#ef4444" : lightText.muted, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "8px", height: "8px", background: isOverLimit ? "#ef4444" : "#10b981", borderRadius: "50%", boxShadow: `0 0 10px ${isOverLimit ? "#ef4444" : "#10b981"}` }}></div>
              Law {ct.violations?.split(" ")[0] ?? "Status"}
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: lightText.strong, lineHeight: 1.3 }}>
              {isOverLimit ? ct.overspeedTitle : ct.noViolations}
            </div>
            <div style={{ fontSize: "0.8rem", color: lightText.muted, marginTop: "0.25rem" }}>
              {isOverLimit ? ct.overspeedDesc?.split(".")[0] : (ct.noViolationsDesc ?? "Scanning zone...")}
            </div>
          </div>
        </div>

        {/* Cyberpunk Chat Interface */}
        <div 
          onClick={handleVoiceInput}
          style={{ 
            width: "100%", 
            background: "rgba(255,255,255,0.86)", 
            backdropFilter: "blur(40px)",
            borderRadius: "24px", 
            padding: "1.25rem", 
            cursor: "pointer",
            border: "1px solid rgba(14,165,233,0.18)",
            boxShadow: "0 18px 42px rgba(15,23,42,0.1)",
            transition: "all 0.3s ease",
            minHeight: "100px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden"
          }}>
          <div style={{ fontSize: "0.95rem", lineHeight: 1.5, color: lightText.strong }}>
            <span style={{ color: lightText.muted, fontWeight: 800, letterSpacing: "0.1em", textTransform:"uppercase", fontSize:"0.65rem", fontFamily: "'Latin Modern Roman', serif", fontStyle: "italic" }}>LexDrive AI // </span>
            {aiSpeechText}
          </div>
          <div style={{ marginTop: "0.75rem", alignSelf: "flex-end", color: lightText.body, fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {aiCompanionState === "listening" ? ct.listening : "Tap to Speak"}
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
          <a href="/summary" style={{ flex: 1, padding: "1.25rem", background: "#0284c7", border: "none", borderRadius: "980px", color: "#ffffff", fontWeight: 700, textDecoration: "none", textAlign: "center", cursor: "pointer", boxShadow: "0 12px 28px rgba(2,132,199,0.24)", transition: "all 0.2s ease" }}>
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
