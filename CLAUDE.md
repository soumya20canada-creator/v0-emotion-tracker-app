# Bhava — Emotional Wellness Check-In App

A mobile-first SPA for logging emotions, getting research-backed coping actions, and tracking mood patterns over time.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16.1.6 (App Router, CSR) |
| Language | TypeScript 5.7.3 (strict mode) |
| Styling | Tailwind CSS v4.1.9 (PostCSS, no config file) |
| UI Icons | lucide-react 0.564.0 |
| Auth + DB | Supabase (@supabase/supabase-js ^2.49.0) |
| Hosting | Vercel (auto-deploy on git push to main) |
| Email | Resend API (via Supabase Edge Functions) |
| Analytics | @vercel/analytics 1.6.1 |
| Package manager | pnpm 10.30.3 |

**Fonts:** DM Sans (body, weights 300/400/500) · Cormorant Garamond (display/logo, weights 400/500/600)

---

## Project Structure

```
app/
  layout.tsx       Root layout — fonts, analytics, metadata, viewport
  page.tsx         Main SPA component (CSR, ~672 lines) — all screen state lives here

components/        23 client components
  auth-gate.tsx          Full auth flow (signup, signin, profile setup, forgot password)
  emotion-wheel.tsx      6 emotion buttons, color-coded
  sub-emotion-picker.tsx Multi-select sub-emotions
  emotion-describe.tsx   Optional journal note input
  context-tag-picker.tsx Multi-select 14 context tags
  intensity-slider.tsx   1–5 scale with emoji bubbles, crisis warning at 4+
  action-cards.tsx       3–5 shuffled micro-actions with checkboxes
  crisis-games.tsx       Grounding exercises (breathing, butterfly taps, cold water)
  crisis-resources.tsx   Region-specific helplines + support groups
  progress-tracker.tsx   Level card, streaks, weekly breakdown, mood trend
  mood-calendar.tsx      16-week GitHub-style heatmap
  badges-page.tsx        13 achievement badges
  patterns-page.tsx      Peak day/time per emotion
  music-player.tsx       Ambient music per emotion (Spotify embeds)
  nav-bar.tsx            Bottom nav: Home, Journey, Badges, Patterns
  theme-picker.tsx       10 theme cards (5 light, 5 dark)
  theme-toggle.tsx       Quick dark/light toggle
  badge-popup.tsx        Unlock modal
  point-popup.tsx        Floating "+X pts" animation
  how-it-works.tsx       Onboarding modal
  onboarding-tooltips.tsx First-login feature highlights
  location-picker.tsx    Region selector (for crisis resources)
  app-logo.tsx           Lotus icon

lib/
  auth.ts               Supabase auth helpers (no OTP/magic links — email+password only)
  supabase.ts           Client init (storageKey: "bhava-auth", autoRefreshToken)
  supabase-sync.ts      Async cloud sync — localStorage is source of truth, Supabase is backup
  profile.ts            getProfile / createProfile / updateProfile / isUsernameTaken
  game-store.ts         All game state: points, streaks, badges, check-ins (localStorage)
  emotions-data.ts      6 emotions, 30+ sub-emotions, 200+ micro-actions, 13 badges
  themes.ts             10 themes with 17 CSS variables each; applyTheme() sets root vars
  context-tags.ts       14 context tags (school, work, family, immigration, etc.)
  crisis-resources.ts   Crisis helplines for 10+ regions
  journal-suggestions.ts Smart suggestions based on keywords in journal note
  utils.ts              cn() — twMerge + clsx

supabase/functions/
  daily-reminder/       Cron 19:00 UTC — email users who haven't checked in today
  weekly-reminder/      Cron Monday 9am UTC — weekly recap email
```

---

## Screen Flow (all within app/page.tsx)

```
[auth check] → AuthGate (if not logged in)
     ↓
home → describe → sub-emotion → context → intensity → actions → (crisis if intensity ≥ 4)
                                                          ↓
                                              "Track your journey" or "Come back to yourself"
                                              → resets to home

Tabs (NavBar): home · progress (Journey) · badges · patterns
```

---

## Features

