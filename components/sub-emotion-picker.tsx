"use client"

import { type EmotionCategory } from "@/lib/emotions-data"
import { Check } from "lucide-react"

type SubEmotionPickerProps = {
  emotion: EmotionCategory
  selected: string[]
  onToggle: (sub: string) => void
}

export function SubEmotionPicker({ emotion, selected, onToggle }: SubEmotionPickerProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <p className="text-base text-muted-foreground text-center leading-relaxed">
        Pick as many as you want (earns bonus points)
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {emotion.subEmotions.map((sub) => {
          const isSelected = selected.includes(sub)
          return (
            <button
              key={sub}
              onClick={() => onToggle(sub)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-base font-semibold transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                background: isSelected ? emotion.color : `${emotion.color}15`,
                color: isSelected ? "#FFF" : emotion.color,
                border: `2px solid ${isSelected ? emotion.color : `${emotion.color}33`}`,
              }}
              aria-pressed={isSelected}
            >
              {isSelected && <Check size={14} strokeWidth={3} aria-hidden="true" />}
              {sub}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-sm font-medium" style={{ color: emotion.color }}>
          {selected.length} selected
        </p>
      )}
    </div>
  )
}
