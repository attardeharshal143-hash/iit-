import { NextResponse } from "next/server";

/**
 * TTS Proxy — server-side fetch to avoid CORS/403 on client.
 * Tries multiple Google TTS endpoints in order.
 * Used as fallback when browser SpeechSynthesis has no voice for the language.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text")?.slice(0, 200);
  const lang = searchParams.get("lang");

  if (!text || !lang) {
    return new NextResponse("Missing text or lang params", { status: 400 });
  }

  const encoded = encodeURIComponent(text);

  // Try multiple endpoints — Google has several TTS surfaces
  const endpoints = [
    // Endpoint 1: translate_tts with tw-ob client (most reliable for Indian languages)
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encoded}`,
    // Endpoint 2: translate_tts with gtx client
    `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=${lang}&q=${encoded}`,
    // Endpoint 3: translate.googleapis.com
    `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${lang}&q=${encoded}`,
  ];

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "audio/mpeg, audio/*, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://translate.google.com/",
  };

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type") || "audio/mpeg";
        const buf = await res.arrayBuffer();
        if (buf.byteLength > 100) { // sanity check — real audio is > 100 bytes
          return new NextResponse(buf, {
            headers: {
              "Content-Type": contentType.includes("audio") ? contentType : "audio/mpeg",
              "Cache-Control": "public, max-age=86400",
            },
          });
        }
      }
    } catch {
      // Try next endpoint
    }
  }

  return new NextResponse("TTS unavailable", { status: 503 });
}
