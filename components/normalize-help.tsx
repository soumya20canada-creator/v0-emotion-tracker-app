"use client"

import { AppLogo } from "@/components/app-logo"
import { PronunciationGuide } from "@/components/pronunciation-guide"
import { taglineFor } from "@/lib/cultural-taglines"
import { HeartHandshake } from "lucide-react"

type NormalizeHelpProps = {
  country?: string | null
  onContinue: () => void
}

export function NormalizeHelp({ country, onContinue }: NormalizeHelpProps) {
  const tagline = taglineFor(country)
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
            Bhava · {tagline.script}
          </span>
          <PronunciationGuide size="sm" />
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-7">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Before we begin</p>
          <h1 className="text-3xl font-extrabold text-foreground leading-tight text-balance">
            Where many of us grew up, no one talked about this.
          </h1>
        </div>

        <div className="flex flex-col gap-4 text-base text-foreground/90 leading-relaxed">
          <p>
            Mental health, therapy, asking for help — these were things kept quiet. Maybe in your family too.
          </p>
          <p>
            Taking care of how you feel isn't weakness. It's the same care you'd give a friend who couldn't sleep,
            or a parent who seemed tired for too long.
          </p>
          <p>
            You don't have to call it therapy. You don't have to tell anyone you're here. This is just a quiet
            place to check in with yourself.
          </p>
        </div>

        <div className="flex gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20">
          <HeartHandshake size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-foreground leading-relaxed">
              Seeking help is normal. You're not going crazy.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              What you're carrying is real, and reaching for support — in any form — is one of the strongest,
              most human things you can do. You're not the only one.
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground italic leading-relaxed">
          Nothing you do here leaves your phone unless you choose.
        </p>

        <button
          onClick={onContinue}
          style={{
            minHeight: 56,
            background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)",
            color: "#3B1F00",
          }}
          className="w-full rounded-2xl text-base font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          I'm ready
        </button>

        <p className="text-sm text-muted-foreground/70 text-center italic mt-auto">
          {tagline.script} · {tagline.gloss}
        </p>
      </div>
    </main>
  )
}
