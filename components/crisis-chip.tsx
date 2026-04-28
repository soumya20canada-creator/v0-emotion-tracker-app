"use client"

import { LifeBuoy } from "lucide-react"
import { useTranslations } from "next-intl"

type CrisisChipProps = {
  onOpen: () => void
}

export function CrisisChip({ onOpen }: CrisisChipProps) {
  const t = useTranslations("crisis")
  return (
    <button
      onClick={onOpen}
      aria-label={t("needHelpNow")}
      data-tour="crisis"
      style={{ minHeight: 44 }}
      className="fixed bottom-36 right-4 z-[250] flex items-center gap-2 px-4 py-2.5 rounded-full bg-destructive/90 text-destructive-foreground shadow-lg border border-destructive/40 backdrop-blur-sm hover:bg-destructive transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
    >
      <LifeBuoy size={16} aria-hidden="true" />
      <span className="text-sm font-semibold">{t("needHelpNow")}</span>
    </button>
  )
}
