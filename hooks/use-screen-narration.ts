"use client"

import { useCallback, useEffect } from "react"
import { useVoice } from "@/components/voice-provider"

/**
 * Auto-narrate a screen when Listen mode is on. Re-narrates whenever the
 * provided parts change. Returns a `replay` callback for "Listen again".
 *
 * Pass title, description, and any option labels in the order they should
 * be spoken. Empty/whitespace strings are filtered by speakSequence.
 */
export function useScreenNarration(parts: string[]): { replay: () => void } {
  const { voiceEnabled, speakSequence, cancel } = useVoice()
  const key = parts.join("|")

  useEffect(() => {
    if (!voiceEnabled) return
    speakSequence(parts)
    return () => cancel()
    // We intentionally key on the joined string + voiceEnabled so callers can
    // pass a fresh array literal each render without re-narrating constantly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceEnabled, key])

  const replay = useCallback(() => {
    speakSequence(parts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { replay }
}
