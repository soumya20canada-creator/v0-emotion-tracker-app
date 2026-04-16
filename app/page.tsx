"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { EmotionWheel } from "@/components/emotion-wheel"
import { IntensitySlider } from "@/components/intensity-slider"
import { SubEmotionPicker } from "@/components/sub-emotion-picker"
import { ActionCards } from "@/components/action-cards"
import { CrisisGames } from "@/components/crisis-games"
import { ProgressTracker } from "@/components/progress-tracker"
import { NavBar } from "@/components/nav-bar"
import { PointPopup } from "@/components/point-popup"
import { BadgePopup } from "@/components/badge-popup"
import { AppLogo } from "@/components/app-logo"
import { LocationPicker } from "@/components/location-picker"
import { CrisisResources } from "@/components/crisis-resources"
import { ContextTagPicker } from "@/components/context-tag-picker"
import { AuthGate } from "@/components/auth-gate"
import { ThemePicker } from "@/components/theme-picker"
import { MusicPlayer } from "@/components/music-player"
import { OnboardingTooltips } from "@/components/onboarding-tooltips"
import { HowItWorks } from "@/components/how-it-works"
import { EmotionDescribe } from "@/components/emotion-describe"
import { BadgesPage } from "@/components/badges-page"
import { PatternsPage } from "@/components/patterns-page"
import { LanguagePopup } from "@/components/language-popup"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { AccountSettings } from "@/components/account-settings"
import { PersonalizedResources } from "@/components/personalized-resources"
import { PronunciationGuide } from "@/components/pronunciation-guide"
import {
  type EmotionCategory,
  type MicroAction,
  INTENSITY_OPTIONS,
  getActionsForEmotion,
} from "@/lib/emotions-data"
import {
  type GameState,
  loadState,
  saveState,
  processCheckIn,
} from "@/lib/game-store"
import { getSession, onAuthStateChange, onPasswordRecovery, updatePassword } from "@/lib/auth"
import { getProfile, updateProfile, saveOnboardingSession, type Profile } from "@/lib/profile"
import { applyTheme } from "@/lib/themes"
import { getRegionById } from "@/lib/crisis-resources"
import type { Badge } from "@/lib/emotions-data"
import type { ThemeId } from "@/lib/themes"
import { hasSelectedLanguage, getSavedLanguage, saveLanguage } from "@/lib/languages"
import type { OnboardingSession } from "@/lib/onboarding-data"
import { ArrowLeft, Sparkles, X, Lock, Info, Eye, EyeOff } from "lucide-react"

type Screen = "home" | "describe" | "sub-emotion" | "context" | "intensity" | "actions" | "crisis" | "progress" | "badges" | "patterns"

