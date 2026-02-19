"use client"

import { type GameState } from "@/lib/game-store"
import { EMOTION_CATEGORIES } from "@/lib/emotions-data"
import {
  Flame,
  Star,
  Trophy,
  Compass,
  Zap,
  Shield,
  Heart,
  Dumbbell,
  Award,
  Crown,
  Brain,
  Lock,
  TrendingUp,
  Target,
  Rainbow,
} from "lucide-react"

const BADGE_ICON_MAP: Record<string, React.ElementType> = {
  Star,
  Compass,
  Flame,
  Trophy,
  Zap,
  Rainbow,
  Shield,
  Heart,
  Dumbbell,
  Award,
  Crown,
  Brain,
}

type ProgressTrackerProps = {
  gameState: GameState
  onClose: () => void
}

export function ProgressTracker({ gameState, onClose }: ProgressTrackerProps) {
  const unlockedCount = gameState.badges.filter((b) => b.unlocked).length
  const totalBadges = gameState.badges.length
  const recentEmotions = [...new Set(gameState.checkIns.slice(-10).map((c) => c.emotionId))]

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto pb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">Your Progress</h3>
        <button
          onClick={onClose}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-4 rounded-2xl bg-secondary">
          <div className="w-10 h-10 rounded-xl bg-game-coral/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-game-coral" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-2">{gameState.totalPoints}</span>
          <span className="text-xs text-muted-foreground">Total pts</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-2xl bg-secondary">
          <div className="w-10 h-10 rounded-xl bg-game-teal/20 flex items-center justify-center">
            <Flame size={20} className="text-game-teal" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-2">{gameState.currentStreak}</span>
          <span className="text-xs text-muted-foreground">Day streak</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-2xl bg-secondary">
          <div className="w-10 h-10 rounded-xl bg-game-yellow/20 flex items-center justify-center">
            <Target size={20} className="text-game-yellow" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-2">{gameState.totalActionsCompleted}</span>
          <span className="text-xs text-muted-foreground">Moves done</span>
        </div>
      </div>

      {/* Longest streak */}
      {gameState.longestStreak > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-game-yellow/10 border border-game-yellow/20">
          <Trophy size={18} className="text-game-yellow" />
          <span className="text-sm text-foreground">
            Longest streak: <strong>{gameState.longestStreak} days</strong>
          </span>
        </div>
      )}

      {/* Emotion spectrum */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3">Emotions Explored</h4>
        <div className="flex gap-2 flex-wrap">
          {EMOTION_CATEGORIES.map((cat) => {
            const explored = gameState.uniqueEmotions.includes(cat.id)
            return (
              <div
                key={cat.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: explored ? `${cat.color}22` : "var(--muted)",
                  color: explored ? cat.color : "var(--muted-foreground)",
                  border: `2px solid ${explored ? cat.color : "transparent"}`,
                  opacity: explored ? 1 : 0.5,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: explored ? cat.color : "var(--border)" }}
                />
                {cat.label}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent activity */}
      {recentEmotions.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3">Recent Feelings</h4>
          <div className="flex gap-2">
            {recentEmotions.map((eid) => {
              const cat = EMOTION_CATEGORIES.find((c) => c.id === eid)
              if (!cat) return null
              return (
                <div
                  key={eid}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: cat.color, boxShadow: `0 2px 8px ${cat.color}44` }}
                >
                  <span className="text-xs font-bold" style={{ color: "#FFF" }}>
                    {cat.label.slice(0, 2)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-foreground">Badges</h4>
          <span className="text-xs text-muted-foreground">{unlockedCount}/{totalBadges} unlocked</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {gameState.badges.map((badge) => {
            const Icon = BADGE_ICON_MAP[badge.icon] || Star
            return (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl text-center transition-all"
                style={{
                  background: badge.unlocked ? "var(--secondary)" : "var(--muted)",
                  opacity: badge.unlocked ? 1 : 0.4,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: badge.unlocked ? "var(--primary)" : "var(--border)",
                  }}
                >
                  {badge.unlocked ? (
                    <Icon size={18} style={{ color: "#FFF" }} />
                  ) : (
                    <Lock size={14} style={{ color: "var(--muted-foreground)" }} />
                  )}
                </div>
                <span className="text-xs font-bold text-foreground leading-tight">{badge.name}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{badge.description}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Check-in history */}
      {gameState.checkIns.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3">Recent Check-ins</h4>
          <div className="flex flex-col gap-2">
            {gameState.checkIns.slice(-5).reverse().map((checkin, i) => {
              const cat = EMOTION_CATEGORIES.find((c) => c.id === checkin.emotionId)
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border"
                >
                  <div
                    className="w-8 h-8 rounded-full shrink-0"
                    style={{ background: cat?.color || "var(--muted)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {cat?.label} ({checkin.subEmotion}) - Level {checkin.intensity}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {checkin.actionsCompleted.length} moves completed, +{checkin.pointsEarned}pts
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{checkin.date}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
