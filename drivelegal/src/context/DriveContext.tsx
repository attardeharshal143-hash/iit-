"use client";
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import finesData from "../data/fines.json";
import { OBDManager, OBDStatus } from "../lib/obd";
import { speak } from "../lib/tts";

interface DriveContextType {
  speed: number; limit: number; isCarMode: boolean; setIsCarMode: (val: boolean) => void;
  speedLimitSource: string; speedLimitStatus: "idle" | "detecting" | "live" | "default" | "error";
  fines: typeof finesData; askCoPilot: (query: string) => Promise<string>;
  isChatOpen: boolean; setIsChatOpen: (val: boolean) => void; riskAlert: string;
  lastKnownLocation: { lat: number; lon: number } | null;
  currentLocationName: string;
  drivingScore: number; maxSpeedReached: number; alertsTriggered: number;
  violationHistory: any[]; addViolation: (type: string, amount: number) => void;
  setViolationHistory: (val: any[]) => void; appLanguage: string; setAppLanguage: (val: string) => void;
  obdStatus: OBDStatus; speedSource: "obd" | "gps";
  connectOBD: () => Promise<void>; disconnectOBD: () => Promise<void>; obdSupported: boolean;
  gpsStatus: "idle" | "requesting" | "active" | "denied" | "unavailable" | "timeout";
  gpsError: string;
  requestGPS: () => void;
  aiAlert: string; roadContext: any;
  weather: { condition: string; temp: number; isRaining: boolean } | null;
  tripDurationMinutes: number;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);

