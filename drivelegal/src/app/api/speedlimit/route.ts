import { NextResponse } from 'next/server';
import { isRateLimited, getClientIp } from '../../../lib/rateLimit';

export async function POST(req: Request) {
  // 60 requests per minute per IP (called frequently during driving)
  if (isRateLimited(getClientIp(req), { limit: 60, windowMs: 60_000 })) {
    return NextResponse.json({ source: "RateLimit", limit: null }, { status: 429 });
  }

  try {
    const { lat, lon } = await req.json();
    const olaKey = process.env.OLA_MAPS_API_KEY;

    // 1. Attempt to use Ola Maps API if key exists
    if (olaKey) {
      try {
        const olaEndpoint = `https://api.olamaps.io/routing/v1/speed-limits?lat=${lat}&lng=${lon}&api_key=${olaKey}`;
        const olaRes = await fetch(olaEndpoint, {
          method: "GET",
          headers: { "Accept": "application/json" },
          signal: AbortSignal.timeout(4000) // 4s timeout — fail fast to OSM
        });

        if (olaRes.ok) {
          const olaData = await olaRes.json();
          const limit = olaData.speedLimit || olaData.limit || olaData.maxspeed;
          if (limit) {
            return NextResponse.json({ source: "Ola Maps", limit: parseInt(limit) });
          }
        }
      } catch (err) {
        console.warn("Ola Maps failed, falling back to OSM Overpass.", err);
      }
    }

    // 2. Fallback to OpenStreetMap (Overpass API) to ensure the hackathon demo never fails
    const query = `[out:json];way(around:50,${lat},${lon})["maxspeed"];out tags;`;
    const osmEndpoint = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    
    const osmRes = await fetch(osmEndpoint);
    if (osmRes.ok) {
      const text = await osmRes.text();
      try {
        const osmData = JSON.parse(text);
        if (osmData.elements && osmData.elements.length > 0 && osmData.elements[0].tags.maxspeed) {
          const fetchedLimit = parseInt(osmData.elements[0].tags.maxspeed);
          if (!isNaN(fetchedLimit)) {
            return NextResponse.json({ source: "OpenStreetMap", limit: fetchedLimit });
          }
        }
      } catch (e) {
        console.warn("Overpass API returned invalid JSON", text.substring(0, 50));
      }
    } else {
      console.warn("Overpass API returned status", osmRes.status);
    }

    // Default return if no data found
    return NextResponse.json({ source: "Default", limit: null });

  } catch (error: any) {
    console.error("Speed Limit API Error:", error);
    return NextResponse.json({ error: "Failed to fetch speed limit" }, { status: 500 });
  }
}
