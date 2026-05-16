import { NextResponse } from 'next/server';
import { isRateLimited, getClientIp } from '../../../lib/rateLimit';

const fetchOverpass = (query: string, timeoutMs = 7000) => {
  const body = new URLSearchParams({ data: query });
  return fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "Accept": "application/json",
      "User-Agent": "LexDriveAI/1.0",
    },
    body,
    signal: AbortSignal.timeout(timeoutMs),
  });
};

export async function POST(req: Request) {
  if (isRateLimited(getClientIp(req), { limit: 30, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  try {
    const { lat, lon } = await req.json();
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: "lat/lon required" }, { status: 400 });
    }

    const query = `
      [out:json][timeout:8];
      (
        node(around:300,${lat},${lon})[amenity~"school|hospital|police|fire_station|college|university|kindergarten"];
        node(around:200,${lat},${lon})[highway="speed_camera"];
        node(around:100,${lat},${lon})[highway="traffic_signals"];
        node(around:200,${lat},${lon})[barrier="toll_booth"];
        node(around:150,${lat},${lon})[railway="level_crossing"];
        way(around:50,${lat},${lon})[highway];
      );
      out tags 25;
    `;

    const osmRes = await fetchOverpass(query);

    type RoadCtx = {
      nearbyZones: string[]; roadType: string;
      hasSpeedCamera: boolean; hasTrafficSignal: boolean;
      hasTollBooth: boolean; hasRailwayCrossing: boolean;
      nearestPOI: string | null;
    };

    const empty: RoadCtx = {
      nearbyZones: [], roadType: "unknown",
      hasSpeedCamera: false, hasTrafficSignal: false,
      hasTollBooth: false, hasRailwayCrossing: false,
      nearestPOI: null,
    };

    if (!osmRes.ok) return NextResponse.json(empty);

    const osmData = await osmRes.json();
    const elements = osmData.elements || [];
    const ctx: RoadCtx = { ...empty };

    const zoneMap: Record<string, string> = {
      school: "school zone", hospital: "hospital zone",
      police: "police station nearby", fire_station: "fire station nearby",
      college: "college zone", university: "university zone",
      kindergarten: "school zone",
    };

    for (const el of elements) {
      const tags = el.tags || {};

      if (tags.amenity && zoneMap[tags.amenity]) {
        const zone = zoneMap[tags.amenity];
        if (!ctx.nearbyZones.includes(zone)) ctx.nearbyZones.push(zone);
        if (!ctx.nearestPOI && tags.name) ctx.nearestPOI = tags.name;
      }
      if (tags.highway === "speed_camera") ctx.hasSpeedCamera = true;
      if (tags.highway === "traffic_signals") ctx.hasTrafficSignal = true;
      if (tags.barrier === "toll_booth") ctx.hasTollBooth = true;
      if (tags.railway === "level_crossing") ctx.hasRailwayCrossing = true;
      if (el.type === "way" && tags.highway && ctx.roadType === "unknown") {
        ctx.roadType = tags.highway;
      }
    }

    return NextResponse.json(ctx);

  } catch (err: any) {
    console.error("Road context error:", err.message);
    return NextResponse.json({
      nearbyZones: [], roadType: "unknown",
      hasSpeedCamera: false, hasTrafficSignal: false,
      hasTollBooth: false, hasRailwayCrossing: false,
      nearestPOI: null,
    });
  }
}
