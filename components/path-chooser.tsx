"use client"

import { AppLogo } from "@/components/app-logo"
import { Heart, Wind, Users, Compass, ArrowRight } from "lucide-react"
import type { PathChoice } from "@/lib/onboarding-data"
import { supportPrefToPath } from "@/lib/onboarding-data"

type PathChooserProps = {
  supportPreferences: string[]
  onChoose: (path: PathChoice) => void
}

type Card = {
  id: PathChoice
  icon: React.ElementType
  title: string
  subtitle: string
  accent: string
}

const CARDS: Card[] = [
  {
    id: "wheel",
    icon: Heart,
    title: "Explore what I'm feeling",
    subtitle: "Name it, understand it, and get tools built for that exact feeling.",
    accent: "#8B5CF6",
  },
  {
    id: "quick-actions",
    icon: Wind,
    title: "Give me something to do right now",
    subtitle: "A few small grounding actions you can try in under 5 minutes.",
    accent: "#10B981",
  },
  {
    id: "support",
    icon: Users,
    title: "Help me find support",
    subtitle: "Real helplines and communities near you — you don't have to do this alone.",
    accent: "#3B82F6",
  },
  {
    id: "look-around",
    icon: Compass,
    title: "Let me look around first",
    subtitle: "Take me to the main space and I'll explore at my own pace.",
    accent: "#F59E0B",
  },
]

export function PathChooser({ supportPreferences, onChoose }: PathChooserProps) {
  const top = supportPrefToPath(supportPreferences)
  const ordered = [...CARDS].sort((a, b) => (a.id === top ? -1 : b.id === top ? 1 : 0))

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

      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-foreground text-balance leading-tight">
            What would help right now?
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            There's no wrong answer. Pick whatever feels closest — you can try the others later.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {ordered.map((card, i) => {
            const Icon = card.icon
            const isSuggested = card.id === top && i === 0
            return (
              <button
                key={card.id}
                onClick={() => onChoose(card.id)}
                style={{
                  minHeight: 88,
                  borderColor: isSuggested ? card.accent : "var(--border)",
                  background: isSuggested ? `${card.accent}08` : "var(--card)",
                  boxShadow: isSuggested ? `0 4px 20px ${card.accent}22` : "none",
                }}
                className="relative w-full p-5 rounded-2xl text-left flex items-center gap-4 border-2 transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${card.accent}20`, color: card.accent }}
                  aria-hidden="true"
                >
                  <Icon size={22} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-foreground">{card.title}</p>
                    {isSuggested && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: `${card.accent}22`, color: card.accent }}
                      >
                        Suggested
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.subtitle}</p>
                </div>
                <ArrowRight size={18} className="text-muted-foreground shrink-0" aria-hidden="true" />
              </button>
            )
          })}
        </div>

        <p className="text-sm text-muted-foreground/70 text-center mt-auto pt-6">
          Everything here is yours. You're in control.
        </p>
      </div>
    </main>
  )
}
