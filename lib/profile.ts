import { supabase } from "./supabase"

export type Profile = {
  id: string
  email: string
  username: string | null
  display_name: string | null
  color_theme: string
  avatar_emoji: string
  notification_enabled: boolean
  report_weekly: boolean
  report_monthly: boolean
  created_at: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  if (error || !data) return null
  return data as Profile
}

export async function createProfile(
  userId: string,
  email: string,
  username: string,
  displayName: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .insert([{
      id: userId,
      email,
      username,
      display_name: displayName,
      color_theme: "default",
      avatar_emoji: "🌸",
      notification_enabled: true,
      report_weekly: false,
      report_monthly: false,
    }])
    .select()
    .single()
  if (error || !data) return null
  return data as Profile
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
