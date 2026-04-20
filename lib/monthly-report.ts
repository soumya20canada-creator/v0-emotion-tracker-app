// Monthly report aggregator. Pure — no side effects, no storage.
// Input: check-ins array + month-start Date. Output: a small readable summary.

import type { CheckIn } from "./game-store"
import { EMOTION_CATEGORIES } from "./emotions-data"

export type PeakTimeOfDay = "morning" | "afternoon" | "evening" | "night"

export type MonthlyReport = {
  monthKey: string
  monthLabel: string
  totalCheckIns: number
  daysActive: number
  topEmotions: { emotionId: string; label: string; count: number }[]
  peakDayOfWeek: string | null
  peakTimeOfDay: PeakTimeOfDay | null
  topContextTags: { tag: string; count: number }[]
  actionsCompleted: number
  crisisModeUsed: number
  averageIntensity: number | null
  journalEntryCount: number
  narrative: string
}

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const DOW_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function monthKey(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  return `${y}-${m}`
}

export function previousMonthStart(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth() - 1, 1)
}

function emotionLabel(emotionId: string): string {
  return EMOTION_CATEGORIES.find((e) => e.id === emotionId)?.label ?? emotionId
}

function bucketTime(hour: number): PeakTimeOfDay {
  if (hour < 6) return "night"
  if (hour < 12) return "morning"
  if (hour < 17) return "afternoon"
  if (hour < 21) return "evening"
  return "night"
}

function parseCheckInDate(c: CheckIn): Date {
  if (c.timestamp) return new Date(c.timestamp)
  return new Date(`${c.date}T00:00:00`)
}

function topN<T extends string>(counts: Record<T, number>, n: number): { key: T; count: number }[] {
  return (Object.entries(counts) as [T, number][])
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
}

export function generateMonthlyReport(checkIns: CheckIn[], monthStart: Date): MonthlyReport {
  const start = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1)
  const end = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)

  const inMonth = checkIns.filter((c) => {
    const d = parseCheckInDate(c)
    return d >= start && d < end
  })

  const key = monthKey(start)
  const label = `${MONTH_LABELS[start.getMonth()]} ${start.getFullYear()}`

  if (inMonth.length === 0) {
    return {
      monthKey: key,
      monthLabel: label,
      totalCheckIns: 0,
      daysActive: 0,
      topEmotions: [],
      peakDayOfWeek: null,
      peakTimeOfDay: null,
      topContextTags: [],
      actionsCompleted: 0,
      crisisModeUsed: 0,
      averageIntensity: null,
      journalEntryCount: 0,
      narrative: `No check-ins in ${label}. That's okay — some months are quiet.`,
    }
  }

  const emotionCounts: Record<string, number> = {}
  const tagCounts: Record<string, number> = {}
  const dowCounts: number[] = [0, 0, 0, 0, 0, 0, 0]
  const todCounts: Record<PeakTimeOfDay, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 }
  const uniqueDays = new Set<string>()
  let actionsCompleted = 0
  let crisisModeUsed = 0
  let intensitySum = 0
  let journalEntryCount = 0

  for (const c of inMonth) {
    emotionCounts[c.emotionId] = (emotionCounts[c.emotionId] ?? 0) + 1
    uniqueDays.add(c.date)
    actionsCompleted += c.actionsCompleted?.length ?? 0
    if (c.usedCrisisMode) crisisModeUsed += 1
    intensitySum += c.intensity
    if (c.journalNote && c.journalNote.trim().length > 0) journalEntryCount += 1
    for (const tag of c.contextTags ?? []) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1
    }
    const d = parseCheckInDate(c)
    dowCounts[d.getDay()] += 1
    todCounts[bucketTime(d.getHours())] += 1
  }

  const topEmotions = topN(emotionCounts, 3).map(({ key, count }) => ({
    emotionId: key,
    label: emotionLabel(key),
    count,
  }))

  const topContextTags = topN(tagCounts, 3).map(({ key, count }) => ({ tag: key, count }))

  let peakDayOfWeek: string | null = null
  {
    const maxIdx = dowCounts.indexOf(Math.max(...dowCounts))
    if (dowCounts[maxIdx] > 0) peakDayOfWeek = DOW_LABELS[maxIdx]
  }

  let peakTimeOfDay: PeakTimeOfDay | null = null
  {
    const entries = Object.entries(todCounts) as [PeakTimeOfDay, number][]
    entries.sort((a, b) => b[1] - a[1])
    if (entries[0][1] > 0) peakTimeOfDay = entries[0][0]
  }

  const averageIntensity = Math.round((intensitySum / inMonth.length) * 10) / 10
  const daysActive = uniqueDays.size

  const parts: string[] = []
  parts.push(
    `You checked in ${inMonth.length} ${inMonth.length === 1 ? "time" : "times"} across ${daysActive} ${daysActive === 1 ? "day" : "days"}.`
  )
  if (topEmotions[0]) {
    parts.push(`The feeling that came up most was ${topEmotions[0].label.toLowerCase()}.`)
  }
  if (peakDayOfWeek && peakTimeOfDay) {
    parts.push(`It tended to arrive on ${peakDayOfWeek}s, especially in the ${peakTimeOfDay}.`)
  } else if (peakDayOfWeek) {
    parts.push(`It showed up most on ${peakDayOfWeek}s.`)
  } else if (peakTimeOfDay) {
    parts.push(`${peakTimeOfDay[0].toUpperCase()}${peakTimeOfDay.slice(1)}s tended to be the heaviest.`)
  }
  if (actionsCompleted > 0) {
    parts.push(`You reached for something that might help ${actionsCompleted} ${actionsCompleted === 1 ? "time" : "times"}.`)
  }
  if (journalEntryCount >= 3) {
    parts.push(`You wrote it down ${journalEntryCount} times — that counts.`)
  }

  return {
    monthKey: key,
    monthLabel: label,
    totalCheckIns: inMonth.length,
    daysActive,
    topEmotions,
    peakDayOfWeek,
    peakTimeOfDay,
    topContextTags,
    actionsCompleted,
    crisisModeUsed,
    averageIntensity,
    journalEntryCount,
    narrative: parts.join(" "),
  }
}