export function DriveProvider({ children }: { children: ReactNode }) {
  const [speed, setSpeed] = useState(0);
  const [limit, setLimit] = useState(50);
  const [speedLimitSource, setSpeedLimitSource] = useState("Default");
  const [speedLimitStatus, setSpeedLimitStatus] = useState<"idle" | "detecting" | "live" | "default" | "error">("idle");
  const [isCarMode, setIsCarMode] = useState(false);
  const [riskAlert, setRiskAlert] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lastKnownLocation, setLastKnownLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState("");
  const [appLanguage, setAppLanguage] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("LexDrive_language") || "en-IN";
    }
    return "en-IN";
  });
  const [obdStatus, setObdStatus] = useState<OBDStatus>("disconnected");
  const [speedSource, setSpeedSource] = useState<"obd" | "gps">("gps");
  const [obdSupported, setObdSupported] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "requesting" | "active" | "denied" | "unavailable" | "timeout">("idle");
  const [gpsError, setGpsError] = useState("");
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
  const lastSpeedLimitFetchRef = useRef(0);
  const lastReverseGeocodeFetchRef = useRef(0);
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
  const lastKnownLocationRef = useRef<{ lat: number; lon: number } | null>(null);
  const gpsStatusRef = useRef<"idle" | "requesting" | "active" | "denied" | "unavailable" | "timeout">("idle");
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
  useEffect(() => { lastKnownLocationRef.current = lastKnownLocation; }, [lastKnownLocation]);
  useEffect(() => { gpsStatusRef.current = gpsStatus; }, [gpsStatus]);
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
      const location = lastKnownLocationRef.current;
      const gps = gpsStatusRef.current;
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
          location,
          gpsStatus: gps,
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

      // Use the shared TTS utility — handles voice loading, language matching, and fallback
      speak(reply, lang);
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

  const fetchSpeedLimit = async (lat: number, lon: number) => {
    const now = Date.now();
    if (now - lastSpeedLimitFetchRef.current < 15_000) return;
    lastSpeedLimitFetchRef.current = now;
    setSpeedLimitStatus("detecting");

    try {
      const res = await fetch("/api/speedlimit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });
      const data = await res.json();
      const source = typeof data.source === "string" && data.source ? data.source : "Unknown";
      const parsedLimit = typeof data.limit === "number" ? data.limit : parseInt(String(data.limit), 10);

      setSpeedLimitSource(source);
      if (!res.ok) {
        setSpeedLimitStatus("error");
        return;
      }

      if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
        const nextLimit = Math.round(parsedLimit);
        setSpeedLimitStatus("live");
        if (nextLimit !== limitRef.current) {
          limitRef.current = nextLimit;
          setLimit(nextLimit);
          triggerProactiveAlert("new_limit", speedRef.current, nextLimit, { newLimit: nextLimit });
        }
      } else {
        setSpeedLimitStatus("default");
      }
    } catch (e) {
      setSpeedLimitStatus("error");
      console.warn("Speed limit fetch failed:", e);
    }
  };

  const fetchLocationName = async (lat: number, lon: number) => {
    const now = Date.now();
    if (now - lastReverseGeocodeFetchRef.current < 60_000) return;
    lastReverseGeocodeFetchRef.current = now;

    try {
      const url = new URL("https://nominatim.openstreetmap.org/reverse");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("lat", String(lat));
      url.searchParams.set("lon", String(lon));
      url.searchParams.set("zoom", "16");
      url.searchParams.set("addressdetails", "1");
      const res = await fetch(url, { headers: { "User-Agent": "LexDriveAI/1.0" } });
      if (!res.ok) return;
      const data = await res.json();
      const address = data.address || {};
      const parts = [
        data.name,
        address.road,
        address.suburb || address.neighbourhood || address.city_district,
        address.city || address.town || address.village,
        address.state,
      ].filter(Boolean);
      const label = Array.from(new Set(parts)).join(", ") || data.display_name || "";
      if (label) setCurrentLocationName(label);
    } catch (e) {
      console.warn("Reverse geocode failed:", e);
    }
  };

  const handleSpeedUpdate = (newSpeed: number, lat?: number, lon?: number) => {
    if (lat && lon) {
      setLastKnownLocation({ lat, lon });
      fetchRoadContext(lat, lon);
      fetchSpeedLimit(lat, lon);
      fetchLocationName(lat, lon);
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

  const handleGpsError = (err: GeolocationPositionError) => {
    if (err.code === err.TIMEOUT) {
      setGpsStatus("timeout");
      setGpsError("GPS signal is taking too long. Move near a window or outdoors, then try again.");
      console.warn("GPS timeout - waiting for signal...");
    } else if (err.code === err.PERMISSION_DENIED) {
      setGpsStatus("denied");
      setGpsError("Location access is blocked. Enable location permission for this site in your browser.");
      console.warn("GPS permission denied by user.");
    } else {
      setGpsStatus("unavailable");
      setGpsError(err.message || "GPS is unavailable on this device or browser.");
      console.warn("GPS Error:", err.message);
    }
  };

  const requestGPS = () => {
    if (!("geolocation" in navigator)) {
      setGpsStatus("unavailable");
      setGpsError("GPS is not supported in this browser.");
      return;
    }

    setGpsStatus("requesting");
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const kmh = position.coords.speed != null ? position.coords.speed * 3.6 : speedRef.current;
        setGpsStatus("active");
        setGpsError("");
        setSpeedSource("gps");
        handleSpeedUpdate(kmh, lat, lon);
      },
      handleGpsError,
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  };

  useEffect(() => {
    if (!isCarMode) return;
    let watchId: number;
    if ("geolocation" in navigator) {
      setGpsStatus("requesting");
      setGpsError("");
      watchId = navigator.geolocation.watchPosition(
        position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setGpsStatus("active");
          setGpsError("");
          if (obdStatus !== "connected") {
            const raw = position.coords.speed;
            const kmh = raw != null ? raw * 3.6 : 0;
            setSpeedSource("gps");
            handleSpeedUpdate(kmh, lat, lon);
          } else {
            setLastKnownLocation({ lat, lon });
            fetchRoadContext(lat, lon);
            fetchSpeedLimit(lat, lon);
          }
        },
        handleGpsError,
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
    } else {
      setGpsStatus("unavailable");
      setGpsError("GPS is not supported in this browser.");
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [isCarMode, obdStatus]);

  const askCoPilot = async (query: string): Promise<string> => {
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          speed,
          limit,
          language: appLanguage,
          weather,
          roadContext,
          location: lastKnownLocation,
          gpsStatus,
          hour: new Date().getHours(),
        }),
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
      speedLimitSource, speedLimitStatus,
      riskAlert, lastKnownLocation, currentLocationName, drivingScore, maxSpeedReached, alertsTriggered,
      isChatOpen, setIsChatOpen, violationHistory, addViolation, setViolationHistory,
      appLanguage, setAppLanguage, obdStatus, speedSource, connectOBD, disconnectOBD,
      obdSupported, gpsStatus, gpsError, requestGPS, aiAlert, roadContext, weather, tripDurationMinutes,
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
