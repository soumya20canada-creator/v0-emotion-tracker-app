"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { useTranslations } from "next-intl"
import { X } from "lucide-react"

const TOUR_DONE_KEY = "bhava-tour-done"
const ONBOARDING_DONE_KEY = "bhava-onboarding-done"

type Stop = {
  id: "wheel" | "journey" | "patterns" | "space" | "crisis" | "controls"
  selector: string
  /** Pad the spotlight cutout outwards from the element bounds (px). */
  pad: number
  /** Border-radius for the spotlight cutout (px). */
  radius: number
}

const STOPS: Stop[] = [
  { id: "wheel",    selector: '[data-tour="wheel"]',    pad: 12, radius: 24 },
  { id: "journey",  selector: '[data-tour="journey"]',  pad: 8,  radius: 16 },
  { id: "patterns", selector: '[data-tour="patterns"]', pad: 8,  radius: 16 },
  { id: "space",    selector: '[data-tour="space"]',    pad: 8,  radius: 16 },
  { id: "crisis",   selector: '[data-tour="crisis"]',   pad: 8,  radius: 999 },
  { id: "controls", selector: '[data-tour="controls"]', pad: 8,  radius: 20 },
]

type Rect = { x: number; y: number; w: number; h: number }

type CoachmarkTourProps = {
  /** When true, renders the tour. Parent owns the visibility state. */
  active: boolean
  /** Called when the user finishes or skips the tour. */
  onClose: () => void
}

export function CoachmarkTour({ active, onClose }: CoachmarkTourProps) {
  const t = useTranslations("tour")
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [vp, setVp] = useState({ w: 0, h: 0 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const stop = STOPS[step]

  // Measure the current anchor + viewport. Re-measures on resize/scroll/step.
  const measure = useCallback(() => {
    if (typeof window === "undefined") return
    const el = document.querySelector(stop.selector) as HTMLElement | null
    setVp({ w: window.innerWidth, h: window.innerHeight })
    if (!el) {
      setRect(null)
      return
    }
    const r = el.getBoundingClientRect()
    setRect({
      x: r.left - stop.pad,
      y: r.top - stop.pad,
      w: r.width + stop.pad * 2,
      h: r.height + stop.pad * 2,
    })
  }, [stop])

  useEffect(() => {
    if (!active) return
    const schedule = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(measure)
    }
    schedule()
    window.addEventListener("resize", schedule)
    window.addEventListener("scroll", schedule, true)
    return () => {
      window.removeEventListener("resize", schedule)
      window.removeEventListener("scroll", schedule, true)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [active, measure])

  // Restart at step 0 each time the tour re-activates.
  useEffect(() => {
    if (active) setStep(0)
  }, [active])

  const total = STOPS.length
  const isLast = step === total - 1
  const isFirst = step === 0

  function next() {
    if (isLast) finish()
    else setStep((s) => s + 1)
  }
  function back() {
    if (!isFirst) setStep((s) => s - 1)
  }
  function finish() {
    try { localStorage.setItem(TOUR_DONE_KEY, "true") } catch { /* ignore */ }
    onClose()
  }

  if (!active || !mounted) return null

  // Tooltip placement: prefer below the anchor; fall back above if there's no room.
  const TOOLTIP_W = 300
  const TOOLTIP_H_EST = 200
  const margin = 16
  let tipTop = 0
  let tipLeft = 0
  let placement: "above" | "below" | "center" = "center"

  if (rect && vp.h > 0) {
    const roomBelow = vp.h - (rect.y + rect.h)
    const roomAbove = rect.y
    if (roomBelow >= TOOLTIP_H_EST + margin) {
      placement = "below"
      tipTop = rect.y + rect.h + margin
    } else if (roomAbove >= TOOLTIP_H_EST + margin) {
      placement = "above"
      tipTop = rect.y - TOOLTIP_H_EST - margin
    } else {
      placement = "center"
      tipTop = Math.max(margin, vp.h / 2 - TOOLTIP_H_EST / 2)
    }
    // horizontal: center on anchor, clamp to viewport
    const center = rect.x + rect.w / 2 - TOOLTIP_W / 2
    tipLeft = Math.max(margin, Math.min(vp.w - TOOLTIP_W - margin, center))
  } else {
    // Anchor missing — show tooltip centered, no spotlight.
    tipTop = Math.max(margin, vp.h / 2 - TOOLTIP_H_EST / 2)
    tipLeft = Math.max(margin, vp.w / 2 - TOOLTIP_W / 2)
  }

  const overlay = (
    <div
      className="fixed inset-0 z-[400]"
      role="dialog"
      aria-modal="true"
      aria-label="Intro tour"
    >
      {/* Dimmed overlay with spotlight cutout via SVG mask */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        width={vp.w}
        height={vp.h}
        onClick={(e) => {
          // tap on the dim (not on the cutout) advances
          if (e.target === e.currentTarget) next()
        }}
        aria-hidden="true"
      >
        <defs>
          <mask id="bhava-tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.w}
                height={rect.h}
                rx={stop.radius}
                ry={stop.radius}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.62)"
          mask="url(#bhava-tour-mask)"
        />
        {rect && (
          <rect
            x={rect.x}
            y={rect.y}
            width={rect.w}
            height={rect.h}
            rx={stop.radius}
            ry={stop.radius}
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={2}
            pointerEvents="none"
          />
        )}
      </svg>

      {/* Tooltip card */}
      <div
        className="absolute bg-card text-foreground rounded-2xl shadow-2xl border border-border/60 p-5 flex flex-col gap-3"
        style={{
          width: TOOLTIP_W,
          top: tipTop,
          left: tipLeft,
        }}
        data-placement={placement}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              {t("step", { current: step + 1, total })}
            </p>
            <h3 className="text-lg font-extrabold leading-tight mt-0.5">
              {t(`${stop.id}.title`)}
            </h3>
          </div>
          <button
            onClick={finish}
            aria-label={t("skip")}
            style={{ minWidth: 36, minHeight: 36 }}
            className="rounded-full flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t(`${stop.id}.body`)}
        </p>
        <div className="flex items-center justify-between gap-2 mt-1">
          <button
            onClick={finish}
            className="text-xs font-semibold text-muted-foreground px-2 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("skip")}
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={back}
                style={{ minHeight: 40 }}
                className="px-4 h-10 rounded-xl text-sm font-semibold bg-muted hover:bg-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t("back")}
              </button>
            )}
            <button
              onClick={next}
              style={{ minHeight: 40 }}
              className="px-4 h-10 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isLast ? t("done") : t("next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}

/**
 * Helper used by app/page.tsx to decide whether the tour should auto-fire on
 * home-screen mount. Returns true if onboarding is done but the tour hasn't
 * been seen yet. Safe to call on the server (returns false).
 */
export function shouldAutoStartTour(): boolean {
  if (typeof window === "undefined") return false
  try {
    const onboarded = localStorage.getItem(ONBOARDING_DONE_KEY) === "true"
    const tourDone = localStorage.getItem(TOUR_DONE_KEY) === "true"
    return onboarded && !tourDone
  } catch {
    return false
  }
}

/** Clear the tour-done flag so it replays on next mount. */
export function resetTour() {
  try { localStorage.removeItem(TOUR_DONE_KEY) } catch { /* ignore */ }
}
