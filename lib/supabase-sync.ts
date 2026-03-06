// Supabase sync layer
// localStorage remains the fast source of truth; Supabase is the durable cloud backup
// Uses authenticated user IDs from Supabase Auth

import { supabase } from "./supabase"
import type { CheckIn, GameState } from "./game-store"

async function getAuthUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export async function syncCheckIn(checkIn: CheckIn, gameState: GameState): Promise<void> {
  try {
    const userId = await getAuthUserId()
    if (!userId) return

    await supabase.from("mood_entries").insert([{
      user_id: userId,
      emotion: checkIn.emotionId,
      sub_emotion: checkIn.subEmotion,
      intensity: checkIn.intensity,
      context_tags: checkIn.contextTags,
      journal_note: checkIn.journalNote,
      actions_completed: checkIn.actionsCompleted,
      points_earned: checkIn.pointsEarned,
      created_at: new Date().toISOString(),
    }])

    await supabase.from("app_users")
      .upsert({ id: userId, streak_count: gameState.currentStreak, last_active: new Date().toISOString() })
      .eq("id", userId)

    await syncBadges(userId, gameState)
  } catch (err) {
    console.error("[bhava] syncCheckIn failed:", err)
  }
}

async function syncBadges(userId: string, gameState: GameState): Promise<void> {
  try {
    const unlockedBadges = gameState.badges.filter((b) => b.unlocked)
    if (unlockedBadges.length === 0) return
    const { data: existing } = await supabase
      .from("badge_progress")
      .select("badge_name")
      .eq("user_id", userId)
    const existingNames = new Set((existing || []).map((b: { badge_name: string }) => b.badge_name))
    const newBadges = unlockedBadges
      .filter((b) => !existingNames.has(b.name))
      .map((b) => ({ user_id: userId, badge_name: b.name, level: 1 }))
    if (newBadges.length > 0) {
      await supabase.from("badge_progress").insert(newBadges)
    }
  } catch (err) {
    console.error("[bhava] syncBadges failed:", err)
  }
}
