"use client"

import { type EmotionCategory } from "@/lib/emotions-data"

type SubEmotionPickerProps = {
  emotion: EmotionCategory
  selected: string | null
  onSelect: (sub: string) => void
}

export function SubEmotionPicker({ emotion, selected, onSelect }: SubEmotionPickerProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <p className="text-sm text-muted-foreground text-center leading-relaxed">
        Can you get more specific? (optional but earns bonus points)
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {emotion.subEmotions.map((sub) => {
          const isSelected = selected === sub
          return (
            <button
              key={sub}
              onClick={() => onSelect(sub)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                background: isSelected ? emotion.color : `${emotion.color}15`,
                color: isSelected ? "#FFF" : emotion.color,
                border: `2px solid ${isSelected ? emotion.color : `${emotion.color}33`}`,
              }}
              aria-pressed={isSelected}
            >
              {sub}
            </button>
          )
        })}
      </div>
    </div>
  )
}
