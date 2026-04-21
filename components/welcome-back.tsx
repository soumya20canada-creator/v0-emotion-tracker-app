"use client"

import { AppLogo } from "@/components/app-logo"
import { ThemeHeader } from "@/components/theme-header"
import { PronunciationGuide } from "@/components/pronunciation-guide"
import { taglineFor } from "@/lib/cultural-taglines"
import { Sparkles } from "lucide-react"

type WelcomeBackProps = {
  firstName: string
  avatarEmoji?: string
  country?: string | null
  regionLabel?: string | null
  daysSinceLastCheckIn: number | null
  onReady: () => void
  onSkip: () => void
}

function timeAgoPhrase(days: number | null): string {
  if (days === null) return "It's good to see you again."
  if (days === 0) return "You're back again today — that's care, not a chore."
  if (days === 1) return "It's been a day. Welcome back."
  if (days < 7) return `It's been ${days} days. No pressure — take a breath.`
  if (days < 30) return `It's been a couple of weeks. You're here now. That's enough.`
  return "It's been a while. I'm glad you came back."
}

export function WelcomeBack({ firstName, avatarEmoji, country, regionLabel, daysSinceLastCheckIn, onReady, onSkip }: WelcomeBackProps) {
  const tagline = taglineFor(country, regionLabel)
  return (
    <main className="min-h-dvh bg-background flex flex-col">
      <ThemeHeader />
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center px-5 py-3 gap-3">
          <AppLogo size={32} />
          <span
            className="text-2xl tracking-wide"
            style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
              background: "linear-gradient(135deg, #C9A84C 0%, #F5D77E 50%, #C9A84C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Bhava · {tagline.script}
          </span>
          <PronunciationGuide size="sm" />
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-8 justify-center">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-secondary text-4xl" aria-hidden="true">
            {avatarEmoji ?? "🌸"}
          </div>
          <h1 className="text-3xl font-extrabold text-foreground text-balance leading-tight">
            Welcome back, {firstName}.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-sm">
            {timeAgoPhrase(daysSinceLastCheckIn)}
          </p>
          <p className="text-base text-muted-foreground/80 leading-relaxed max-w-sm">
            Take a breath before we begin. There's no rush. You can tell me how today feels, or skip straight to your space.
          </p>
        </div>

        <div className="flex gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20">
          <Sparkles size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-foreground leading-relaxed">
              Coming back is strength.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Checking in with yourself — again and again — is one of the bravest, most loving things you can do.
              You're taking care of you. That matters.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onReady}
            style={{ minHeight: 56, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
            className="w-full rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            I'm ready
          </button>
          <button
            onClick={onSkip}
            style={{ minHeight: 48 }}
            className="w-full rounded-2xl text-base font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Skip — take me straight to my space
          </button>
        </div>

        <p className="text-sm text-muted-foreground/70 text-center italic">
          {tagline.script} · {tagline.gloss}
        </p>
      </div>
    </main>
  )
}
