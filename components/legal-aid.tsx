"use client"

import { useMemo } from "react"
import { AppLogo } from "@/components/app-logo"
import { PronunciationGuide } from "@/components/pronunciation-guide"
import { legalAidFor, getRegionById } from "@/lib/crisis-resources"
import { taglineFor } from "@/lib/cultural-taglines"
import { ArrowLeft, ExternalLink, Scale, ShieldCheck } from "lucide-react"
import { ThemeHeader } from "@/components/theme-header"

type LegalAidProps = {
  region: string | null
  country?: string | null
  onClose: () => void
}

export function LegalAid({ region, country, onClose }: LegalAidProps) {
  const resources = useMemo(() => legalAidFor(region), [region])
  const regionData = region ? getRegionById(region) : null

  return (
    <main className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <ThemeHeader />
        <div className="max-w-lg mx-auto flex items-center px-5 py-3 gap-3">
          <button
            onClick={onClose}
            style={{ minWidth: 44, minHeight: 44 }}
            className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
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
            Bhava · {taglineFor(country, regionData?.label).script}
          </span>
          <PronunciationGuide size="sm" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-8 flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-primary" aria-hidden="true" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Visa & immigration help</p>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground text-balance leading-tight">
            Free legal help{regionData ? ` in ${regionData.label}` : ""}.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            These organizations help people navigate visas, status, asylum, and paperwork — at no cost. Separate from therapy.
          </p>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/30">
          <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-foreground leading-relaxed">
            Talking to a legal aid org is confidential. They can't report you. They exist to help — use them.
          </p>
        </div>

        {resources.length === 0 ? (
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border">
            <p className="text-base font-bold text-foreground">No curated list for this region yet.</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Try searching <em>"free immigration legal aid near me"</em> or <em>"pro bono immigration lawyer {regionData?.label ?? "your city"}"</em>. Most countries have a nonprofit that will help for free.
            </p>
          </div>
        ) : (
          <section className="flex flex-col gap-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Curated list</p>
            <div className="flex flex-col gap-2">
              {resources.map((r) => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ minHeight: 72 }}
                  className="w-full flex items-start gap-3 p-4 rounded-2xl bg-card border border-border hover:bg-muted cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base font-bold text-foreground">{r.name}</p>
                      {r.note && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                          {r.note}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
                  </div>
                  <ExternalLink size={16} className="text-muted-foreground shrink-0 mt-1" aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>
        )}

        <p className="text-xs text-muted-foreground/70 leading-relaxed italic">
          This list is a starting point, not a recommendation. Every case is different — find someone who listens to yours.
        </p>
      </div>
    </main>
  )
}
