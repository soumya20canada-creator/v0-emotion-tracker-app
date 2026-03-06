"use client"

import { useRef, useState } from "react"
import { Volume2, VolumeX, Music, Play } from "lucide-react"

type SoundConfig = {
  label: string
  frequencies: number[]
  waveType: OscillatorType
  gain: number
  lfoRate: number
  lfoDepth: number
}

const EMOTION_SOUNDS: Record<string, SoundConfig> = {
  happy:    { label: "uplifting tones",  frequencies: [261.6, 329.6, 392.0, 523.3], waveType: "sine",     gain: 0.06, lfoRate: 0.35, lfoDepth: 0.30 },
  sad:      { label: "gentle stillness", frequencies: [174.6, 220.0, 261.6],         waveType: "triangle", gain: 0.05, lfoRate: 0.10, lfoDepth: 0.20 },
  angry:    { label: "grounding hum",    frequencies: [55.0,  82.4,  110.0],         waveType: "sine",     gain: 0.04, lfoRate: 0.50, lfoDepth: 0.35 },
  anxious:  { label: "ocean breath",     frequencies: [174.6, 261.6, 349.2],         waveType: "sine",     gain: 0.06, lfoRate: 0.07, lfoDepth: 0.55 },
  confused: { label: "forest calm",      frequencies: [256.0, 341.3, 512.0],         waveType: "sine",     gain: 0.05, lfoRate: 0.20, lfoDepth: 0.28 },
  calm:     { label: "singing bowls",    frequencies: [432.0, 528.0, 639.0],         waveType: "sine",     gain: 0.07, lfoRate: 0.04, lfoDepth: 0.42 },
}

type AudioState = {
  ctx: AudioContext
  masterGain: GainNode
}

type MusicPlayerProps = {
  emotionId: string | null
  accentColor?: string
}

export function MusicPlayer({ emotionId, accentColor = "var(--primary)" }: MusicPlayerProps) {
  const audioRef = useRef<AudioState | null>(null)
  const [playing, setPlaying] = useState(false)

  const config = emotionId ? EMOTION_SOUNDS[emotionId] : null

  // Called from a click handler — always a valid user gesture
  function startAudio(cfg: SoundConfig) {
    // Tear down previous context
    if (audioRef.current) {
      try { audioRef.current.ctx.close() } catch { /* ignore */ }
      audioRef.current = null
    }

    try {
      const Ctx = (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
      const ctx = new Ctx()

      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime)
      masterGain.connect(ctx.destination)

      // LFO (tremolo / breathing effect)
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.type = "sine"
      lfo.frequency.setValueAtTime(cfg.lfoRate, ctx.currentTime)
      lfoGain.gain.setValueAtTime(cfg.gain * cfg.lfoDepth, ctx.currentTime)
      lfo.connect(lfoGain)
      lfoGain.connect(masterGain.gain)
      lfo.start()

      // Chord oscillators
      cfg.frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const oscGain = ctx.createGain()
        osc.type = cfg.waveType
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        osc.detune.setValueAtTime((i % 2 === 0 ? 1 : -1) * (i + 1) * 2, ctx.currentTime)
        oscGain.gain.setValueAtTime(cfg.gain / cfg.frequencies.length, ctx.currentTime)
        osc.connect(oscGain)
        oscGain.connect(masterGain)
        osc.start()
      })

      audioRef.current = { ctx, masterGain }
      // Fade in over 3 s
      masterGain.gain.setTargetAtTime(cfg.gain, ctx.currentTime, 1.5)
      setPlaying(true)
    } catch (err) {
      console.error("[bhava] Web Audio error:", err)
    }
  }

  function stopAudio() {
    if (!audioRef.current) return
    const { ctx, masterGain } = audioRef.current
    masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.5)
    setTimeout(() => { try { ctx.close() } catch { /* ignore */ } }, 1500)
    audioRef.current = null
    setPlaying(false)
  }

  function handlePlay() {
    if (config) startAudio(config)
  }

  function handleMute() {
    stopAudio()
  }

  if (!config) return null

  return (
    <div
      className="fixed bottom-24 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg backdrop-blur-sm border border-border/50"
      style={{ background: `${accentColor}18` }}
    >
      <Music size={12} style={{ color: accentColor }} />
      <span className="text-xs font-medium" style={{ color: accentColor }}>
        {config.label}
      </span>
      {playing ? (
        <button
          onClick={handleMute}
          className="cursor-pointer transition-opacity hover:opacity-70"
          aria-label="Mute music"
        >
          <Volume2 size={14} style={{ color: accentColor }} />
        </button>
      ) : (
        <button
          onClick={handlePlay}
          className="cursor-pointer transition-opacity hover:opacity-70"
          aria-label="Play ambient music"
        >
          <Play size={14} style={{ color: accentColor }} />
        </button>
      )}
    </div>
  )
}
