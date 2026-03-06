"use client"

import { type CheckIn } from "@/lib/game-store"
import { EMOTION_CATEGORIES } from "@/lib/emotions-data"

const EMOTION_EMOJI: Record<string, string> = {
  joy: "😊", calm: "😌", sadness: "😔", anger: "😤", fear: "😰", surprise: "😕",
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]
const WEEKS = 16

function getEmotionColor(emotionId: string): string {
  const cat = EMOTION_CATEGORIES.find((c) => c.id === emotionId)
  return cat?.color ?? "var(--primary)"
}

export function MoodCalendar({ checkIns }: { checkIns: CheckIn[] }) {
  // Build date → last emotionId map
  const dateMap = new Map<string, string>()
  checkIns.forEach((c) => dateMap.set(c.date, c.emotionId))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Start at Monday of (WEEKS) weeks ago
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - WEEKS * 7 + 1)
  const dow = startDate.getDay()
  startDate.setDate(startDate.getDate() - (dow === 0 ? 6 : dow - 1))

  // Build columns (Mon–Sun per column = 1 week)
  const columns: { date: string; emotionId: string | null }[][] = []
  const monthLabels: { colIndex: number; label: string }[] = []
  const cur = new Date(startDate)

  for (let col = 0; col < WEEKS; col++) {
    const week: { date: string; emotionId: string | null }[] = []
    for (let day = 0; day < 7; day++) {
      const dateStr = cur.toISOString().slice(0, 10)
      const isFuture = cur > today
      if (day === 0) {
        const prevDate = columns[col - 1]?.[0]?.date
        const prevMonth = prevDate ? new Date(prevDate).getMonth() : -1
        if (new Date(dateStr).getMonth() !== prevMonth) {
          monthLabels.push({
            colIndex: col,
            label: new Date(dateStr).toLocaleString("default", { month: "short" }),
          })
        }
      }
      week.push({ date: dateStr, emotionId: isFuture ? null : (dateMap.get(dateStr) ?? null) })
      cur.setDate(cur.getDate() + 1)
    }
    columns.push(week)
  }

  const exploredEmotionIds = [...new Set(checkIns.map((c) => c.emotionId))]

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto pb-1">
        <div style={{ minWidth: `${WEEKS * 18 + 20}px` }}>
          {/* Month labels */}
          <div className="flex mb-0.5" style={{ paddingLeft: 20 }}>
            {columns.map((_, col) => {
              const lbl = monthLabels.find((m) => m.colIndex === col)
              return (
                <div key={col} style={{ width: 18, flexShrink: 0 }}>
                  {lbl && (
                    <span className="text-[9px] text-muted-foreground font-medium">{lbl.label}</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Day-of-week labels + grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1" style={{ width: 12 }}>
              {DAY_LABELS.map((d, i) => (
                <span
                  key={i}
                  className="text-[9px] text-muted-foreground"
                  style={{ height: 14, lineHeight: "14px", display: "block" }}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Week columns */}
            <div className="flex gap-0.5">
              {columns.map((week, col) => (
                <div key={col} className="flex flex-col gap-0.5">
                  {week.map((cell, row) => (
                    <div
                      key={row}
                      title={
                        cell.emotionId
                          ? `${cell.date} · ${EMOTION_CATEGORIES.find((c) => c.id === cell.emotionId)?.label ?? cell.emotionId}`
                          : cell.date
                      }
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        background: cell.emotionId ? getEmotionColor(cell.emotionId) : "var(--muted)",
                        opacity: cell.emotionId ? 0.85 : 0.35,
                        transition: "opacity 0.2s",
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      {exploredEmotionIds.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {exploredEmotionIds.map((eid) => {
            const cat = EMOTION_CATEGORIES.find((c) => c.id === eid)
            if (!cat) return null
            return (
              <div key={eid} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ background: cat.color }} />
                <span className="text-[10px] text-muted-foreground">
                  {EMOTION_EMOJI[eid] ?? ""} {cat.label}
                </span>
              </div>
            )
          })}
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: "var(--muted)", opacity: 0.35 }} />
            <span className="text-[10px] text-muted-foreground">No check-in</span>
          </div>
        </div>
      )}
    </div>
  )
}
