"use client"

import { type EmotionCategory } from "@/lib/emotions-data"

type IntensitySliderProps = {
  emotion: EmotionCategory
  intensity: number
  onChange: (value: number) => void
  onConfirm: () => void
}

const INTENSITY_LABELS: Record<string, string[]> = {
  low: ["barely there", "a whisper", "a light nudge"],
  medium: ["noticeable", "pretty real", "can't ignore it"],
  high: ["super intense", "overwhelming", "off the charts"],
}

function getLabel(val: number): string {
  if (val <= 3) return INTENSITY_LABELS.low[val - 1] || INTENSITY_LABELS.low[0]
  if (val <= 6) return INTENSITY_LABELS.medium[val - 4] || INTENSITY_LABELS.medium[0]
  if (val <= 9) return INTENSITY_LABELS.high[val - 7] || INTENSITY_LABELS.high[0]
  return "maximum"
}

export function IntensitySlider({ emotion, intensity, onChange, onConfirm }: IntensitySliderProps) {
  const isCrisis = intensity >= 7

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300"
          style={{
            background: emotion.color,
            color: "#FFF",
            transform: `scale(${0.8 + intensity * 0.06})`,
            boxShadow: `0 0 ${intensity * 4}px ${emotion.color}66`,
          }}
        >
          {intensity}
        </div>
        <p className="text-sm font-medium text-muted-foreground capitalize">
          {getLabel(intensity)}
        </p>
      </div>

      {/* Slider */}
      <div className="w-full flex flex-col gap-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>mild</span>
          <span>intense</span>
        </div>
        <div className="relative w-full">
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              background: `linear-gradient(to right, ${emotion.color}44, ${emotion.color})`,
              accentColor: emotion.color,
            }}
            aria-label={`Intensity level: ${intensity} out of 10`}
          />
          {/* Tick marks */}
          <div className="flex justify-between px-1 mt-1" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{
                  background:
                    i + 1 <= intensity ? emotion.color : "#E8E0D8",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {isCrisis && (
        <div
          className="w-full rounded-xl p-3 text-center text-sm font-medium transition-all duration-300"
          style={{ background: `${emotion.color}15`, color: emotion.color, border: `1px solid ${emotion.color}33` }}
        >
          High intensity detected - crisis tools will be available
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
