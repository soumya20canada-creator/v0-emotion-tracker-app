// Client-side game state management using localStorage for instant UI + Supabase cloud sync
// localStorage is the fast source of truth; Supabase is the durable backup

import { BADGES, type Badge } from "./emotions-data"
import { syncCheckIn } from "./supabase-sync"

export type CheckIn = {
  date: string
  emotionId: string
  subEmotion: string
  intensity: number
  actionsCompleted: string[]
  pointsEarned: number
  usedCrisisMode: boolean
  contextTags: string[]
  journalNote: string
}

export type GameState = {
  totalPoints: number
  currentStreak: number
  longestStreak: number
  lastCheckInDate: string | null
  checkIns: CheckIn[]
  badges: Badge[]
  uniqueEmotions: string[]
  totalActionsCompleted: number
  socialActionsCompleted: number
  bodyActionsCompleted: number
  mindfulActionsCompleted: number
  usedCrisisMode: boolean
  selectedRegion: string | null
}

const STORAGE_KEY = "feels-moves-game-state"

export function getDefaultState(): GameState {
  return {
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCheckInDate: null,
    checkIns: [],
    badges: BADGES.map((b) => ({ ...b })),
    uniqueEmotions: [],
    totalActionsCompleted: 0,
    socialActionsCompleted: 0,
    bodyActionsCompleted: 0,
    mindfulActionsCompleted: 0,
    usedCrisisMode: false,
    selectedRegion: null,
  }
}

export function loadState(): GameState {
  if (typeof window === "undefined") return getDefaultState()
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return getDefaultState()
    const parsed = JSON.parse(stored)
    // Merge with default to handle new badges
    const state = { ...getDefaultState(), ...parsed }
    // Ensure all badges exist
    state.badges = BADGES.map((b) => {
      const existing = parsed.badges?.find((pb: Badge) => pb.id === b.id)
      return existing || { ...b }
    })
    return state
  } catch {
    return getDefaultState()
  }
}

export function saveState(state: GameState): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage full or unavailable
  }
}

function isSameDay(date1: string, date2: string): boolean {
  return date1.slice(0, 10) === date2.slice(0, 10)
}

function isConsecutiveDay(prev: string, current: string): boolean {
  const d1 = new Date(prev)
  const d2 = new Date(current)
  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)
  const diff = d2.getTime() - d1.getTime()
  return diff > 0 && diff <= 86400000 // 1 day in ms
}

export function processCheckIn(
  state: GameState,
  emotionId: string,
  subEmotion: string,
  intensity: number,
  completedActions: { id: string; points: number; category: string }[],
  usedCrisisMode: boolean,
  contextTags: string[] = [],
  journalNote: string = ""
): GameState {
  const now = new Date().toISOString()
  const today = now.slice(0, 10)
  const pointsEarned = completedActions.reduce((sum, a) => sum + a.points, 0)

  // Calculate streak
  let newStreak = state.currentStreak
  if (state.lastCheckInDate) {
    if (isSameDay(state.lastCheckInDate, now)) {
      // Same day, streak stays
    } else if (isConsecutiveDay(state.lastCheckInDate, now)) {
      newStreak += 1
    } else {
      newStreak = 1
    }
  } else {
    newStreak = 1
  }

  const newUniqueEmotions = state.uniqueEmotions.includes(emotionId)
    ? state.uniqueEmotions
    : [...state.uniqueEmotions, emotionId]

  const socialCount =
    state.socialActionsCompleted + completedActions.filter((a) => a.category === "social").length
  const bodyCount =
    state.bodyActionsCompleted + completedActions.filter((a) => a.category === "body").length
  const mindfulCount =
    state.mindfulActionsCompleted + completedActions.filter((a) => a.category === "mindful").length

  const newState: GameState = {
    totalPoints: state.totalPoints + pointsEarned,
    currentStreak: newStreak,
    longestStreak: Math.max(state.longestStreak, newStreak),
    lastCheckInDate: now,
    checkIns: [
      ...state.checkIns,
      {
        date: today,
        emotionId,
        subEmotion,
        intensity,
        actionsCompleted: completedActions.map((a) => a.id),
        pointsEarned,
        usedCrisisMode,
        contextTags,
        journalNote,
      },
    ],
    badges: state.badges,
    uniqueEmotions: newUniqueEmotions,
    totalActionsCompleted: state.totalActionsCompleted + completedActions.length,
    socialActionsCompleted: socialCount,
    bodyActionsCompleted: bodyCount,
    mindfulActionsCompleted: mindfulCount,
    usedCrisisMode: state.usedCrisisMode || usedCrisisMode,
    selectedRegion: state.selectedRegion,
  }

  // Check badge unlocks
  newState.badges = newState.badges.map((badge) => {
    if (badge.unlocked) return badge
    switch (badge.id) {
      case "first-check":
        return { ...badge, unlocked: newState.checkIns.length >= 1 }
      case "explorer":
        return { ...badge, unlocked: newState.uniqueEmotions.length >= 3 }
      case "streak-3":
        return { ...badge, unlocked: newState.currentStreak >= 3 }
      case "streak-7":
        return { ...badge, unlocked: newState.currentStreak >= 7 }
      case "action-hero":
        return { ...badge, unlocked: newState.totalActionsCompleted >= 10 }
      case "all-emotions":
        return { ...badge, unlocked: newState.uniqueEmotions.length >= 6 }
      case "crisis-calm":
        return { ...badge, unlocked: newState.usedCrisisMode }
      case "social-star":
        return { ...badge, unlocked: newState.socialActionsCompleted >= 5 }
      case "body-mover":
        return { ...badge, unlocked: newState.bodyActionsCompleted >= 5 }
      case "points-100":
        return { ...badge, unlocked: newState.totalPoints >= 100 }
      case "points-500":
        return { ...badge, unlocked: newState.totalPoints >= 500 }
      case "mindful-5":
        return { ...badge, unlocked: newState.mindfulActionsCompleted >= 5 }
      default:
        return badge
    }
  })

  saveState(newState)

  // Fire-and-forget Supabase sync (non-blocking)
  const latestCheckIn = newState.checkIns[newState.checkIns.length - 1]
  if (latestCheckIn) {
    syncCheckIn(latestCheckIn, newState).catch(() => {
      // Sync failures are non-critical; localStorage has the data
    })
  }

  return newState
}
