"use client"

import { type GameState } from "@/lib/game-store"
import { Sparkles, Heart, Moon, Star } from "lucide-react"

const MOMENT_ICON_MAP: Record<string, React.ElementType> = {
  Sparkles, Heart, Moon, Star,
}

type BadgesPageProps = {
  gameState: GameState
}

export function BadgesPage({ gameState }: BadgesPageProps) {
  const unlocked = gameState.moments.filter((m) => m.unlocked)
  const upcoming = gameState.moments.filter((m) => !m.unlocked)

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto pb-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-extrabold text-foreground">Moments</h3>
        <p className="text-sm text-muted-foreground">
          Quiet markers of showing up for yourself. No levels, no pressure.
        </p>
      </div>

      {unlocked.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Noticed so far</h4>
          <div className="flex flex-col gap-3">
            {unlocked.map((moment) => {
              const Icon = MOMENT_ICON_MAP[moment.icon] || Sparkles
              return (
                <div
                  key={moment.id}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-secondary border border-border"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/15 shrink-0">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-foreground">{moment.name}</span>
                    <span className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{moment.description}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {unlocked.length === 0 && (
        <div className="text-center p-8 rounded-2xl bg-muted/50">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-base font-bold text-foreground">Nothing here yet — and that's okay</p>
          <p className="text-sm text-muted-foreground mt-1">Your first check-in is the first moment.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Ahead of you</h4>
          <div className="flex flex-col gap-3">
            {upcoming.map((moment) => (
              <div
                key={moment.id}
                className="flex items-start gap-3 p-4 rounded-2xl border border-dashed border-border"
                style={{ opacity: 0.7 }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted shrink-0">
                  <Sparkles size={16} className="text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-foreground">{moment.name}</span>
                  <span className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{moment.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
