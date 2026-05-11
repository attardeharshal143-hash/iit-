# LexDrive AI 🚗⚖️
### *AI-Powered Legal Co-Pilot & Road Safety Platform*

LexDrive AI bridges the gap between complex traffic laws and real-time driving behavior. It combines GPS-based speed monitoring, an AI legal assistant, a global fine database, and gamified safety tracking — all in a single PWA built for Indian roads with global coverage.

---

## Features

### AI Legal Co-Pilot (Groq Llama 3.1)
- Voice-activated Q&A about traffic laws, fines, and your rights
- Context-aware — knows your current speed, speed limit, and road zone
- Multilingual: English, Hindi, Marathi, Kannada
- Sub-second responses via Groq `llama-3.1-8b-instant`
- Rate limited to 60 requests/min per IP

### Proactive Drive Intelligence
The AI monitors your drive continuously and speaks alerts automatically — no driver input needed:

| Trigger | What the AI does |
|---|---|
| Speed limit crossed | Announces exact fine (Sec 183 MVA), urges slow down |
| Still over limit 10s / 30s / 60s | Escalates severity — medium → high → critical (license suspension risk) |
| Aggressive acceleration | Warns about reckless driving fine ₹1,000–₹5,000 (Sec 184 MVA) |
| 3+ aggressive events in 10 min | Pattern alert — "repeated reckless driving" with escalated fine |
| Approaching speed limit (within 5 km/h) | Soft pre-violation advisory before the offence happens |
| School zone detected | "School zone ahead — reduce to 25 km/h, children crossing" |
| Hospital zone detected | "Hospital zone — maintain silence, honking fine ₹1,000" |
| Police station nearby | Calm advisory about current speed vs limit |
| Speed camera ahead | Warns if over limit, confirms if safe |
| Speed limit changes | Announces new limit and whether driver is compliant |
| Seatbelt reminder (first movement) | One-time reminder at trip start — ₹1,000 fine (Sec 194B MVA) |
| Night driving (10 PM–5 AM) | Headlight rules, drunk driving check probability |
| Rain / fog / snow detected | Wet road warning, reduce speed 20 km/h, visibility fine |
| 2+ hours continuous driving | Fatigue warning every 30 min — Sec 184 MVA offence |
| Phone screen touched while driving | Mobile usage fine ₹1,000–₹5,000 (Sec 184 MVA) |
| Toll booth ahead | FASTag reminder — penalty is 2× toll amount |
| Railway crossing ahead | Mandatory stop — fine ₹500 + jail (Railways Act Sec 147) |

### Road Context Engine (OpenStreetMap)
- Queries OSM Overpass API every 30 seconds for nearby POIs within 300m
- Detects: schools, hospitals, police stations, fire stations, colleges, speed cameras, traffic signals, toll booths, railway crossings
- Road type detection: residential, primary, highway, service
- All context injected into AI system prompt for location-aware responses
- Free forever — no API key required

### Weather Intelligence (Open-Meteo)
- Fetches live weather every 5 minutes using GPS coordinates
- Free forever — no API key required (Open-Meteo public API)
- Detects: rain, fog, snow, thunderstorm using WMO weather codes
- AI warns about wet road stopping distances and visibility fines
- Live weather temperature shown in Car Display Mode header

### Real-Time Speed Limit Detection
- Primary: Ola Maps API for Indian road data (requires `OLA_MAPS_API_KEY`)
- Automatic fallback to OpenStreetMap Overpass API when Ola Maps fails, times out (4s), or key is missing
- OSM is free forever — no key needed — so speed limits always work even without Ola Maps
- Auto-updates speed limit as you drive into new zones
- Voice announcement on zone change

### Global Finebook
- 100+ violations across India, USA, UK, UAE, Australia, Germany
- Natural language filtering — type "above 5000" or "under 1000"
- Filter by country, state, and vehicle type
- Covers Indian Motor Vehicles Act (2019) sections and state compounding fees

### Dual HUD Modes
- **Car Display Mode** (`/car`): Dashboard-style 16:9 layout, large speedometer in km/h, live clock and weather, voice-only — designed for Android Auto / CarPlay
- **Phone Drive Mode** (`/drive`): Vertical high-contrast interface for dashboard mounting, real OBD-II speed integration, waveform voice UI, OBD-II connect button with live source indicator (OBD-II / GPS badge)

### OBD-II Real Speed (via Web Bluetooth)
- Connects to any ELM327 BLE OBD-II adapter over Web Bluetooth API
- Reads **PID `010D`** (Vehicle Speed) directly from the car's ECU at 500ms intervals
- **Priority system:** OBD speed takes over GPS when adapter is connected; GPS resumes automatically on disconnect
- GPS still runs in background for location-based speed limit lookups even when OBD is active
- Speed source badge on speedometer shows **OBD-II** (green) or **GPS** (purple) at all times
- Supported adapters: Vgate iCar Pro BLE, Veepeak OBDCheck BLE, OBDLINK CX, any ELM327 BLE dongle
- Browser requirement: Chrome on Android (Web Bluetooth not supported in Safari or Firefox)
- Falls back gracefully to GPS speed when no adapter is connected or browser is unsupported

