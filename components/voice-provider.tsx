"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useLocaleSwitch } from "@/components/intl-provider"
import {
  cancel as cancelSpeech,
  getVoiceFor,
  onVoicesReady,
  speak as speakOne,
  speakSequence as speakMany,
} from "@/lib/speech"

const STORAGE_KEY = "bhava-voice"

type VoiceContextValue = {
  voiceEnabled: boolean
  setVoiceEnabled: (v: boolean) => void
  voiceAvailable: boolean
  /** Speak only when Listen mode is on. */
  speak: (text: string) => void
  /** Always speak (used by tap-to-listen icons). No-op if no voice available. */
  forceSpeak: (text: string) => void
  speakSequence: (parts: string[]) => void
  cancel: () => void
}

const VoiceContext = createContext<VoiceContextValue | null>(null)

export function useVoice(): VoiceContextValue {
  const ctx = useContext(VoiceContext)
  if (!ctx) throw new Error("useVoice must be used inside <VoiceProvider>")
  return ctx
}

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocaleSwitch()
  const [voiceEnabled, setVoiceEnabledState] = useState(false)
  const [voiceAvailable, setVoiceAvailable] = useState(false)
  const [, setVoicesTick] = useState(0)

  // Hydrate enabled flag from localStorage.
  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      if (v === "true") setVoiceEnabledState(true)
    } catch { /* ignore */ }
  }, [])

  // Re-check availability whenever the voice list changes or locale changes.
  useEffect(() => {
    setVoiceAvailable(getVoiceFor(locale) != null)
    const off = onVoicesReady(() => {
      setVoiceAvailable(getVoiceFor(locale) != null)
      setVoicesTick((t) => t + 1)
    })
    return off
  }, [locale])

  // Cancel any in-flight utterance when the locale changes.
  useEffect(() => {
    cancelSpeech()
  }, [locale])

  // Cancel on unmount.
  useEffect(() => () => cancelSpeech(), [])

  const setVoiceEnabled = useCallback((v: boolean) => {
    setVoiceEnabledState(v)
    try { localStorage.setItem(STORAGE_KEY, v ? "true" : "false") } catch { /* ignore */ }
    if (!v) cancelSpeech()
  }, [])

  const speak = useCallback((text: string) => {
    if (!voiceEnabled) return
    speakOne(text, locale)
  }, [voiceEnabled, locale])

  const forceSpeak = useCallback((text: string) => {
    speakOne(text, locale)
  }, [locale])

  const speakSequence = useCallback((parts: string[]) => {
    if (!voiceEnabled) return
    speakMany(parts, locale)
  }, [voiceEnabled, locale])

  const cancel = useCallback(() => cancelSpeech(), [])

  return (
    <VoiceContext.Provider
      value={{
        voiceEnabled,
        setVoiceEnabled,
        voiceAvailable,
        speak,
        forceSpeak,
        speakSequence,
        cancel,
      }}
    >
      {children}
    </VoiceContext.Provider>
  )
}
