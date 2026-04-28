"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
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
import { taglineFor } from "@/lib/cultural-taglines"
import { ThemeHeader } from "@/components/theme-header"
import { LocationPicker } from "@/components/location-picker"
import { AppLogo } from "@/components/app-logo"
import { PronunciationGuide } from "@/components/pronunciation-guide"
import { ArrowLeft, Volume2 } from "lucide-react"
import { useVoice } from "@/components/voice-provider"
import { useScreenNarration } from "@/hooks/use-screen-narration"

type OnboardingFlowProps = {
  isNewUser: boolean
  onComplete: (session: OnboardingSession, country?: string, identity?: string[], gender?: string[], pronouns?: string, currentRegion?: string | null) => void
  onSkip: () => void
}

type Screen = 1 | 2 | 3 | 4

export function OnboardingFlow({ isNewUser, onComplete, onSkip }: OnboardingFlowProps) {
  const t = useTranslations("onboarding")
  const tVoice = useTranslations("voice")
  const { forceSpeak } = useVoice()
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

  // Tagline script follows whichever location the user has picked so far:
  // "Where are you living right now?" (country, screen 1) wins over
  // "Where are you right now?" (currentRegion, screen 2) to match taglineFor's contract.
  const regionLabel = currentRegion ? getRegionById(currentRegion)?.label : undefined
  const tagline = taglineFor(country || undefined, regionLabel)

  function toggle<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
  }

  // Voice narration — speak the dominant prompt for the current screen.
  const narrationParts: string[] = (() => {
    if (screen === 1) return [t("intro.title"), t("intro.description"), t("country.title"), t("country.description")]
    if (screen === 2) return [t("location.title"), t("location.description"), t("situation.title"), t("situation.description"), t("goingOn.title"), t("goingOn.description")]
    if (screen === 3) return [t("body.title"), t("body.description"), t("duration.title")]
    return [t("support.title"), t("support.description")]
  })()
  const { replay } = useScreenNarration(narrationParts)

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
            Bhava · {tagline.script}
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
                aria-label={t("backAria")}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                {t("back")}
              </button>
            ) : <span />}
            <span className="text-sm font-semibold text-foreground">
              {t("stepOf", { current: currentStep, total: totalScreens })}
            </span>
            <button
              type="button"
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              style={{ minHeight: 44, padding: "0 8px" }}
            >
              {t("skip")}
            </button>
          </div>
          <div
            className="w-full h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={totalScreens}
            aria-label={t("stepOf", { current: currentStep, total: totalScreens })}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(currentStep / totalScreens) * 100}%` }}
            />
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={replay}
              style={{ minHeight: 32 }}
              className="flex items-center gap-1.5 px-2.5 h-8 rounded-full bg-muted hover:bg-border text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={tVoice("listenAgain")}
            >
              <Volume2 size={12} aria-hidden="true" />
              <span className="text-[11px] font-semibold">{tVoice("listenAgain")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-8 flex flex-col gap-8">

        {/* ── Screen 1: Country, Identity, Gender ── */}
        {screen === 1 && (
          <fieldset className="flex flex-col gap-8 border-none p-0 m-0">
            <legend className="sr-only">{t("identity.legend")}</legend>

            {/* Intro */}
            <section aria-labelledby="intro-heading" className="p-5 rounded-2xl border border-border bg-secondary/40">
              <h2 id="intro-heading" className="text-lg font-bold text-foreground mb-2">
                {t("intro.title")}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {t("intro.description")}
              </p>
            </section>

            {/* Country */}
            <section aria-labelledby="country-heading">
              <QuestionHeading
                id="country-heading"
                text={t("country.title")}
                onListen={() => forceSpeak(`${t("country.title")} ${t("country.description")}`)}
                listenAriaLabel={tVoice("readOption")}
              />
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                {t("country.description")}
              </p>
              <label htmlFor="country-select" className="text-sm font-semibold text-foreground block mb-2">
                {t("country.selectLabel")}
              </label>
              <select
                id="country-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{ minHeight: 44 }}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base transition"
              >
                <option value="">{t("country.placeholder")}</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </section>

            {/* Identity */}
            <section aria-labelledby="identity-heading">
              <QuestionHeading
                id="identity-heading"
                text={t("identity.title")}
                onListen={() => forceSpeak(`${t("identity.title")} ${t("identity.description")}`)}
                listenAriaLabel={tVoice("readOption")}
              />
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                {t("identity.description")}
              </p>
              <div className="flex flex-col gap-2" role="group" aria-labelledby="identity-heading">
                {IDENTITY_OPTIONS.map((opt) => (
                  <MultiSelectButton
                    key={opt.id}
                    label={t(opt.labelKey)}
                    onListen={() => forceSpeak(t(opt.labelKey))}
                    listenAriaLabel={tVoice("readOption")}
                    selected={identity.includes(opt.id)}
                    onToggle={() => setIdentity(toggle(identity, opt.id))}
                  />
                ))}
              </div>
            </section>

            {/* Gender */}
            <section aria-labelledby="gender-heading">
              <QuestionHeading
                id="gender-heading"
                text={t("gender.title")}
                onListen={() => forceSpeak(`${t("gender.title")} ${t("gender.description")}`)}
                listenAriaLabel={tVoice("readOption")}
              />
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                {t("gender.description")}
              </p>
              <div className="flex flex-col gap-2" role="group" aria-labelledby="gender-heading">
                {GENDER_OPTIONS.map((opt) => (
                  <MultiSelectButton
                    key={opt.id}
                    label={t(opt.labelKey)}
                    onListen={() => forceSpeak(t(opt.labelKey))}
                    listenAriaLabel={tVoice("readOption")}
                    selected={gender.includes(opt.id)}
                    onToggle={() => setGender(toggle(gender, opt.id))}
                  />
                ))}
              </div>
              {gender.includes("different-term") && (
                <div className="mt-3">
                  <label htmlFor="custom-gender" className="text-sm font-semibold text-foreground block mb-1.5">
                    {t("gender.customLabel")}
                  </label>
                  <input
                    id="custom-gender"
                    type="text"
                    value={customGender}
                    onChange={(e) => setCustomGender(e.target.value)}
                    placeholder={t("gender.customPlaceholder")}
                    style={{ minHeight: 44 }}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base transition"
                  />
                </div>
              )}
            </section>

            {/* Pronouns */}
            <section aria-labelledby="pronouns-heading">
              <QuestionHeading
                id="pronouns-heading"
                text={`${t("pronouns.title")} ${t("pronouns.optional")}`}
                onListen={() => forceSpeak(t("pronouns.title"))}
                listenAriaLabel={tVoice("readOption")}
              />
              <div className="flex flex-col gap-2 mt-4" role="group" aria-labelledby="pronouns-heading">
                {PRONOUN_OPTIONS.map((opt) => (
                  <SingleSelectButton
                    key={opt.id}
                    label={t(opt.labelKey)}
                    onListen={() => forceSpeak(t(opt.labelKey))}
                    listenAriaLabel={tVoice("readOption")}
                    selected={pronouns === opt.id}
                    onSelect={() => setPronouns(pronouns === opt.id ? "" : opt.id)}
                  />
                ))}
              </div>
              {pronouns === "custom" && (
                <div className="mt-3">
                  <label htmlFor="custom-pronouns" className="text-sm font-semibold text-foreground block mb-1.5">
                    {t("pronouns.customLabel")}
                  </label>
                  <input
                    id="custom-pronouns"
                    type="text"
                    value={customPronouns}
                    onChange={(e) => setCustomPronouns(e.target.value)}
                    placeholder={t("pronouns.customPlaceholder")}
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
            <legend className="sr-only">{t("location.legend")}</legend>

            <section aria-labelledby="where-now-heading">
              <QuestionHeading
                id="where-now-heading"
                text={t("location.title")}
                onListen={() => forceSpeak(`${t("location.title")} ${t("location.description")}`)}
                listenAriaLabel={tVoice("readOption")}
              />
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                {t("location.description")}
              </p>
              <LocationPicker selectedRegion={currentRegion} onSelect={setCurrentRegion} />
            </section>

            <section aria-labelledby="situation-heading">
              <QuestionHeading
                id="situation-heading"
                text={t("situation.title")}
                onListen={() => forceSpeak(`${t("situation.title")} ${t("situation.description")}`)}
                listenAriaLabel={tVoice("readOption")}
              />
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                {t("situation.description")}
              </p>
              <div className="flex flex-col gap-2" role="group" aria-labelledby="situation-heading">
                {SITUATION_OPTIONS.map((opt) => (
                  <MultiSelectButton
                    key={opt.id}
                    label={t(opt.labelKey)}
                    onListen={() => forceSpeak(t(opt.labelKey))}
                    listenAriaLabel={tVoice("readOption")}
                    selected={situation.includes(opt.id)}
                    onToggle={() => setSituation(toggle(situation, opt.id))}
                  />
                ))}
              </div>
            </section>

            <section aria-labelledby="going-on-heading">
              <QuestionHeading
                id="going-on-heading"
                text={t("goingOn.title")}
                onListen={() => forceSpeak(`${t("goingOn.title")} ${t("goingOn.description")}`)}
                listenAriaLabel={tVoice("readOption")}
              />
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                {t("goingOn.description")}
              </p>
              <div className="flex flex-col gap-2" role="group" aria-labelledby="going-on-heading">
                {GOING_ON_OPTIONS.map((opt) => (
                  <MultiSelectButton
                    key={opt.id}
                    label={t(opt.labelKey)}
                    onListen={() => forceSpeak(t(opt.labelKey))}
                    listenAriaLabel={tVoice("readOption")}
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
            <legend className="sr-only">{t("body.legend")}</legend>

            <section aria-labelledby="body-heading">
              <QuestionHeading
                id="body-heading"
                text={t("body.title")}
                onListen={() => forceSpeak(`${t("body.title")} ${t("body.description")}`)}
                listenAriaLabel={tVoice("readOption")}
              />
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                {t("body.description")}
              </p>
              <div className="flex flex-col gap-2" role="group" aria-labelledby="body-heading">
                {BODY_FEELING_OPTIONS.map((opt) => (
                  <MultiSelectButton
                    key={opt.id}
                    label={t(opt.labelKey)}
                    onListen={() => forceSpeak(t(opt.labelKey))}
                    listenAriaLabel={tVoice("readOption")}
                    selected={bodyFeelings.includes(opt.id)}
                    onToggle={() => setBodyFeelings(toggle(bodyFeelings, opt.id))}
                  />
                ))}
              </div>
            </section>

            <section aria-labelledby="duration-heading">
              <QuestionHeading
                id="duration-heading"
                text={t("duration.title")}
                onListen={() => forceSpeak(t("duration.title"))}
                listenAriaLabel={tVoice("readOption")}
              />
              <div className="flex flex-col gap-2 mt-4" role="group" aria-labelledby="duration-heading">
                {DURATION_OPTIONS.map((opt) => (
                  <SingleSelectButton
                    key={opt.id}
                    label={t(opt.labelKey)}
                    onListen={() => forceSpeak(t(opt.labelKey))}
                    listenAriaLabel={tVoice("readOption")}
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
            <legend className="sr-only">{t("support.legend")}</legend>

            <section aria-labelledby="support-heading">
              <QuestionHeading
                id="support-heading"
                text={t("support.title")}
                onListen={() => forceSpeak(`${t("support.title")} ${t("support.description")}`)}
                listenAriaLabel={tVoice("readOption")}
              />
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                {t("support.description")}
              </p>
              <div className="flex flex-col gap-2" role="group" aria-labelledby="support-heading">
                {SUPPORT_OPTIONS.map((opt) => (
                  <MultiSelectButton
                    key={opt.id}
                    label={t(opt.labelKey)}
                    onListen={() => forceSpeak(t(opt.labelKey))}
                    listenAriaLabel={tVoice("readOption")}
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
              {t("enter")}
            </button>
          </fieldset>
        )}
      </div>
    </div>
  )
}

function QuestionHeading({
  id,
  text,
  onListen,
  listenAriaLabel,
}: {
  id: string
  text: string
  onListen: () => void
  listenAriaLabel: string
}) {
  return (
    <div className="flex items-start gap-2 mb-1">
      <h2 id={id} className="text-2xl font-bold text-foreground flex-1">
        {text}
      </h2>
      <button
        type="button"
        onClick={onListen}
        aria-label={listenAriaLabel}
        style={{ minWidth: 36, minHeight: 36 }}
        className="shrink-0 mt-1 flex items-center justify-center rounded-full text-primary hover:bg-primary/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Volume2 size={18} aria-hidden="true" />
      </button>
    </div>
  )
}

function MultiSelectButton({
  label,
  selected,
  onToggle,
  onListen,
  listenAriaLabel,
}: {
  label: string
  selected: boolean
  onToggle: () => void
  onListen?: () => void
  listenAriaLabel?: string
}) {
  return (
    <div
      className={[
        "w-full rounded-xl flex items-center gap-2 transition-all duration-150",
        "focus-within:ring-2 focus-within:ring-primary",
        selected
          ? "bg-primary/10 border-2 border-primary"
          : "bg-muted border-2 border-transparent hover:border-primary/30 hover:bg-muted/80",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        style={{ minHeight: 52 }}
        className={[
          "flex-1 px-5 py-3.5 rounded-xl text-left text-base font-medium cursor-pointer",
          "focus-visible:outline-none",
          "flex items-center gap-3",
          selected ? "text-primary" : "text-foreground",
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
      {onListen && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onListen() }}
          aria-label={listenAriaLabel ?? "Read this option"}
          style={{ minWidth: 40, minHeight: 40 }}
          className="mr-2 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Volume2 size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

function SingleSelectButton({
  label,
  selected,
  onSelect,
  onListen,
  listenAriaLabel,
}: {
  label: string
  selected: boolean
  onSelect: () => void
  onListen?: () => void
  listenAriaLabel?: string
}) {
  return (
    <div
      className={[
        "w-full rounded-xl flex items-center gap-2 transition-all duration-150",
        "focus-within:ring-2 focus-within:ring-primary",
        selected
          ? "bg-primary/10 border-2 border-primary"
          : "bg-muted border-2 border-transparent hover:border-primary/30 hover:bg-muted/80",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        style={{ minHeight: 52 }}
        className={[
          "flex-1 px-5 py-3.5 rounded-xl text-left text-base font-medium cursor-pointer",
          "focus-visible:outline-none",
          "flex items-center gap-3",
          selected ? "text-primary" : "text-foreground",
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
      {onListen && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onListen() }}
          aria-label={listenAriaLabel ?? "Read this option"}
          style={{ minWidth: 40, minHeight: 40 }}
          className="mr-2 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Volume2 size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

function ContinueButton({ onClick }: { onClick: () => void }) {
  const tCommon = useTranslations("common")
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ minHeight: 52, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
      className="w-full rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {tCommon("continue")}
    </button>
  )
}

function EmergencyNote({ country }: { country: string }) {
  const t = useTranslations("onboarding.emergency")
  const number = getEmergencyNumber(country) || "112"
  const display = country ? `${number} (${country})` : number

  function handleCall() {
    window.location.href = `tel:${number}`
  }

  return (
    <div
      className="p-4 rounded-xl border border-border bg-muted/40 flex flex-col gap-2"
      role="note"
    >
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t("description")}
      </p>
      <button
        type="button"
        onClick={handleCall}
        style={{ minHeight: 44 }}
        className="self-start px-4 py-2 rounded-lg text-sm font-semibold bg-background border border-border text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
        aria-label={t("aria", { display })}
      >
        {t("button", { display })}
      </button>
    </div>
  )
}
