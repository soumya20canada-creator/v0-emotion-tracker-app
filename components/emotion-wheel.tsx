"use client"

import { useState } from "react"
import { EMOTION_CATEGORIES, type EmotionCategory } from "@/lib/emotions-data"
import {
  Sun,
  CloudRain,
  Flame,
  Wind,
  Zap,
  Leaf,
} from "lucide-react"

const ICON_MAP: Record<string, React.ElementType> = {
  Sun,
  CloudRain,
  Flame,
  Wind,
  Zap,
  Leaf,
}

type EmotionWheelProps = {
  onSelect: (emotion: EmotionCategory) => void
  selectedId: string | null
}

export function EmotionWheel({ onSelect, selectedId }: EmotionWheelProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex flex-col items-center gap-3">
        <h2 className="text-3xl font-extrabold text-foreground text-center text-balance leading-tight">
          How are you feeling?
        </h2>
        <p className="text-base text-muted-foreground text-center leading-relaxed">
          Tap what fits. No right answers.
        </p>
      </div>

      {/* Grid layout - simpler, more accessible than circular */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {EMOTION_CATEGORIES.map((emotion) => {
          const Icon = ICON_MAP[emotion.icon]
          const isSelected = selectedId === emotion.id
          const isHovered = hoveredId === emotion.id

          return (
            <button
              key={emotion.id}
              className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              style={{
                background: isSelected ? emotion.color : `${emotion.color}15`,
                border: `3px solid ${isSelected ? emotion.color : `${emotion.color}44`}`,
                transform: `scale(${isSelected ? 1.05 : isHovered ? 1.02 : 1})`,
                boxShadow: isSelected
                  ? `0 4px 24px ${emotion.color}44`
                  : "none",
              }}
              onClick={() => onSelect(emotion)}
              onMouseEnter={() => setHoveredId(emotion.id)}
              onMouseLeave={() => setHoveredId(null)}
              aria-label={`Select ${emotion.label} emotion`}
              aria-pressed={isSelected}
            >
              {Icon && (
                <Icon
                  size={28}
                  style={{ color: isSelected ? "#F2EFE2" : emotion.color }}
                  aria-hidden="true"
                />
              )}
              <span
                className="text-base font-bold"
                style={{ color: isSelected ? "#F2EFE2" : emotion.color }}
              >
                {emotion.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
