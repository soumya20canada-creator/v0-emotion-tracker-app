// Supabase sync layer
// Syncs local game state to the remote Supabase backend (app_users, mood_entries, badge_progress)
// localStorage remains the fast source of truth; Supabase is the durable cloud backup

import { supabase } from "./supabase"
import type { CheckIn, GameState } from "./game-store"

const USER_ID_KEY = "bhava_user_id"

// --- Anonymous user management ---

export async function getOrCreateUser(): Promise<string | null> {
  if (typeof window === "undefined") return null
  try {
    let userId = localStorage.getItem(USER_ID_KEY)
    if (userId) {
      // Touch last_active
      await supabase
        .from("app_users")
        .update({ last_active: new Date().toISOString() })
        .eq("id", userId)
      return userId
    }

    const { data, error } = await supabase
      .from("app_users")
      .insert([{ streak_count: 0, last_active: new Date().toISOString() }])
      .select("id")
      .single()

    if (error || !data) {
      console.error("[v0] Error creating Supabase user:", error)
      return null
    }

    userId = data.id as string
    localStorage.setItem(USER_ID_KEY, userId)
    return userId
  } catch (err) {
    console.error("[v0] Supabase getOrCreateUser failed:", err)
    return null
  }
}

// --- Sync a single check-in to Supabase ---

export async function syncCheckIn(
  checkIn: CheckIn,
  gameState: GameState
): Promise<void> {
  try {
    const userId = await getOrCreateUser()
    if (!userId) return

    // 1. Insert mood entry
    await supabase.from("mood_entries").insert([
      {
        user_id: userId,
        emotion: checkIn.emotionId,
        intensity: checkIn.intensity,
        created_at: new Date().toISOString(),
      },
    ])

    // 2. Update streak on app_users
    await supabase
      .from("app_users")
      .update({
        streak_count: gameState.currentStreak,
        last_active: new Date().toISOString(),
      })
      .eq("id", userId)

    // 3. Sync badges
    await syncBadges(userId, gameState)
  } catch (err) {
    // Non-blocking: local state is the source of truth
    console.error("[v0] Supabase syncCheckIn failed:", err)
  }
}

// --- Sync badges to Supabase ---

async function syncBadges(userId: string, gameState: GameState): Promise<void> {
  try {
    const unlockedBadges = gameState.badges.filter((b) => b.unlocked)
    if (unlockedBadges.length === 0) return

    // Get existing badges from Supabase
    const { data: existing } = await supabase
      .from("badge_progress")
      .select("badge_name")
      .eq("user_id", userId)

    const existingNames = new Set((existing || []).map((b: { badge_name: string }) => b.badge_name))

    // Insert any new badges
    const newBadges = unlockedBadges
      .filter((b) => !existingNames.has(b.name))
      .map((b) => ({
        user_id: userId,
        badge_name: b.name,
        level: 1,
      }))

    if (newBadges.length > 0) {
      await supabase.from("badge_progress").insert(newBadges)
    }
  } catch (err) {
    console.error("[v0] Supabase syncBadges failed:", err)
  }
}

// --- Fetch backend stats (for future dashboard use) ---

export async function getBackendStats(): Promise<{
  totalUsers: number
  totalMoods: number
} | null> {
  try {
    const { count: totalUsers } = await supabase
      .from("app_users")
      .select("id", { count: "exact", head: true })

    const { count: totalMoods } = await supabase
      .from("mood_entries")
      .select("id", { count: "exact", head: true })

    return {
      totalUsers: totalUsers || 0,
      totalMoods: totalMoods || 0,
    }
  } catch {
    return null
  }
}
