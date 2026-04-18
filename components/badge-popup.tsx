"use client"

import { useEffect, useState } from "react"
import { Star, Sparkles, Heart, Moon } from "lucide-react"
import type { Moment } from "@/lib/emotions-data"

const BADGE_ICON_MAP: Record<string, React.ElementType> = {
  Star, Sparkles, Heart, Moon,
}

type BadgePopupProps = {
  badge: Moment
  onDone: () => void
}

export function BadgePopup({ badge, onDone }: BadgePopupProps) {
  const [show, setShow] = useState(true)
  const Icon = BADGE_ICON_MAP[badge.icon] || Sparkles

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      onDone()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onDone])

  if (!show) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-foreground/30 backdrop-blur-sm">
      <div
        className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-card shadow-xl animate-in zoom-in-75 duration-500"
        role="alert"
        aria-label={`Moment: ${badge.name}`}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary/15">
          <Icon size={32} className="text-primary" />
        </div>
        <p className="text-lg font-bold" style={{ color: "var(--primary)" }}>
          {badge.name}
        </p>
        <p className="text-base text-muted-foreground text-center max-w-[280px] leading-relaxed">
          {badge.description}
        </p>
        <button
          onClick={() => {
            setShow(false)
            onDone()
          }}
          className="px-6 py-2 rounded-xl text-sm font-bold bg-primary cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          style={{ color: "#FFF" }}
        >
          Thank you
        </button>
      </div>
    </div>
  )
}
