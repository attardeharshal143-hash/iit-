import { NextResponse } from 'next/server';
import { isRateLimited, getClientIp } from '../../../lib/rateLimit';

export async function POST(req: Request) {
  if (isRateLimited(getClientIp(req), { limit: 60, windowMs: 60_000 })) {
    return NextResponse.json({ reply: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const {
      message, trigger,
      speed = 0, limit = 50,
      language = "en-IN",
      roadContext = null,
      weather = null,
      hour = new Date().getHours(),
      tripDurationMinutes = 0,
      overspeedSeconds = 0,
      newLimit = null,
      weatherCondition = null,
      aggressiveCount = 0,
      severity = "medium",
    } = body;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ reply: "No API key configured." });

    const langMap: Record<string, string> = {
      "hi-IN": "Hindi (हिंदी)", "mr-IN": "Marathi (मराठी)",
      "kn-IN": "Kannada (ಕನ್ನಡ)", "en-IN": "English",
      "bn-IN": "Bengali (বাংলা)", "gu-IN": "Gujarati (ગુજરાતી)",
      "ta-IN": "Tamil (தமிழ்)", "te-IN": "Telugu (తెలుగు)",
    };
    const lang = langMap[language] || "English";

    // Road context summary
    let ctxSummary = "";
    if (roadContext) {
      const parts = [
        roadContext.nearbyZones?.length ? `Nearby zones: ${roadContext.nearbyZones.join(", ")}.` : "",
        roadContext.nearestPOI ? `Nearest POI: ${roadContext.nearestPOI}.` : "",
        roadContext.hasSpeedCamera ? "Speed camera ahead." : "",
        roadContext.hasTrafficSignal ? "Traffic signal ahead." : "",
        roadContext.hasTollBooth ? "Toll booth ahead." : "",
        roadContext.hasRailwayCrossing ? "Railway crossing ahead." : "",
        roadContext.roadType !== "unknown" ? `Road type: ${roadContext.roadType}.` : "",
      ].filter(Boolean);
      ctxSummary = parts.join(" ");
    }

    // Weather summary
    const weatherSummary = weather
      ? `Weather: ${weather.condition}, ${weather.temp}°C.${weather.isRaining ? " Road is wet." : ""}`
      : "";

    // Time context
    const isNight = hour >= 22 || hour < 5;
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
    const timeContext = isNight ? "Night driving (10 PM–5 AM)." : isRushHour ? "Rush hour traffic." : "";

    const overspeedBy = Math.max(0, speed - limit);
    const fine = overspeedBy > 40 ? "₹2,000–₹4,000" : overspeedBy > 20 ? "₹1,000–₹2,000" : "₹1,000";

    // Build user message from trigger
    let userMessage = message || "";
    if (trigger) {
      const triggers: Record<string, string> = {
        speeding:
          `Driver is going ${speed} km/h in a ${limit} km/h zone, over by ${overspeedBy} km/h. Fine: ${fine} under Sec 183 MVA. Tell them to slow down urgently.`,
        sustained_speed:
          `Driver has been over the limit for ${overspeedSeconds} seconds. ${speed} km/h in ${limit} zone. Severity: ${severity}. Fine risk: ${fine}. ${severity === "critical" ? "Warn about license suspension." : "Urge firmly to slow down."}`,
        aggressive:
          `Driver just accelerated aggressively. Speed: ${speed} km/h, limit: ${limit} km/h. Warn about reckless driving fine ₹1,000–₹5,000 under Sec 184 MVA.`,
        repeated_aggressive:
          `Driver has shown aggressive acceleration ${aggressiveCount} times in the last 10 minutes. Speed: ${speed} km/h. This is a pattern of reckless driving — Sec 184 MVA, fine up to ₹5,000.`,
        near_limit:
          `Driver is at ${speed} km/h, approaching the ${limit} km/h speed limit. Give a soft pre-violation advisory to ease off slightly.`,
        zone_school:
          `Driver approaching school zone at ${speed} km/h. Typical limit: 25 km/h. Warn to slow down for children's safety.`,
        zone_hospital:
          `Driver near hospital zone at ${speed} km/h. Warn to maintain silence and slow down. Honking fine: ₹1,000.`,
        zone_police:
          `Police station detected nearby. Driver at ${speed} km/h in ${limit} zone. Give calm advisory.`,
        speed_camera:
          `Speed camera ahead. Driver at ${speed} km/h, limit ${limit} km/h. ${speed > limit ? `Over by ${overspeedBy} km/h — fine ${fine}.` : "Within limit — maintain speed."}`,
        new_limit:
          `Speed limit just changed to ${newLimit} km/h. Driver currently at ${speed} km/h. ${speed > (newLimit || limit) ? "Now over the new limit." : "Within new limit."} Inform them clearly.`,
        seatbelt_reminder:
          `Driver just started moving. Remind them to fasten seatbelt. Fine: ₹1,000 under Sec 194B MVA. Keep it brief and friendly.`,
        fatigue:
          `Driver has been driving for ${tripDurationMinutes} minutes (${Math.floor(tripDurationMinutes / 60)} hours). Fatigue driving is an offence under Sec 184 MVA. Suggest taking a break.`,
        night_driving:
          `Night driving detected (${hour}:00). Remind driver about mandatory headlights, reduced visibility, and higher drunk driving check probability. Speed: ${speed} km/h.`,
        weather:
          `${weatherCondition === "rain" ? "Rain detected." : weatherCondition === "fog" ? "Fog detected." : "Bad weather detected."} Wet/low-visibility roads. Warn driver to reduce speed by 20 km/h and increase following distance. Fine for reckless driving in bad weather: ₹1,000–₹5,000.`,
        phone_usage:
          `Driver touched the screen while going ${speed} km/h. Warn about mobile phone while driving fine: ₹1,000–₹5,000 under Sec 184 MVA.`,
        toll_booth:
          `Toll booth detected ahead. Remind driver to have FASTag ready. Penalty for non-FASTag: double the toll amount.`,
        railway_crossing:
          `Railway level crossing ahead. Mandatory stop required. Fine for crossing closed gates: ₹500 + imprisonment under Railways Act Sec 147.`,
      };
      userMessage = triggers[trigger] || `Speed: ${speed} km/h, limit: ${limit} km/h. Give a safety advisory.`;
    }

    const systemPrompt = `You are LexDrive Co-Pilot, an intelligent AI voice assistant inside a car dashboard.

CURRENT STATE:
- Speed: ${speed} km/h | Limit: ${limit} km/h | Status: ${speed > limit ? `OVER by ${overspeedBy} km/h` : "Within limit"}
- Trip duration: ${tripDurationMinutes} minutes
${ctxSummary ? `- Road: ${ctxSummary}` : ""}
${weatherSummary ? `- ${weatherSummary}` : ""}
${timeContext ? `- Time: ${timeContext}` : ""}

LEGAL KNOWLEDGE (Indian MV Act 2019 + International):
- Overspeeding LMV: ₹1,000 first, ₹2,000 repeat (Sec 183)
- Overspeeding >40 km/h over: ₹2,000–₹4,000 + license suspension
- Reckless driving: ₹1,000–₹5,000 (Sec 184)
- No seatbelt: ₹1,000 (Sec 194B) | No helmet: ₹1,000 + 3-month suspension (Sec 194D)
- Drunk driving: ₹10,000 + 6 months jail (Sec 185)
- Mobile phone while driving: ₹1,000–₹5,000 (Sec 184)
- No license: ₹5,000 (Sec 3/181) | Juvenile driving: ₹25,000 (Sec 199A)
- School zone: 25 km/h | Hospital zone: no honking
- Fatigue driving: offence under Sec 184 | Night: mandatory headlights
- Toll non-FASTag: 2× toll | Railway crossing violation: ₹500 + jail (Railways Act 147)
- USA CA: 1–15 mph over = $238 | UK: up to £1,000 + 3–6 points | UAE: AED 600 for 20+ over

RULES:
1. Respond EXCLUSIVELY in ${lang}.
2. Maximum 2 short sentences — spoken aloud while driving.
3. Urgent when violation, calm when advisory.
4. Always state the exact fine amount for violations.
5. Never say "I" or "As an AI" — speak as a co-pilot.
6. Start with the most critical information first.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 80,
        temperature: 0.35,
      }),
    });

    const data = await response.json();
    if (data.error || !data.choices?.[0]) {
      return NextResponse.json({ reply: "Stay focused on the road and drive safely." });
    }
    return NextResponse.json({ reply: data.choices[0].message.content.trim() });

  } catch (err: any) {
    console.error("Co-Pilot error:", err);
    return NextResponse.json({ reply: "Stay focused on the road and drive safely." }, { status: 500 });
  }
}
