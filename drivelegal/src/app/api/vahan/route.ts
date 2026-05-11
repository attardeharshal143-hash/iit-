import { NextResponse } from 'next/server';
import https from 'https';
import { isRateLimited, getClientIp } from '../../../lib/rateLimit';

// Use Node.js native https module - more reliable than fetch() in Next.js API routes
function httpsPost(host: string, path: string, headers: Record<string, string>, body: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      path: path,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`HTTPS Status: ${res.statusCode}`);
        console.log(`HTTPS Body (first 500): ${data.substring(0, 500)}`);
        resolve(data);
      });
    });

    req.on('error', (e) => {
      console.error('HTTPS Request error:', e.message);
      reject(e);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.write(body);
    req.end();
  });
}

export async function POST(req: Request) {
  // 10 lookups per minute per IP
  if (isRateLimited(getClientIp(req), { limit: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  let plateNumber = '';

  try {
    const body = await req.json();
    plateNumber = (body.plateNumber || '').toUpperCase().replace(/\s+/g, '');
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!plateNumber) {
    return NextResponse.json({ error: "Plate number is required" }, { status: 400 });
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY;

  // --- LIVE API — only attempted when key is configured ---
  if (rapidApiKey) {
    try {
      const requestBody = JSON.stringify({ vehicle_number: plateNumber });
      const responseText = await httpsPost(
        'vehicle-rc-information-v2.p.rapidapi.com',
        '/',
        {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'vehicle-rc-information-v2.p.rapidapi.com',
          'x-rapidapi-key': rapidApiKey
        },
        requestBody
      );

      if (responseText && responseText.trim().startsWith('{')) {
        const v = JSON.parse(responseText);
        const ownerName = v?.owner_name;

        if (ownerName) {
          return NextResponse.json({
            status: "SUCCESS",
            source: "Live RTO Database (NIC-Verified)",
            data: {
              ownerName: ownerName,
              vehicleModel: `${v?.brand_name || ''} ${v?.brand_model || ''}`.trim() || "N/A",
              fuelType: v?.fuel_type || "N/A",
              registrationDate: v?.registration_date || "N/A",
              insuranceExpiry: v?.insurance_expiry || "VALID",
              pucStatus: v?.rc_status || "ACTIVE",
              address: v?.present_address || "",
              ownerCount: v?.owner_count || "1"
            }
          });
        }
      }
    } catch (e: any) {
      console.error("Live API Exception:", e.message);
    }
  } else {
    console.info("RAPIDAPI_KEY not set — skipping live vehicle lookup. Add key to .env.local to enable.");
  }

  // --- FREE FALLBACK — always returned when key is missing or live API fails ---
  return NextResponse.json({
    status: "SUCCESS",
    source: "Parivahan Self-Service",
    data: {
      ownerName: "Verify at parivahan.gov.in",
      vehicleModel: plateNumber,
      registrationDate: "N/A",
      fuelType: "N/A",
      insuranceExpiry: "N/A",
      pucStatus: "N/A",
      note: "Add RAPIDAPI_KEY to .env.local for live RTO data"
    }
  });
}
