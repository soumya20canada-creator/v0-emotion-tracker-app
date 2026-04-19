"use client"

import { useEffect, useState } from "react"
import { BookOpenText, Wind, Headphones, Music, Feather, ChevronRight, Sparkles, Heart, Moon } from "lucide-react"
import { Journal } from "@/components/journal"
import { Breathing } from "@/components/breathing"
import { GroundingNotes } from "@/components/grounding-notes"
import { type GameState } from "@/lib/game-store"
import { getEntries } from "@/lib/journal-store"

const MOMENT_ICON_MAP: Record<string, React.ElementType> = {
  Sparkles, Heart, Moon,
}

type MySpaceProps = {
  userId: string
  gameState: GameState
  firstName?: string
}

type View = "hub" | "journal" | "breathe" | "notes"

export function MySpace({ userId, gameState, firstName }: MySpaceProps) {
  const [view, setView] = useState<View>("hub")
  const [entryCount, setEntryCount] = useState(0)

  useEffect(() => {
    setEntryCount(getEntries(userId).length)
  }, [userId, view])

  if (view === "journal") {
    return <Journal userId={userId} onClose={() => setView("hub")} />
  }
  if (view === "breathe") {
    return <Breathing onClose={() => setView("hub")} />
  }
  if (view === "notes") {
    return <GroundingNotes onClose={() => setView("hub")} />
  }

  const unlockedMoments = gameState.moments.filter((m) => m.unlocked)

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto pb-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-extrabold text-foreground">
          {firstName ? `${firstName}'s corner` : "Your corner"} 🌸
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A quiet place. Pick up what helps, leave the rest.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <HubCard
          icon={BookOpenText}
          title="Journal"
          subtitle={entryCount > 0
            ? `${entryCount} ${entryCount === 1 ? "entry" : "entries"} · private to you`
            : "A blank page, just for you · private"}
          onClick={() => setView("journal")}
        />
        <HubCard
          icon={Wind}
          title="Breathe"
          subtitle="3 gentle patterns · 1–5 minutes"
          onClick={() => setView("breathe")}
        />
        <HubCard
          icon={Headphones}
          title="Meditate"
          subtitle="Free guided sessions · coming soon"
          disabled
        />
        <HubCard
          icon={Music}
          title="Comfort sounds"
          subtitle="Rain, ocean, fire · coming soon"
          disabled
        />
        <HubCard
          icon={Feather}
          title="Grounding notes"
          subtitle="One short note for today"
          onClick={() => setView("notes")}
        />
      </section>

      {unlockedMoments.length > 0 && (
        <section className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Moments you've noticed
          </h4>
          <div className="flex flex-col gap-2">
            {unlockedMoments.map((m) => {
              const Icon = MOMENT_ICON_MAP[m.icon] || Sparkles
              return (
                <div
                  key={m.id}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/60 border border-border"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/15 shrink-0">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">{m.name}</span>
                    <span className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {m.description}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

function HubCard({
  icon: Icon, title, subtitle, onClick, disabled,
}: {
  icon: React.ElementType
  title: string
  subtitle: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ minHeight: 68 }}
      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border text-left hover:bg-muted disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={title}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/15 shrink-0">
        <Icon size={18} className="text-primary" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
      {!disabled && <ChevronRight size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />}
    </button>
  )
}
