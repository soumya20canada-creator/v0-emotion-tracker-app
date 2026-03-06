"use client"

import { type GameState, getLevel, getDailyGoal } from "@/lib/game-store"
import { EMOTION_CATEGORIES } from "@/lib/emotions-data"
import { CONTEXT_TAGS } from "@/lib/context-tags"
import {
  Flame, Star, Trophy, Compass, Zap, Shield, Heart, Dumbbell,
  Award, Crown, Brain, Lock, TrendingUp, Target, Rainbow,
} from "lucide-react"

const BADGE_ICON_MAP: Record<string, React.ElementType> = {
  Star, Compass, Flame, Trophy, Zap, Rainbow, Shield, Heart, Dumbbell, Award, Crown, Brain,
}

const MOTIVATIONAL_QUOTES = [
  "Every feeling you name is a step toward knowing yourself.",
  "You showed up today. That's everything.",
  "Feelings aren't problems to solve — they're signals to hear.",
  "The fact that you're here means you care about yourself. That matters.",
  "Healing isn't linear. Neither is growth. Neither are you.",
  "You don't have to feel okay to be okay.",
  "Small actions, taken with intention, change everything over time.",
  "Your emotional life is rich. That's a gift, not a burden.",
]

type ProgressTrackerProps = {
  gameState: GameState
  onClose: () => void
  displayName?: string
}

