// Web Speech API wrapper with locale-aware voice selection and a fallback chain.
// All functions are no-ops on the server / when the API is missing.

import type { Locale } from "@/lib/locales"

export type SpeakOptions = {
  rate?: number
  pitch?: number
  onStart?: () => void
  onEnd?: () => void
  onCancel?: () => void
  onError?: () => void
}

// BCP-47 prefixes the browser uses for voice tagging.
const LOCALE_BCP47: Record<Locale, string> = {
  en: "en",
  fr: "fr",
  hi: "hi",
  pa: "pa",
  ur: "ur",
  ar: "ar",
  tl: "tl", // also "fil" on some platforms
  zh: "zh",
  es: "es",
}

// When the system has no voice for a locale, fall back to a linguistically
// adjacent one. NOTE: never fall back across script boundaries — an English
// voice mangling Arabic/Urdu/Hindi text reads literal punctuation aloud
// ("slash slash"), which is worse than silence. Same for pa→en.
// If no native voice exists for these locales, the toggle correctly shows
// "voice not available for this language on this device."
const FALLBACK: Record<Locale, Locale[]> = {
  en: [],
  fr: ["en"],
  hi: [],         // Devanagari — no en fallback
  pa: ["hi"],     // Gurmukhi → Devanagari is a stretch but linguistically close;
                  //   if neither exists, mark unavailable
  ur: ["ar"],     // Both use Arabic script; if neither exists, unavailable
  ar: [],         // Arabic script — no en fallback
  tl: ["en"],     // Latin script, English fallback OK
  zh: [],         // Hanzi — no en fallback
  es: ["en"],     // Latin script, English fallback OK (degraded but readable)
}

function hasSpeech(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

function listVoices(): SpeechSynthesisVoice[] {
  if (!hasSpeech()) return []
  return window.speechSynthesis.getVoices() ?? []
}

/**
 * Subscribe to the moment voices become available. Chrome populates the list
 * asynchronously; Safari/Firefox have it sync. Returns an unsubscribe.
 */
export function onVoicesReady(cb: () => void): () => void {
  if (!hasSpeech()) return () => {}
  const synth = window.speechSynthesis
  // If voices are already there, fire once on the next tick.
  if (synth.getVoices().length > 0) {
    const id = window.setTimeout(cb, 0)
    return () => window.clearTimeout(id)
  }
  const handler = () => {
    if (synth.getVoices().length > 0) cb()
  }
  synth.addEventListener("voiceschanged", handler)
  return () => synth.removeEventListener("voiceschanged", handler)
}

/**
 * Best voice match for a locale or any of its fallbacks. Returns null if
 * nothing in the system can speak any of them.
 */
export function getVoiceFor(locale: Locale): SpeechSynthesisVoice | null {
  const voices = listVoices()
  if (voices.length === 0) return null
  const candidates: Locale[] = [locale, ...FALLBACK[locale]]
  for (const cand of candidates) {
    const tag = LOCALE_BCP47[cand]
    // Prefer exact (e.g. "hi-IN" starts with "hi"); also allow alt tag for tl.
    const v = voices.find((vv) => {
      const vl = vv.lang.toLowerCase()
      if (vl.startsWith(tag.toLowerCase())) return true
      if (cand === "tl" && (vl.startsWith("fil") || vl.startsWith("tl"))) return true
      return false
    })
    if (v) return v
  }
  return null
}

export function isLocaleSupported(locale: Locale): boolean {
  return getVoiceFor(locale) != null
}

export function cancel() {
  if (!hasSpeech()) return
  try { window.speechSynthesis.cancel() } catch { /* ignore */ }
}

/** Speak a single string in the given locale. */
export function speak(text: string, locale: Locale, opts?: SpeakOptions) {
  if (!hasSpeech()) return
  const trimmed = text?.trim()
  if (!trimmed) return
  const u = new SpeechSynthesisUtterance(trimmed)
  const voice = getVoiceFor(locale)
  if (voice) {
    u.voice = voice
    u.lang = voice.lang
  } else {
    // No voice — set lang anyway so the engine can try a default voice.
    u.lang = LOCALE_BCP47[locale]
  }
  u.rate = opts?.rate ?? 1
  u.pitch = opts?.pitch ?? 1
  if (opts?.onStart) u.onstart = () => opts.onStart?.()
  if (opts?.onEnd) u.onend = () => opts.onEnd?.()
  if (opts?.onError) u.onerror = () => opts.onError?.()
  // Chrome quirk: cancel() before speak() guarantees the new utterance plays.
  try {
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}

/**
 * Speak a sequence of strings back-to-back in the given locale. Each string
 * gets a tiny pause between for breathing room.
 */
export function speakSequence(parts: string[], locale: Locale, opts?: SpeakOptions) {
  if (!hasSpeech()) return
  const cleaned = parts.map((p) => p?.trim()).filter((p): p is string => !!p)
  if (cleaned.length === 0) return
  cancel()
  const voice = getVoiceFor(locale)
  let cancelled = false
  let idx = 0
  const speakNext = () => {
    if (cancelled) return
    if (idx >= cleaned.length) {
      opts?.onEnd?.()
      return
    }
    const u = new SpeechSynthesisUtterance(cleaned[idx])
    if (voice) {
      u.voice = voice
      u.lang = voice.lang
    } else {
      u.lang = LOCALE_BCP47[locale]
    }
    u.rate = opts?.rate ?? 1
    u.pitch = opts?.pitch ?? 1
    if (idx === 0) u.onstart = () => opts?.onStart?.()
    u.onend = () => {
      idx += 1
      speakNext()
    }
    u.onerror = () => {
      cancelled = true
      opts?.onError?.()
    }
    try {
      window.speechSynthesis.speak(u)
    } catch {
      cancelled = true
    }
  }
  speakNext()
}
