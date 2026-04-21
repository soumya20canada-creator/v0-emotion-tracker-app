"use client"

import { AppLogo } from "@/components/app-logo"
import { ArrowLeft } from "lucide-react"
import { LocationPicker } from "@/components/location-picker"
import { CrisisResources } from "@/components/crisis-resources"
import { getRegionById } from "@/lib/crisis-resources"
import { ThemeHeader } from "@/components/theme-header"

type SupportViewProps = {
  selectedRegion: string | null
  onRegionSelect: (id: string) => void
  onBack: () => void
  mode?: "page" | "overlay"
}

// Shared crisis-helplines screen. In "page" mode it's a full-screen route-style
// return. In "overlay" mode it's a fixed-position layer above OnboardingFlow
// (z-[200]) so onboarding state survives when the user taps the crisis chip
// mid-flow and comes back.
export function SupportView({ selectedRegion, onRegionSelect, onBack, mode = "page" }: SupportViewProps) {
  const regionData = selectedRegion ? getRegionById(selectedRegion) : null
  const shell =
    mode === "overlay"
      ? "fixed inset-0 z-[260] bg-background overflow-y-auto pb-16"
      : "min-h-dvh bg-background pb-16"

  return (
    <main className={shell}>
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <ThemeHeader />
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              style={{ minWidth: 44, minHeight: 44 }}
              className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </button>
            <AppLogo size={32} />
          </div>
          <LocationPicker selectedRegion={selectedRegion} onSelect={onRegionSelect} />
        </div>
      </header>
      <div className="max-w-lg mx-auto px-5 py-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-foreground text-balance leading-tight">
            You're not alone in this.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Real people, in your region, trained to listen. Free and confidential.
          </p>
        </div>
        {regionData ? (
          <CrisisResources region={regionData} accentColor="#3B82F6" />
        ) : (
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border-2 border-accent/30">
            <p className="text-base font-bold text-foreground">Where are you right now?</p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Pick a region so we can show you the right helplines.
            </p>
            <LocationPicker selectedRegion={selectedRegion} onSelect={onRegionSelect} />
          </div>
        )}
        <button
          onClick={onBack}
          style={{ minHeight: 52, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
          className="w-full rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Take me back
        </button>
      </div>
    </main>
  )
}
