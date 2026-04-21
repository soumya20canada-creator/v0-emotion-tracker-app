"use client"

import { useMemo } from "react"
import { AppLogo } from "@/components/app-logo"
import { PronunciationGuide } from "@/components/pronunciation-guide"
import { LocationPicker } from "@/components/location-picker"
import { getRegionById, type TherapistResource, type TherapistTag } from "@/lib/crisis-resources"
import { taglineFor } from "@/lib/cultural-taglines"
import { ArrowLeft, ExternalLink, AlertCircle, ShieldCheck, Heart, Scale } from "lucide-react"

type FindTherapistProps = {
  region: string | null
  country?: string | null
  identity?: string[] | null
  favoriteIds?: string[]
  onToggleFavorite?: (id: string) => void
  onOpenLegalAid?: () => void
  onClose: () => void
  onCrisis: () => void
  onPickRegion: (regionId: string) => void
}

type Section = {
  title: string
  subtitle?: string
  items: TherapistResource[]
}

function buildSections(
  all: TherapistResource[],
  identity: string[] | null | undefined,
  isDiaspora: boolean,
): Section[] {
  const used = new Set<string>()
  const take = (pred: (r: TherapistResource) => boolean): TherapistResource[] => {
    const out: TherapistResource[] = []
    for (const r of all) {
      if (used.has(r.name)) continue
      if (pred(r)) {
        out.push(r)
        used.add(r.name)
      }
    }
    return out
  }

  const hasStudent = identity?.includes("immigrant") || identity?.includes("first-gen")

  const freeSection: Section = { title: "Free or government-covered", subtitle: "Cost is often the biggest barrier. Start here.", items: take((r) => r.tags.includes("free")) }
  const culturalSection: Section = {
    title: "Culturally-matched",
    subtitle: isDiaspora
      ? "Therapists who won't need you to explain your background — important when you're far from home."
      : "Therapists who won't need you to explain your background.",
    items: take((r) => r.tags.includes("cultural") || r.tags.includes("multilingual")),
  }
  const lowCost: Section = { title: "Low-cost / sliding scale", items: take((r) => r.tags.includes("low-cost")) }
  const directories: Section = { title: "Directories to browse", items: take((r) => r.tags.includes("directory")) }
  const student: Section = { title: "Student / youth", items: take((r) => r.tags.includes("student")) }
  const online: Section = { title: "Online options", items: take((r) => r.tags.includes("online")) }

  const sections: Section[] = isDiaspora
    ? [freeSection, culturalSection, lowCost, directories, ...(hasStudent ? [student] : []), online]
    : [freeSection, lowCost, culturalSection, directories, ...(hasStudent ? [student] : []), online]
  return sections.filter((s) => s.items.length > 0)
}

function tagBadge(tag: TherapistTag): string {
  const map: Record<TherapistTag, string> = {
    free: "Free",
    "low-cost": "Low-cost",
    directory: "Directory",
    cultural: "Culturally matched",
    multilingual: "Multilingual",
    student: "Student",
    online: "Online",
  }
  return map[tag]
}

export function FindTherapist({ region, country, identity, favoriteIds, onToggleFavorite, onOpenLegalAid, onClose, onCrisis, onPickRegion }: FindTherapistProps) {
  const regionData = region ? getRegionById(region) : null
  const isDiaspora = !!country && !!regionData && country !== regionData.label
  const favSet = useMemo(() => new Set(favoriteIds ?? []), [favoriteIds])
  const sections = useMemo(
    () => {
      if (!regionData) return []
      const base = buildSections(regionData.therapists, identity ?? null, isDiaspora)
      const savedItems = regionData.therapists.filter((r) => favSet.has(r.name))
      if (savedItems.length === 0) return base
      const saved: Section = { title: "Your saved therapists", subtitle: "Tap the heart again to unsave.", items: savedItems }
      return [saved, ...base]
    },
    [regionData, identity, isDiaspora, favSet],
  )

  return (
    <main className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
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
          <h1 className="text-3xl font-extrabold text-foreground text-balance leading-tight">
            You asked for a therapist.
          </h1>
          {regionData ? (
            <p className="text-lg text-foreground leading-relaxed">
              Here are real options in <strong>{regionData.label}</strong>.
            </p>
          ) : (
            <p className="text-lg text-foreground leading-relaxed">
              First — where are you right now? So we show the right options.
            </p>
          )}
        </div>

        {isDiaspora && (
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/30">
              <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-foreground leading-relaxed">
                Seeing a therapist doesn't affect your visa, PR application, or citizenship case. It's confidential and protected by privacy law.
              </p>
            </div>
            {onOpenLegalAid && (
              <button
                onClick={onOpenLegalAid}
                style={{ minHeight: 44 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary border border-primary/30 bg-transparent hover:bg-primary/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Scale size={14} aria-hidden="true" />
                Worried about visa/status? Find legal aid →
              </button>
            )}
          </div>
        )}

        {!regionData && (
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border-2 border-accent/30">
            <p className="text-base font-bold text-foreground">Pick a region</p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Therapist access depends on where you are — insurance, language, and cost differ a lot.
            </p>
            <LocationPicker selectedRegion={region} onSelect={onPickRegion} />
          </div>
        )}

        {sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{section.title}</p>
              {section.subtitle && <p className="text-sm text-muted-foreground leading-relaxed">{section.subtitle}</p>}
            </div>
            <div className="flex flex-col gap-2">
              {section.items.map((r) => {
                const isFav = favSet.has(r.name)
                return (
                  <div key={r.name} className="relative">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ minHeight: 72 }}
                      className="w-full flex items-start gap-3 p-4 pr-12 rounded-2xl bg-card border border-border hover:bg-muted cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {r.tags.map((t) => (
                            <span key={t} className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              {tagBadge(t)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-muted-foreground shrink-0 mt-1" aria-hidden="true" />
                    </a>
                    {onToggleFavorite && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(r.name) }}
                        aria-label={isFav ? "Unsave" : "Save"}
                        aria-pressed={isFav}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center bg-background/70 backdrop-blur-sm border border-border hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Heart size={16} className={isFav ? "text-destructive fill-destructive" : "text-muted-foreground"} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        <button
          onClick={onCrisis}
          style={{ minHeight: 56 }}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-left hover:bg-destructive/15 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          <AlertCircle size={18} className="text-destructive shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">In crisis right now?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Skip this — tap here for emergency support lines in your region.
            </p>
          </div>
        </button>
      </div>
    </main>
  )
}
