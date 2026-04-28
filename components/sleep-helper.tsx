"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { ArrowLeft, ChevronRight, Feather, Wind, Headphones } from "lucide-react"
import { ThemeHeader } from "@/components/theme-header"
import { Breathing } from "@/components/breathing"
import { Journal } from "@/components/journal"
import { Meditate } from "@/components/meditate"

type SleepHelperProps = {
  userId: string
  onClose: () => void
}

type View = "menu" | "park" | "breathe" | "body"

export function SleepHelper({ userId, onClose }: SleepHelperProps) {
  const t = useTranslations("sleep")
  const [view, setView] = useState<View>("menu")

  if (view === "park") return <Journal userId={userId} onClose={() => setView("menu")} />
  if (view === "breathe") return <Breathing onClose={() => setView("menu")} />
  if (view === "body") return <Meditate onClose={() => setView("menu")} />

  return (
    <main className="min-h-dvh bg-background flex flex-col">
      <ThemeHeader />
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center px-5 py-3 gap-2">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={t("close")}
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-8 flex flex-col gap-7">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold text-foreground text-balance leading-tight">
            {t("title")}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed text-balance">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <SleepCard
            icon={Feather}
            title={t("park.title")}
            desc={t("park.desc")}
            onClick={() => setView("park")}
          />
          <SleepCard
            icon={Wind}
            title={t("breathe.title")}
            desc={t("breathe.desc")}
            onClick={() => setView("breathe")}
          />
          <SleepCard
            icon={Headphones}
            title={t("body.title")}
            desc={t("body.desc")}
            onClick={() => setView("body")}
          />
        </div>
      </div>
    </main>
  )
}

function SleepCard({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ElementType
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{ minHeight: 80 }}
      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border text-left hover:bg-muted cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={title}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/15 shrink-0">
        <Icon size={18} className="text-primary" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <ChevronRight size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />
    </button>
  )
}
