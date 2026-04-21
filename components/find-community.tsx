"use client"

import { useMemo } from "react"
import { AppLogo } from "@/components/app-logo"
import { PronunciationGuide } from "@/components/pronunciation-guide"
import { LocationPicker } from "@/components/location-picker"
import { getRegionById, type CommunityResource, type CommunityTag } from "@/lib/crisis-resources"
import { taglineFor } from "@/lib/cultural-taglines"
import { ArrowLeft, ExternalLink, Stethoscope, Heart } from "lucide-react"

type FindCommunityProps = {
  region: string | null
  country?: string | null
  identity?: string[] | null
  favoriteIds?: string[]
  onToggleFavorite?: (id: string) => void
  onClose: () => void
  onSwitchToTherapist: () => void
  onPickRegion: (regionId: string) => void
}

type Section = {
  title: string
  subtitle?: string
  items: CommunityResource[]
}

function buildSections(
  all: CommunityResource[],
  country: string | null | undefined,
  regionLabel: string | undefined,
  identity: string[] | null | undefined,
): Section[] {
  const used = new Set<string>()
  const take = (pred: (r: CommunityResource) => boolean): CommunityResource[] => {
    const out: CommunityResource[] = []
    for (const r of all) {
      if (used.has(r.name)) continue
      if (pred(r)) { out.push(r); used.add(r.name) }
    }
    return out
  }

  const isDiaspora = !!country && !!regionLabel && country !== regionLabel
  const id = new Set(identity ?? [])
  const showLgbtq = id.has("lgbtq")

  const sections: Section[] = []
  if (isDiaspora) {
    sections.push({
      title: "Newcomer and diaspora",
      subtitle: `Orgs that know what it's like to rebuild here.`,
      items: take((r) => r.tags.includes("newcomer") || r.tags.includes("diaspora")),
    })
  } else {
    sections.push({ title: "Newcomer-serving orgs", items: take((r) => r.tags.includes("newcomer")) })
    sections.push({ title: "Diaspora and cultural", items: take((r) => r.tags.includes("diaspora")) })
  }
  sections.push({ title: "Local meetups", subtitle: "Real-world groups near you.", items: take((r) => r.tags.includes("local-meetup")) })
  if (showLgbtq) sections.push({ title: "LGBTQ+ spaces", items: take((r) => r.tags.includes("lgbtq")) })
  sections.push({ title: "Identity-specific", items: take((r) => r.tags.includes("lgbtq") || r.tags.includes("women") || r.tags.includes("youth") || r.tags.includes("faith")) })
  sections.push({ title: "Online communities", items: take((r) => r.tags.includes("online")) })
  return sections.filter((s) => s.items.length > 0)
}

function tagBadge(tag: CommunityTag): string {
  const map: Record<CommunityTag, string> = {
    newcomer: "Newcomer",
    diaspora: "Diaspora",
    lgbtq: "LGBTQ+",
    youth: "Youth",
    women: "Women",
    faith: "Faith",
    "local-meetup": "Local",
    online: "Online",
  }
  return map[tag]
}

export function FindCommunity({ region, country, identity, favoriteIds, onToggleFavorite, onClose, onSwitchToTherapist, onPickRegion }: FindCommunityProps) {
  const regionData = region ? getRegionById(region) : null
  const favSet = useMemo(() => new Set(favoriteIds ?? []), [favoriteIds])
  const sections = useMemo(
    () => {
      if (!regionData) return []
      const base = buildSections(regionData.community, country, regionData.label, identity ?? null)
      const savedItems = regionData.community.filter((r) => favSet.has(r.name))
      if (savedItems.length === 0) return base
      const saved: Section = { title: "Your saved spaces", subtitle: "Tap the heart again to unsave.", items: savedItems }
      return [saved, ...base]
    },
    [regionData, country, identity, favSet],
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
            Bhava · {taglineFor(country).script}
          </span>
          <PronunciationGuide size="sm" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-8 flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-foreground text-balance leading-tight">
            You don't have to do this alone.
          </h1>
          {regionData ? (
            <p className="text-lg text-foreground leading-relaxed">
              Here's where to find people in <strong>{regionData.label}</strong>
              {country && country !== regionData.label ? <> — with spaces for folks from {country} too</> : null}.
            </p>
          ) : (
            <p className="text-lg text-foreground leading-relaxed">
              Pick where you are so we can show communities near you.
            </p>
          )}
        </div>

        {!regionData && (
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border-2 border-accent/30">
            <p className="text-base font-bold text-foreground">Pick a region</p>
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
          onClick={onSwitchToTherapist}
          style={{ minHeight: 56 }}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:bg-muted cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Stethoscope size={18} className="text-primary shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold text-foreground">Looking for a therapist instead?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Curated directories, free and paid options.
            </p>
          </div>
        </button>
      </div>
    </main>
  )
}
