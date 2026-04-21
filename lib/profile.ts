import { supabase } from "./supabase"
import type { OnboardingSession } from "./onboarding-data"

export type Profile = {
  id: string
  email: string
  username: string | null
  display_name: string | null
  first_name: string | null
  color_theme: string
  avatar_emoji: string
  notification_enabled: boolean
  report_weekly: boolean
  report_monthly: boolean
  country: string | null
  identity_selections: string[]
  gender_identity: string[]
  pronouns: string | null
  language: string
  onboarding_completed: boolean
  favorite_therapist_ids?: string[]
  favorite_community_ids?: string[]
  created_at: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  if (error || !data) return null
  return {
    ...data,
    identity_selections: data.identity_selections ?? [],
    gender_identity: data.gender_identity ?? [],
    language: data.language ?? "en",
    onboarding_completed: data.onboarding_completed ?? false,
  } as Profile
}

export async function createProfile(
  userId: string,
  email: string,
  firstName: string,
  username?: string
): Promise<Profile | null> {
  const safeUsername = username ?? firstName.toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Math.random().toString(36).slice(2, 6)
  const { data, error } = await supabase
    .from("profiles")
    .insert([{
      id: userId,
      email,
      username: safeUsername,
      display_name: firstName,
      first_name: firstName,
      color_theme: "default",
      avatar_emoji: "🌸",
      notification_enabled: true,
      report_weekly: false,
      report_monthly: false,
      country: null,
      identity_selections: [],
      gender_identity: [],
      pronouns: null,
      language: "en",
      onboarding_completed: false,
    }])
    .select()
    .single()
  if (error || !data) return null
  return {
    ...data,
    identity_selections: data.identity_selections ?? [],
    gender_identity: data.gender_identity ?? [],
    language: data.language ?? "en",
    onboarding_completed: data.onboarding_completed ?? false,
  } as Profile
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, "id" | "email" | "created_at">>
): Promise<void> {
  await supabase.from("profiles").update(updates).eq("id", userId)
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle()
  return !!data
}

export async function saveOnboardingSession(
  userId: string,
  session: Omit<OnboardingSession, "id" | "user_id" | "created_at">
): Promise<void> {
  await supabase.from("onboarding_sessions").insert([{ user_id: userId, ...session }])
}

export async function getOnboardingSessions(userId: string): Promise<OnboardingSession[]> {
  const { data } = await supabase
    .from("onboarding_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  return (data ?? []) as OnboardingSession[]
}

export async function deleteAccount(userId: string): Promise<{ error: string | null }> {
  try {
    await supabase.from("onboarding_sessions").delete().eq("user_id", userId)
    await supabase.from("profiles").delete().eq("id", userId)
    await supabase.auth.signOut()
    return { error: null }
  } catch {
    return { error: "Could not delete account. Please contact support." }
  }
}
