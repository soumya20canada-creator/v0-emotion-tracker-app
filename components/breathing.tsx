"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Play, Pause } from "lucide-react"

type BreathingProps = {
  onClose: () => void
}

type Phase = "inhale" | "hold-in" | "exhale" | "hold-out"

type Preset = {
  id: string
  name: string
  description: string
  // durations in seconds; 0 means skip that phase
  inhale: number
  holdIn: number
  exhale: number
  holdOut: number
}

const PRESETS: Preset[] = [
  {
    id: "box",
    name: "Box breathing",
    description: "In 4, hold 4, out 4, hold 4. Used by Navy SEALs to steady nerves.",
    inhale: 4, holdIn: 4, exhale: 4, holdOut: 4,
  },
  {
    id: "478",
    name: "4-7-8",
    description: "In 4, hold 7, out 8. Calms the nervous system quickly.",
    inhale: 4, holdIn: 7, exhale: 8, holdOut: 0,
  },
  {
    id: "slow",
    name: "Slow down",
    description: "In 6, out 6. Just slow everything a little.",
    inhale: 6, holdIn: 0, exhale: 6, holdOut: 0,
  },
]

function phaseLabel(phase: Phase): string {
  switch (phase) {
    case "inhale": return "Breathe in"
    case "hold-in": return "Hold"
    case "exhale": return "Breathe out"
    case "hold-out": return "Rest"
  }
}

function nextPhase(p: Phase, preset: Preset): Phase {
  const order: Phase[] = ["inhale", "hold-in", "exhale", "hold-out"]
  let i = order.indexOf(p)
  for (let n = 0; n < 4; n++) {
    i = (i + 1) % 4
    const cand = order[i]
    const d = phaseDuration(cand, preset)
    if (d > 0) return cand
  }
  return "inhale"
}

function phaseDuration(p: Phase, preset: Preset): number {
  switch (p) {
    case "inhale": return preset.inhale
    case "hold-in": return preset.holdIn
    case "exhale": return preset.exhale
    case "hold-out": return preset.holdOut
  }
}

export function Breathing({ onClose }: BreathingProps) {
  const [preset, setPreset] = useState<Preset>(PRESETS[0])
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<Phase>("inhale")
  const [remaining, setRemaining] = useState<number>(PRESETS[0].inhale)
  const [cycles, setCycles] = useState(0)
  const tickRef = useRef<number | null>(null)

  // Reset on preset change
  useEffect(() => {
    setRunning(false)
    setPhase("inhale")
    setRemaining(preset.inhale)
    setCycles(0)
  }, [preset])

  // Timer
  useEffect(() => {
    if (!running) {
      if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null }
      return
    }
    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1
        // phase complete
        setPhase((p) => {
          const np = nextPhase(p, preset)
          const dur = phaseDuration(np, preset)
          setRemaining(dur)
          if (np === "inhale") setCycles((c) => c + 1)
          return np
        })
        return 0
      })
    }, 1000) as unknown as number
    return () => {
      if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null }
    }
  }, [running, preset])

  const totalPhase = Math.max(1, phaseDuration(phase, preset))
  const progress = 1 - remaining / totalPhase
  const scale = phase === "inhale"
    ? 0.6 + 0.4 * progress
    : phase === "exhale"
      ? 1.0 - 0.4 * progress
      : phase === "hold-in"
        ? 1.0
        : 0.6

  return (
    <main className="min-h-dvh bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3 gap-3">
          <button
            onClick={onClose}
            style={{ minWidth: 44, minHeight: 44 }}
            className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Back to My Space"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground">Breathe</h2>
          <span style={{ minWidth: 44 }} />
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Pick a pace. Then watch the circle and breathe with it — no need to count.
          </p>
          <div className="flex flex-col gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p)}
                aria-pressed={preset.id === p.id}
                style={{ minHeight: 56 }}
                className="w-full text-left p-3 rounded-2xl border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-active={preset.id === p.id}
                // active styling via inline style
              >
                <div
                  className="flex items-center gap-3"
                  style={{
                    color: "var(--foreground)",
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      background: preset.id === p.id ? "var(--primary)" : "var(--border)",
                    }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div
            className="relative flex items-center justify-center"
            style={{ width: 240, height: 240 }}
            aria-hidden="true"
          >
            <div
              className="absolute rounded-full"
              style={{
                width: 240,
                height: 240,
                background: "var(--primary)",
                opacity: 0.08,
              }}
            />
            <div
              className="rounded-full transition-transform duration-1000 ease-in-out"
              style={{
                width: 240,
                height: 240,
                background: "radial-gradient(circle, var(--primary) 0%, var(--accent) 100%)",
                opacity: 0.7,
                transform: `scale(${scale})`,
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-lg font-bold text-foreground">{phaseLabel(phase)}</p>
              <p className="text-5xl font-extrabold text-foreground tabular-nums mt-1">{remaining}</p>
            </div>
          </div>

          <button
            onClick={() => setRunning((r) => !r)}
            style={{ minWidth: 120, minHeight: 52, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
            className="rounded-2xl text-base font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center gap-2"
            aria-label={running ? "Pause" : "Start"}
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
            {running ? "Pause" : "Start"}
          </button>

          <p className="text-xs text-muted-foreground tabular-nums">
            {cycles} {cycles === 1 ? "cycle" : "cycles"} completed
          </p>
        </div>
      </div>
    </main>
  )
}
