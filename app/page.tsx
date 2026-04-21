"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { EmotionWheel } from "@/components/emotion-wheel"
import { IntensitySlider } from "@/components/intensity-slider"
import { SubEmotionPicker } from "@/components/sub-emotion-picker"
import { ActionCards } from "@/components/action-cards"
import { CrisisGames } from "@/components/crisis-games"
import { ProgressTracker } from "@/components/progress-tracker"
import { NavBar } from "@/components/nav-bar"
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
import { MySpace } from "@/components/my-space"
import { PatternsPage } from "@/components/patterns-page"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { AccountSettings } from "@/components/account-settings"
import { PronunciationGuide } from "@/components/pronunciation-guide"
import { AcknowledgmentScreen } from "@/components/acknowledgment-screen"
import { LegalAid } from "@/components/legal-aid"
import { WelcomeBack } from "@/components/welcome-back"
import { NormalizeHelp } from "@/components/normalize-help"
import { ThemeHeader } from "@/components/theme-header"
import { Breathing } from "@/components/breathing"
import { Journal } from "@/components/journal"
import { GroundingNotes } from "@/components/grounding-notes"
import { Meditate } from "@/components/meditate"
import { FindTherapist } from "@/components/find-therapist"
import { FindCommunity } from "@/components/find-community"
import { SessionCheckout, type PositiveEmotionId } from "@/components/session-checkout"
import { CrisisChip } from "@/components/crisis-chip"
import {
  type EmotionCategory,
  type MicroAction,
  EMOTION_CATEGORIES,
  INTENSITY_OPTIONS,
  getActionsForEmotion,
  scoreActionsForSession,
} from "@/lib/emotions-data"
import {
  type GameState,
  loadState,
  saveState,
  clearState,
  clearLegacyState,
  processCheckIn,
  daysSinceLastCheckIn,
  longestStreak,
} from "@/lib/game-store"
import { hydrateFromSupabase } from "@/lib/supabase-sync"
import { getSession, onAuthStateChange, onPasswordRecovery, updatePassword } from "@/lib/auth"
import { getProfile, createProfile, updateProfile, saveOnboardingSession, type Profile } from "@/lib/profile"
import { applyTheme } from "@/lib/themes"
import { getRegionById } from "@/lib/crisis-resources"
import type { Moment } from "@/lib/emotions-data"
import type { ThemeId } from "@/lib/themes"
import type { OnboardingSession, PathChoice, ToolSuggestionId } from "@/lib/onboarding-data"
import { countryToRegionId, situationToContextTags, bodyToEmotion, durationToIntensity, bodyFeelingPhrase } from "@/lib/onboarding-data"
import { upcomingCulturalDay } from "@/lib/cultural-calendar"
import { taglineFor } from "@/lib/cultural-taglines"
import { monthKey, previousMonthStart } from "@/lib/monthly-report"
import { ArrowLeft, X, Lock, Info, Eye, EyeOff, Wind, BookOpenText, Feather, Headphones, ArrowRight, ChevronRight } from "lucide-react"

type Screen = "home" | "wheel" | "describe" | "sub-emotion" | "context" | "intensity" | "actions" | "crisis" | "progress" | "badges" | "patterns"

