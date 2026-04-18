// Supabase sync layer
// localStorage remains the fast source of truth; Supabase is the durable cloud backup.
// Writes on every check-in; reads once at login via hydrateFromSupabase().

import { supabase } from "./supabase"
import { MOMENTS } from "./emotions-data"
import type { CheckIn, GameState } from "./game-store"

export async function syncCheckIn(checkIn: CheckIn, _gameState: GameState): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id
    if (!userId) return

    await supabase.from("mood_entries").insert([{
      user_id: userId,
      emotion: checkIn.emotionId,
      sub_emotion: checkIn.subEmotion,
      intensity: checkIn.intensity,
      context_tags: checkIn.contextTags,
      journal_note: checkIn.journalNote,
      actions_completed: checkIn.actionsCompleted,
      created_at: checkIn.timestamp ?? new Date().toISOString(),
    }])
  } catch (err) {
    console.error("[bhava] syncCheckIn failed:", err)
  }
}

type MoodEntryRow = {
  emotion: string
  sub_emotion: string | null
  intensity: number | null
  context_tags: string[] | null
  journal_note: string | null
  actions_completed: string[] | null
  created_at: string
}

export async function hydrateFromSupabase(userId: string): Promise<GameState | null> {
  try {
    const { data, error } = await supabase
      .from("mood_entries")
      .select("emotion, sub_emotion, intensity, context_tags, journal_note, actions_completed, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[bhava] hydrateFromSupabase failed:", error)
      return null
    }

    const rows = (data ?? []) as MoodEntryRow[]

    const checkIns: CheckIn[] = rows.map((r) => ({
      date: r.created_at.slice(0, 10),
      timestamp: r.created_at,
      emotionId: r.emotion,
      subEmotion: r.sub_emotion ?? "",
      intensity: r.intensity ?? 3,
      actionsCompleted: r.actions_completed ?? [],
      usedCrisisMode: false,
      contextTags: r.context_tags ?? [],
      journalNote: r.journal_note ?? "",
    }))

    const uniqueEmotions = Array.from(new Set(checkIns.map((c) => c.emotionId)))
    const uniqueDays = new Set(checkIns.map((c) => c.date))
    const totalActions = checkIns.reduce((sum, c) => sum + c.actionsCompleted.length, 0)
    const lastCheckInDate = checkIns.length > 0 ? checkIns[checkIns.length - 1].timestamp ?? null : null

    const moments = MOMENTS.map((m) => {
      switch (m.id) {
        case "first-check":       return { ...m, unlocked: checkIns.length >= 1 }
        case "named-ten":         return { ...m, unlocked: checkIns.length >= 10 }
        case "month-showing-up":  return { ...m, unlocked: uniqueDays.size >= 30 }
        default:                  return { ...m }
      }
    })

    return {
      lastCheckInDate,
      checkIns,
      moments,
      uniqueEmotions,
      totalActionsCompleted: totalActions,
      usedCrisisMode: false,
      selectedRegion: null,
    }
  } catch (err) {
    console.error("[bhava] hydrateFromSupabase threw:", err)
    return null
  }
}
