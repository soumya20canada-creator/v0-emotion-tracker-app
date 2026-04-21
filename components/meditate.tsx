"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react"
import { ThemeHeader } from "@/components/theme-header"

type MeditateProps = {
  onClose: () => void
}

const PRESETS = [
  { minutes: 3, label: "3 min", description: "A small pause" },
  { minutes: 5, label: "5 min", description: "A short sit" },
  { minutes: 10, label: "10 min", description: "A steady practice" },
  { minutes: 15, label: "15 min", description: "A longer rest" },
] as const

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export function Meditate({ onClose }: MeditateProps) {
  const [minutes, setMinutes] = useState<number>(5)
  const [remaining, setRemaining] = useState<number>(5 * 60)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const tickRef = useRef<number | null>(null)

  useEffect(() => {
    setRemaining(minutes * 60)
    setRunning(false)
    setDone(false)
  }, [minutes])

  useEffect(() => {
    if (!running) {
      if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null }
      return
    }
    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false)
          setDone(true)
          return 0
        }
        return r - 1
      })
    }, 1000) as unknown as number
    return () => {
      if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null }
    }
  }, [running])

  const total = minutes * 60
  const progress = total > 0 ? 1 - remaining / total : 0
  const ringSize = 260
  const ringStroke = 10
  const ringRadius = (ringSize - ringStroke) / 2
  const circumference = 2 * Math.PI * ringRadius
  const dashOffset = circumference * (1 - progress)

  function reset() {
    setRemaining(minutes * 60)
    setRunning(false)
    setDone(false)
  }

  return (
    <main className="min-h-dvh bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <ThemeHeader />
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3 gap-3">
          <button
            onClick={onClose}
            style={{ minWidth: 44, minHeight: 44 }}
            className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Back to My Space"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground">Meditate</h2>
          <span style={{ minWidth: 44 }} />
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sit somewhere comfortable. Close your eyes or let them soften. When the timer ends, open them gently.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => {
              const active = minutes === p.minutes
              return (
                <button
                  key={p.minutes}
                  onClick={() => setMinutes(p.minutes)}
                  aria-pressed={active}
                  style={{
                    minHeight: 56,
                    background: active ? "var(--primary)" : "var(--muted)",
                    color: active ? "var(--primary-foreground)" : "var(--foreground)",
                  }}
                  className="rounded-2xl text-sm font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="relative" style={{ width: ringSize, height: ringSize }} aria-hidden="true">
            <svg width={ringSize} height={ringSize} className="transform -rotate-90">
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                stroke="var(--border)"
                strokeWidth={ringStroke}
                fill="none"
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                stroke="var(--primary)"
                strokeWidth={ringStroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {done ? (
                <>
                  <p className="text-lg font-bold text-foreground">That's enough.</p>
                  <p className="text-sm text-muted-foreground mt-1 text-center px-4 max-w-[220px] leading-relaxed">
                    Come back when you need to.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-5xl font-extrabold text-foreground tabular-nums">{formatTime(remaining)}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {running ? "sitting" : remaining === total ? "ready" : "paused"}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {done ? (
              <button
                onClick={reset}
                style={{ minWidth: 140, minHeight: 52, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
                className="rounded-2xl text-base font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                Sit again
              </button>
            ) : (
              <>
                <button
                  onClick={() => setRunning((r) => !r)}
                  style={{ minWidth: 140, minHeight: 52, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
                  className="rounded-2xl text-base font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center gap-2"
                >
                  {running ? <Pause size={18} /> : <Play size={18} />}
                  {running ? "Pause" : remaining === total ? "Begin" : "Resume"}
                </button>
                {remaining !== total && !running && (
                  <button
                    onClick={reset}
                    style={{ minWidth: 52, minHeight: 52 }}
                    className="rounded-2xl flex items-center justify-center bg-muted hover:bg-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Reset"
                  >
                    <RotateCcw size={18} className="text-foreground" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground/70 text-center italic leading-relaxed">
          No bells, no guidance. Just you and the time you gave yourself.
        </p>
      </div>
    </main>
  )
}
