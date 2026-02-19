"use client"

import { useEffect, useState } from "react"

type PointPopupProps = {
  points: number
  color: string
  onDone: () => void
}

export function PointPopup({ points, color, onDone }: PointPopupProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onDone()
    }, 1200)
    return () => clearTimeout(timer)
  }, [onDone])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
      aria-live="polite"
    >
      <div
        className="text-4xl font-bold animate-bounce"
        style={{ color, textShadow: `0 0 20px ${color}66` }}
      >
        +{points} pts!
      </div>
    </div>
  )
}
