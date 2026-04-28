"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useTranslations } from "next-intl"
import { useVoice } from "@/components/voice-provider"

export function VoiceToggle() {
  const { voiceEnabled, setVoiceEnabled, voiceAvailable } = useVoice()
  const t = useTranslations("voice")

  const disabled = !voiceAvailable
  const onClick = () => {
    if (disabled) return
    setVoiceEnabled(!voiceEnabled)
  }

  const label = voiceEnabled ? t("toggle.on") : t("toggle.off")
  const title = disabled ? t("unavailable") : label

  return (
    <button
      onClick={onClick}
      aria-pressed={voiceEnabled}
      aria-disabled={disabled}
      title={title}
      style={{ minHeight: 36 }}
      className={`flex items-center gap-1.5 px-2.5 h-9 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        disabled
          ? "bg-muted/50 text-muted-foreground/60 cursor-not-allowed"
          : voiceEnabled
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "bg-muted hover:bg-border text-foreground"
      }`}
    >
      {voiceEnabled && !disabled
        ? <Volume2 size={13} aria-hidden="true" />
        : <VolumeX size={13} aria-hidden="true" />}
      <span className="text-[11px] font-semibold">{disabled ? t("listen") : label}</span>
    </button>
  )
}
