// Per-user client state. localStorage is scoped by user ID.
// On login, state is hydrated from Supabase (source of truth for checkIns + moments).

import { MOMENTS, type Moment } from "./emotions-data"
import { syncCheckIn } from "./supabase-sync"

export type CheckIn = {
  date: string
  timestamp?: string
  emotionId: string
  subEmotion: string
  intensity: number
  actionsCompleted: string[]
  usedCrisisMode: boolean
  contextTags: string[]
  journalNote: string
}

export type GameState = {
  lastCheckInDate: string | null
  checkIns: CheckIn[]
  moments: Moment[]
  uniqueEmotions: string[]
  totalActionsCompleted: number
  usedCrisisMode: boolean
  selectedRegion: string | null
}

function storageKey(userId: string): string {
  return `bhava-state:${userId}`
}

export function getDailyGoal(checkIns: CheckIn[]): { target: number; done: number; label: string } {
  const today = new Date().toISOString().slice(0, 10)
  const todayCount = checkIns.filter((c) => c.date === today).length
  return { target: 1, done: todayCount, label: "Check in with yourself today" }
}

// Days since the most recent check-in. 0 = today, 1 = yesterday, etc.
export function daysSinceLastCheckIn(state: GameState): number | null {
  if (!state.lastCheckInDate) return null
  const last = new Date(state.lastCheckInDate)
  const now = new Date()
  const ms = now.setHours(0, 0, 0, 0) - last.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor(ms / 86400000))
}

// Longest run of consecutive days with at least one check-in.
export function longestStreak(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0
  const days = Array.from(new Set(checkIns.map((c) => c.date))).sort()
  let best = 1
  let cur = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]).getTime()
    const next = new Date(days[i]).getTime()
    if (next - prev === 86400000) {
      cur += 1
      best = Math.max(best, cur)
    } else {
      cur = 1
    }
  }
  return best
}

export function getDefaultState(): GameState {
  return {
    lastCheckInDate: null,
    checkIns: [],
    moments: MOMENTS.map((m) => ({ ...m })),
    uniqueEmotions: [],
    totalActionsCompleted: 0,
    usedCrisisMode: false,
    selectedRegion: null,
  }
}

export function loadState(userId: string): GameState {
  if (typeof window === "undefined") return getDefaultState()
  try {
    const stored = localStorage.getItem(storageKey(userId))
    if (!stored) return getDefaultState()
    const parsed = JSON.parse(stored)
    const state = { ...getDefaultState(), ...parsed }
    state.moments = MOMENTS.map((m) => {
      const existing = parsed.moments?.find((pm: Moment) => pm.id === m.id)
      return existing ?? { ...m }
    })
    return state
  } catch {
    return getDefaultState()
  }
}

export function saveState(state: GameState, userId: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(state))
  } catch {
    // localStorage full or unavailable
  }
}

export function clearState(userId: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(storageKey(userId))
  } catch {
    // noop
  }
}

// Remove any legacy unscoped key that might carry data from another user
export function clearLegacyState(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem("bhava-game-state")
  } catch {
    // noop
  }
}

