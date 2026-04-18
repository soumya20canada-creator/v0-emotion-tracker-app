"use client"

import { AppLogo } from "@/components/app-logo"
import { reflectOnboarding } from "@/lib/onboarding-data"
import type { OnboardingSession } from "@/lib/onboarding-data"

type AcknowledgmentScreenProps = {
  firstName: string
  country: string | null
  session: OnboardingSession | null
  onContinue: () => void
}

export function AcknowledgmentScreen({ firstName, country, session, onContinue }: AcknowledgmentScreenProps) {
  const reflection = reflectOnboarding(session, country)

  return (
    <main className="min-h-dvh bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
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
            Bhava · भाव
          </span>
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-8 justify-center">
        <div className="flex flex-col gap-5">
          <h1 className="text-3xl font-extrabold text-foreground text-balance leading-tight">
            Thank you for sharing, {firstName}.
          </h1>

          {reflection && (
            <p className="text-lg text-foreground leading-relaxed">
              {reflection}. That's a lot to hold — and you don't have to hold it alone.
            </p>
          )}

          <div className="p-5 rounded-2xl border border-border bg-secondary/50">
            <p className="text-base text-foreground leading-relaxed">
              <span className="font-bold">Bhava is a quiet space to notice what you're feeling and try small things that might help.</span>{" "}
              <span className="text-muted-foreground">
                No pressure. No timeline. Just you, one small moment at a time.
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={onContinue}
          style={{ minHeight: 56, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
          className="w-full rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Continue
        </button>

        <p className="text-sm text-muted-foreground/70 text-center italic">
          भाव · the felt sense of being
        </p>
      </div>
    </main>
  )
}
