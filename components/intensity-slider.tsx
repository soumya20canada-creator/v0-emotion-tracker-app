"use client"

import { type EmotionCategory, INTENSITY_OPTIONS } from "@/lib/emotions-data"

const LEVEL_EMOJI = ["🌱", "🌿", "🌊", "⚡", "🌪️"]

type IntensityPickerProps = {
  emotion: EmotionCategory
  intensity: number
  onChange: (value: number) => void
  onConfirm: () => void
}

export function IntensitySlider({ emotion, intensity, onChange, onConfirm }: IntensityPickerProps) {
  const selected = INTENSITY_OPTIONS.find((o) => o.level === intensity)
  const isCrisis = selected?.isCrisis || false

  // How far along the track the filled portion goes (0–100%)
  const trackFill = ((intensity - 1) / (INTENSITY_OPTIONS.length - 1)) * 100

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm mx-auto">

      {/* Scale label */}
      <div className="flex justify-between w-full px-1">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Barely there</span>
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Overwhelming</span>
      </div>

      {/* Bubbles + track */}
      <div className="relative flex items-end justify-between w-full px-1" style={{ paddingBottom: 28 }}>

        {/* Track rail */}
        <div className="absolute left-0 right-0 h-1.5 rounded-full bg-muted overflow-hidden"
          style={{ bottom: 10, marginLeft: 22, marginRight: 22 }}>
          <div
            className="h-full rounded-full transition-all duration-400"
            style={{ width: `${trackFill}%`, background: emotion.color }}
          />
        </div>

        {INTENSITY_OPTIONS.map((option, i) => {
          const isSelected = intensity === option.level
          return (
            <button
              key={option.level}
              onClick={() => onChange(option.level)}
              className="relative flex flex-col items-center gap-2 transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
              aria-label={`${option.label}: ${option.description}`}
              aria-pressed={isSelected}
              style={{ zIndex: 1 }}
            >
              {/* Bubble */}
              <div
                className="rounded-full flex items-center justify-center transition-all duration-300 select-none"
                style={{
                  width: option.size,
                  height: option.size,
                  background: isSelected ? emotion.color : `${emotion.color}18`,
                  border: `2.5px solid ${isSelected ? emotion.color : `${emotion.color}33`}`,
                  boxShadow: isSelected ? `0 4px 20px ${emotion.color}55` : "none",
                  transform: isSelected ? "scale(1.12)" : "scale(1)",
                  fontSize: option.size * 0.38,
                }}
              >
                {LEVEL_EMOJI[i]}
              </div>
              {/* Level number */}
              <span
                className="text-[10px] font-bold absolute"
                style={{
                  bottom: -20,
                  color: isSelected ? emotion.color : "var(--muted-foreground)",
                }}
              >
                {option.level}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected label + description */}
      {selected && (
        <div
          className="w-full text-center px-5 py-4 rounded-2xl transition-all duration-300"
          style={{ background: `${emotion.color}10`, border: `1px solid ${emotion.color}20` }}
        >
          <p className="text-base font-bold" style={{ color: emotion.color }}>
            {selected.label}
          </p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {selected.description}
          </p>
        </div>
      )}

      {isCrisis && (
        <div
          className="w-full rounded-2xl p-4 text-center text-sm font-semibold"
          style={{ background: `${emotion.color}15`, color: emotion.color, border: `1px solid ${emotion.color}33` }}
        >
          Grounding tools will be ready for you 🤍
        </div>
      )}

      <button
        onClick={onConfirm}
        className="w-full py-4 rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          background: emotion.color,
          color: "#FFFFFF",
          boxShadow: `0 4px 20px ${emotion.color}44`,
        }}
      >
        {isCrisis ? "Get support now" : "Show me what helps"}
      </button>
    </div>
  )
}