export function ProgressTracker({ gameState, onClose, displayName }: ProgressTrackerProps) {
  const unlockedCount = gameState.badges.filter((b) => b.unlocked).length
  const totalBadges = gameState.badges.length
  const recentEmotions = [...new Set(gameState.checkIns.slice(-10).map((c) => c.emotionId))]
  const level = getLevel(gameState.totalPoints)
  const dailyGoal = getDailyGoal(gameState.checkIns)
  const quoteIndex = gameState.checkIns.length % MOTIVATIONAL_QUOTES.length
  const quote = MOTIVATIONAL_QUOTES[quoteIndex]

  // XP progress to next level
  const xpProgress = level.next
    ? Math.round(((gameState.totalPoints - level.min) / (level.next - level.min)) * 100)
    : 100

  // Context tag counts
  const tagCounts: Record<string, number> = {}
  gameState.checkIns.forEach((c) => (c.contextTags || []).forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1 }))
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxTagCount = sortedTags.length > 0 ? sortedTags[0][1] : 1

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto pb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-extrabold text-foreground">Your Journey</h3>
        <button onClick={onClose} className="text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-semibold">
          Close
        </button>
      </div>

      {/* Motivational quote */}
      <div className="p-4 rounded-2xl bg-primary/8 border border-primary/15 text-center">
        <p className="text-sm text-foreground italic leading-relaxed">"{quote}"</p>
      </div>

      {/* Level card */}
      <div className="p-5 rounded-2xl bg-secondary border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{level.emoji}</span>
            <div>
              <p className="text-base font-bold text-foreground">{level.name}</p>
              <p className="text-xs text-muted-foreground">{gameState.totalPoints} pts total</p>
            </div>
          </div>
          {level.next && (
            <p className="text-xs text-muted-foreground">{level.next - gameState.totalPoints} pts to {LEVEL_NAMES[level.next]}</p>
          )}
        </div>
        <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${xpProgress}%`, background: "var(--primary)" }}
          />
        </div>
      </div>

      {/* Daily goal */}
      <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-accent/30 bg-accent/5">
        <div className="relative w-14 h-14 shrink-0">
          <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
            <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border)" strokeWidth="4" />
            <circle
              cx="24" cy="24" r="20" fill="none"
              stroke="var(--accent)" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - Math.min(dailyGoal.done / dailyGoal.target, 1))}`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-accent">
            {dailyGoal.done}/{dailyGoal.target}
          </span>
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{dailyGoal.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {dailyGoal.done >= dailyGoal.target ? "Done for today — well done 🌸" : "You've got this. We're here."}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-4 rounded-2xl bg-secondary">
          <div className="w-10 h-10 rounded-xl bg-game-coral/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-game-coral" />
          </div>
          <span className="text-3xl font-extrabold text-foreground mt-2">{gameState.totalPoints}</span>
          <span className="text-xs text-muted-foreground text-center">Total pts</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-2xl bg-secondary">
          <div className="w-10 h-10 rounded-xl bg-game-teal/20 flex items-center justify-center">
            <Flame size={20} className="text-game-teal" />
          </div>
          <span className="text-3xl font-extrabold text-foreground mt-2">{gameState.currentStreak}</span>
          <span className="text-xs text-muted-foreground text-center">Day streak</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-2xl bg-secondary">
          <div className="w-10 h-10 rounded-xl bg-game-yellow/20 flex items-center justify-center">
            <Target size={20} className="text-game-yellow" />
          </div>
          <span className="text-3xl font-extrabold text-foreground mt-2">{gameState.totalActionsCompleted}</span>
          <span className="text-xs text-muted-foreground text-center">Moves done</span>
        </div>
      </div>

      {/* Streak milestone messages */}
      {gameState.currentStreak >= 3 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-game-teal/10 border border-game-teal/20">
          <Flame size={18} className="text-game-teal shrink-0" />
          <p className="text-sm text-foreground">
            {gameState.currentStreak >= 30
              ? `${gameState.currentStreak} days of showing up for yourself. That's extraordinary. 🌳`
              : gameState.currentStreak >= 14
              ? `${gameState.currentStreak} days in a row — you're building something real. 🌺`
              : gameState.currentStreak >= 7
              ? `A full week of check-ins. Your nervous system is noticing. 🌸`
              : `${gameState.currentStreak} days in a row — you're on your way. 🌿`}
          </p>
        </div>
      )}

      {gameState.longestStreak > gameState.currentStreak && gameState.longestStreak > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-game-yellow/10 border border-game-yellow/20">
          <Trophy size={18} className="text-game-yellow" />
          <span className="text-sm text-foreground">Your longest streak: <strong>{gameState.longestStreak} days</strong> — you've done it before, you can do it again.</span>
        </div>
      )}

      {/* Emotions explored */}
      <div>
        <h4 className="text-base font-bold text-foreground mb-3">Feelings explored</h4>
        <div className="flex gap-2 flex-wrap">
          {EMOTION_CATEGORIES.map((cat) => {
            const explored = gameState.uniqueEmotions.includes(cat.id)
            return (
              <div key={cat.id} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: explored ? `${cat.color}22` : "var(--muted)",
                  color: explored ? cat.color : "var(--muted-foreground)",
                  border: `2px solid ${explored ? cat.color : "transparent"}`,
                  opacity: explored ? 1 : 0.5,
                }}>
                <div className="w-3 h-3 rounded-full" style={{ background: explored ? cat.color : "var(--border)" }} />
                {cat.label}
              </div>
            )
          })}
        </div>
      </div>

      {/* Top triggers */}
      {sortedTags.length > 0 && (
        <div>
          <h4 className="text-base font-bold text-foreground mb-1">What's been coming up</h4>
          <p className="text-xs text-muted-foreground mb-3">Noticing your patterns is part of the work.</p>
          <div className="flex flex-col gap-2">
            {sortedTags.map(([tagId, count]) => {
              const tag = CONTEXT_TAGS.find((t) => t.id === tagId)
              const pct = Math.round((count / maxTagCount) * 100)
              return (
                <div key={tagId} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground w-32 shrink-0 truncate">{tag?.label || tagId}</span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: "var(--primary)", minWidth: "8px" }} />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground w-6 text-right shrink-0">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent emotions */}
      {recentEmotions.length > 0 && (
        <div>
          <h4 className="text-base font-bold text-foreground mb-3">Recent feelings</h4>
          <div className="flex gap-2">
            {recentEmotions.map((eid) => {
              const cat = EMOTION_CATEGORIES.find((c) => c.id === eid)
              if (!cat) return null
              return (
                <div key={eid} className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: cat.color, boxShadow: `0 2px 8px ${cat.color}44` }}>
                  <span className="text-xs font-bold" style={{ color: "#FFF" }}>{cat.label.slice(0, 2)}</span>
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
          <span className="text-sm text-muted-foreground">{unlockedCount}/{totalBadges} earned</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {gameState.badges.map((badge) => {
            const Icon = BADGE_ICON_MAP[badge.icon] || Star
            return (
              <div key={badge.id} className="flex flex-col items-center gap-2 p-3 rounded-2xl text-center transition-all"
                style={{ background: badge.unlocked ? "var(--secondary)" : "var(--muted)", opacity: badge.unlocked ? 1 : 0.4 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: badge.unlocked ? "var(--primary)" : "var(--border)" }}>
                  {badge.unlocked
                    ? <Icon size={18} style={{ color: "#FFF" }} />
                    : <Lock size={14} style={{ color: "var(--muted-foreground)" }} />}
                </div>
                <span className="text-xs font-bold text-foreground leading-tight">{badge.name}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{badge.description}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent check-ins */}
      {gameState.checkIns.length > 0 && (
        <div>
          <h4 className="text-base font-bold text-foreground mb-3">Recent check-ins</h4>
          <div className="flex flex-col gap-2">
            {gameState.checkIns.slice(-5).reverse().map((checkin, i) => {
              const cat = EMOTION_CATEGORIES.find((c) => c.id === checkin.emotionId)
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                  <div className="w-8 h-8 rounded-full shrink-0" style={{ background: cat?.color || "var(--muted)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {cat?.label}{checkin.subEmotion ? ` · ${checkin.subEmotion}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {checkin.actionsCompleted.length} move{checkin.actionsCompleted.length !== 1 ? "s" : ""} · +{checkin.pointsEarned}pts
                    </p>
                    {checkin.journalNote && (
                      <p className="text-xs text-muted-foreground italic mt-0.5 leading-relaxed">"{checkin.journalNote}"</p>
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

const LEVEL_NAMES: Record<number, string> = { 100: "Sprout", 300: "Bloom", 700: "Garden", 1500: "Forest" }
