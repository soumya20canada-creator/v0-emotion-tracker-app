"use client"

import { useMemo } from "react"
import { AppLogo } from "@/components/app-logo"
import { PronunciationGuide } from "@/components/pronunciation-guide"
import {
  humanReflection,
  suggestTools,
  situationToContextTags,
  type ToolSuggestion,
  type ToolSuggestionId,
} from "@/lib/onboarding-data"
import type { OnboardingSession } from "@/lib/onboarding-data"
import { taglineFor, homeTimeLineFor } from "@/lib/cultural-taglines"
import { Wind, BookOpenText, Feather, Headphones, HeartHandshake, ChevronRight, ArrowRight, Stethoscope, Users, Scale, LifeBuoy, Music, TrendingUp, Lock } from "lucide-react"
import { ThemeHeader } from "@/components/theme-header"

type AcknowledgmentScreenProps = {
  firstName: string
  country: string | null
  regionLabel?: string | null
  session: OnboardingSession | null
  identity?: string[] | null
  onPickTool: (tool: ToolSuggestionId) => void
  onOpenWheel: () => void
  onSkip: () => void
}

const TOOL_ICONS: Record<ToolSuggestionId, React.ElementType> = {
  "find-therapist": Stethoscope,
  "find-community": Users,
  "breathe": Wind,
  "journal": BookOpenText,
  "grounding-note": Feather,
  "meditate": Headphones,
  "reach-out": HeartHandshake,
  "legal-aid": Scale,
  "crisis-resources": LifeBuoy,
  "music": Music,
  "patterns": TrendingUp,
  "my-space": Lock,
}

function headingFor(topId: ToolSuggestionId | undefined): string {
  switch (topId) {
    case "find-therapist": return "Here's where to find real support"
    case "find-community": return "Here's where to find people near you"
    case "legal-aid": return "Visa stress is its own kind of heavy — here's help"
    case "crisis-resources": return "Right now, let's get you grounded"
    case "music":
    case "breathe":
    case "meditate": return "A soft place to land for a minute"
    case "patterns": return "Let's see the shape of what you're carrying"
    case "journal":
    case "my-space":
    case "grounding-note": return "Here's a private place to start"
    case "reach-out": return "You don't have to sit with this alone"
    default: return "Here's what might help right now"
  }
}

export function AcknowledgmentScreen({
  firstName,
  country,
  regionLabel,
  session,
  identity,
  onPickTool,
  onOpenWheel,
  onSkip,
}: AcknowledgmentScreenProps) {
  const reflection = useMemo(() => humanReflection(session, country, identity ?? undefined), [session, country, identity])
  const tools = suggestTools(session)
  const tagline = taglineFor(country, regionLabel)
  const contextTags = new Set(situationToContextTags(session))
  const homeTimeLine = contextTags.has("homesick") || contextTags.has("loneliness") ? homeTimeLineFor(country) : null

  return (
    <main className="min-h-dvh bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <ThemeHeader />
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

      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-8 flex flex-col gap-7">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold text-foreground text-balance leading-tight">
            Hi {firstName}.
          </h1>
          <p className="text-lg text-foreground leading-relaxed text-balance">
            {reflection}
          </p>
          {homeTimeLine && (
            <p className="text-sm text-muted-foreground italic leading-relaxed">{homeTimeLine}</p>
          )}
        </div>

        <section className="flex flex-col gap-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {headingFor(tools[0]?.id)}
          </p>
          <div className="flex flex-col gap-2">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onClick={() => onPickTool(tool.id)} />
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <button
            onClick={onOpenWheel}
            style={{ minHeight: 48 }}
            className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-foreground/80 hover:text-foreground hover:bg-muted transition-colors cursor-pointer rounded-xl px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Want to name what you're feeling? Open the emotion wheel
            <ArrowRight size={14} />
          </button>
          <button
            onClick={onSkip}
            style={{ minHeight: 44 }}
            className="w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-xl px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            I just want to look around
          </button>
        </div>

        <p className="text-sm text-muted-foreground/70 text-center italic">
          {tagline.script} · {tagline.gloss}
        </p>
      </div>
    </main>
  )
}

function ToolCard({ tool, onClick }: { tool: ToolSuggestion; onClick: () => void }) {
  const Icon = TOOL_ICONS[tool.id]
  return (
    <button
      onClick={onClick}
      style={{ minHeight: 72 }}
      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border text-left hover:bg-muted cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={tool.title}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/15 shrink-0">
        <Icon size={18} className="text-primary" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-foreground">{tool.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tool.reason}</p>
      </div>
      <ChevronRight size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />
    </button>
  )
}
