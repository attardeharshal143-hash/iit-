import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  const lang = searchParams.get("lang");

  if (!text || !lang) {
    return new NextResponse("Missing text or lang params", { status: 400 });
  }

  // Use the standard Google Translate TTS endpoint, which has robust regional language support
  // client=tw-ob is required for this endpoint to return audio without blocking.
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text.slice(0, 200))}`;

  try {
    const response = await fetch(url, {
      headers: {
        // Disguise as a standard browser to prevent 403 Forbidden blocks
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
      }
    });

    if (!response.ok) {
      throw new Error(`Google TTS failed with status ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch (error) {
    console.error("TTS Proxy Error:", error);
    return new NextResponse("Failed to fetch audio stream", { status: 500 });
  }
}
