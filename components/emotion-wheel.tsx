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
  const count = EMOTION_CATEGORIES.length
  const radius = 130
  const centerX = 180
  const centerY = 180

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-foreground text-center text-balance leading-relaxed">
        How are you feeling right now?
      </h2>
      <p className="text-muted-foreground text-center text-sm leading-relaxed">
        Tap an emotion to get started. No right answers.
      </p>

      {/* Wheel */}
      <div className="relative" style={{ width: 360, height: 360 }}>
        {/* Center circle */}
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: 80,
            height: 80,
            left: centerX - 40,
            top: centerY - 40,
            background: selectedId
              ? EMOTION_CATEGORIES.find((e) => e.id === selectedId)?.color
              : "#F5F0EB",
            transition: "background 0.3s ease",
          }}
        >
          <span className="text-xs font-bold" style={{ color: selectedId ? "#FFF" : "#6B7280" }}>
            {selectedId
              ? EMOTION_CATEGORIES.find((e) => e.id === selectedId)?.label
              : "you"}
          </span>
        </div>

        {EMOTION_CATEGORIES.map((emotion, i) => {
          const angle = (i * 360) / count - 90
          const rad = (angle * Math.PI) / 180
          const x = centerX + radius * Math.cos(rad) - 44
          const y = centerY + radius * Math.sin(rad) - 44
          const Icon = ICON_MAP[emotion.icon]
          const isSelected = selectedId === emotion.id
          const isHovered = hoveredId === emotion.id
          const scale = isSelected ? 1.15 : isHovered ? 1.08 : 1

          return (
            <button
              key={emotion.id}
              className="absolute flex flex-col items-center justify-center rounded-full transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              style={{
                width: 88,
                height: 88,
                left: x,
                top: y,
                background: isSelected ? emotion.color : `${emotion.color}22`,
                border: `3px solid ${emotion.color}`,
                transform: `scale(${scale})`,
                boxShadow: isSelected
                  ? `0 0 24px ${emotion.color}66`
                  : "0 2px 8px rgba(0,0,0,0.06)",
                zIndex: isSelected ? 10 : 1,
              }}
              onClick={() => onSelect(emotion)}
              onMouseEnter={() => setHoveredId(emotion.id)}
              onMouseLeave={() => setHoveredId(null)}
              aria-label={`Select ${emotion.label} emotion`}
              aria-pressed={isSelected}
            >
              {Icon && (
                <Icon
                  size={24}
                  style={{ color: isSelected ? "#FFF" : emotion.color }}
                  aria-hidden="true"
                />
              )}
              <span
                className="text-xs font-bold mt-1"
                style={{ color: isSelected ? "#FFF" : emotion.color }}
              >
                {emotion.label}
              </span>
            </button>
          )
        })}

        {/* Connecting lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={360}
          height={360}
          aria-hidden="true"
        >
          {EMOTION_CATEGORIES.map((emotion, i) => {
            const angle = (i * 360) / count - 90
            const rad = (angle * Math.PI) / 180
            const x = centerX + (radius - 44) * Math.cos(rad)
            const y = centerY + (radius - 44) * Math.sin(rad)
            return (
              <line
                key={emotion.id}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke={emotion.color}
                strokeWidth={selectedId === emotion.id ? 2.5 : 1}
                strokeDasharray={selectedId === emotion.id ? "0" : "4 4"}
                opacity={selectedId === emotion.id ? 0.6 : 0.2}
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}