### Gamified Safety Tracking
- Real-time driving score (0-100) with deductions for overspeeding and aggressive acceleration
- Badge system: Speed Saint, Safe Driver, Reckless Rookie
- Violation history with challan IDs, persisted in localStorage
- Post-drive summary at `/summary`

### Vehicle E-Challan Portal
- Look up pending challans by vehicle plate number
- Live owner lookup via Vahan (RTO) database — only attempted when `RAPIDAPI_KEY` is set
- Falls back gracefully to a Parivahan self-service link when key is not configured (no errors, no cost)
- Automated challan calculator by country, state, vehicle type, and violation

### 3D Robot Companion
- Three.js animated robot with state-based expressions
- Idle, Listening, Speaking, Alert modes with color-coded emotions
- Built with React Three Fiber and Drei

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 + React 19 |
| 3D Graphics | Three.js + React Three Fiber + Drei |
| AI | Groq Llama 3.1-8b-instant (free tier) |
| Speed — OBD-II | Web Bluetooth API + ELM327 BLE (PID 010D) |
| Speed — GPS | Browser Geolocation API (fallback) |
| Speed Limits | Ola Maps API → OpenStreetMap Overpass (free fallback) |
| Road Context | OpenStreetMap Overpass (zones, cameras, toll, railway) |
| Weather | Open-Meteo API (free, no key required) |
| Vehicle Lookup | RapidAPI Vahan (optional, paid) — skipped if key not set |
| Voice | Web Speech API (Recognition + Synthesis) |
| State | React Context API |
| Styling | Inter + Space Grotesk fonts, CSS custom properties |
| PWA | Service Worker + Web App Manifest |
| Language | TypeScript 5 |

---

## Running for Free

LexDrive AI is designed to run at **zero cost** by default. Here's the breakdown:

| API | Free? | Notes |
|---|---|---|
| Groq (AI Co-Pilot) | ✅ Free | 60 req/min, 14,400 req/day on free tier |
| OpenStreetMap Overpass | ✅ Free forever | Road zones, cameras, toll, railway — no key |
| Open-Meteo (Weather) | ✅ Free forever | Rain/fog/snow detection — no key |
| Ola Maps | ✅ Free tier | 1,000 req/day free — OSM takes over if it fails |
| RapidAPI Vahan | ⚠️ Optional paid | Skipped entirely if `RAPIDAPI_KEY` is not set |
| Vercel / Netlify hosting | ✅ Free hobby tier | Perfect for Next.js |

