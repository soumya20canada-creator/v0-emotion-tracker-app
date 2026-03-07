"use client"

import { type CheckIn } from "@/lib/game-store"
import { EMOTION_CATEGORIES } from "@/lib/emotions-data"

const EMOTION_EMOJI: Record<string, string> = {
  joy: "😊", calm: "😌", sadness: "😔", anger: "😤", fear: "😰", surprise: "😕",
}

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function getEmotionColor(emotionId: string): string {
  return EMOTION_CATEGORIES.find((c) => c.id === emotionId)?.color ?? "var(--primary)"
}

type DayCell = {
  date: string
  dayNum: number
  emotionId: string | null
  isCurrentMonth: boolean
  isToday: boolean
  isFuture: boolean
}

export function MoodCalendar({ checkIns }: { checkIns: CheckIn[] }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const year = today.getFullYear()
  const month = today.getMonth()

  const monthName = today.toLocaleString("default", { month: "long", year: "numeric" })

  // date → last emotionId for that day
  const dateMap = new Map<string, string>()
  checkIns.forEach((c) => dateMap.set(c.date, c.emotionId))

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Align grid start to Monday
  const dow = firstDay.getDay() // 0=Sun … 6=Sat
  const gridStart = new Date(firstDay)
  gridStart.setDate(firstDay.getDate() - (dow === 0 ? 6 : dow - 1))

  // Build flat list of day cells until we've covered the month + completed the week
  const allDays: DayCell[] = []
  const cur = new Date(gridStart)

  while (true) {
    const dateStr = cur.toISOString().slice(0, 10)
    const isCurrentMonth = cur.getMonth() === month
    const isToday = cur.getTime() === today.getTime()
    const isFuture = cur > today

    allDays.push({
      date: dateStr,
      dayNum: cur.getDate(),
      emotionId: isCurrentMonth && !isFuture ? (dateMap.get(dateStr) ?? null) : null,
      isCurrentMonth,
      isToday,
      isFuture,
    })

    cur.setDate(cur.getDate() + 1)
    // Stop after the week that contains the last day of the month is complete
    if (cur > lastDay && cur.getDay() === 1) break
  }

  // Group into weeks of 7
  const weeks: DayCell[][] = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  // Emotions used this month
  const thisMonthStr = `${year}-${String(month + 1).padStart(2, "0")}`
  const monthEmotions = [...new Set(checkIns.filter(c => c.date.startsWith(thisMonthStr)).map(c => c.emotionId))]

  // Stats for this month
  const monthCheckIns = checkIns.filter(c => c.date.startsWith(thisMonthStr))
  const checkedDays = new Set(monthCheckIns.map(c => c.date)).size

  return (
    <div className="flex flex-col gap-4">
      {/* Month header + stats */}
      <div className="flex items-center justify-between">
        <h5 className="text-base font-bold text-foreground">{monthName}</h5>
        <span className="text-xs text-muted-foreground font-medium">
          {checkedDays} / {lastDay.getDate()} days checked in
        </span>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground pb-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex flex-col gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((cell) => {
              const hasEmotion = !!cell.emotionId
              const color = hasEmotion ? getEmotionColor(cell.emotionId!) : undefined

              return (
                <div
                  key={cell.date}
                  title={
                    hasEmotion
                      ? `${cell.date} · ${EMOTION_CATEGORIES.find(c => c.id === cell.emotionId)?.label}`
                      : cell.date
                  }
                  className="flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    height: 36,
                    background: hasEmotion
                      ? color
                      : cell.isCurrentMonth && !cell.isFuture
                      ? "var(--muted)"
                      : "transparent",
                    color: hasEmotion
                      ? "#fff"
                      : cell.isCurrentMonth
                      ? "var(--muted-foreground)"
                      : "transparent",
                    opacity: cell.isCurrentMonth ? (cell.isFuture ? 0.3 : 1) : 0,
                    outline: cell.isToday ? `2px solid var(--primary)` : undefined,
                    outlineOffset: cell.isToday ? "2px" : undefined,
                    boxShadow: hasEmotion ? `0 2px 8px ${color}44` : undefined,
                  }}
                >
                  {cell.isCurrentMonth ? cell.dayNum : ""}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend — only emotions logged this month */}
      {monthEmotions.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-1">
          {monthEmotions.map((eid) => {
            const cat = EMOTION_CATEGORIES.find((c) => c.id === eid)
            if (!cat) return null
            return (
              <div key={eid} className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-md" style={{ background: cat.color }} />
                <span className="text-xs text-muted-foreground">
                  {EMOTION_EMOJI[eid] ?? ""} {cat.label}
                </span>
              </div>
            )
          })}
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-muted" />
            <span className="text-xs text-muted-foreground">No check-in</span>
          </div>
        </div>
      )}
    </div>
  )
}