export function processCheckIn(
  state: GameState,
  emotionId: string,
  subEmotion: string,
  intensity: number,
  completedActions: { id: string; category: string }[],
  usedCrisisMode: boolean,
  contextTags: string[] = [],
  journalNote: string = "",
  userId?: string
): GameState {
  const now = new Date().toISOString()
  const today = now.slice(0, 10)

  const newUniqueEmotions = state.uniqueEmotions.includes(emotionId)
    ? state.uniqueEmotions
    : [...state.uniqueEmotions, emotionId]

  const newCheckIn: CheckIn = {
    date: today,
    timestamp: now,
    emotionId,
    subEmotion,
    intensity,
    actionsCompleted: completedActions.map((a) => a.id),
    usedCrisisMode,
    contextTags,
    journalNote,
  }

  // Session merge: if the last check-in is clearly the same in-progress session
  // (same date + emotion + intensity + subEmotion, logged within the last 15
  // minutes), update it in place instead of appending a new row. Stops the
  // weekly breakdown from double-counting when a user confirms intensity and
  // then completes actions — both paths call processCheckIn.
  const last = state.checkIns[state.checkIns.length - 1]
  const SESSION_WINDOW_MS = 15 * 60 * 1000
  let mergedCheckIns: CheckIn[]
  let actionDelta = completedActions.length
  if (
    last &&
    last.date === today &&
    last.emotionId === emotionId &&
    last.intensity === intensity &&
    last.subEmotion === subEmotion &&
    last.timestamp &&
    Date.now() - new Date(last.timestamp).getTime() < SESSION_WINDOW_MS
  ) {
    const mergedActions = Array.from(new Set([...last.actionsCompleted, ...newCheckIn.actionsCompleted]))
    actionDelta = mergedActions.length - last.actionsCompleted.length
    const merged: CheckIn = {
      ...last,
      timestamp: now,
      actionsCompleted: mergedActions,
      usedCrisisMode: last.usedCrisisMode || usedCrisisMode,
      contextTags: Array.from(new Set([...last.contextTags, ...contextTags])),
      journalNote: journalNote || last.journalNote,
    }
    mergedCheckIns = [...state.checkIns.slice(0, -1), merged]
  } else {
    mergedCheckIns = [...state.checkIns, newCheckIn]
  }

  const newState: GameState = {
    lastCheckInDate: now,
    checkIns: mergedCheckIns,
    moments: state.moments,
    uniqueEmotions: newUniqueEmotions,
    totalActionsCompleted: state.totalActionsCompleted + actionDelta,
    usedCrisisMode: state.usedCrisisMode || usedCrisisMode,
    selectedRegion: state.selectedRegion,
  }

  // Soft moment unlocks — gentle markers, not achievements
  const allDays = new Set(newState.checkIns.map((c) => c.date))
  const currentStreak = longestStreak(newState.checkIns)
  const journaledCount = newState.checkIns.filter((c) => c.journalNote && c.journalNote.trim().length > 0).length
  const immigrationCount = newState.checkIns.filter((c) =>
    c.contextTags.some((t) => t === "immigration" || t === "homesick" || t === "cultural-pressure" || t === "language")
  ).length

  newState.moments = newState.moments.map((m) => {
    if (m.unlocked) return m
    switch (m.id) {
      case "first-check":
        return { ...m, unlocked: newState.checkIns.length >= 1 }
      case "named-ten":
        return { ...m, unlocked: newState.checkIns.length >= 10 }
      case "month-showing-up":
        return { ...m, unlocked: allDays.size >= 30 }
      case "five-actions":
        return { ...m, unlocked: newState.totalActionsCompleted >= 5 }
      case "reached-for-help":
        return { ...m, unlocked: newState.usedCrisisMode }
      case "three-emotions":
        return { ...m, unlocked: newState.uniqueEmotions.length >= 3 }
      case "week-streak":
        return { ...m, unlocked: currentStreak >= 7 }
      case "written-it-out":
        return { ...m, unlocked: journaledCount >= 3 }
      case "named-the-journey":
        return { ...m, unlocked: immigrationCount >= 1 }
      case "full-range":
        return { ...m, unlocked: newState.uniqueEmotions.length >= 6 }
      default:
        return m
    }
  })

  if (userId) {
    saveState(newState, userId)
    syncCheckIn(newCheckIn, newState).catch(() => {
      // sync failures are non-critical
    })
  }

  return newState
}

// Wellbeing score per emotion (1–5 scale, 5 = highest wellbeing)
const MOOD_SCORES: Record<string, number> = {
  joy: 5, calm: 5,
  surprise: 3,
  sadness: 2, fear: 2,
  anger: 1,
}

export function getMoodScore(emotionId: string): number {
  return MOOD_SCORES[emotionId] ?? 3
}

export type MoodTrend = {
  thisWeek: number
  lastWeek: number
  thisMonth: number
  lastMonth: number
  weekDelta: number
  monthDelta: number
}

export function getMoodTrend(checkIns: CheckIn[]): MoodTrend | null {
  if (checkIns.length < 3) return null
  const now = Date.now()
  const DAY = 86400000

  function avgScore(items: CheckIn[]): number {
    if (items.length === 0) return 0
    const avg = items.reduce((sum, c) => sum + (MOOD_SCORES[c.emotionId] ?? 3), 0) / items.length
    return Math.round(avg * 20)
  }

  const thisWeekItems  = checkIns.filter(c => now - new Date(c.date).getTime() <= 7  * DAY)
  const lastWeekItems  = checkIns.filter(c => { const d = now - new Date(c.date).getTime(); return d > 7 * DAY && d <= 14 * DAY })
  const thisMonthItems = checkIns.filter(c => now - new Date(c.date).getTime() <= 30 * DAY)
  const lastMonthItems = checkIns.filter(c => { const d = now - new Date(c.date).getTime(); return d > 30 * DAY && d <= 60 * DAY })

  const thisWeek  = avgScore(thisWeekItems)
  const lastWeek  = avgScore(lastWeekItems)
  const thisMonth = avgScore(thisMonthItems)
  const lastMonth = avgScore(lastMonthItems)

  const weekDelta  = lastWeek  > 0 ? Math.round((thisWeek  - lastWeek)  / lastWeek  * 100) : 0
  const monthDelta = lastMonth > 0 ? Math.round((thisMonth - lastMonth) / lastMonth * 100) : 0

  return { thisWeek, lastWeek, thisMonth, lastMonth, weekDelta, monthDelta }
}
