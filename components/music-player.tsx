"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX, Music } from "lucide-react"

const EMOTION_TRACKS: Record<string, string> = {
  happy: "/audio/birds.mp3",
  sad: "/audio/piano.mp3",
  angry: "/audio/rain.mp3",
  anxious: "/audio/ocean.mp3",
  confused: "/audio/forest.mp3",
  calm: "/audio/bells.mp3",
}

const EMOTION_LABELS: Record<string, string> = {
  happy: "birdsong",
  sad: "soft piano",
  angry: "gentle rain",
  anxious: "ocean waves",
  confused: "forest sounds",
  calm: "singing bowls",
}

type MusicPlayerProps = {
  emotionId: string | null
  accentColor?: string
}

export function MusicPlayer({ emotionId, accentColor = "var(--primary)" }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("bhava-music-muted") === "true"
  })
  const [visible, setVisible] = useState(false)

  const track = emotionId ? EMOTION_TRACKS[emotionId] : null
  const label = emotionId ? EMOTION_LABELS[emotionId] : null

  useEffect(() => {
    if (!track) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setVisible(false)
      return
    }

    if (!audioRef.current || audioRef.current.src !== window.location.origin + track) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(track)
      audio.loop = true
      audio.volume = 0
      audio.muted = muted
      audioRef.current = audio

      if (!muted) {
        audio.play().catch(() => {
          // Autoplay blocked — user must interact first
        })
        // Fade in
        let vol = 0
        const fade = setInterval(() => {
          vol = Math.min(vol + 0.02, 0.3)
          if (audioRef.current) audioRef.current.volume = vol
          if (vol >= 0.3) clearInterval(fade)
        }, 100)
      }
    }
    setVisible(true)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [track])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted
      if (!muted && audioRef.current.paused) {
        audioRef.current.play().catch(() => {})
      }
    }
    localStorage.setItem("bhava-music-muted", String(muted))
  }, [muted])

  if (!visible || !label) return null

  return (
    <div
      className="fixed bottom-24 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg backdrop-blur-sm border border-border/50 transition-all duration-300"
      style={{ background: `${accentColor}18` }}
    >
      <Music size={12} style={{ color: accentColor }} />
      <span className="text-xs font-medium" style={{ color: accentColor }}>
        {label}
      </span>
      <button
        onClick={() => setMuted((m) => !m)}
        className="cursor-pointer transition-opacity hover:opacity-70"
        aria-label={muted ? "Unmute music" : "Mute music"}
      >
        {muted
          ? <VolumeX size={14} style={{ color: accentColor }} />
          : <Volume2 size={14} style={{ color: accentColor }} />
        }
      </button>
    </div>
  )
}
