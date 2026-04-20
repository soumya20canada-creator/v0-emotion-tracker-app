"use client"

import { useState, useRef } from "react"
import {
  IDENTITY_OPTIONS,
  GENDER_OPTIONS,
  PRONOUN_OPTIONS,
  SITUATION_OPTIONS,
  GOING_ON_OPTIONS,
  BODY_FEELING_OPTIONS,
  DURATION_OPTIONS,
  SUPPORT_OPTIONS,
  COUNTRIES,
  type OnboardingSession,
} from "@/lib/onboarding-data"
import { getEmergencyNumber } from "@/lib/emergency-numbers"
import { getRegionById } from "@/lib/crisis-resources"
import { ThemeHeader } from "@/components/theme-header"
import { LocationPicker } from "@/components/location-picker"
import { AppLogo } from "@/components/app-logo"
import { PronunciationGuide } from "@/components/pronunciation-guide"
import { ArrowLeft } from "lucide-react"

type OnboardingFlowProps = {
  isNewUser: boolean
  onComplete: (session: OnboardingSession, country?: string, identity?: string[], gender?: string[], pronouns?: string, currentRegion?: string | null) => void
  onSkip: () => void
}

type Screen = 1 | 2 | 3 | 4

export function OnboardingFlow({ isNewUser, onComplete, onSkip }: OnboardingFlowProps) {
  const startScreen: Screen = isNewUser ? 1 : 2
  const totalScreens = isNewUser ? 4 : 3
  const [screen, setScreen] = useState<Screen>(startScreen)

  // Screen 1 — identity
  const [country, setCountry] = useState("")
  const [identity, setIdentity] = useState<string[]>([])
  const [gender, setGender] = useState<string[]>([])
  const [customGender, setCustomGender] = useState("")
  const [pronouns, setPronouns] = useState("")
  const [customPronouns, setCustomPronouns] = useState("")

  // Screen 2 — situation
  const [currentRegion, setCurrentRegion] = useState<string | null>(null)
  const [situation, setSituation] = useState<string[]>([])
  const [goingOn, setGoingOn] = useState<string[]>([])

  // Screen 3 — body + duration
  const [bodyFeelings, setBodyFeelings] = useState<string[]>([])
  const [duration, setDuration] = useState("")

  // Screen 4 — support
  const [support, setSupport] = useState<string[]>([])

  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" })
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  const currentStep = screen - startScreen + 1

  function toggle<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
  }

  function handleComplete() {
    const session: OnboardingSession = {
      current_situation: situation,
      whats_been_going_on: goingOn,
      body_feelings: bodyFeelings,
      duration,
      support_preferences: support,
    }
    const finalPronouns = pronouns === "custom" ? customPronouns : pronouns
    const finalGender = gender.includes("different-term") && customGender
      ? [...gender.filter((g) => g !== "different-term"), customGender]
      : gender
    onComplete(session, country || undefined, identity.length ? identity : undefined, finalGender.length ? finalGender : undefined, finalPronouns || undefined, currentRegion)
  }

  return (
    <div ref={scrollRef} className="fixed inset-0 z-[200] flex flex-col bg-background overflow-y-auto">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <ThemeHeader />
        <div className="max-w-lg mx-auto flex items-center gap-3 px-6 pt-1 pb-3">
          <AppLogo size={28} />
          <span
            className="text-xl tracking-wide"
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
          <PronunciationGuide size="sm" />
        </div>
        <div className="max-w-lg mx-auto flex flex-col gap-2 px-6 pb-4">
          <div className="flex items-center justify-between gap-3">
            {screen > startScreen ? (
              <button
                type="button"
                onClick={() => { scrollTop(); setScreen((s) => (s - 1) as Screen) }}
                style={{ minWidth: 44, minHeight: 44 }}
                className="flex items-center gap-1 -ml-2 px-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Go back to previous step"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back
              </button>
            ) : <span />}
            <span className="text-sm font-semibold text-foreground">
              Step {currentStep} of {totalScreens}
            </span>
            <button
              type="button"
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              style={{ minHeight: 44, padding: "0 8px" }}
            >
              Skip for now
            </button>
          </div>
          <div
            className="w-full h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={totalScreens}
            aria-label={`Step ${currentStep} of ${totalScreens}`}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(currentStep / totalScreens) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-8 flex flex-col gap-8">

        {/* ── Screen 1: Country, Identity, Gender ── */}
        {screen === 1 && (
          <fieldset className="flex flex-col gap-8 border-none p-0 m-0">
            <legend className="sr-only">Your background and identity</legend>

            {/* Intro */}
            <section aria-labelledby="intro-heading" className="p-5 rounded-2xl border border-border bg-secondary/40">
              <h2 id="intro-heading" className="text-lg font-bold text-foreground mb-2">
                A gentle space to feel seen.
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Bhava helps you notice what you're feeling and try small things that might help. A few soft questions first — skip anything, take your time.
              </p>
            </section>

            {/* Country */}
            <section aria-labelledby="country-heading">
              <h2 id="country-heading" className="text-2xl font-bold text-foreground mb-1">
                Where are you living right now?
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                This helps us show you the right local resources and support options.
              </p>
              <label htmlFor="country-select" className="text-sm font-semibold text-foreground block mb-2">
                Select your country
              </label>
              <select
                id="country-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{ minHeight: 44 }}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base transition"
              >
                <option value="">Choose a country...</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </section>

            {/* Identity */}
            <section aria-labelledby="identity-heading">
              <h2 id="identity-heading" className="text-2xl font-bold text-foreground mb-1">
                I am...
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                Select as many as feel true, or skip if you prefer.
              </p>
              <div className="flex flex-col gap-2" role="group" aria-labelledby="identity-heading">
                {IDENTITY_OPTIONS.map((opt) => (
                  <MultiSelectButton
                    key={opt.id}
                    label={opt.label}
                    selected={identity.includes(opt.id)}
                    onToggle={() => setIdentity(toggle(identity, opt.id))}
                  />
                ))}
              </div>
            </section>

            {/* Gender */}
            <section aria-labelledby="gender-heading">
              <h2 id="gender-heading" className="text-2xl font-bold text-foreground mb-1">
                How do you identify?
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                This helps us use the right language with you. Select all that apply, or skip.
              </p>
              <div className="flex flex-col gap-2" role="group" aria-labelledby="gender-heading">
                {GENDER_OPTIONS.map((opt) => (
                  <MultiSelectButton
                    key={opt.id}
                    label={opt.label}
                    selected={gender.includes(opt.id)}
                    onToggle={() => setGender(toggle(gender, opt.id))}
                  />
                ))}
              </div>
              {gender.includes("different-term") && (
                <div className="mt-3">
                  <label htmlFor="custom-gender" className="text-sm font-semibold text-foreground block mb-1.5">
                    Your term (optional)
                  </label>
                  <input
                    id="custom-gender"
                    type="text"
                    value={customGender}
                    onChange={(e) => setCustomGender(e.target.value)}
                    placeholder="How you identify..."
                    style={{ minHeight: 44 }}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base transition"
                  />
                </div>
              )}
            </section>

            {/* Pronouns */}
            <section aria-labelledby="pronouns-heading">
              <h2 id="pronouns-heading" className="text-2xl font-bold text-foreground mb-1">
                What are your pronouns?
                <span className="text-sm font-normal text-muted-foreground ml-2">(optional)</span>
              </h2>
              <div className="flex flex-col gap-2 mt-4" role="group" aria-labelledby="pronouns-heading">
                {PRONOUN_OPTIONS.map((opt) => (
                  <SingleSelectButton
                    key={opt.id}
                    label={opt.label}
                    selected={pronouns === opt.id}
                    onSelect={() => setPronouns(pronouns === opt.id ? "" : opt.id)}
                  />
                ))}
              </div>
              {pronouns === "custom" && (
                <div className="mt-3">
                  <label htmlFor="custom-pronouns" className="text-sm font-semibold text-foreground block mb-1.5">
                    Your pronouns
                  </label>
                  <input
                    id="custom-pronouns"
                    type="text"
                    value={customPronouns}
                    onChange={(e) => setCustomPronouns(e.target.value)}
                    placeholder="e.g. xe/xem, ze/zir..."
                    style={{ minHeight: 44 }}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base transition"
                  />
                </div>
              )}
            </section>

            <ContinueButton onClick={() => { scrollTop(); setScreen(2) }} />
          </fieldset>
        )}

        {/* ── Screen 2: Situation + What's been going on ── */}
        {screen === 2 && (
          <fieldset className="flex flex-col gap-8 border-none p-0 m-0">
            <legend className="sr-only">Your current situation</legend>

            <section aria-labelledby="where-now-heading">
              <h2 id="where-now-heading" className="text-2xl font-bold text-foreground mb-1">
                Where are you right now?
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                You might be travelling or somewhere new. This helps us show the right local support.
              </p>
              <LocationPicker selectedRegion={currentRegion} onSelect={setCurrentRegion} />
            </section>

            <section aria-labelledby="situation-heading">
              <h2 id="situation-heading" className="text-2xl font-bold text-foreground mb-1">
                What is your current situation?
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                Select all that feel true right now.
              </p>
              <div className="flex flex-col gap-2" role="group" aria-labelledby="situation-heading">
                {SITUATION_OPTIONS.map((opt) => (
                  <MultiSelectButton
                    key={opt.id}
                    label={opt.label}
                    selected={situation.includes(opt.id)}
                    onToggle={() => setSituation(toggle(situation, opt.id))}
                  />
                ))}
              </div>
            </section>

            <section aria-labelledby="going-on-heading">
              <h2 id="going-on-heading" className="text-2xl font-bold text-foreground mb-1">
                What has been going on for you lately?
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                Select all that feel true.
              </p>
              <div className="flex flex-col gap-2" role="group" aria-labelledby="going-on-heading">
                {GOING_ON_OPTIONS.map((opt) => (
                  <MultiSelectButton
                    key={opt.id}
                    label={opt.label}
                    selected={goingOn.includes(opt.id)}
                    onToggle={() => setGoingOn(toggle(goingOn, opt.id))}
                  />
                ))}
              </div>
            </section>

            <ContinueButton onClick={() => { scrollTop(); setScreen(3) }} />
          </fieldset>
        )}

        {/* ── Screen 3: Body feelings + Duration ── */}
        {screen === 3 && (
          <fieldset className="flex flex-col gap-8 border-none p-0 m-0">
            <legend className="sr-only">How you are feeling</legend>

            <section aria-labelledby="body-heading">
              <h2 id="body-heading" className="text-2xl font-bold text-foreground mb-1">
                Take a moment and check in with yourself.
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                What are you feeling in your body? Select all that apply.
              </p>
              <div className="flex flex-col gap-2" role="group" aria-labelledby="body-heading">
                {BODY_FEELING_OPTIONS.map((opt) => (
                  <MultiSelectButton
                    key={opt.id}
                    label={opt.label}
                    selected={bodyFeelings.includes(opt.id)}
                    onToggle={() => setBodyFeelings(toggle(bodyFeelings, opt.id))}
                  />
                ))}
              </div>
            </section>

            <section aria-labelledby="duration-heading">
              <h2 id="duration-heading" className="text-2xl font-bold text-foreground mb-1">
                How long has this been going on?
              </h2>
              <div className="flex flex-col gap-2 mt-4" role="group" aria-labelledby="duration-heading">
                {DURATION_OPTIONS.map((opt) => (
                  <SingleSelectButton
                    key={opt.id}
                    label={opt.label}
                    selected={duration === opt.id}
                    onSelect={() => setDuration(duration === opt.id ? "" : opt.id)}
                  />
                ))}
              </div>
            </section>

            {/* Emergency services note — prefer "where are you right now" selection, fall back to onboarding country */}
            {(() => {
              const regionLabel = currentRegion ? getRegionById(currentRegion)?.label : undefined
              const effectiveCountry = regionLabel ?? country ?? ""
              return <EmergencyNote country={effectiveCountry} />
            })()}

            <ContinueButton onClick={() => { scrollTop(); setScreen(4) }} />
          </fieldset>
        )}

        {/* ── Screen 4: Support preferences ── */}
        {screen === 4 && (
          <fieldset className="flex flex-col gap-8 border-none p-0 m-0">
            <legend className="sr-only">What kind of support you need</legend>

            <section aria-labelledby="support-heading">
              <h2 id="support-heading" className="text-2xl font-bold text-foreground mb-1">
                Everyone needs something different.
              </h2>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                What sounds most helpful to you right now? Select all that feel right.
              </p>
              <div className="flex flex-col gap-2" role="group" aria-labelledby="support-heading">
                {SUPPORT_OPTIONS.map((opt) => (
                  <MultiSelectButton
                    key={opt.id}
                    label={opt.label}
                    selected={support.includes(opt.id)}
                    onToggle={() => setSupport(toggle(support, opt.id))}
                  />
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={handleComplete}
              style={{ background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00", minHeight: 52 }}
              className="w-full rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Enter Bhava
            </button>
          </fieldset>
        )}
      </div>
    </div>
  )
}

function MultiSelectButton({
  label,
  selected,
  onToggle,
}: {
  label: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      style={{ minHeight: 52 }}
      className={[
        "w-full px-5 py-3.5 rounded-xl text-left text-base font-medium transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "flex items-center gap-3",
        selected
          ? "bg-primary/10 text-primary border-2 border-primary"
          : "bg-muted text-foreground border-2 border-transparent hover:border-primary/30 hover:bg-muted/80",
      ].join(" ")}
    >
      <span
        className={[
          "w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors",
          selected ? "bg-primary border-primary" : "border-muted-foreground/40",
        ].join(" ")}
        aria-hidden="true"
      >
        {selected && (
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  )
}

function SingleSelectButton({
  label,
  selected,
  onSelect,
}: {
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{ minHeight: 52 }}
      className={[
        "w-full px-5 py-3.5 rounded-xl text-left text-base font-medium transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "flex items-center gap-3",
        selected
          ? "bg-primary/10 text-primary border-2 border-primary"
          : "bg-muted text-foreground border-2 border-transparent hover:border-primary/30 hover:bg-muted/80",
      ].join(" ")}
    >
      <span
        className={[
          "w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-colors",
          selected ? "bg-primary border-primary" : "border-muted-foreground/40",
        ].join(" ")}
        aria-hidden="true"
      >
        {selected && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
      </span>
      {label}
    </button>
  )
}

function ContinueButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ minHeight: 52, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
      className="w-full rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      Continue
    </button>
  )
}

function EmergencyNote({ country }: { country: string }) {
  const number = getEmergencyNumber(country) || "112"
  const display = country ? `${number} (${country})` : number

  function handleCall() {
    window.location.href = `tel:${number}`
  }

  return (
    <div
      className="p-4 rounded-xl border border-border bg-muted/40 flex flex-col gap-2"
      role="note"
      aria-label="Emergency services note"
    >
      <p className="text-sm text-muted-foreground leading-relaxed">
        If you are experiencing a medical emergency, you can contact emergency services directly.
      </p>
      <button
        type="button"
        onClick={handleCall}
        style={{ minHeight: 44 }}
        className="self-start px-4 py-2 rounded-lg text-sm font-semibold bg-background border border-border text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
        aria-label={`Call emergency services: ${display}`}
      >
        Emergency: {display}
      </button>
    </div>
  )
}
