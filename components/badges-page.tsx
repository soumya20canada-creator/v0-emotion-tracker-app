"use client"

import { type GameState, getLevel } from "@/lib/game-store"
import {
  Star, Trophy, Compass, Flame, Zap, Shield, Heart, Dumbbell,
  Award, Crown, Brain, Lock, Rainbow,
} from "lucide-react"

const BADGE_ICON_MAP: Record<string, React.ElementType> = {
  Star, Compass, Flame, Trophy, Zap, Rainbow, Shield, Heart, Dumbbell, Award, Crown, Brain,
}

type BadgesPageProps = {
  gameState: GameState
}

export function BadgesPage({ gameState }: BadgesPageProps) {
  const unlockedCount = gameState.badges.filter((b) => b.unlocked).length
  const totalBadges = gameState.badges.length
  const level = getLevel(gameState.totalPoints)

  const unlocked = gameState.badges.filter((b) => b.unlocked)
  const locked = gameState.badges.filter((b) => !b.unlocked)

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto pb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-extrabold text-foreground">Badges</h3>
        <span className="text-sm font-semibold text-muted-foreground">{unlockedCount}/{totalBadges} earned</span>
      </div>

      {/* Level summary */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
        <span className="text-3xl">{level.emoji}</span>
        <div>
          <p className="text-base font-bold text-foreground">{level.name}</p>
          <p className="text-xs text-muted-foreground">{gameState.totalPoints} pts · {unlockedCount} badge{unlockedCount !== 1 ? "s" : ""} earned</p>
        </div>
      </div>

      {/* Unlocked badges */}
      {unlocked.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Earned</h4>
          <div className="grid grid-cols-3 gap-3">
            {unlocked.map((badge) => {
              const Icon = BADGE_ICON_MAP[badge.icon] || Star
              return (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-secondary border border-border text-center"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary">
                    <Icon size={22} style={{ color: "#FFF" }} />
                  </div>
                  <span className="text-xs font-bold text-foreground leading-tight">{badge.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{badge.description}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {unlocked.length === 0 && (
        <div className="text-center p-8 rounded-2xl bg-muted/50">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-base font-bold text-foreground">Your first badge is waiting</p>
          <p className="text-sm text-muted-foreground mt-1">Complete your first check-in to earn it.</p>
        </div>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Still to earn</h4>
          <div className="grid grid-cols-3 gap-3">
            {locked.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center"
                style={{ background: "var(--muted)", opacity: 0.5 }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-border">
                  <Lock size={16} className="text-muted-foreground" />
                </div>
                <span className="text-xs font-bold text-foreground leading-tight">{badge.name}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{badge.requirement}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
