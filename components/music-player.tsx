"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Volume2, VolumeX, Music } from "lucide-react"

type SoundConfig = {
  label: string
  frequencies: number[]
  waveType: OscillatorType
  gain: number
  lfoRate: number
  lfoDepth: number
}

const EMOTION_SOUNDS: Record<string, SoundConfig> = {
  happy:   { label: "uplifting tones",   frequencies: [261.6, 329.6, 392.0, 523.3], waveType: "sine",     gain: 0.06, lfoRate: 0.35, lfoDepth: 0.30 },
  sad:     { label: "gentle stillness",  frequencies: [174.6, 220.0, 261.6],         waveType: "triangle", gain: 0.05, lfoRate: 0.10, lfoDepth: 0.20 },
  angry:   { label: "grounding hum",     frequencies: [55.0,  82.4,  110.0],         waveType: "sine",     gain: 0.04, lfoRate: 0.50, lfoDepth: 0.35 },
  anxious: { label: "ocean breath",      frequencies: [174.6, 261.6, 349.2],         waveType: "sine",     gain: 0.06, lfoRate: 0.07, lfoDepth: 0.55 },
  confused:{ label: "forest calm",       frequencies: [256.0, 341.3, 512.0],         waveType: "sine",     gain: 0.05, lfoRate: 0.20, lfoDepth: 0.28 },
  calm:    { label: "singing bowls",     frequencies: [432.0, 528.0, 639.0],         waveType: "sine",     gain: 0.07, lfoRate: 0.04, lfoDepth: 0.42 },
}

type AudioNodes = {
  ctx: AudioContext
  oscillators: OscillatorNode[]
  lfo: OscillatorNode
  lfoGain: GainNode
  masterGain: GainNode
}

type MusicPlayerProps = {
  emotionId: string | null
  accentColor?: string
}

export function MusicPlayer({ emotionId, accentColor = "var(--primary)" }: MusicPlayerProps) {
  const nodesRef = useRef<AudioNodes | null>(null)
  const [muted, setMuted] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("bhava-music-muted") === "true"
  )
  const [visible, setVisible] = useState(false)

  const stopNodes = useCallback(() => {
    if (!nodesRef.current) return
    const { oscillators, lfo, lfoGain, masterGain, ctx } = nodesRef.current
    try {
      masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.8)
      setTimeout(() => {
        oscillators.forEach(o => { try { o.stop(); o.disconnect() } catch { /* ignore */ } })
        try { lfo.stop(); lfo.disconnect() } catch { /* ignore */ }
        try { lfoGain.disconnect() } catch { /* ignore */ }
        try { masterGain.disconnect() } catch { /* ignore */ }
        try { ctx.close() } catch { /* ignore */ }
      }, 2500)
    } catch { /* ignore */ }
    nodesRef.current = null
  }, [])

  const startNodes = useCallback((config: SoundConfig) => {
    stopNodes()
    try {
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      if (ctx.state === "suspended") ctx.resume()

      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime)
      masterGain.connect(ctx.destination)

      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.type = "sine"
      lfo.frequency.setValueAtTime(config.lfoRate, ctx.currentTime)
      lfoGain.gain.setValueAtTime(config.gain * config.lfoDepth, ctx.currentTime)
      lfo.connect(lfoGain)
      lfoGain.connect(masterGain.gain)
      lfo.start()

      const oscillators = config.frequencies.map((freq, i) => {
        const osc = ctx.createOscillator()
        const oscGain = ctx.createGain()
        osc.type = config.waveType
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        osc.detune.setValueAtTime((i % 2 === 0 ? 1 : -1) * (i + 1) * 1.5, ctx.currentTime)
        oscGain.gain.setValueAtTime(config.gain / config.frequencies.length, ctx.currentTime)
        osc.connect(oscGain)
        oscGain.connect(masterGain)
        osc.start()
        return osc
      })

      nodesRef.current = { ctx, oscillators, lfo, lfoGain, masterGain }
      masterGain.gain.setTargetAtTime(config.gain, ctx.currentTime, 1.5)
    } catch (err) {
      console.error("[bhava] Web Audio error:", err)
    }
  }, [stopNodes])

  const emotionConfig = emotionId ? EMOTION_SOUNDS[emotionId] : null

  useEffect(() => {
    if (!emotionConfig) {
      stopNodes()
      setVisible(false)
      return
    }
    setVisible(true)
    if (!muted) startNodes(emotionConfig)
    return stopNodes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emotionId])

  useEffect(() => {
    if (!emotionConfig) return
    if (muted) {
      stopNodes()
    } else {
      startNodes(emotionConfig)
    }
    localStorage.setItem("bhava-music-muted", String(muted))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted])

  if (!visible || !emotionConfig) return null

  return (
    <div
      className="fixed bottom-24 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg backdrop-blur-sm border border-border/50 transition-all duration-300"
      style={{ background: `${accentColor}18` }}
    >
      <Music size={12} style={{ color: accentColor }} />
      <span className="text-xs font-medium" style={{ color: accentColor }}>
        {emotionConfig.label}
      </span>
      <button
        onClick={() => setMuted(m => !m)}
        className="cursor-pointer transition-opacity hover:opacity-70"
        aria-label={muted ? "Unmute music" : "Mute music"}
      >
        {muted
          ? <VolumeX size={14} style={{ color: accentColor }} />
          : <Volume2 size={14} style={{ color: accentColor }} />}
      </button>
    </div>
  )
}