### Working
- Email + password auth (mailer_autoconfirm enabled, no OTP)
- Forgot password → email link → PasswordResetModal flow
- Profile: display name, username, avatar emoji, theme preference
- Emotion wheel (6 categories based on Plutchik's wheel)
- Sub-emotion multi-select (30+ sub-emotions)
- Optional journal note with smart keyword suggestions
- 14 context tags (includes immigrant-specific: immigration, homesick, cultural-pressure, language-barrier)
- Intensity slider 1–5 with emoji bubbles
- 200+ micro-actions (CBT/DBT/ACT/EMDR backed, 5 categories: body, social, creative, mindful, fun)
- Points system (5–40 pts per action, 25 bonus for crisis toolkit)
- Streak tracking + longest streak
- 13 achievement badges with auto-unlock logic
- 5 progression levels: Seedling → Sprout → Bloom → Garden → Forest
- 16-week mood calendar (GitHub heatmap style)
- Weekly emoji mood breakdown (last 7 days)
- Mood trend score (this week vs last week, 1–100 scale)
- Per-emotion patterns (peak day of week + time of day)
- Crisis grounding games (breathing, butterfly taps, ice, cold water)
- Crisis helplines for 10+ regions (US, UK, Canada, Australia, India, Germany, Philippines, Mexico, Nigeria, Global)
- Location picker for region-specific crisis resources
- 10 color themes (5 light, 5 dark) — applied via CSS variables at runtime, saved to profile
- Ambient music player per emotion
- "How it works" onboarding modal
- First-login onboarding tooltips
- Daily + weekly email reminders (Supabase Edge Functions + Resend)
- Vercel Analytics
- localStorage + Supabase cloud sync (async, non-blocking)

### Not Started / Incomplete
- No social/sharing features
- No export of mood data
- No notifications (push/in-app) — only email reminders
- Supabase DB schema/migrations not in source control

---

## External Services

| Service | Purpose | Config |
|---|---|---|
| Supabase | Auth + database | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY |
| Supabase Edge Functions | Cron email reminders | RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL |
| Resend | Email delivery | Used only in Edge Functions |
| Vercel | Hosting + analytics | git push to main → auto-deploy |
| Google Fonts | DM Sans + Cormorant Garamond | next/font/google in layout.tsx |

**Supabase DB tables (inferred from code):** `profiles`, `mood_entries`, `app_users`, `badge_progress`

---

## Design System

**Emotion Colors (fixed across all themes):**
- Joy: #F59E0B · Sadness: #3B82F6 · Anger: #EF4444 · Fear: #10B981 · Surprise: #F97316 · Calm: #8B5CF6

**Themes (10 total):**
- Light: default (blue), ocean (cyan), forest (green), sunset (orange), lavender (purple)
- Dark: midnight (indigo), nebula (violet), ember (orange), aurora (teal), rose-noir (pink)

**Styling approach:**
- 100% Tailwind CSS, no CSS-in-JS
- Theme CSS variables: --background, --foreground, --card, --primary, --secondary, --muted, --accent, --border, --input, --ring
- OKLch color space in globals.css
- Mobile-first, max content width ~430px, tested on <768px
- Border radius: 2xl/3xl (rounded, friendly)
- Shadows use emotion color at 44% opacity, backgrounds at 15% opacity

---

## Rules / Always Follow

1. **SPA pattern** — All routing is screen state in `page.tsx`. No new Next.js routes/pages.
2. **No OTP or magic links** — Auth is email + password only. `mailer_autoconfirm: true` in Supabase.
3. **localStorage first** — `game-store.ts` reads/writes localStorage. Supabase sync is async backup, never blocking.
4. **Tailwind only** — No inline styles except for dynamic values (emotion colors, CSS variable overrides). Use `cn()` from `lib/utils.ts`.
5. **Theme via CSS variables** — Call `applyTheme(id)` from `lib/themes.ts` to switch themes. Never hardcode colors in new components.
6. **Verify build before push** — Run `npx next build` in `/project`. Deploy via `git push` (no Vercel CLI).
7. **Mobile-first** — Design for <430px first. Use `useIsMobile()` hook if needed.
8. **Keep state in page.tsx** — Don't create new state management layers. Pass callbacks down to components.
9. **Concise responses** — User prefers short, direct communication. No summaries of what was done.
10. **No unnecessary files** — Edit existing files, don't create new ones unless clearly needed.