export default function BhavaApp() {
  const [authReady, setAuthReady] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [currentTheme, setCurrentTheme] = useState("default")

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showNormalizeHelp, setShowNormalizeHelp] = useState(false)
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false)
  const [lastOnboardingSession, setLastOnboardingSession] = useState<OnboardingSession | null>(null)

  // Post-onboarding flow state
  const [showAcknowledgment, setShowAcknowledgment] = useState(false)
  const [showSupportView, setShowSupportView] = useState(false)
  const [showFindTherapist, setShowFindTherapist] = useState(false)
  const [showFindCommunity, setShowFindCommunity] = useState(false)
  const [showLegalAid, setShowLegalAid] = useState(false)
  const [actionsHint, setActionsHint] = useState<string | null>(null)

  // App settings
  const [showSettings, setShowSettings] = useState(false)

  // Monthly report auto-open
  const [autoOpenMonth, setAutoOpenMonth] = useState(false)

  // Guided-session tool + check-out
  const [activeTool, setActiveTool] = useState<ToolSuggestionId | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [fromGuidedSession, setFromGuidedSession] = useState(false)

  // Per-session location ask — refresh each time the app opens
  const locationSessionClearedRef = useRef(false)

  const [screen, setScreen] = useState<Screen>("home")
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionCategory | null>(null)
  const [subEmotions, setSubEmotions] = useState<string[]>([])
  const [contextTags, setContextTags] = useState<string[]>([])
  const [journalNote, setJournalNote] = useState("")
  const [intensity, setIntensity] = useState(3)
  const [actions, setActions] = useState<MicroAction[]>([])
  const [completedActionIds, setCompletedActionIds] = useState<string[]>([])
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [momentPopup, setMomentPopup] = useState<Moment | null>(null)
  const [showCrisis, setShowCrisis] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const momentQueueRef = useRef<Moment[]>([])

  // Auth check on mount
  useEffect(() => {
    clearLegacyState()
    getSession().then((session) => {
      if (session?.user) {
        getProfile(session.user.id).then(async (p) => {
          if (p) {
            setProfile(p)
            if (p.color_theme) {
              setCurrentTheme(p.color_theme)
              applyTheme(p.color_theme)
            }
            setIsFirstTimeUser(!p.onboarding_completed)
            setIsNewUser(!p.onboarding_completed)
            if (!p.onboarding_completed) {
              setShowNormalizeHelp(true)
            } else {
              setShowWelcomeBack(true)
            }
          } else {
            // New user via Google OAuth — no profile exists yet, create one
            const u = session.user
            const firstName =
              u.user_metadata?.full_name?.split(" ")[0] ??
              u.user_metadata?.name?.split(" ")[0] ??
              u.email?.split("@")[0] ??
              "Friend"
            const newProfile = await createProfile(u.id, u.email ?? "", firstName)
            if (newProfile) {
              setProfile(newProfile)
              setCurrentTheme(newProfile.color_theme)
              applyTheme(newProfile.color_theme)
              setIsFirstTimeUser(true)
              setIsNewUser(true)
              setShowNormalizeHelp(true)
            }
          }
          setAuthReady(true)
        })
      } else {
        setAuthReady(true)
      }
    })
    const unsub = onAuthStateChange((user) => {
      if (!user) {
        setProfile((prev) => {
          if (prev) clearState(prev.id)
          return null
        })
        setGameState(null)
        setShowOnboarding(false)
        setShowNormalizeHelp(false)
        setShowWelcomeBack(false)
        setLastOnboardingSession(null)
      }
    })
    const unsubRecovery = onPasswordRecovery(() => setShowPasswordReset(true))
    return () => { unsub(); unsubRecovery() }
  }, [])

  useEffect(() => {
    if (!profile) return
    let cancelled = false
    const local = loadState(profile.id)
    setGameState(local)
    hydrateFromSupabase(profile.id).then((remote) => {
      if (cancelled || !remote) return
      const merged: GameState = {
        ...remote,
        selectedRegion: local.selectedRegion ?? remote.selectedRegion ?? null,
      }
      setGameState(merged)
      saveState(merged, profile.id)
    })
    return () => { cancelled = true }
  }, [profile])

  // Per-session location ask — clear selectedRegion once per browser session
  // so the user is always asked "where are you right now?"
  useEffect(() => {
    if (!profile || !gameState || locationSessionClearedRef.current) return
    locationSessionClearedRef.current = true
    try {
      const key = `bhava-region-session-set:${profile.id}`
      const alreadySet = typeof window !== "undefined" ? sessionStorage.getItem(key) : null
      if (!alreadySet && gameState.selectedRegion) {
        setGameState({ ...gameState, selectedRegion: null })
      }
    } catch {
      // noop
    }
  }, [profile, gameState])

  // Auto-open monthly report once per month (only for returning, onboarded users)
  useEffect(() => {
    if (!profile || !gameState) return
    if (showOnboarding || showNormalizeHelp || showWelcomeBack || showAcknowledgment) return
    if (autoOpenMonth) return
    try {
      const key = `bhava-last-monthly-report-viewed:${profile.id}`
      const prevKey = monthKey(previousMonthStart())
      const lastViewed = typeof window !== "undefined" ? localStorage.getItem(key) : null
      if (lastViewed === prevKey) return
      const prevStart = previousMonthStart()
      const prevEnd = new Date(prevStart.getFullYear(), prevStart.getMonth() + 1, 1)
      const hasCheckIns = gameState.checkIns.some((c) => {
        const d = c.timestamp ? new Date(c.timestamp) : new Date(`${c.date}T00:00:00`)
        return d >= prevStart && d < prevEnd
      })
      if (!hasCheckIns) return
      setAutoOpenMonth(true)
      setScreen("badges")
    } catch {
      // noop
    }
  }, [profile, gameState, showOnboarding, showNormalizeHelp, showWelcomeBack, showAcknowledgment, autoOpenMonth])

  const handleMonthReportViewed = useCallback((mKey: string) => {
    if (!profile) return
    try {
      localStorage.setItem(`bhava-last-monthly-report-viewed:${profile.id}`, mKey)
    } catch {
      // noop
    }
    setAutoOpenMonth(false)
  }, [profile])

  const handleAuthenticated = useCallback((p: Profile, newUser: boolean) => {
    setProfile(p)
    setCurrentTheme(p.color_theme)
    applyTheme(p.color_theme)
    setGameState(loadState(p.id))
    const firstTime = newUser || !p.onboarding_completed
    setIsNewUser(firstTime)
    setIsFirstTimeUser(firstTime)
    if (firstTime) {
      setShowNormalizeHelp(true)
    } else {
      setShowWelcomeBack(true)
    }
  }, [])

  const handleOnboardingComplete = useCallback(async (
    session: OnboardingSession,
    country?: string,
    identity?: string[],
    gender?: string[],
    pronouns?: string,
    currentRegion?: string | null
  ) => {
    setLastOnboardingSession(session)
    setShowOnboarding(false)
    setShowAcknowledgment(true)

    if (currentRegion && profile) {
      setGameState((prev) => {
        if (!prev) return prev
        const updated = { ...prev, selectedRegion: currentRegion }
        saveState(updated, profile.id)
        try { sessionStorage.setItem(`bhava-region-session-set:${profile.id}`, "1") } catch {}
        return updated
      })
    }

    if (!profile) return

    await saveOnboardingSession(profile.id, session)

    const profileUpdates: Partial<Profile> = { onboarding_completed: true }
    if (country) profileUpdates.country = country
    if (identity) profileUpdates.identity_selections = identity
    if (gender) profileUpdates.gender_identity = gender
    if (pronouns) profileUpdates.pronouns = pronouns

    await updateProfile(profile.id, profileUpdates)
    setProfile((prev) => prev ? { ...prev, ...profileUpdates } : prev)
  }, [profile])

  const toggleFavoriteTherapist = useCallback((id: string) => {
    if (!profile) return
    const cur = profile.favorite_therapist_ids ?? []
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    setProfile((prev) => prev ? { ...prev, favorite_therapist_ids: next } : prev)
    updateProfile(profile.id, { favorite_therapist_ids: next }).catch(() => {})
  }, [profile])

  const toggleFavoriteCommunity = useCallback((id: string) => {
    if (!profile) return
    const cur = profile.favorite_community_ids ?? []
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    setProfile((prev) => prev ? { ...prev, favorite_community_ids: next } : prev)
    updateProfile(profile.id, { favorite_community_ids: next }).catch(() => {})
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
    const sessionCtxTags = situationToContextTags(lastOnboardingSession)
    const mergedCtxTags = Array.from(new Set([...(contextTags ?? []), ...sessionCtxTags]))
    const a = scoreActionsForSession(selectedEmotion.id, intensity, {
      body_feelings: lastOnboardingSession?.body_feelings ?? [],
      whats_been_going_on: lastOnboardingSession?.whats_been_going_on ?? [],
      duration: lastOnboardingSession?.duration ?? "",
      context_tags: mergedCtxTags,
    })
    setActions(a.length > 0 ? a : getActionsForEmotion(selectedEmotion.id, intensity))
    setCompletedActionIds([])
    const option = INTENSITY_OPTIONS.find((o) => o.level === intensity)
    setShowCrisis(option?.isCrisis || false)
    setScreen("actions")
  }, [selectedEmotion, intensity, lastOnboardingSession, contextTags])

  const showNextMoment = useCallback(() => {
    if (momentQueueRef.current.length > 0) {
      setMomentPopup(momentQueueRef.current.shift()!)
    }
  }, [])

  const handleActionComplete = useCallback((action: MicroAction) => {
    if (!selectedEmotion || !gameState || !profile) return
    setCompletedActionIds((prev) => [...prev, action.id])
    const subLabel = subEmotions.length > 0 ? subEmotions.join(", ") : selectedEmotion.label
    const newState = processCheckIn(
      gameState, selectedEmotion.id, subLabel, intensity,
      [{ id: action.id, category: action.category }],
      showCrisis, contextTags, journalNote, profile.id
    )
    const newlyUnlocked = newState.moments.filter(
      (m) => m.unlocked && !gameState.moments.find((om) => om.id === m.id && om.unlocked)
    )
    setGameState(newState)
    if (newlyUnlocked.length > 0) {
      momentQueueRef.current.push(...newlyUnlocked)
      setTimeout(showNextMoment, 1400)
    }
  }, [selectedEmotion, gameState, profile, subEmotions, intensity, showCrisis, showNextMoment, contextTags, journalNote])

  const handleJustLog = useCallback(() => {
    if (!selectedEmotion || !gameState || !profile) return
    const subLabel = subEmotions.length > 0 ? subEmotions.join(", ") : selectedEmotion.label
    const newState = processCheckIn(
      gameState, selectedEmotion.id, subLabel, intensity,
      [{ id: "just-logged", category: "mindful" }],
      showCrisis, contextTags, journalNote, profile.id
    )
    setGameState(newState)
    if (fromGuidedSession) setShowCheckout(true)
    else setScreen("home")
  }, [selectedEmotion, gameState, profile, subEmotions, intensity, showCrisis, contextTags, journalNote, fromGuidedSession])

  const handleCrisisComplete = useCallback(() => {
    if (!selectedEmotion || !gameState || !profile) return
    const subLabel = subEmotions.length > 0 ? subEmotions.join(", ") : selectedEmotion.label
    const newState = processCheckIn(
      gameState, selectedEmotion.id, subLabel, intensity,
      [{ id: "crisis-game", category: "mindful" }],
      true, contextTags, journalNote, profile.id
    )
    const newlyUnlocked = newState.moments.filter(
      (m) => m.unlocked && !gameState.moments.find((om) => om.id === m.id && om.unlocked)
    )
    setGameState(newState)
    if (newlyUnlocked.length > 0) {
      momentQueueRef.current.push(...newlyUnlocked)
      setTimeout(showNextMoment, 1400)
    }
  }, [selectedEmotion, gameState, profile, subEmotions, intensity, showNextMoment, contextTags, journalNote])

  const handleRegionSelect = useCallback((regionId: string) => {
    if (!gameState || !profile) return
    const updated = { ...gameState, selectedRegion: regionId }
    setGameState(updated)
    saveState(updated, profile.id)
    try {
      sessionStorage.setItem(`bhava-region-session-set:${profile.id}`, "1")
    } catch {
      // noop
    }
  }, [gameState, profile])

  const openTool = useCallback((id: ToolSuggestionId, guided: boolean) => {
    setFromGuidedSession(guided)
    if (id === "reach-out") {
      setShowSupportView(true)
      return
    }
    if (id === "find-therapist") {
      setShowFindTherapist(true)
      return
    }
    if (id === "find-community") {
      setShowFindCommunity(true)
      return
    }
    if (id === "legal-aid") {
      setShowLegalAid(true)
      return
    }
    if (id === "crisis-resources") {
      // Reuses the existing support view (CrisisResources renders there).
      setShowSupportView(true)
      return
    }
    if (id === "patterns") {
      setScreen("patterns")
      return
    }
    if (id === "my-space") {
      setScreen("badges")
      return
    }
    if (id === "music") {
      // Floating MusicPlayer is always mounted — closing acknowledgment surfaces it.
      setActionsHint("Tap the music note at the bottom to pick something soft.")
      return
    }
    setActiveTool(id)
  }, [profile, gameState])

  const handlePickTool = useCallback((id: ToolSuggestionId) => {
    setShowAcknowledgment(false)
    openTool(id, true)
  }, [openTool])

  const handleOpenWheel = useCallback(() => {
    setShowAcknowledgment(false)
    const session = lastOnboardingSession
    const inferredEmotionId = session ? bodyToEmotion(session.body_feelings) : "calm"
    const inferredEmotion =
      EMOTION_CATEGORIES.find((e) => e.id === inferredEmotionId) ??
      EMOTION_CATEGORIES.find((e) => e.id === "calm")!
    const inferredIntensity = session ? durationToIntensity(session.duration) : 3
    const preselectedTags = situationToContextTags(session)
    setSelectedEmotion(inferredEmotion)
    setSubEmotions([])
    setContextTags(preselectedTags)
    setJournalNote("")
    setIntensity(inferredIntensity)
    setActionsHint(null)
    setFromGuidedSession(true)
    setScreen("sub-emotion")
  }, [lastOnboardingSession])

  const handleToolClose = useCallback(() => {
    const guided = fromGuidedSession
    setActiveTool(null)
    if (guided) {
      setShowCheckout(true)
    }
  }, [fromGuidedSession])

  const handleCheckoutDone = useCallback(() => {
    setShowCheckout(false)
    setFromGuidedSession(false)
    setScreen("home")
  }, [])

  const handleCheckoutNeedMore = useCallback(() => {
    setShowCheckout(false)
    setActiveTool("grounding-note")
    // fromGuidedSession stays true so closing the note returns to checkout flow state
  }, [])

  const handleSavePositive = useCallback((positiveId: PositiveEmotionId) => {
    if (!gameState || !profile) {
      handleCheckoutDone()
      return
    }
    const contextTagsFromSession = situationToContextTags(lastOnboardingSession)
    const newState = processCheckIn(
      gameState, "joy", positiveId, 2,
      [], false, contextTagsFromSession, "", profile.id
    )
    const newlyUnlocked = newState.moments.filter(
      (m) => m.unlocked && !gameState.moments.find((om) => om.id === m.id && om.unlocked)
    )
    setGameState(newState)
    if (newlyUnlocked.length > 0) {
      momentQueueRef.current.push(...newlyUnlocked)
      setTimeout(showNextMoment, 1400)
    }
    handleCheckoutDone()
  }, [gameState, profile, lastOnboardingSession, showNextMoment, handleCheckoutDone])

  // Legacy helper retained for the wheel-routed flow — used when user enters via doorway
  // and completes action-cards. Not used for the reflection-hub path anymore.
  const handlePathChoice = useCallback((_: PathChoice) => {
    setShowAcknowledgment(false)
    setScreen("home")
  }, [])

  const handleReset = useCallback(() => {
    setSelectedEmotion(null)
    setSubEmotions([])
    setContextTags([])
    setJournalNote("")
    setIntensity(3)
    setActions([])
    setCompletedActionIds([])
    setShowCrisis(false)
    setActionsHint(null)
    setScreen("home")
  }, [])

  const handleNavigate = useCallback((target: string) => {
    if (target === "home") handleReset()
    else if (target === "progress") setScreen("progress")
    else if (target === "badges") setScreen("badges")
    else if (target === "patterns") setScreen("patterns")
  }, [handleReset])

  // Loading
  if (!authReady) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-background">
        <AppLogo size={48} />
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label="Loading" role="status" />
      </div>
    )
  }

  // Auth gate
  if (!profile) {
    return (
      <div className="min-h-dvh bg-background">
        <ThemeHeader onThemeChange={(id) => setCurrentTheme(id)} />
        <AuthGate onAuthenticated={handleAuthenticated} />
      </div>
    )
  }

  // Welcome-back buffer for returning users
  if (showWelcomeBack) {
    const lastDate = gameState?.checkIns?.[gameState.checkIns.length - 1]?.date
    let days: number | null = null
    if (lastDate) {
      const diff = Date.now() - new Date(lastDate).getTime()
      days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
    }
    return (
      <WelcomeBack
        firstName={profile.first_name ?? profile.display_name ?? profile.username ?? "friend"}
        avatarEmoji={profile.avatar_emoji}
        country={profile.country}
        daysSinceLastCheckIn={days}
        onReady={() => { setShowWelcomeBack(false); setShowOnboarding(true) }}
        onSkip={() => { setShowWelcomeBack(false) }}
      />
    )
  }

  // Normalize help-seeking (shown once before onboarding for new users)
  if (showNormalizeHelp) {
    return (
      <NormalizeHelp
        country={profile.country}
        onContinue={() => { setShowNormalizeHelp(false); setShowOnboarding(true) }}
      />
    )
  }

  // Emergency exit: keep the crisis chip reachable from *any* screen, including
  // onboarding. Support view renders here (before onboarding) so tapping the chip
  // on an onboarding step opens crisis resources without getting stuck.
  if (showSupportView) {
    const regionData = gameState?.selectedRegion ? getRegionById(gameState.selectedRegion) : null
    return (
      <main className="min-h-dvh bg-background pb-16">
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3 gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowSupportView(false); setScreen("home") }}
                style={{ minWidth: 44, minHeight: 44 }}
                className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-foreground" />
              </button>
              <AppLogo size={32} />
            </div>
            <LocationPicker selectedRegion={gameState?.selectedRegion ?? null} onSelect={handleRegionSelect} />
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
              <LocationPicker selectedRegion={gameState?.selectedRegion ?? null} onSelect={handleRegionSelect} />
            </div>
          )}
          <button
            onClick={() => { setShowSupportView(false); setScreen("home") }}
            style={{ minHeight: 52, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
            className="w-full rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Take me back
          </button>
        </div>
      </main>
    )
  }

  // Onboarding
  if (showOnboarding) {
    return (
      <>
        <OnboardingFlow
          isNewUser={isFirstTimeUser}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
        <CrisisChip onOpen={() => setShowSupportView(true)} />
      </>
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

  // Post-onboarding reflection hub: reflection + tool suggestions + wheel doorway
  if (showAcknowledgment) {
    return (
      <>
        <AcknowledgmentScreen
          firstName={greetingName}
          country={profile.country}
          session={lastOnboardingSession}
          identity={profile.identity_selections}
          onPickTool={handlePickTool}
          onOpenWheel={handleOpenWheel}
          onSkip={() => { setShowAcknowledgment(false); setScreen("home") }}
        />
        <CrisisChip onOpen={() => { setShowAcknowledgment(false); setShowSupportView(true) }} />
      </>
    )
  }

  // End-of-session check-out (after a guided tool or action-cards completion)
  if (showCheckout) {
    return (
      <SessionCheckout
        country={profile.country}
        onDone={handleCheckoutDone}
        onNeedMore={handleCheckoutNeedMore}
        onSavePositive={handleSavePositive}
      />
    )
  }

  // Active tool overlay (reflection-hub tool pick OR home tool tile)
  if (activeTool === "breathe") return <Breathing onClose={handleToolClose} />
  if (activeTool === "journal") return <Journal userId={profile.id} onClose={handleToolClose} />
  if (activeTool === "grounding-note") return <GroundingNotes onClose={handleToolClose} />
  if (activeTool === "meditate") return <Meditate onClose={handleToolClose} />

  if (showLegalAid) {
    return (
      <LegalAid
        region={gameState.selectedRegion}
        country={profile.country}
        onClose={() => setShowLegalAid(false)}
      />
    )
  }

  if (showFindTherapist) {
    return (
      <FindTherapist
        region={gameState.selectedRegion}
        country={profile.country}
        identity={profile.identity_selections}
        favoriteIds={profile.favorite_therapist_ids}
        onToggleFavorite={toggleFavoriteTherapist}
        onOpenLegalAid={() => setShowLegalAid(true)}
        onPickRegion={handleRegionSelect}
        onClose={() => {
          setShowFindTherapist(false)
          if (fromGuidedSession) setShowCheckout(true)
        }}
        onCrisis={() => { setShowFindTherapist(false); setShowSupportView(true) }}
      />
    )
  }

  if (showFindCommunity) {
    return (
      <FindCommunity
        region={gameState.selectedRegion}
        country={profile.country}
        identity={profile.identity_selections}
        favoriteIds={profile.favorite_community_ids}
        onToggleFavorite={toggleFavoriteCommunity}
        onPickRegion={handleRegionSelect}
        onClose={() => {
          setShowFindCommunity(false)
          if (fromGuidedSession) setShowCheckout(true)
        }}
        onSwitchToTherapist={() => { setShowFindCommunity(false); setShowFindTherapist(true) }}
      />
    )
  }

  return (
    <main className="min-h-dvh bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            {screen !== "home" && screen !== "progress" && screen !== "badges" && screen !== "patterns" && (
              <button
                onClick={() => {
                  if (screen === "wheel") setScreen("home")
                  else if (screen === "describe") setScreen("wheel")
                  else if (screen === "sub-emotion") setScreen("describe")
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
            {screen === "home" && lastOnboardingSession && (
              <button
                onClick={() => setShowAcknowledgment(true)}
                style={{ minWidth: 44, minHeight: 44 }}
                className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Back to your starting point"
                title="Back to your starting point"
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
                Bhava · {taglineFor(profile.country).script}
              </span>
              <PronunciationGuide size="sm" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LocationPicker selectedRegion={gameState.selectedRegion} onSelect={handleRegionSelect} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-5 py-8">
        {screen === "home" && (
          <div className="flex flex-col items-stretch gap-7">
            {(() => {
              const gap = daysSinceLastCheckIn(gameState)
              const best = longestStreak(gameState.checkIns)
              if (gap !== null && gap >= 2 && best >= 1) {
                return (
                  <div className="p-4 rounded-2xl bg-accent/20 border border-accent/30">
                    <p className="text-sm text-foreground leading-relaxed">
                      You missed a few days. That's allowed. Your longest run is still <strong>{best}</strong> {best === 1 ? "day" : "days"} — pick up where you left off whenever you're ready.
                    </p>
                  </div>
                )
              }
              return null
            })()}
            {(() => {
              const up = upcomingCulturalDay(profile.country, 5)
              if (!up) return null
              const when = up.daysUntil === 0 ? "today" : up.daysUntil === 1 ? "tomorrow" : `in ${up.daysUntil} days`
              return (
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/25">
                  <p className="text-sm font-bold text-foreground">{up.day.name} is {when}.</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{up.day.note} It's okay to log it.</p>
                </div>
              )
            })()}
            {/* Hero headline */}
            <div className="text-center flex flex-col gap-2">
              <h1 className="text-3xl font-extrabold text-foreground leading-tight text-balance">
                How can I be here for you?
              </h1>
              <p className="text-base text-muted-foreground italic">
                Welcome back, {greetingName} {profile.avatar_emoji}
              </p>
              <p className="text-sm text-muted-foreground/50 tracking-widest">{taglineFor(profile.country).script} · {taglineFor(profile.country).gloss}</p>
            </div>

            {/* Where are you right now? — per-session ask */}
            {!gameState.selectedRegion && (
              <div className="flex flex-col gap-3 p-5 rounded-2xl bg-secondary/70 border border-border">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-bold text-foreground">Where are you right now?</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Places change, and so can you. Pick where you are today so we can show the right resources.
                  </p>
                </div>
                <LocationPicker selectedRegion={gameState.selectedRegion} onSelect={handleRegionSelect} />
              </div>
            )}

            {/* Tool tiles — pick up what helps */}
            <section className="flex flex-col gap-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                Something to pick up
              </p>
              <div className="flex flex-col gap-2">
                <HomeToolTile icon={Wind} title="Breathe" subtitle="3 gentle patterns · 1–5 minutes" onClick={() => openTool("breathe", false)} />
                <HomeToolTile icon={BookOpenText} title="Write it down" subtitle="A private page, just for you" onClick={() => openTool("journal", false)} />
                <HomeToolTile icon={Feather} title="A small note for today" subtitle="Short · rotates daily" onClick={() => openTool("grounding-note", false)} />
                <HomeToolTile icon={Headphones} title="Sit quietly" subtitle="A silent timer · 3 to 15 minutes" onClick={() => openTool("meditate", false)} />
              </div>
            </section>

            {/* Wheel doorway — opt-in */}
            <button
              onClick={() => { setFromGuidedSession(false); setScreen("wheel") }}
              style={{ minHeight: 52 }}
              className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-foreground/80 hover:text-foreground hover:bg-muted transition-colors cursor-pointer rounded-2xl border border-border px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Want to name a feeling? Open the emotion wheel
              <ArrowRight size={14} />
            </button>

            {/* See how it works */}
            <button
              onClick={() => setShowHowItWorks(true)}
              style={{ minHeight: 44 }}
              className="mx-auto flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-2"
            >
              <Info size={15} aria-hidden="true" />
              See how it works
            </button>

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

        {screen === "wheel" && (
          <div className="flex flex-col items-center gap-8">
            <div className="text-center flex flex-col gap-2">
              <h1 className="text-2xl font-extrabold text-foreground leading-tight text-balance">
                What are you feeling?
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tap what fits. No right answers.
              </p>
            </div>
            <EmotionWheel onSelect={handleEmotionSelect} selectedId={selectedEmotion?.id || null} />
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
            <SubEmotionPicker emotion={selectedEmotion} selected={subEmotions} onToggle={handleSubEmotionToggle} country={profile.country} />
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
                  <ContextTagPicker
                    selected={contextTags}
                    onToggle={(tagId) => setContextTags((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId])}
                    accentColor={selectedEmotion.color}
                    suggestedTags={situationToContextTags(lastOnboardingSession)}
                    emotionId={selectedEmotion.id}
                  />
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
              <CrisisGames emotion={selectedEmotion} onClose={() => setShowCrisis(false)} onComplete={handleCrisisComplete} defaultGame={intensity >= 5 ? "breathing" : undefined} />
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

            {actionsHint && (
              <p className="text-sm text-muted-foreground italic leading-relaxed px-1">
                {actionsHint}
              </p>
            )}
            <ActionCards actions={actions} emotion={selectedEmotion} onComplete={handleActionComplete} completedIds={completedActionIds} onJustLog={completedActionIds.length === 0 ? handleJustLog : undefined} />

            {completedActionIds.length > 0 && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setFromGuidedSession(true); setShowCheckout(true) }}
                  style={{ minHeight: 52, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
                  className="w-full rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  How are you feeling now?
                </button>
                <button
                  onClick={() => setScreen("progress")}
                  style={{ minHeight: 48, borderColor: selectedEmotion?.color, color: selectedEmotion?.color, background: `${selectedEmotion?.color}10` }}
                  className="w-full rounded-2xl text-base font-semibold border-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Track your journey
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
          <MySpace
            userId={profile.id}
            gameState={gameState}
            firstName={greetingName}
            autoOpenMonth={autoOpenMonth}
            onMonthReportViewed={handleMonthReportViewed}
          />
        )}

        {screen === "patterns" && (
          <PatternsPage gameState={gameState} />
        )}
      </div>

      {/* Ambient music */}
      <MusicPlayer emotionId={selectedEmotion?.id ?? null} accentColor={selectedEmotion?.color} />

      {/* Soft moment popup */}
      {momentPopup && <BadgePopup badge={momentPopup} onDone={() => { setMomentPopup(null); showNextMoment() }} />}

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

      {/* How it works modal */}
      {showHowItWorks && <HowItWorks onClose={() => setShowHowItWorks(false)} />}

      {/* Password reset modal */}
      {showPasswordReset && (
        <PasswordResetModal onDone={() => setShowPasswordReset(false)} />
      )}

      {/* Onboarding tooltips */}
      <OnboardingTooltips isNewUser={isNewUser} />

      {/* Global crisis chip — always reachable on main app screens */}
      <CrisisChip onOpen={() => setShowSupportView(true)} />

      {/* Bottom nav */}
      <NavBar
        activeScreen={screen === "progress" ? "progress" : screen === "badges" ? "badges" : screen === "patterns" ? "patterns" : "home"}
        onNavigate={handleNavigate}
        displayName={greetingName}
        avatarEmoji={profile.avatar_emoji}
        onShowThemes={() => setShowThemePicker(true)}
        onShowSettings={() => setShowSettings(true)}
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

function HomeToolTile({
  icon: Icon, title, subtitle, onClick,
}: {
  icon: React.ElementType
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{ minHeight: 68 }}
      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border text-left hover:bg-muted cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={title}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/15 shrink-0">
        <Icon size={18} className="text-primary" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
      <ChevronRight size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />
    </button>
  )
}
