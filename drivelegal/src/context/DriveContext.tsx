"use client";
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import finesData from "../data/fines.json";
import { OBDManager, OBDStatus } from "../lib/obd";

interface DriveContextType {
  speed: number; limit: number; isCarMode: boolean; setIsCarMode: (val: boolean) => void;
  fines: typeof finesData; askCoPilot: (query: string) => Promise<string>;
  isChatOpen: boolean; setIsChatOpen: (val: boolean) => void; riskAlert: string;
  lastKnownLocation: { lat: number; lon: number } | null;
  drivingScore: number; maxSpeedReached: number; alertsTriggered: number;
  violationHistory: any[]; addViolation: (type: string, amount: number) => void;
  setViolationHistory: (val: any[]) => void; appLanguage: string; setAppLanguage: (val: string) => void;
  obdStatus: OBDStatus; speedSource: "obd" | "gps";
  connectOBD: () => Promise<void>; disconnectOBD: () => Promise<void>; obdSupported: boolean;
  aiAlert: string; roadContext: any;
  weather: { condition: string; temp: number; isRaining: boolean } | null;
  tripDurationMinutes: number;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);

export function DriveProvider({ children }: { children: ReactNode }) {
  const [speed, setSpeed] = useState(0);
  const [limit, setLimit] = useState(50);
  const [isCarMode, setIsCarMode] = useState(false);
  const [riskAlert, setRiskAlert] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lastKnownLocation, setLastKnownLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [appLanguage, setAppLanguage] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("LexDrive_language") || "en-IN";
    }
    return "en-IN";
  });
  const [obdStatus, setObdStatus] = useState<OBDStatus>("disconnected");
  const [speedSource, setSpeedSource] = useState<"obd" | "gps">("gps");
  const [obdSupported, setObdSupported] = useState(false);
  const obdRef = useRef<OBDManager | null>(null);
  const [drivingScore, setDrivingScore] = useState(100);
  const [maxSpeedReached, setMaxSpeedReached] = useState(0);
  const [alertsTriggered, setAlertsTriggered] = useState(0);
  const [violationHistory, setViolationHistory] = useState<any[]>([]);
  const [aiAlert, setAiAlert] = useState("");
  const [roadContext, setRoadContext] = useState<any>(null);
  const [weather, setWeather] = useState<{ condition: string; temp: number; isRaining: boolean } | null>(null);
  const [tripDurationMinutes, setTripDurationMinutes] = useState(0);

  // Refs
  const overspeedSecondsRef = useRef(0);
  const overspeedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAlertTriggerRef = useRef<string>("");
  const alertCooldownRef = useRef(false);
  const lastContextFetchRef = useRef(0);
  const lastWeatherFetchRef = useRef(0);
  const speedRef = useRef(0);
  const limitRef = useRef(50);
  const tripStartRef = useRef<number | null>(null);
  const tripTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aggressiveCountRef = useRef(0);
  const aggressiveWindowRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seatbeltReminderDoneRef = useRef(false);
  const fatigueAlertedRef = useRef<number>(0);
  const nearApproachAlertedRef = useRef(false);
  const touchWhileDrivingRef = useRef(false);
  // Stable refs for values consumed inside triggerProactiveAlert (fixes stale closures)
  const appLanguageRef = useRef(typeof window !== "undefined" ? (localStorage.getItem("LexDrive_language") || "en-IN") : "en-IN");
  const roadContextRef = useRef<any>(null);
  const weatherRef = useRef<{ condition: string; temp: number; isRaining: boolean } | null>(null);
  const tripDurationMinutesRef = useRef(0);

  useEffect(() => { setObdSupported(OBDManager.isSupported()); }, []);

  useEffect(() => {
    localStorage.setItem("LexDrive_language", appLanguage);
    
    if (typeof window !== 'undefined') {
      const shortCode = appLanguage.split("-")[0];
      // Set cookies for Google Translate
      document.cookie = `googtrans=/en/${shortCode}; path=/`;
      document.cookie = `googtrans=/en/${shortCode}; domain=${window.location.hostname}; path=/`;
      
      // Try to trigger the Google Translate widget with retries
      const applyGTrans = (attempts = 0) => {
        const gtSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (gtSelect) {
          gtSelect.value = shortCode;
          gtSelect.dispatchEvent(new Event('change'));
        } else if (attempts < 10) {
          // Widget not ready yet — retry after 300ms
          setTimeout(() => applyGTrans(attempts + 1), 300);
        }
      };
      applyGTrans();
    }
  }, [appLanguage]);

  useEffect(() => {
    const saved = localStorage.getItem("LexDrive_violations");
    if (saved) setViolationHistory(JSON.parse(saved));
  }, []);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { limitRef.current = limit; }, [limit]);
  useEffect(() => { appLanguageRef.current = appLanguage; }, [appLanguage]);
  useEffect(() => { roadContextRef.current = roadContext; }, [roadContext]);
  useEffect(() => { weatherRef.current = weather; }, [weather]);
  useEffect(() => { tripDurationMinutesRef.current = tripDurationMinutes; }, [tripDurationMinutes]);

  // ── Trip timer & Wake Lock ──
  useEffect(() => {
    let wakeLock: any = null;
    
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake Lock error:', err);
      }
    };

    if (isCarMode) {
      requestWakeLock();
      tripStartRef.current = Date.now();
      seatbeltReminderDoneRef.current = false;
      fatigueAlertedRef.current = 0;
      tripTimerRef.current = setInterval(() => {
        if (tripStartRef.current) {
          setTripDurationMinutes(Math.floor((Date.now() - tripStartRef.current) / 60000));
        }
      }, 60000);
    } else {
      if (tripTimerRef.current) clearInterval(tripTimerRef.current);
      tripStartRef.current = null;
      setTripDurationMinutes(0);
      if (wakeLock) {
        wakeLock.release().catch(console.error);
        wakeLock = null;
      }
    }
    return () => { 
      if (tripTimerRef.current) clearInterval(tripTimerRef.current); 
      if (wakeLock) wakeLock.release().catch(console.error);
    };
  }, [isCarMode]);

  // ── Phone touch detection while driving ──
  useEffect(() => {
    if (!isCarMode) return;
    const handleTouch = () => {
      if (speedRef.current > 20 && !touchWhileDrivingRef.current) {
        touchWhileDrivingRef.current = true;
        triggerProactiveAlert("phone_usage", speedRef.current, limitRef.current);
        setTimeout(() => { touchWhileDrivingRef.current = false; }, 30000);
      }
    };
    window.addEventListener("touchstart", handleTouch, { passive: true });
    return () => window.removeEventListener("touchstart", handleTouch);
  }, [isCarMode]);

  const addViolation = (type: string, amount: number) => {
    const newViolation = {
      id: `CHL-${Math.floor(10000 + Math.random() * 90000)}`,
      violation: type,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      amount,
      status: "UNPAID",
    };
    // BUG FIX: use functional update to avoid stale violationHistory closure
    setViolationHistory(prev => {
      const updated = [newViolation, ...prev];
      localStorage.setItem("LexDrive_violations", JSON.stringify(updated));
      return updated;
    });
  };

  const triggerProactiveAlert = async (
    trigger: string,
    currentSpeed: number,
    currentLimit: number,
    extra: Record<string, any> = {}
  ) => {
    if (alertCooldownRef.current) return;
    if (lastAlertTriggerRef.current === trigger && trigger !== "sustained_speed" && trigger !== "fatigue") return;
    alertCooldownRef.current = true;
    lastAlertTriggerRef.current = trigger;
    setTimeout(() => { alertCooldownRef.current = false; }, 8000);
    try {
      const hour = new Date().getHours();
      // BUG FIX: read from refs to avoid stale closure values
      const lang = appLanguageRef.current;
      const ctx = roadContextRef.current;
      const wx = weatherRef.current;
      const tripMins = tripDurationMinutesRef.current;
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger,
          speed: currentSpeed,
          limit: currentLimit,
          language: lang,
          roadContext: ctx,
          weather: wx,
          hour,
          tripDurationMinutes: tripMins,
          ...extra,
        }),
      });
      const data = await res.json();
      const reply = (data.reply || "").trim();
      if (!reply) return;
      setAiAlert(reply);
      setTimeout(() => setAiAlert(""), 7000);
      
      const shortLang = lang.split('-')[0];
      let played = false;

      if ("speechSynthesis" in window) {
        const speak = () => {
          if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();

          const voices = window.speechSynthesis.getVoices();
          const voice = voices.find(v => v.lang.startsWith(shortLang));
          
          if (voice || shortLang === "en") {
            const u = new SpeechSynthesisUtterance(reply);
            u.lang = lang; 
            u.rate = 0.9;
            if (voice) u.voice = voice;
            window.speechSynthesis.speak(u);
            played = true;
          } else {
            // Fallback to our internal Next.js proxy to avoid Google CORS & 403 errors
            const safeReply = reply.slice(0, 200);
            const ttsUrl = `/api/tts?text=${encodeURIComponent(safeReply)}&lang=${shortLang}`;
            const audio = new Audio(ttsUrl);
            audio.play().catch(() => { /* AutoPlay blocked by browser */ });
          }
        };

        if (window.speechSynthesis.getVoices().length > 0) {
          speak();
        } else {
          window.speechSynthesis.onvoiceschanged = () => speak();
        }
      }
    } catch (e) {
      console.warn("Proactive alert failed:", e);
    }
  };

  // ── Weather fetch (Open-Meteo, free, no key) ──
  const fetchWeather = async (lat: number, lon: number) => {
    const now = Date.now();
    if (now - lastWeatherFetchRef.current < 300_000) return; // every 5 min
    lastWeatherFetchRef.current = now;
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await res.json();
      const cw = data.current_weather;
      if (!cw) return;
      // WMO weather codes: 51-67 = rain/drizzle, 71-77 = snow, 80-82 = showers, 95-99 = thunderstorm
      const isRaining = [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(cw.weathercode);
      const isFog = [45,48].includes(cw.weathercode);
      const condition = isRaining ? "rain" : isFog ? "fog" : cw.weathercode >= 71 && cw.weathercode <= 77 ? "snow" : "clear";
      setWeather({ condition, temp: Math.round(cw.temperature), isRaining });
      if (isRaining || isFog) {
        triggerProactiveAlert("weather", speedRef.current, limitRef.current, { weatherCondition: condition });
      }
    } catch (e) {
      console.warn("Weather fetch failed:", e);
    }
  };

  const fetchRoadContext = async (lat: number, lon: number) => {
    const now = Date.now();
    if (now - lastContextFetchRef.current < 30_000) return;
    lastContextFetchRef.current = now;
    fetchWeather(lat, lon);
    try {
      const res = await fetch("/api/roadcontext", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });
      const ctx = await res.json();
      setRoadContext(ctx);
      if (ctx.nearbyZones?.includes("school zone")) {
        triggerProactiveAlert("zone_school", speedRef.current, limitRef.current);
      } else if (ctx.nearbyZones?.includes("hospital zone")) {
        triggerProactiveAlert("zone_hospital", speedRef.current, limitRef.current);
      } else if (ctx.nearbyZones?.includes("police station nearby")) {
        triggerProactiveAlert("zone_police", speedRef.current, limitRef.current);
      }
      if (ctx.hasSpeedCamera) triggerProactiveAlert("speed_camera", speedRef.current, limitRef.current);
      if (ctx.hasTollBooth) triggerProactiveAlert("toll_booth", speedRef.current, limitRef.current);
      if (ctx.hasRailwayCrossing) triggerProactiveAlert("railway_crossing", speedRef.current, limitRef.current);
    } catch (e) {
      console.warn("Road context fetch failed:", e);
    }
  };

  const handleSpeedUpdate = (newSpeed: number, lat?: number, lon?: number) => {
    if (lat && lon) {
      setLastKnownLocation({ lat, lon });
      fetchRoadContext(lat, lon);
    }

    // ── Seatbelt reminder on first movement ──
    if (!seatbeltReminderDoneRef.current && newSpeed > 5) {
      seatbeltReminderDoneRef.current = true;
      triggerProactiveAlert("seatbelt_reminder", newSpeed, limitRef.current);
    }

    setSpeed(prev => {
      const change = newSpeed - prev;
      if (newSpeed > maxSpeedReached) setMaxSpeedReached(Math.floor(newSpeed));

      // ── Pre-violation warning (within 5 km/h of limit) ──
      if (newSpeed > limitRef.current - 5 && newSpeed <= limitRef.current && !nearApproachAlertedRef.current) {
        nearApproachAlertedRef.current = true;
        triggerProactiveAlert("near_limit", Math.floor(newSpeed), limitRef.current);
        setTimeout(() => { nearApproachAlertedRef.current = false; }, 30000);
      }

      // ── Aggressive acceleration ──
      if (change > 6) {
        setRiskAlert("Aggressive acceleration detected!");
        setDrivingScore(s => Math.max(0, s - 5));
        setAlertsTriggered(a => a + 1);
        setTimeout(() => setRiskAlert(""), 4000);
        aggressiveCountRef.current += 1;
        if (!aggressiveWindowRef.current) {
          aggressiveWindowRef.current = setTimeout(() => {
            aggressiveCountRef.current = 0;
            aggressiveWindowRef.current = null;
          }, 600000); // 10 min window
        }
        if (aggressiveCountRef.current >= 3) {
          triggerProactiveAlert("repeated_aggressive", Math.floor(newSpeed), limitRef.current, {
            aggressiveCount: aggressiveCountRef.current,
          });
        } else {
          triggerProactiveAlert("aggressive", Math.floor(newSpeed), limitRef.current);
        }
      }

      // ── Just crossed speed limit ──
      if (newSpeed > limitRef.current && prev <= limitRef.current) {
        nearApproachAlertedRef.current = false;
        setDrivingScore(s => Math.max(0, s - 10));
        setAlertsTriggered(a => a + 1);
        addViolation("Overspeeding (Section 183 MVA)", 1000);
        triggerProactiveAlert("speeding", Math.floor(newSpeed), limitRef.current);
        if (!overspeedTimerRef.current) {
          overspeedSecondsRef.current = 0;
          overspeedTimerRef.current = setInterval(() => {
            overspeedSecondsRef.current += 5;
            const severity = overspeedSecondsRef.current >= 60 ? "critical" : overspeedSecondsRef.current >= 30 ? "high" : "medium";
            if (overspeedSecondsRef.current >= 10) {
              triggerProactiveAlert("sustained_speed", speedRef.current, limitRef.current, {
                overspeedSeconds: overspeedSecondsRef.current,
                severity,
              });
            }
          }, 5000);
        }
      }

      // ── Back within limit ──
      if (newSpeed <= limitRef.current && prev > limitRef.current) {
        if (overspeedTimerRef.current) {
          clearInterval(overspeedTimerRef.current);
          overspeedTimerRef.current = null;
          overspeedSecondsRef.current = 0;
        }
        lastAlertTriggerRef.current = "";
      }

      return Math.floor(newSpeed);
    });

    // ── Fatigue check (every 30 min after 2 hours) ──
    if (tripStartRef.current) {
      const mins = Math.floor((Date.now() - tripStartRef.current) / 60000);
      if (mins >= 120 && mins - fatigueAlertedRef.current >= 30) {
        fatigueAlertedRef.current = mins;
        triggerProactiveAlert("fatigue", newSpeed, limitRef.current, { tripDurationMinutes: mins });
      }
    }

    // ── Night driving check (10 PM – 5 AM) ──
    const hour = new Date().getHours();
    if ((hour >= 22 || hour < 5) && lastAlertTriggerRef.current !== "night_driving") {
      triggerProactiveAlert("night_driving", newSpeed, limitRef.current, { hour });
    }

    if (lat && lon && Math.random() > 0.8) {
      fetch("/api/speedlimit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.limit && data.limit !== limitRef.current) {
            setLimit(data.limit);
            triggerProactiveAlert("new_limit", speedRef.current, data.limit, { newLimit: data.limit });
          }
        })
        .catch(console.error);
    }

    // ── Weather Check (Every 5 minutes) ──
    if (lat && lon && Date.now() - lastWeatherFetchRef.current > 300000) {
      lastWeatherFetchRef.current = Date.now();
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then(r => r.json())
        .then(data => {
          if (data.current_weather) {
            const isRaining = data.current_weather.weathercode >= 51 && data.current_weather.weathercode <= 67;
            setWeather({
              condition: isRaining ? "Raining" : "Clear",
              temp: data.current_weather.temperature,
              isRaining: isRaining
            });
            if (isRaining && lastAlertTriggerRef.current !== "weather_rain") {
              triggerProactiveAlert("weather", newSpeed, limitRef.current, { weather: "raining" });
            }
          }
        })
        .catch(console.error);
    }
  };

  const connectOBD = async () => {
    if (!obdRef.current) obdRef.current = new OBDManager();
    const mgr = obdRef.current;
    mgr.onStatus(s => setObdStatus(s));
    mgr.onSpeed(({ speedKmh, source }) => {
      setSpeedSource(source);
      handleSpeedUpdate(speedKmh);
    });
    await mgr.connect();
  };

  const disconnectOBD = async () => {
    await obdRef.current?.disconnect();
    setSpeedSource("gps");
    setObdStatus("disconnected");
  };

  useEffect(() => {
    if (!isCarMode) return;
    let watchId: number;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          if (obdStatus !== "connected") {
            const raw = position.coords.speed;
            const kmh = raw != null ? raw * 3.6 : 0;
            setSpeedSource("gps");
            handleSpeedUpdate(kmh, lat, lon);
          } else {
            setLastKnownLocation({ lat, lon });
            if (Math.random() > 0.8) {
              fetch("/api/speedlimit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lat, lon }),
              })
                .then(r => r.json())
                .then(data => {
                  if (data.limit && data.limit !== limitRef.current) {
                    setLimit(data.limit);
                    triggerProactiveAlert("new_limit", speedRef.current, data.limit, { newLimit: data.limit });
                  }
                })
                .catch(console.error);
            }
          }
        },
        err => {
          if (err.code === err.TIMEOUT) {
            console.warn("GPS timeout - waiting for signal...");
          } else if (err.code === err.PERMISSION_DENIED) {
            console.warn("GPS permission denied by user.");
          } else {
            console.warn("GPS Error:", err.message);
          }
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [isCarMode, obdStatus]);

  const askCoPilot = async (query: string): Promise<string> => {
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, speed, limit, language: appLanguage, weather, hour: new Date().getHours() }),
      });
      const data = await res.json();
      return data.reply || "I could not process that request.";
    } catch {
      return "Network error connecting to the AI.";
    }
  };

  return (
    <DriveContext.Provider value={{
      speed, limit, isCarMode, setIsCarMode, fines: finesData, askCoPilot,
      riskAlert, lastKnownLocation, drivingScore, maxSpeedReached, alertsTriggered,
      isChatOpen, setIsChatOpen, violationHistory, addViolation, setViolationHistory,
      appLanguage, setAppLanguage, obdStatus, speedSource, connectOBD, disconnectOBD,
      obdSupported, aiAlert, roadContext, weather, tripDurationMinutes,
    }}>
      {children}
    </DriveContext.Provider>
  );
}

export function useDriveContext() {
  const context = useContext(DriveContext);
  if (!context) throw new Error("useDriveContext must be used within a DriveProvider");
  return context;
}
