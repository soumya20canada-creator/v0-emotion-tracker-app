// Bhava Daily Reminder — Supabase Edge Function
// Deploy: supabase functions deploy daily-reminder
// Cron: every day at 19:00 UTC via Supabase dashboard → Edge Functions → Schedules
// Schedule expression: 0 19 * * *
//
// Required env vars (same as weekly-reminder):
//   RESEND_API_KEY            — from resend.com
//   RESEND_FROM_EMAIL         — e.g. hello@yourdomain.com (or onboarding@resend.dev for testing)
//   SUPABASE_URL              — your project URL
//   SUPABASE_SERVICE_ROLE_KEY — service role key (NOT the anon key)
//   NEXT_PUBLIC_SITE_URL      — e.g. https://v0-mood-tracker-with-som.vercel.app

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev"
const SITE_URL = Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://bhava.app"

Deno.serve(async () => {
  // Fetch all users with notifications enabled
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, notification_enabled")
    .eq("notification_enabled", true)

  if (error || !profiles) {
    return new Response(JSON.stringify({ error: "Failed to fetch profiles" }), { status: 500 })
  }

  // Today's date range (UTC)
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  let sent = 0

  for (const profile of profiles) {
    // Check if they've already checked in today
    const { data: todayEntries } = await supabase
      .from("mood_entries")
      .select("id")
      .eq("user_id", profile.id)
      .gte("created_at", todayStart.toISOString())
      .limit(1)

    if (todayEntries && todayEntries.length > 0) {
      // Already checked in today — skip
      continue
    }

    const name = profile.display_name || "friend"

    // Get last check-in emotion for personalization
    const { data: lastEntry } = await supabase
      .from("mood_entries")
      .select("emotion, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)

    const lastEmotion = lastEntry?.[0]?.emotion
    const emotionMessages: Record<string, string> = {
      joy: "You were feeling happy last time — keep nurturing that. 🌻",
      sadness: "Last time you were feeling low. You showed up anyway — that takes courage. 🌧️",
      anger: "You were carrying some frustration last time. Let's see where you are today. 🌊",
      fear: "Last time you were feeling anxious. A quick check-in can help you notice if it's shifted. 🌿",
      surprise: "You were feeling a bit scattered last time. How are things sitting today? 🌀",
      calm: "You were feeling calm last time — how are you holding that today? 🌸",
    }
    const personalLine = lastEmotion
      ? (emotionMessages[lastEmotion] ?? "How are you feeling today?")
      : "How are you feeling today?"

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFFDF8;font-family:'Nunito',Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;margin:0;background:linear-gradient(135deg,#C9A84C,#F5D77E,#C9A84C);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Bhava</h1>
      <p style="font-size:11px;color:#94A3B8;letter-spacing:0.15em;margin:4px 0 0;">भाव · the felt sense of being</p>
    </div>

    <p style="font-size:18px;font-weight:700;color:#1E293B;">Hi ${name} 🌸</p>
    <p style="font-size:15px;color:#64748B;line-height:1.6;">
      ${personalLine}
    </p>
    <p style="font-size:15px;color:#64748B;line-height:1.6;margin-top:8px;">
      Your daily check-in takes 30 seconds. It's one of the smallest things you can do for yourself — and one of the most powerful.
    </p>

    <div style="background:#F0F7FF;border-radius:16px;padding:20px;margin:24px 0;">
      <p style="font-size:13px;color:#1E293B;font-style:italic;line-height:1.6;margin:0;">
        "Every feeling you name is a step toward knowing yourself."
      </p>
    </div>

    <div style="text-align:center;margin:32px 0;">
      <a href="${SITE_URL}"
        style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#C9A84C,#F5D77E,#C9A84C);color:#3B1F00;font-weight:700;font-size:15px;border-radius:12px;text-decoration:none;">
        Check in now 🌸
      </a>
    </div>

    <p style="font-size:11px;color:#94A3B8;text-align:center;line-height:1.6;">
      You're receiving this because you opted into daily reminders.<br>
      <a href="${SITE_URL}/unsubscribe?id=${profile.id}" style="color:#94A3B8;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: profile.email,
        subject: `${name}, how are you feeling today? 🌸`,
        html,
      }),
    })

    sent++
  }

  return new Response(JSON.stringify({ sent }), { status: 200 })
})
