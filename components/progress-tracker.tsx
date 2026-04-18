"use client"

import { type GameState, getDailyGoal, getMoodTrend } from "@/lib/game-store"
import { EMOTION_CATEGORIES } from "@/lib/emotions-data"
import { MoodCalendar } from "@/components/mood-calendar"

const EMOTION_EMOJI: Record<string, string> = {
  joy: "😊", calm: "😌", sadness: "😔", anger: "😤", fear: "😰", surprise: "😕",
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

export function ProgressTracker({ gameState, onClose }: ProgressTrackerProps) {
  const dailyGoal = getDailyGoal(gameState.checkIns)
  const quoteIndex = gameState.checkIns.length % MOTIVATIONAL_QUOTES.length
  const quote = MOTIVATIONAL_QUOTES[quoteIndex]

  // Weekly mood breakdown (last 7 days)
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7); weekAgo.setHours(0, 0, 0, 0)
  const weekCheckIns = gameState.checkIns.filter(c => new Date(c.date) >= weekAgo)
  const weekCounts: Record<string, number> = {}
  weekCheckIns.forEach(c => { weekCounts[c.emotionId] = (weekCounts[c.emotionId] || 0) + 1 })
  const weekTotal = weekCheckIns.length
  const weekBreakdown = Object.entries(weekCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([eid, count]) => ({
      eid, count,
      pct: weekTotal > 0 ? Math.round(count / weekTotal * 100) : 0,
      cat: EMOTION_CATEGORIES.find(c => c.id === eid),
    }))

  const moodTrend = getMoodTrend(gameState.checkIns)

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

      {/* Mood Calendar */}
      {gameState.checkIns.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="text-base font-bold text-foreground">Mood calendar</h4>
          <p className="text-xs text-muted-foreground">Your emotional fingerprint — 16 weeks at a glance.</p>
          <MoodCalendar checkIns={gameState.checkIns} />
        </div>
      )}

      {/* Weekly Mood Summary */}
      <div>
        <h4 className="text-base font-bold text-foreground mb-1">This week's mood breakdown</h4>
        {weekTotal === 0 ? (
          <p className="text-sm text-muted-foreground mt-2">No check-ins yet this week — start today 🌱</p>
        ) : (
          <div className="flex flex-col gap-2 mt-3">
            {weekBreakdown.map(({ eid, pct, cat }) =>
              cat ? (
                <div key={eid} className="flex items-center gap-3">
                  <span className="text-base shrink-0 w-6 text-center">{EMOTION_EMOJI[eid] ?? "•"}</span>
                  <span className="text-sm font-medium text-foreground w-16 shrink-0">{cat.label}</span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: cat.color, minWidth: "4px" }} />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground w-8 text-right shrink-0">{pct}%</span>
                </div>
              ) : null
            )}
            <p className="text-xs text-muted-foreground mt-1">{weekTotal} check-in{weekTotal !== 1 ? "s" : ""} this week</p>
          </div>
        )}
      </div>

      {/* Mood Score Trend */}
      {moodTrend && (moodTrend.thisWeek > 0 || moodTrend.thisMonth > 0) && (
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-secondary border border-border">
          <div>
            <h4 className="text-base font-bold text-foreground">Mood score</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Based on emotional quality of your check-ins (0–100).</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-extrabold text-foreground">{moodTrend.thisWeek}</p>
              <p className="text-xs text-muted-foreground">This week</p>
            </div>
            {moodTrend.lastWeek > 0 && (
              <div className="px-3 py-1.5 rounded-full"
                style={{ background: moodTrend.weekDelta >= 0 ? "#10B98115" : "#EF444415" }}>
                <span className="text-sm font-bold"
                  style={{ color: moodTrend.weekDelta >= 0 ? "#10B981" : "#EF4444" }}>
                  {moodTrend.weekDelta >= 0 ? "↑" : "↓"} {Math.abs(moodTrend.weekDelta)}% vs last week
                </span>
              </div>
            )}
          </div>
          {moodTrend.thisMonth > 0 && (
            <div className="flex items-center gap-3 pt-2 border-t border-border flex-wrap">
              <span className="text-sm text-muted-foreground">
                This month: <strong className="text-foreground">{moodTrend.thisMonth}</strong>
              </span>
              {moodTrend.lastMonth > 0 && (
                <span className="text-sm font-semibold"
                  style={{ color: moodTrend.monthDelta >= 0 ? "#10B981" : "#EF4444" }}>
                  {moodTrend.monthDelta >= 0 ? "↑" : "↓"} {Math.abs(moodTrend.monthDelta)}% vs last month
                </span>
              )}
            </div>
          )}
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
                      {checkin.actionsCompleted.length} move{checkin.actionsCompleted.length !== 1 ? "s" : ""}
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
