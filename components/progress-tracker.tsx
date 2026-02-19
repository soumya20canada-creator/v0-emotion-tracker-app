"use client"

import { type GameState } from "@/lib/game-store"
import { EMOTION_CATEGORIES } from "@/lib/emotions-data"
import { CONTEXT_TAGS } from "@/lib/context-tags"
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

  // Count context tags across all check-ins
  const tagCounts: Record<string, number> = {}
  gameState.checkIns.forEach((checkin) => {
    const tags = checkin.contextTags || []
    tags.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1
    })
  })
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const maxTagCount = sortedTags.length > 0 ? sortedTags[0][1] : 1

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto pb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-extrabold text-foreground">Your Progress</h3>
        <button
          onClick={onClose}
          className="text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-semibold"
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
          <span className="text-3xl font-extrabold text-foreground mt-2">{gameState.totalPoints}</span>
          <span className="text-sm text-muted-foreground">Total pts</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-2xl bg-secondary">
          <div className="w-10 h-10 rounded-xl bg-game-teal/20 flex items-center justify-center">
            <Flame size={20} className="text-game-teal" />
          </div>
          <span className="text-3xl font-extrabold text-foreground mt-2">{gameState.currentStreak}</span>
          <span className="text-sm text-muted-foreground">Day streak</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-2xl bg-secondary">
          <div className="w-10 h-10 rounded-xl bg-game-yellow/20 flex items-center justify-center">
            <Target size={20} className="text-game-yellow" />
          </div>
          <span className="text-3xl font-extrabold text-foreground mt-2">{gameState.totalActionsCompleted}</span>
          <span className="text-sm text-muted-foreground">Moves done</span>
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
        <h4 className="text-base font-bold text-foreground mb-3">Emotions Explored</h4>
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

      {/* Top triggers */}
      {sortedTags.length > 0 && (
        <div>
          <h4 className="text-base font-bold text-foreground mb-3">Top Triggers</h4>
          <div className="flex flex-col gap-2">
            {sortedTags.map(([tagId, count]) => {
              const tag = CONTEXT_TAGS.find((t) => t.id === tagId)
              const pct = Math.round((count / maxTagCount) * 100)
              return (
                <div key={tagId} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground w-32 shrink-0 truncate">
                    {tag?.label || tagId}
                  </span>
                  <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: "var(--primary)",
                        minWidth: "8px",
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground w-8 text-right shrink-0">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Understanding your triggers helps you prepare and respond better over time.
          </p>
        </div>
      )}

      {/* Recent activity */}
      {recentEmotions.length > 0 && (
        <div>
          <h4 className="text-base font-bold text-foreground mb-3">Recent Feelings</h4>
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
          <h4 className="text-base font-bold text-foreground">Badges</h4>
          <span className="text-sm text-muted-foreground">{unlockedCount}/{totalBadges} unlocked</span>
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
                <span className="text-sm font-bold text-foreground leading-tight">{badge.name}</span>
                <span className="text-xs text-muted-foreground leading-tight">{badge.description}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Check-in history */}
      {gameState.checkIns.length > 0 && (
        <div>
          <h4 className="text-base font-bold text-foreground mb-3">Recent Check-ins</h4>
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
                    <p className="text-sm font-semibold text-foreground truncate">
                      {cat?.label} ({checkin.subEmotion}) - Level {checkin.intensity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {checkin.actionsCompleted.length} moves completed, +{checkin.pointsEarned}pts
                    </p>
                    {checkin.journalNote && (
                      <p className="text-xs text-muted-foreground italic mt-0.5 leading-relaxed">
                        {'"'}{checkin.journalNote}{'"'}
                      </p>
                    )}
                    {checkin.contextTags && checkin.contextTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {checkin.contextTags.map((tagId) => (
                          <span key={tagId} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {tagId.replace(/-/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
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
