"use client"

import { type EmotionCategory, INTENSITY_OPTIONS, type IntensityOption } from "@/lib/emotions-data"

type IntensityPickerProps = {
  emotion: EmotionCategory
  intensity: number
  onChange: (value: number) => void
  onConfirm: () => void
}

export function IntensitySlider({ emotion, intensity, onChange, onConfirm }: IntensityPickerProps) {
  const selected = INTENSITY_OPTIONS.find((o) => o.level === intensity)
  const isCrisis = selected?.isCrisis || false

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm mx-auto">
      {/* Bubble options */}
      <div className="flex items-end justify-center gap-3 w-full py-4">
        {INTENSITY_OPTIONS.map((option) => {
          const isSelected = intensity === option.level
          return (
            <button
              key={option.level}
              onClick={() => onChange(option.level)}
              className="flex flex-col items-center gap-2 transition-all duration-300 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl p-2"
              aria-label={`${option.label}: ${option.description}`}
              aria-pressed={isSelected}
            >
              <div
                className="rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95"
                style={{
                  width: option.size,
                  height: option.size,
                  background: isSelected ? emotion.color : `${emotion.color}20`,
                  border: `3px solid ${isSelected ? emotion.color : `${emotion.color}44`}`,
                  boxShadow: isSelected ? `0 0 20px ${emotion.color}44` : "none",
                }}
              />
              <span
                className="text-xs font-bold leading-tight text-center max-w-[70px] transition-colors duration-200"
                style={{ color: isSelected ? emotion.color : "var(--muted-foreground)" }}
              >
                {option.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected description */}
      {selected && (
        <div
          className="text-center px-5 py-3 rounded-2xl transition-all duration-300"
          style={{ background: `${emotion.color}10` }}
        >
          <p className="text-base font-semibold" style={{ color: emotion.color }}>
            {selected.label}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {selected.description}
          </p>
        </div>
      )}

      {isCrisis && (
        <div
          className="w-full rounded-2xl p-4 text-center text-sm font-semibold transition-all duration-300"
          style={{ background: `${emotion.color}15`, color: emotion.color, border: `1px solid ${emotion.color}33` }}
        >
          Crisis tools will be ready for you
        </div>
      )}

      <button
        onClick={onConfirm}
        className="w-full py-4 rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          background: emotion.color,
          color: "#FFF",
          boxShadow: `0 4px 20px ${emotion.color}44`,
        }}
      >
        {isCrisis ? "Get help now" : "Show me moves"}
      </button>
    </div>
  )
}