export default function BhavaApp() {
  const [authReady, setAuthReady] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [currentTheme, setCurrentTheme] = useState("default")

  // Language state
  const [langReady, setLangReady] = useState(false)
  const [showLangPopup, setShowLangPopup] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("en")

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false)
  const [lastOnboardingSession, setLastOnboardingSession] = useState<OnboardingSession | null>(null)

  // App settings
  const [showSettings, setShowSettings] = useState(false)

  const [screen, setScreen] = useState<Screen>("home")
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionCategory | null>(null)
  const [subEmotions, setSubEmotions] = useState<string[]>([])
  const [contextTags, setContextTags] = useState<string[]>([])
  const [journalNote, setJournalNote] = useState("")
  const [intensity, setIntensity] = useState(3)
  const [actions, setActions] = useState<MicroAction[]>([])
  const [completedActionIds, setCompletedActionIds] = useState<string[]>([])
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [pointPopup, setPointPopup] = useState<{ points: number; color: string } | null>(null)
  const [badgePopup, setBadgePopup] = useState<Badge | null>(null)
  const [showCrisis, setShowCrisis] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const badgeQueueRef = useRef<Badge[]>([])

  // 1. Check language selection on mount
  useEffect(() => {
    const hasLang = hasSelectedLanguage()
    const savedLang = getSavedLanguage()
    setCurrentLanguage(savedLang)
    setShowLangPopup(!hasLang)
    setLangReady(true)
  }, [])

  // 2. Auth check on mount
  useEffect(() => {
    getSession().then((session) => {
      if (session?.user) {
        getProfile(session.user.id).then((p) => {
          setProfile(p)
          if (p?.color_theme) {
            setCurrentTheme(p.color_theme)
            applyTheme(p.color_theme)
          }
          if (p) {
            setIsFirstTimeUser(!p.onboarding_completed)
            setIsNewUser(!p.onboarding_completed)
            setShowOnboarding(true)
          }
          setAuthReady(true)
        })
      } else {
        setAuthReady(true)
      }
    })
    const unsub = onAuthStateChange((user) => {
      if (!user) {
        setProfile(null)
        setGameState(null)
        setShowOnboarding(false)
        setLastOnboardingSession(null)
      }
    })
    const unsubRecovery = onPasswordRecovery(() => setShowPasswordReset(true))
    return () => { unsub(); unsubRecovery() }
  }, [])

  useEffect(() => {
    if (profile) setGameState(loadState())
  }, [profile])

  const handleLanguageSelect = useCallback((code: string) => {
    setCurrentLanguage(code)
    saveLanguage(code)
    setShowLangPopup(false)
    if (profile) updateProfile(profile.id, { language: code })
  }, [profile])

  const handleAuthenticated = useCallback((p: Profile, newUser: boolean) => {
    setProfile(p)
    setCurrentTheme(p.color_theme)
    applyTheme(p.color_theme)
    setGameState(loadState())
    setIsNewUser(newUser || !p.onboarding_completed)
    setIsFirstTimeUser(!p.onboarding_completed)
    setShowOnboarding(true)
  }, [])

  const handleOnboardingComplete = useCallback(async (
    session: OnboardingSession,
    country?: string,
    identity?: string[],
    gender?: string[],
    pronouns?: string
  ) => {
    setLastOnboardingSession(session)
    setShowOnboarding(false)

    if (!profile) return

    // Save onboarding session to Supabase
    await saveOnboardingSession(profile.id, session)

    // Update profile fields
    const profileUpdates: Partial<Profile> = { onboarding_completed: true }
    if (country) profileUpdates.country = country
    if (identity) profileUpdates.identity_selections = identity
    if (gender) profileUpdates.gender_identity = gender
    if (pronouns) profileUpdates.pronouns = pronouns

    await updateProfile(profile.id, profileUpdates)
    setProfile((prev) => prev ? { ...prev, ...profileUpdates } : prev)
  }, [profile])

  const handleOnboardingSkip = useCallback(() => {
    setShowOnboarding(false)
    // Save empty session
    if (profile) saveOnboardingSession(profile.id, {
      current_situation: [],
      whats_been_going_on: [],
      body_feelings: [],
      duration: "",
      support_preferences: [],
    }).catch(() => {})
  }, [profile])

  const handleThemeChange = useCallback((themeId: ThemeId) => {
    setCurrentTheme(themeId)
  }, [])

  const handleEmotionSelect = useCallback((emotion: EmotionCategory) => {
    setSelectedEmotion(emotion)
    setSubEmotions([])
    setJournalNote("")
    setScreen("describe")
  }, [])

  const handleDescribeContinue = useCallback((note: string) => {
    setJournalNote(note)
    setScreen("sub-emotion")
  }, [])

  const handleSubEmotionToggle = useCallback((sub: string) => {
    setSubEmotions((prev) => prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub])
  }, [])

  const handleIntensityConfirm = useCallback(() => {
    if (!selectedEmotion) return
    const a = getActionsForEmotion(selectedEmotion.id, intensity)
    setActions(a)
    setCompletedActionIds([])
    const option = INTENSITY_OPTIONS.find((o) => o.level === intensity)
    setShowCrisis(option?.isCrisis || false)
    setScreen("actions")
  }, [selectedEmotion, intensity])

  const showNextBadge = useCallback(() => {
    if (badgeQueueRef.current.length > 0) {
      setBadgePopup(badgeQueueRef.current.shift()!)
    }
  }, [])

  const handleActionComplete = useCallback((action: MicroAction) => {
    if (!selectedEmotion || !gameState) return
    setCompletedActionIds((prev) => [...prev, action.id])
    setPointPopup({ points: action.points, color: selectedEmotion.color })
    const subLabel = subEmotions.length > 0 ? subEmotions.join(", ") : selectedEmotion.label
    const newState = processCheckIn(
      gameState, selectedEmotion.id, subLabel, intensity,
      [{ id: action.id, points: action.points, category: action.category }],
      showCrisis, contextTags, journalNote
    )
    const newlyUnlocked = newState.badges.filter(
      (b) => b.unlocked && !gameState.badges.find((ob) => ob.id === b.id && ob.unlocked)
    )
    setGameState(newState)
    if (newlyUnlocked.length > 0) {
      badgeQueueRef.current.push(...newlyUnlocked)
      setTimeout(showNextBadge, 1400)
    }
  }, [selectedEmotion, gameState, subEmotions, intensity, showCrisis, showNextBadge, contextTags, journalNote])

  const handleCrisisComplete = useCallback(() => {
    if (!selectedEmotion || !gameState) return
    setPointPopup({ points: 25, color: selectedEmotion.color })
    const subLabel = subEmotions.length > 0 ? subEmotions.join(", ") : selectedEmotion.label
    const newState = processCheckIn(
      gameState, selectedEmotion.id, subLabel, intensity,
      [{ id: "crisis-game", points: 25, category: "mindful" }],
      true, contextTags, journalNote
    )
    const newlyUnlocked = newState.badges.filter(
      (b) => b.unlocked && !gameState.badges.find((ob) => ob.id === b.id && ob.unlocked)
    )
    setGameState(newState)
    if (newlyUnlocked.length > 0) {
      badgeQueueRef.current.push(...newlyUnlocked)
      setTimeout(showNextBadge, 1400)
    }
  }, [selectedEmotion, gameState, subEmotions, intensity, showNextBadge, contextTags, journalNote])

  const handleRegionSelect = useCallback((regionId: string) => {
    if (!gameState) return
    const updated = { ...gameState, selectedRegion: regionId }
    setGameState(updated)
    saveState(updated)
  }, [gameState])

  const handleReset = useCallback(() => {
    setSelectedEmotion(null)
    setSubEmotions([])
    setContextTags([])
    setJournalNote("")
    setIntensity(3)
    setActions([])
    setCompletedActionIds([])
    setShowCrisis(false)
    setScreen("home")
  }, [])

  const handleNavigate = useCallback((target: string) => {
    if (target === "home") handleReset()
    else if (target === "progress") setScreen("progress")
    else if (target === "badges") setScreen("badges")
    else if (target === "patterns") setScreen("patterns")
  }, [handleReset])

  // Loading
  if (!langReady || !authReady) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-background">
        <AppLogo size={48} />
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label="Loading" role="status" />
      </div>
    )
  }

  // Language popup (shown before everything else when first visit)
  if (showLangPopup) {
    return <LanguagePopup onSelect={handleLanguageSelect} />
  }

  // Auth gate
  if (!profile) {
    return <AuthGate onAuthenticated={handleAuthenticated} />
  }

  // Onboarding
  if (showOnboarding) {
    return (
      <OnboardingFlow
        isNewUser={isFirstTimeUser}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    )
  }

  // Account settings (full-screen overlay)
  if (showSettings) {
    return (
      <AccountSettings
        profile={profile}
        onClose={() => setShowSettings(false)}
        onProfileUpdate={(updates) => setProfile((prev) => prev ? { ...prev, ...updates } : prev)}
        onAccountDeleted={() => { setProfile(null); setShowSettings(false) }}
      />
    )
  }

  if (!gameState) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label="Loading" role="status" />
      </div>
    )
  }

  const greetingName = profile.first_name ?? profile.display_name ?? profile.username ?? "friend"
  const supportPrefs = lastOnboardingSession?.support_preferences ?? []
  const country = profile.country ?? null

  return (
    <main className="min-h-dvh bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            {screen !== "home" && screen !== "progress" && screen !== "badges" && screen !== "patterns" && (
              <button
                onClick={() => {
                  if (screen === "sub-emotion") setScreen("home")
                  else if (screen === "context") setScreen("sub-emotion")
                  else if (screen === "intensity") setScreen("context")
                  else if (screen === "actions") setScreen("intensity")
                }}
                style={{ minWidth: 44, minHeight: 44 }}
                className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-foreground" />
              </button>
            )}
            <AppLogo size={32} />
            <div className="flex items-center gap-1.5">
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
              <PronunciationGuide size="sm" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10">
              <Sparkles size={14} className="text-primary" aria-hidden="true" />
              <span className="text-sm font-bold text-primary">{gameState.totalPoints}</span>
            </div>
            <LocationPicker selectedRegion={gameState.selectedRegion} onSelect={handleRegionSelect} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-5 py-8">
        {screen === "home" && (
          <div className="flex flex-col items-center gap-8">
            {/* Daily check-in status */}
            {(() => {
              const today = new Date().toISOString().slice(0, 10)
              const checkedInToday = gameState.checkIns.some(c => c.date === today)
              return (
                <div className="w-full p-4 rounded-2xl flex items-center gap-3 border border-border"
                  style={{ background: checkedInToday ? "#10B98110" : "var(--secondary)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: checkedInToday ? "#10B98120" : "var(--muted)" }}
                    aria-hidden="true"
                  >
                    {checkedInToday ? (
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-foreground">
                      {checkedInToday ? "Checked in today" : "No check-in yet today"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {checkedInToday
                        ? `${gameState.currentStreak}-day streak. Keep going.`
                        : "It takes 30 seconds. You are worth it."}
                    </p>
                  </div>
                  {checkedInToday && gameState.currentStreak > 1 && (
                    <div className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: "#F59E0B20", color: "#F59E0B" }}
                      aria-label={`${gameState.currentStreak} day streak`}
                    >
                      {gameState.currentStreak}d
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Personalized resources (shown if we have onboarding data) */}
            {(supportPrefs.length > 0 || country) && (
              <PersonalizedResources
                supportPreferences={supportPrefs}
                country={country}
              />
            )}

            {/* Hero headline */}
            <div className="text-center flex flex-col gap-2">
              <h1 className="text-3xl font-extrabold text-foreground leading-tight text-balance">
                Understand your emotions,<br />one day at a time.
              </h1>
              <p className="text-base text-muted-foreground italic">
                Welcome back, {greetingName} {profile.avatar_emoji}
              </p>
              <p className="text-sm text-muted-foreground/50 tracking-widest">भाव · the felt sense of being</p>
            </div>

            {/* Emotion wheel */}
            <EmotionWheel onSelect={handleEmotionSelect} selectedId={selectedEmotion?.id || null} />

            {/* See how it works */}
            <button
              onClick={() => setShowHowItWorks(true)}
              style={{ minHeight: 44 }}
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-2"
            >
              <Info size={15} aria-hidden="true" />
              See how it works
            </button>

            {/* Session options */}
            {supportPrefs.length > 0 && (
              <div className="w-full flex flex-col gap-3">
                <div className="w-full h-px bg-border" aria-hidden="true" />
                <p className="text-sm font-semibold text-muted-foreground text-center">What would you like to do?</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setShowOnboarding(true)}
                    style={{ minHeight: 48 }}
                    className="w-full py-3 rounded-2xl text-base font-semibold border border-border text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Look for another resource
                  </button>
                  <button
                    onClick={async () => {
                      import("@/lib/auth").then(({ signOut }) => signOut().then(() => window.location.reload()))
                    }}
                    style={{ minHeight: 48 }}
                    className="w-full py-3 rounded-2xl text-base font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Save and come back later
                  </button>
                  <button
                    onClick={async () => {
                      import("@/lib/auth").then(({ signOut }) => {
                        setLastOnboardingSession(null)
                        signOut().then(() => window.location.reload())
                      })
                    }}
                    style={{ minHeight: 48 }}
                    className="w-full py-3 rounded-2xl text-base font-semibold border border-border text-muted-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Log out and start fresh
                  </button>
                </div>
              </div>
            )}

            {/* Privacy badge */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground/50">
              <Lock size={12} aria-hidden="true" />
              <span>Your data is private and never sold</span>
            </div>

            {/* Science note */}
            <div className="w-full p-5 rounded-2xl bg-secondary border border-border">
              <p className="text-base text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Why this works: </strong>
                Naming what you feel literally quiets your brain's alarm system.
                Science calls it affect labeling — and pairing a feeling with a small action rewires how your nervous system responds over time.{" "}
                <span className="text-sm opacity-60">Lieberman et al., 2007 · Lejuez et al., 2001</span>
              </p>
            </div>
          </div>
        )}

        {screen === "describe" && selectedEmotion && (
          <EmotionDescribe
            emotion={selectedEmotion}
            onContinue={handleDescribeContinue}
          />
        )}

        {screen === "sub-emotion" && selectedEmotion && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{ background: selectedEmotion.color, color: "#FFFFFF" }}
                aria-hidden="true"
              >
                {selectedEmotion.label.slice(0, 2)}
              </div>
              <h2 className="text-2xl font-extrabold text-foreground text-balance text-center">
                You picked: {selectedEmotion.label}
              </h2>
              <p className="text-base text-muted-foreground text-center">Can you get more specific?</p>
            </div>
            <SubEmotionPicker emotion={selectedEmotion} selected={subEmotions} onToggle={handleSubEmotionToggle} />
            <button
              onClick={() => setScreen("context")}
              style={{ background: selectedEmotion.color, color: "#FFFFFF", boxShadow: `0 4px 20px ${selectedEmotion.color}44`, minHeight: 52 }}
              className="w-full max-w-sm mx-auto rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {subEmotions.length > 0 ? `Continue with ${subEmotions.length} selected` : "Skip — keep it simple"}
            </button>
          </div>
        )}

        {screen === "context" && selectedEmotion && (
          <div className="flex flex-col gap-8">
            {(() => {
              const isJoy   = selectedEmotion.id === "joy"
              const isCalm  = selectedEmotion.id === "calm"
              const heading = isJoy  ? "What's behind this happiness?"
                            : isCalm ? "What's helping you feel at peace?"
                            : "What is this about?"
              const subtext = isJoy  ? "What's been a part of this good feeling? Tag as many as feel true."
                            : isCalm ? "What's been supporting this feeling? Tag as many as feel true."
                            : "Tag what might be stirring this feeling. Pick as many as feel true."
              const skipLabel = isJoy  ? "Skip — just feeling it"
                              : isCalm ? "Skip — just at peace"
                              : "Skip — not sure why"
              return (
                <>
                  <div className="flex flex-col items-center gap-3">
                    <h2 className="text-2xl font-extrabold text-foreground text-center text-balance">{heading}</h2>
                    <p className="text-base text-muted-foreground text-center leading-relaxed">{subtext}</p>
                  </div>
                  <ContextTagPicker selected={contextTags} onToggle={(tagId) => setContextTags((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId])} accentColor={selectedEmotion.color} />
                  <button
                    onClick={() => setScreen("intensity")}
                    style={{ background: selectedEmotion.color, color: "#FFFFFF", boxShadow: `0 4px 20px ${selectedEmotion.color}44`, minHeight: 52 }}
                    className="w-full max-w-sm mx-auto rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {contextTags.length > 0 ? `Continue with ${contextTags.length} tag${contextTags.length !== 1 ? "s" : ""}` : skipLabel}
                  </button>
                </>
              )
            })()}
          </div>
        )}

        {screen === "intensity" && selectedEmotion && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-2xl font-extrabold text-foreground text-center text-balance">How big is this feeling?</h2>
              <p className="text-base text-muted-foreground text-center">
                {subEmotions.length > 0 ? `Feeling ${subEmotions.join(", ")}` : `Feeling ${selectedEmotion.label.toLowerCase()}`}
              </p>
            </div>
            <IntensitySlider emotion={selectedEmotion} intensity={intensity} onChange={setIntensity} onConfirm={handleIntensityConfirm} />
          </div>
        )}

        {screen === "actions" && selectedEmotion && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: `${selectedEmotion.color}12` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold shrink-0"
                style={{ background: selectedEmotion.color, color: "#FFFFFF" }}
                aria-hidden="true"
              >
                {selectedEmotion.label.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-foreground">
                  {selectedEmotion.label}{subEmotions.length > 0 ? ` · ${subEmotions.join(", ")}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {INTENSITY_OPTIONS.find((o) => o.level === intensity)?.label || ""}
                </p>
                {journalNote && <p className="text-sm text-muted-foreground mt-1 italic leading-relaxed">"{journalNote}"</p>}
                {contextTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {contextTags.map((tagId) => (
                      <span key={tagId} className="text-sm font-medium px-2 py-0.5 rounded-full"
                        style={{ background: `${selectedEmotion.color}15`, color: selectedEmotion.color }}>
                        {tagId.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowCrisis(!showCrisis)}
              style={{ minHeight: 52, borderColor: selectedEmotion.color, background: showCrisis ? selectedEmotion.color : "transparent", color: showCrisis ? "#FFFFFF" : selectedEmotion.color }}
              className="w-full rounded-2xl text-base font-bold border-2 transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showCrisis ? "Hide grounding toolkit" : INTENSITY_OPTIONS.find((o) => o.level === intensity)?.isCrisis ? "Sometimes feelings get really big — we've got you" : "Open grounding toolkit"}
            </button>

            {showCrisis && (
              <CrisisGames emotion={selectedEmotion} onClose={() => setShowCrisis(false)} onComplete={handleCrisisComplete} />
            )}

            {gameState.selectedRegion ? (
              (() => {
                const regionData = getRegionById(gameState.selectedRegion)
                if (!regionData) return null
                return <CrisisResources region={regionData} accentColor={selectedEmotion.color} />
              })()
            ) : showCrisis ? (
              <div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border-2 border-accent/30">
                <p className="text-base font-bold text-foreground">Where are you right now?</p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  These people care and want to help. Let us show you the right ones for where you are.
                </p>
                <LocationPicker selectedRegion={gameState.selectedRegion} onSelect={handleRegionSelect} />
              </div>
            ) : null}

            <ActionCards actions={actions} emotion={selectedEmotion} onComplete={handleActionComplete} completedIds={completedActionIds} />

            {completedActionIds.length > 0 && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setScreen("progress")}
                  style={{ minHeight: 48, borderColor: selectedEmotion?.color, color: selectedEmotion?.color, background: `${selectedEmotion?.color}10` }}
                  className="w-full rounded-2xl text-base font-semibold border-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Track your journey
                </button>
                <button
                  onClick={handleReset}
                  style={{ minHeight: 52, boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)" }}
                  className="w-full rounded-2xl text-lg font-bold bg-primary text-primary-foreground cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Come back to yourself again
                </button>
              </div>
            )}

            <div className="p-5 rounded-2xl bg-secondary border border-border">
              <p className="text-base text-muted-foreground leading-relaxed">
                <strong className="text-foreground">The science behind this: </strong>
                Even the smallest action can shift how your body holds a feeling. Behavioral activation research (Lejuez et al., 2001) shows that movement and intention create new emotional pathways — not overnight, but one moment at a time.
              </p>
            </div>
          </div>
        )}

        {screen === "progress" && (
          <ProgressTracker gameState={gameState} onClose={handleReset} displayName={greetingName} />
        )}

        {screen === "badges" && (
          <BadgesPage gameState={gameState} />
        )}

        {screen === "patterns" && (
          <PatternsPage gameState={gameState} />
        )}
      </div>

      {/* Ambient music */}
      <MusicPlayer emotionId={selectedEmotion?.id ?? null} accentColor={selectedEmotion?.color} />

      {/* Point popup */}
      {pointPopup && <PointPopup points={pointPopup.points} color={pointPopup.color} onDone={() => setPointPopup(null)} />}

      {/* Badge popup */}
      {badgePopup && <BadgePopup badge={badgePopup} onDone={() => { setBadgePopup(null); showNextBadge() }} />}

      {/* Theme picker modal */}
      {showThemePicker && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/30 backdrop-blur-sm"
          onClick={() => setShowThemePicker(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Theme picker"
        >
          <div
            className="w-full max-w-lg bg-card rounded-t-3xl p-5 pb-10 shadow-2xl border-t border-border/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" aria-hidden="true" />
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-foreground">Your palette</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Pick the look that feels like you.</p>
              </div>
              <button
                onClick={() => setShowThemePicker(false)}
                style={{ minWidth: 44, minHeight: 44 }}
                className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close theme picker"
              >
                <X size={16} />
              </button>
            </div>
            <ThemePicker userId={profile.id} currentTheme={currentTheme} onThemeChange={handleThemeChange} />
          </div>
        </div>
      )}

      {/* Language picker modal */}
      {showLangPopup && (
        <LanguagePopup onSelect={handleLanguageSelect} />
      )}

      {/* How it works modal */}
      {showHowItWorks && <HowItWorks onClose={() => setShowHowItWorks(false)} />}

      {/* Password reset modal */}
      {showPasswordReset && (
        <PasswordResetModal onDone={() => setShowPasswordReset(false)} />
      )}

      {/* Onboarding tooltips */}
      <OnboardingTooltips isNewUser={isNewUser} />

      {/* Bottom nav */}
      <NavBar
        activeScreen={screen === "progress" ? "progress" : screen === "badges" ? "badges" : screen === "patterns" ? "patterns" : "home"}
        onNavigate={handleNavigate}
        streak={gameState.currentStreak}
        points={gameState.totalPoints}
        displayName={greetingName}
        avatarEmoji={profile.avatar_emoji}
        onShowThemes={() => setShowThemePicker(true)}
        onShowSettings={() => setShowSettings(true)}
        language={currentLanguage}
        onShowLanguage={() => setShowLangPopup(true)}
      />
    </main>
  )
}

function PasswordResetModal({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError("Password must be at least 8 characters."); return }
    if (password !== confirm) { setError("Passwords don't match."); return }
    setLoading(true)
    setError(null)
    const { error } = await updatePassword(password)
    setLoading(false)
    if (error) { setError("Couldn't update your password. Please try again."); return }
    setDone(true)
    setTimeout(onDone, 2000)
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Create new password"
    >
      <div className="w-full max-w-sm bg-card rounded-3xl p-7 shadow-2xl border border-border flex flex-col gap-5">
        {done ? (
          <div className="flex flex-col items-center gap-3 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center" aria-hidden="true">
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-lg font-bold text-foreground">Password updated</p>
            <p className="text-base text-muted-foreground">Taking you back to your space...</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Create new password</h2>
              <p className="text-base text-muted-foreground mt-1">Choose something you will remember.</p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-password" className="text-sm font-semibold text-foreground">New password</label>
                <div className="relative">
                  <input
                    id="reset-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                    style={{ minHeight: 48 }}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    style={{ minWidth: 44, minHeight: 44 }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground hover:text-foreground transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-confirm" className="text-sm font-semibold text-foreground">Confirm new password</label>
                <input
                  id="reset-confirm"
                  type={showPw ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  style={{ minHeight: 48 }}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-base"
                />
              </div>
              {error && <p className="text-sm text-destructive text-center" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={loading || !password || !confirm}
                style={{ minHeight: 52, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
                className="w-full rounded-2xl font-bold text-base transition-all duration-200 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {loading ? "Saving..." : "Save new password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
