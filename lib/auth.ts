import { supabase } from "./supabase"
import type { User, Session } from "@supabase/supabase-js"

export type { User, Session }

export async function signUpWithPassword(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { user: data.user ?? null, error: error?.message ?? null }
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data.user ?? null, error: error?.message ?? null }
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/` : undefined
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  })
  return { error: error?.message ?? null }
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function resetPassword(email: string): Promise<{ error: string | null }> {
  const redirectTo = typeof window !== "undefined" ? window.location.origin : ""
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  return { error: error?.message ?? null }
}

export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return { error: error?.message ?? null }
}

export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => data.subscription.unsubscribe()
}

export function onPasswordRecovery(callback: () => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") callback()
  })
  return () => data.subscription.unsubscribe()
}
