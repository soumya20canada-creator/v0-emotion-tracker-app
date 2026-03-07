"use client"

import { type GameState } from "@/lib/game-store"
import { EMOTION_CATEGORIES } from "@/lib/emotions-data"
import { CONTEXT_TAGS } from "@/lib/context-tags"

const EMOTION_EMOJI: Record<string, string> = {
  joy: "😊", calm: "😌", sadness: "😔", anger: "😤", fear: "😰", surprise: "😕",
}

const TIME_EMOJIS: Record<string, string> = {
  Morning: "🌅", Afternoon: "☀️", Evening: "🌆", Night: "🌙",
}

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type PatternsPageProps = {
  gameState: GameState
}

export function PatternsPage({ gameState }: PatternsPageProps) {
  const { checkIns } = gameState

  // --- Context tag counts ---
  const tagCounts: Record<string, number> = {}
  checkIns.forEach((c) => (c.contextTags || []).forEach((t) => {
    tagCounts[t] = (tagCounts[t] || 0) + 1
  }))
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxTagCount = sortedTags.length > 0 ? sortedTags[0][1] : 1

  // --- Recent unique emotions (last 10 check-ins) ---
  const recentEmotionIds = [...new Set(checkIns.slice(-10).map((c) => c.emotionId))]

  // --- Time of day + day of week ---
  const checkInsWithTs = checkIns.filter((c) => c.timestamp)
  const buckets = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 }
  const dayBuckets: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 }
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  checkInsWithTs.forEach((c) => {
    const d = new Date(c.timestamp!)
    const h = d.getHours()
    const day = days[d.getDay()]
    dayBuckets[day] = (dayBuckets[day] || 0) + 1
    if (h >= 5 && h < 12) buckets.Morning++
    else if (h >= 12 && h < 17) buckets.Afternoon++
    else if (h >= 17 && h < 22) buckets.Evening++
    else buckets.Night++
  })

  const maxTime = Math.max(...Object.values(buckets))
  const maxDay = Math.max(...Object.values(dayBuckets))
  const peakTime = Object.entries(buckets).find(([, v]) => v === maxTime)?.[0]
  const peakDay = Object.entries(dayBuckets).find(([, v]) => v === maxDay)?.[0]

  // --- Per-emotion peak insights ---
  const emotionPatterns: {
    emotionId: string; label: string; color: string; peakDay: string; peakTime: string
  }[] = []

  EMOTION_CATEGORIES.forEach((cat) => {
    const items = checkInsWithTs.filter((c) => c.emotionId === cat.id)
    if (items.length < 3) return
    const timeCounts: Record<string, number> = {}
    const dayCounts: Record<string, number> = {}
    items.forEach((c) => {
      const h = new Date(c.timestamp!).getHours()
      const d = new Date(c.timestamp!).getDay()
      const slot =
        h >= 5 && h < 12 ? "mornings" :
        h >= 12 && h < 17 ? "afternoons" :
        h >= 17 && h < 22 ? "evenings" : "nights"
      timeCounts[slot] = (timeCounts[slot] || 0) + 1
      dayCounts[DAYS_SHORT[d]] = (dayCounts[DAYS_SHORT[d]] || 0) + 1
    })
    const peakT = Object.entries(timeCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    const peakD = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    if (peakT && peakD) {
      emotionPatterns.push({
        emotionId: cat.id, label: cat.label, color: cat.color,
        peakDay: peakD + "s", peakTime: peakT,
      })
    }
  })

  const hasTimeData = checkInsWithTs.length >= 3
  const hasPatterns = emotionPatterns.length > 0
  const hasTagData = sortedTags.length > 0
  const hasCheckIns = checkIns.length > 0

  if (!hasCheckIns) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-4xl">🔍</p>
        <p className="text-base font-bold text-foreground">No patterns yet</p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          Check in a few times and your emotional patterns will start to appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-md mx-auto pb-6">
      <h3 className="text-2xl font-extrabold text-foreground">Your Patterns</h3>

      {/* Recent feelings */}
      {recentEmotionIds.length > 0 && (
        <div>
          <h4 className="text-base font-bold text-foreground mb-1">Recent feelings</h4>
          <p className="text-xs text-muted-foreground mb-3">Your last 10 check-ins at a glance.</p>
          <div className="flex gap-2 flex-wrap">
            {recentEmotionIds.map((eid) => {
              const cat = EMOTION_CATEGORIES.find((c) => c.id === eid)
              if (!cat) return null
              return (
                <div
                  key={eid}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: `${cat.color}20`, color: cat.color, border: `2px solid ${cat.color}40` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                  {EMOTION_EMOJI[eid] ?? ""} {cat.label}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* What's been coming up */}
      {hasTagData && (
        <div>
          <h4 className="text-base font-bold text-foreground mb-1">What's been coming up</h4>
          <p className="text-xs text-muted-foreground mb-3">Noticing your patterns is part of the work.</p>
          <div className="flex flex-col gap-2">
            {sortedTags.map(([tagId, count]) => {
              const tag = CONTEXT_TAGS.find((t) => t.id === tagId)
              const pct = Math.round((count / maxTagCount) * 100)
              return (
                <div key={tagId} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground w-36 shrink-0 truncate">
                    {tag?.label || tagId}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: "var(--primary)", minWidth: "8px" }}
                    />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground w-6 text-right shrink-0">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* When you check in */}
      {hasTimeData && (
        <div>
          <h4 className="text-base font-bold text-foreground mb-1">When you check in</h4>
          <p className="text-xs text-muted-foreground mb-3">Your rhythms reveal a lot about you.</p>

          {/* Time of day bars */}
          <div className="flex flex-col gap-2 mb-4">
            {Object.entries(buckets).map(([label, count]) => {
              const pct = maxTime > 0 ? Math.round((count / maxTime) * 100) : 0
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm w-28 shrink-0 text-foreground font-medium">
                    {TIME_EMOJIS[label]} {label}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: "var(--primary)", minWidth: count > 0 ? "8px" : "0" }}
                    />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground w-5 text-right shrink-0">{count}</span>
                </div>
              )
            })}
          </div>

          {/* Day of week grid */}
          <div className="flex gap-1.5 justify-between">
            {days.map((day) => {
              const count = dayBuckets[day] || 0
              const intensity = maxDay > 0 ? count / maxDay : 0
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <div
                    className="w-9 h-9 rounded-xl transition-all duration-300"
                    style={{ background: "var(--primary)", opacity: 0.15 + intensity * 0.85 }}
                  />
                  <span className="text-[10px] text-muted-foreground">{day}</span>
                </div>
              )
            })}
          </div>

          {peakTime && peakDay && (
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              You tend to check in most on{" "}
              <strong className="text-foreground">{peakDay}s</strong>, usually in the{" "}
              <strong className="text-foreground">{peakTime.toLowerCase()}</strong>.{" "}
              Knowing your patterns is part of knowing yourself.
            </p>
          )}
        </div>
      )}

      {/* Per-emotion peak insights */}
      {hasPatterns && (
        <div>
          <h4 className="text-base font-bold text-foreground mb-1">Your emotional patterns</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Needs 3+ check-ins per emotion to appear.
          </p>
          <div className="flex flex-col gap-2">
            {emotionPatterns.map((p) => (
              <div key={p.emotionId} className="flex items-center gap-3 p-4 rounded-2xl border border-border">
                <span className="text-2xl shrink-0">{EMOTION_EMOJI[p.emotionId] ?? "•"}</span>
                <p className="text-sm text-foreground leading-relaxed">
                  You tend to feel{" "}
                  <strong style={{ color: p.color }}>{p.label}</strong> most on{" "}
                  <strong>{p.peakDay}</strong> during the{" "}
                  <strong>{p.peakTime}</strong>.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasTimeData && !hasPatterns && !hasTagData && (
        <div className="text-center p-6 rounded-2xl bg-muted/50">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Keep checking in — patterns start appearing after a few entries.
          </p>
        </div>
      )}
    </div>
  )
}
