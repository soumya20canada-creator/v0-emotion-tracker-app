"use client"

import { useState } from "react"
import { AppLogo } from "@/components/app-logo"
import { reflectOnboarding, supportPrefToPath, pathLabel, type PathChoice } from "@/lib/onboarding-data"
import type { OnboardingSession } from "@/lib/onboarding-data"
import { ChevronDown, ChevronUp } from "lucide-react"

type AcknowledgmentScreenProps = {
  firstName: string
  country: string | null
  session: OnboardingSession | null
  onContinue: (path: PathChoice) => void
}

const ALT_PATHS: PathChoice[] = ["wheel", "quick-actions", "support", "look-around"]

export function AcknowledgmentScreen({ firstName, country, session, onContinue }: AcknowledgmentScreenProps) {
  const reflection = reflectOnboarding(session, country)
  const suggested = supportPrefToPath(session?.support_preferences ?? [])
  const suggestedMeta = pathLabel(suggested)
  const [overrideOpen, setOverrideOpen] = useState(false)

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
            Hi {firstName}.
          </h1>

          {reflection ? (
            <p className="text-lg text-foreground leading-relaxed">
              {reflection}. That's a lot to hold.
            </p>
          ) : (
            <p className="text-lg text-foreground leading-relaxed">
              Thank you for showing up.
            </p>
          )}

          <div className="p-5 rounded-2xl border border-border bg-secondary/50">
            <p className="text-base text-foreground leading-relaxed">
              Based on what you said, I'll start you with{" "}
              <span className="font-bold">{suggestedMeta.label}</span> — {suggestedMeta.reason}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onContinue(suggested)}
            style={{ minHeight: 56, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
            className="w-full rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Take me there
          </button>

          <button
            onClick={() => setOverrideOpen((v) => !v)}
            style={{ minHeight: 44 }}
            className="flex items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-expanded={overrideOpen}
          >
            Somewhere else {overrideOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {overrideOpen && (
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-card border border-border">
              {ALT_PATHS.filter((p) => p !== suggested).map((p) => {
                const meta = pathLabel(p)
                return (
                  <button
                    key={p}
                    onClick={() => onContinue(p)}
                    style={{ minHeight: 52 }}
                    className="w-full text-left px-4 py-3 rounded-xl bg-background hover:bg-muted transition-colors cursor-pointer border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <p className="text-sm font-bold text-foreground capitalize">{meta.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{meta.reason}</p>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground/70 text-center italic">
          भाव · the felt sense of being
        </p>
      </div>
    </main>
  )
}
