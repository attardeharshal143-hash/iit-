/**
 * LexDrive TTS Utility
 * Robust text-to-speech with:
 * 1. Browser SpeechSynthesis (best quality, works offline)
 * 2. /api/tts proxy fallback (Google Translate TTS via server)
 * 3. Silent fallback (never throws)
 *
 * Handles:
 * - Voice loading race condition (voices not ready on first call)
 * - Language matching (exact → prefix → en fallback)
 * - Cancels any ongoing speech before speaking
 * - Works for all 8 supported languages
 */

export type TTSLang =
  | "en-IN" | "hi-IN" | "mr-IN" | "kn-IN"
  | "bn-IN" | "gu-IN" | "ta-IN" | "te-IN";

// Map BCP-47 lang codes to the best available voice lang patterns
const VOICE_LANG_PATTERNS: Record<string, string[]> = {
  "en": ["en-IN", "en-GB", "en-US", "en"],
  "hi": ["hi-IN", "hi"],
  "mr": ["mr-IN", "mr"],
  "kn": ["kn-IN", "kn"],
  "bn": ["bn-IN", "bn-BD", "bn"],
  "gu": ["gu-IN", "gu"],
  "ta": ["ta-IN", "ta-SG", "ta"],
  "te": ["te-IN", "te"],
};

function findBestVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const shortLang = lang.split("-")[0].toLowerCase();
  const patterns = VOICE_LANG_PATTERNS[shortLang] || [lang, shortLang];

  // 1. Exact match
  for (const p of patterns) {
    const v = voices.find(v => v.lang === p);
    if (v) return v;
  }
  // 2. Prefix match
  for (const p of patterns) {
    const v = voices.find(v => v.lang.startsWith(p.split("-")[0]));
    if (v) return v;
  }
  // 3. English fallback
  return voices.find(v => v.lang.startsWith("en")) || voices[0] || null;
}

function speakWithSynthesis(
  text: string,
  lang: string,
  rate = 0.92,
  onEnd?: () => void
): boolean {
  if (!("speechSynthesis" in window)) return false;

  // Cancel any ongoing speech
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }

  const voice = findBestVoice(lang);
  const u = new SpeechSynthesisUtterance(text.slice(0, 300));
  u.lang = lang;
  u.rate = rate;
  u.volume = 1;
  if (voice) u.voice = voice;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();

  window.speechSynthesis.speak(u);
  return true;
}

async function speakWithProxy(
  text: string,
  lang: string,
  onEnd?: () => void
): Promise<boolean> {
  try {
    const shortLang = lang.split("-")[0];
    const url = `/api/tts?text=${encodeURIComponent(text.slice(0, 200))}&lang=${shortLang}`;
    const audio = new Audio(url);
    audio.onended = () => onEnd?.();
    audio.onerror = () => onEnd?.();
    await audio.play();
    return true;
  } catch {
    onEnd?.();
    return false;
  }
}

/**
 * Main speak function — tries browser synthesis first, falls back to proxy.
 * Handles the voices-not-loaded race condition with a retry.
 */
export function speak(
  text: string,
  lang: string,
  onEnd?: () => void
): void {
  if (!text?.trim()) { onEnd?.(); return; }

  const trySpeak = () => {
    const voices = "speechSynthesis" in window ? window.speechSynthesis.getVoices() : [];

    if (voices.length > 0) {
      // Voices are loaded — use synthesis
      speakWithSynthesis(text, lang, 0.92, onEnd);
    } else {
      // Voices not loaded yet — wait for them, then retry once
      if ("speechSynthesis" in window) {
        const handler = () => {
          window.speechSynthesis.onvoiceschanged = null;
          const ok = speakWithSynthesis(text, lang, 0.92, onEnd);
          if (!ok) speakWithProxy(text, lang, onEnd);
        };
        window.speechSynthesis.onvoiceschanged = handler;
        // Safety timeout — if voices never load, use proxy
        setTimeout(() => {
          if (window.speechSynthesis.onvoiceschanged === handler) {
            window.speechSynthesis.onvoiceschanged = null;
            speakWithProxy(text, lang, onEnd);
          }
        }, 2000);
      } else {
        speakWithProxy(text, lang, onEnd);
      }
    }
  };

  trySpeak();
}

/** Stop any ongoing speech */
export function stopSpeech(): void {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Create a speech recognition instance for a given language.
 * Returns null if not supported.
 */
export function createRecognition(lang: string): any | null {
  const SR =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  if (!SR) return null;

  const r = new SR();
  r.lang = lang;
  r.continuous = false;
  r.interimResults = false;
  r.maxAlternatives = 1;
  return r;
}