**Minimum setup to run for free — only one key needed:**

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get a free Groq key at [console.groq.com](https://console.groq.com). Everything else works without any key.

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd drivelegal
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Required — get free at console.groq.com
GROQ_API_KEY=your_groq_api_key_here

# Optional — free tier at olamaps.io (OSM is used as fallback if missing)
OLA_MAPS_API_KEY=your_ola_maps_key_here

# Optional — paid RapidAPI key for live Vahan RTO lookup
# If not set, the app falls back to a Parivahan self-service link at no cost
RAPIDAPI_KEY=your_rapidapi_key_here

# Reserved for future xAI integration
XAI_API_KEY=your_xai_key_here
```

| Variable | Required | Cost | Purpose |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Free | AI Co-Pilot responses (Llama 3.1) |
| `OLA_MAPS_API_KEY` | Optional | Free tier | Speed limit detection (OSM fallback if missing) |
| `RAPIDAPI_KEY` | Optional | Paid | Live vehicle owner lookup via Vahan RTO |
| `XAI_API_KEY` | Optional | — | Reserved for future xAI integration |

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Navigate the app

| Route | Description |
|---|---|
| `/` | Landing page, e-challan portal, feature overview |
| `/drive` | Phone driving mode with OBD-II connect button |
| `/car` | Car display simulator (Android Auto style) with live clock + weather |
| `/finebook` | Searchable global fine database |
| `/summary` | Post-drive summary, score, badges, challan calculator |

---

## Project Structure

```
drivelegal/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── copilot/       # Groq AI — chat + proactive alert engine
│   │   │   ├── roadcontext/   # OSM POI + zone detection (school, hospital, camera)
│   │   │   ├── speedlimit/    # Ola Maps + OSM speed limit
│   │   │   └── vahan/         # Vehicle RTO lookup
│   │   ├── car/               # Car display HUD — live clock, weather, km/h
│   │   ├── drive/             # Phone driving mode — OBD-II connect, GPS/OBD badge
│   │   ├── finebook/          # Global fine database
│   │   ├── summary/           # Post-drive summary
│   │   ├── layout.tsx         # Root layout + providers
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ErrorBoundary.tsx  # Global error boundary
│   │   ├── GlobalCoPilot.tsx  # Floating chat widget
│   │   ├── OnboardingFlow.tsx # 5-step onboarding wizard (real permission requests)
│   │   ├── Robot3D.tsx        # 3D robot wrapper (SSR-safe dynamic import)
│   │   └── RobotModel.tsx     # Three.js robot character
│   ├── context/
│   │   └── DriveContext.tsx   # Global state + proactive AI intelligence engine
│   ├── data/
│   │   └── fines.json         # 100+ violations, multi-country
│   └── lib/
│       ├── obd.ts             # ELM327 BLE OBD-II driver (Web Bluetooth)
│       └── rateLimit.ts       # Sliding-window rate limiter
└── public/
    ├── manifest.json          # PWA manifest (name: LexDrive AI)
    └── sw.js                  # Service Worker (network-first, offline fallback)
```

---

## OBD-II Setup Guide

### What you need
Any **ELM327 BLE** (Bluetooth Low Energy) OBD-II adapter. Recommended options:

| Adapter | Price (approx.) | Notes |
|---|---|---|
| Vgate iCar Pro BLE | ₹1,500–2,000 | Most reliable, widely tested |
| Veepeak OBDCheck BLE | ₹1,800–2,500 | Good iOS + Android support |
| OBDLINK CX | ₹3,500–4,500 | Premium, fastest polling |
| Generic ELM327 BLE | ₹500–1,000 | Works but quality varies |

> ⚠️ Do NOT buy Wi-Fi OBD adapters or classic Bluetooth (non-BLE) adapters — they are not compatible with Web Bluetooth.

### How to connect
1. Plug the OBD-II adapter into your car's OBD port (under the dashboard, driver's side)
2. Turn on the car ignition (engine on or accessory mode)
3. Open LexDrive in **Chrome on Android**
4. Go to `/drive` (Phone Drive Mode)
5. Tap **"Connect OBD-II"** — Chrome will show a BLE device picker
6. Select your adapter from the list
7. The speedometer badge switches from **GPS** (purple) to **OBD-II Live** (green)

### Speed source priority
```
OBD-II connected  →  Engine ECU speed (most accurate, updates every 500ms)
OBD-II not found  →  GPS speed via navigator.geolocation (fallback)
```

GPS location always runs in the background for speed limit zone detection regardless of OBD status.

### Browser compatibility

| Browser | OBD-II Support |
|---|---|
| Chrome on Android | ✅ Full support |
| Chrome on Desktop | ✅ Full support (Windows/Mac/Linux) |
| Samsung Internet | ⚠️ Partial |
| Safari (iOS/Mac) | ❌ Web Bluetooth not supported |
| Firefox | ❌ Web Bluetooth not supported |

---

## API Routes

### `POST /api/copilot`
AI legal Q&A and proactive alert engine powered by Groq Llama 3.1.

**Body (chat mode):** `{ message: string, speed: number, limit: number, language: string }`

**Body (alert mode):** `{ trigger: string, speed: number, limit: number, language: string, roadContext: object, weather?: object, hour?: number, tripDurationMinutes?: number, overspeedSeconds?: number, severity?: string, newLimit?: number, weatherCondition?: string, aggressiveCount?: number }`

**Trigger values:** `speeding` | `sustained_speed` | `aggressive` | `repeated_aggressive` | `near_limit` | `zone_school` | `zone_hospital` | `zone_police` | `speed_camera` | `new_limit` | `seatbelt_reminder` | `fatigue` | `night_driving` | `weather` | `phone_usage` | `toll_booth` | `railway_crossing`

**Response:** `{ reply: string }`

### `POST /api/roadcontext`
Queries OpenStreetMap for nearby road context (schools, hospitals, speed cameras, road type).

**Body:** `{ lat: number, lon: number }`

**Response:** `{ nearbyZones: string[], roadType: string, hasSpeedCamera: boolean, hasTrafficSignal: boolean, hasTollBooth: boolean, hasRailwayCrossing: boolean, nearestPOI: string | null }`

### `POST /api/speedlimit`
Fetch speed limit for GPS coordinates.

**Body:** `{ lat: number, lon: number }`

**Response:** `{ source: string, limit: number | null }`

### `POST /api/vahan`
Vehicle registration lookup via RTO database.

**Body:** `{ plateNumber: string }`

**Response:** `{ status: string, source: string, data: { ownerName, vehicleModel, fuelType, registrationDate, insuranceExpiry, pucStatus } }`

---

## Onboarding

The app includes a 5-step onboarding wizard on first launch:
1. Language selection (English, Hindi, Marathi, Kannada)
2. AI Co-Pilot introduction
3. Speed Advisor introduction
4. Finebook introduction
5. GPS and microphone permission request — triggers real browser permission dialogs

Onboarding state is persisted in localStorage under `LexDrive_onboarded`.

---

## Security & PWA

- Security headers on all routes: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- Service Worker cache headers configured for correct PWA scope
- Rate limiting on all API routes (sliding window, per IP)
- Graceful fallbacks on every external API — app never crashes if a service is unavailable

---

## Built by

| Name | Role |
|---|---|
| Harshal Attarde | AI Architect & Full Stack |
| Kushal Mahajan | Full-Stack Developer |
| Bharat Toke | Data Engineer |
| Himanshu Girase | ML Engineer |
