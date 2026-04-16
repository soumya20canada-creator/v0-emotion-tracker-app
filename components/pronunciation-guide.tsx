"use client"

import { useCallback, useState } from "react"

type PronunciationGuideProps = {
  size?: "sm" | "md" | "lg"
}

export function PronunciationGuide({ size = "md" }: PronunciationGuideProps) {
  const [playing, setPlaying] = useState(false)

  const speak = useCallback(() => {
    if (typeof window === "undefined") return
    if (!("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    setPlaying(true)
    const utterance = new SpeechSynthesisUtterance("Bhava")
    utterance.lang = "hi-IN"
    utterance.rate = 0.8
    utterance.pitch = 1
    utterance.onend = () => setPlaying(false)
    utterance.onerror = () => setPlaying(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  const guideClass = size === "sm"
    ? "text-xs text-muted-foreground"
    : size === "lg"
    ? "text-base text-muted-foreground"
    : "text-sm text-muted-foreground"

  const btnSize = size === "sm" ? 20 : size === "lg" ? 28 : 24

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={guideClass} aria-hidden="true">(bha·va)</span>
      <button
        type="button"
        onClick={speak}
        aria-label="Hear pronunciation of Bhava"
        title="Hear pronunciation"
        style={{ minWidth: 44, minHeight: 44 }}
        className="inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <SpeakerIcon size={btnSize} playing={playing} />
      </button>
    </span>
  )
}

function SpeakerIcon({ size, playing }: { size: number; playing: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={playing ? "var(--primary)" : "currentColor"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={playing ? "animate-pulse" : ""}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}
