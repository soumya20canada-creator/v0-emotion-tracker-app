// Bhava Weekly Reminder — Supabase Edge Function
// Deploy: supabase functions deploy weekly-reminder
// Cron: every Monday at 9am UTC via Supabase dashboard → Edge Functions → Schedules
//
// Required env vars (set in Supabase Dashboard → Settings → Edge Functions):
//   RESEND_API_KEY     — from resend.com
//   RESEND_FROM_EMAIL  — e.g. hello@yourdomain.com (or onboarding@resend.dev for testing)
//   SUPABASE_URL       — your project URL
//   SUPABASE_SERVICE_ROLE_KEY — service role key (NOT the anon key)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev"

Deno.serve(async () => {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, notification_enabled")
    .eq("notification_enabled", true)

  if (error || !profiles) {
    return new Response(JSON.stringify({ error: "Failed to fetch profiles" }), { status: 500 })
  }

  let sent = 0

  for (const profile of profiles) {
    const name = profile.display_name || "friend"

    const { data: moodEntries } = await supabase
      .from("mood_entries")
      .select("emotion, created_at")
      .eq("user_id", profile.id)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const checkInCount = moodEntries?.length ?? 0

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
      ${checkInCount > 0
        ? `You checked in with yourself ${checkInCount} time${checkInCount !== 1 ? "s" : ""} this week. That's you showing up for yourself — and that's everything.`
        : `We noticed you haven't checked in this week. That's okay — life gets full. Whenever you're ready, Bhava is here.`}
    </p>

    <div style="background:#F0F7FF;border-radius:16px;padding:20px;margin:24px 0;">
      <p style="font-size:13px;color:#1E293B;font-style:italic;line-height:1.6;margin:0;">
        "Every feeling you name is a step toward knowing yourself."
      </p>
    </div>

    <div style="background:#F0FFF4;border-radius:16px;padding:16px;margin:16px 0;">
      <p style="font-size:13px;font-weight:700;color:#1E293B;margin:0 0 8px;">This week, try this:</p>
      <p style="font-size:13px;color:#374151;margin:0;line-height:1.6;">
        ${checkInCount > 0
          ? "Take 5 minutes today for box breathing: inhale 4 counts, hold 4, exhale 4, hold 4. It's one of the fastest ways to regulate your nervous system."
          : "Even a 2-minute check-in this week can help you notice patterns in how you feel. No pressure — just curiosity."}
      </p>
    </div>

    <div style="text-align:center;margin:32px 0;">
      <a href="${Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://bhava.app"}"
        style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#C9A84C,#F5D77E,#C9A84C);color:#3B1F00;font-weight:700;font-size:15px;border-radius:12px;text-decoration:none;">
        Come back to yourself 🌸
      </a>
    </div>

    <p style="font-size:12px;color:#94A3B8;text-align:center;line-height:1.6;">
      You're receiving this because you opted into weekly reminders.<br>
      <a href="${Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://bhava.app"}/unsubscribe?id=${profile.id}" style="color:#94A3B8;">Unsubscribe</a>
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
        subject: `${name}, your emotional journey continues 🌸`,
        html,
      }),
    })

    sent++
  }

  return new Response(JSON.stringify({ sent }), { status: 200 })
})
