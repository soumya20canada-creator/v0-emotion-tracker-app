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
import { getProfile, updateProfile, type Profile } from "@/lib/profile"
import { applyTheme } from "@/lib/themes"
import { getRegionById } from "@/lib/crisis-resources"
import type { Badge } from "@/lib/emotions-data"
import type { ThemeId } from "@/lib/themes"
import { ArrowLeft, Sparkles, X, Lock, Info } from "lucide-react"

type Screen = "home" | "describe" | "sub-emotion" | "context" | "intensity" | "actions" | "crisis" | "progress" | "badges" | "patterns"

export default function BhavaApp() {
  const [authReady, setAuthReady] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [currentTheme, setCurrentTheme] = useState("default")

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

  // Auth check on mount
  useEffect(() => {
    getSession().then((session) => {
      if (session?.user) {
        getProfile(session.user.id).then((p) => {
          setProfile(p)
          if (p?.color_theme) {
            setCurrentTheme(p.color_theme)
            applyTheme(p.color_theme)
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
      }
    })
    const unsubRecovery = onPasswordRecovery(() => setShowPasswordReset(true))
    return () => { unsub(); unsubRecovery() }
  }, [])

  useEffect(() => {
    if (profile) setGameState(loadState())
  }, [profile])

  const handleAuthenticated = useCallback((p: Profile) => {
    setProfile(p)
    setCurrentTheme(p.color_theme)
    applyTheme(p.color_theme)
    setGameState(loadState())
    setIsNewUser(true)
  }, [])

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
  if (!authReady) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-background">
        <AppLogo size={48} />
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  // Auth gate
  if (!profile) {
    return <AuthGate onAuthenticated={handleAuthenticated} />
  }

  if (!gameState) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  const greetingName = profile.display_name || profile.username || "friend"

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
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-foreground" />
              </button>
            )}
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
              Bhava
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10">
              <Sparkles size={14} className="text-primary" />
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
            {/* Daily check-in status card */}
            {(() => {
              const today = new Date().toISOString().slice(0, 10)
              const checkedInToday = gameState.checkIns.some(c => c.date === today)
              return (
                <div className="w-full p-4 rounded-2xl flex items-center gap-3 border border-border"
                  style={{ background: checkedInToday ? "#10B98110" : "var(--secondary)" }}>
                  <span className="text-2xl shrink-0">{checkedInToday ? "✅" : "📅"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      {checkedInToday ? "Checked in today!" : "No check-in yet today"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {checkedInToday
                        ? `${gameState.currentStreak}-day streak 🔥 Keep going!`
                        : "It takes 30 seconds. You're worth it."}
                    </p>
                  </div>
                  {checkedInToday && gameState.currentStreak > 1 && (
                    <div className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: "#F59E0B20", color: "#F59E0B" }}>
                      🔥 {gameState.currentStreak}d
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Hero headline */}
            <div className="text-center flex flex-col gap-2">
              <h1 className="text-3xl font-extrabold text-foreground leading-tight text-balance">
                Understand your emotions,<br />one day at a time.
              </h1>
              <p className="text-sm text-muted-foreground italic">
                Welcome back, {greetingName} {profile.avatar_emoji}
              </p>
              <p className="text-xs text-muted-foreground/50 tracking-widest">भाव · the felt sense of being</p>
            </div>

            {/* Emotion wheel */}
            <EmotionWheel onSelect={handleEmotionSelect} selectedId={selectedEmotion?.id || null} />

            {/* "See how it works" CTA */}
            <button
              onClick={() => setShowHowItWorks(true)}
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Info size={15} />
              See how it works →
            </button>

            {/* Privacy badge */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
              <Lock size={10} />
              Your data is private · end-to-end encrypted · never sold
            </div>

            {/* Science note */}
            <div className="w-full p-5 rounded-2xl bg-secondary border border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Why this works:</strong>{" "}
                Naming what you feel literally quiets your brain's alarm system.
                Science calls it affect labeling — and pairing a feeling with a small action rewires how your nervous system responds over time.{" "}
                <span className="text-xs opacity-60">Lieberman et al., 2007 · Lejuez et al., 2001</span>
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
                style={{ background: selectedEmotion.color, color: "#FFFFFF" }}>
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
              className="w-full max-w-sm mx-auto py-4 rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: selectedEmotion.color, color: "#FFFFFF", boxShadow: `0 4px 20px ${selectedEmotion.color}44` }}
            >
              {subEmotions.length > 0 ? `Continue with ${subEmotions.length} selected` : "Skip - keep it simple"}
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
                    className="w-full max-w-sm mx-auto py-4 rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: selectedEmotion.color, color: "#FFFFFF", boxShadow: `0 4px 20px ${selectedEmotion.color}44` }}
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
                style={{ background: selectedEmotion.color, color: "#FFFFFF" }}>
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
                      <span key={tagId} className="text-xs font-medium px-2 py-0.5 rounded-full"
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
              className="w-full py-4 rounded-2xl text-base font-bold border-2 transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              style={{ borderColor: selectedEmotion.color, background: showCrisis ? selectedEmotion.color : "transparent", color: showCrisis ? "#FFFFFF" : selectedEmotion.color }}
            >
              {showCrisis ? "Hide grounding toolkit" : INTENSITY_OPTIONS.find((o) => o.level === intensity)?.isCrisis ? "Sometimes feelings get really big — we've got you 🤍" : "Open grounding toolkit 🤲"}
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
                <p className="text-sm text-muted-foreground leading-relaxed">
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
                  className="w-full py-3 rounded-2xl text-sm font-semibold border-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  style={{ borderColor: selectedEmotion?.color, color: selectedEmotion?.color, background: `${selectedEmotion?.color}10` }}
                >
                  Track your journey 📊
                </button>
                <button
                  onClick={handleReset}
                  className="w-full py-4 rounded-2xl text-lg font-bold bg-primary text-primary-foreground cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  style={{ boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)" }}
                >
                  Come back to yourself again 🌸
                </button>
              </div>
            )}

            <div className="p-5 rounded-2xl bg-secondary border border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">The science behind this:</strong>{" "}
                Even the smallest action can shift how your body holds a feeling. Behavioral activation research (Lejuez et al., 2001) shows that movement + intention creates new emotional pathways — not overnight, but one moment at a time.
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
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/30 backdrop-blur-sm" onClick={() => setShowThemePicker(false)}>
          <div className="w-full max-w-lg bg-card rounded-t-3xl p-5 pb-10 shadow-2xl border-t border-border/40" onClick={(e) => e.stopPropagation()}>
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-foreground">Your palette</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Pick the look that feels like you.</p>
              </div>
              <button onClick={() => setShowThemePicker(false)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <ThemePicker userId={profile.id} currentTheme={currentTheme} onThemeChange={handleThemeChange} />
          </div>
        </div>
      )}

      {/* How it works modal */}
      {showHowItWorks && <HowItWorks onClose={() => setShowHowItWorks(false)} />}

      {/* Password reset modal — shown when user returns via reset link */}
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
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-6">
      <div className="w-full max-w-sm bg-card rounded-3xl p-7 shadow-2xl border border-border flex flex-col gap-5">
        {done ? (
          <div className="flex flex-col items-center gap-3 text-center py-4">
            <span className="text-5xl">✅</span>
            <p className="text-base font-bold text-foreground">Password updated!</p>
            <p className="text-sm text-muted-foreground">Taking you back to your space…</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Create new password 🔑</h2>
              <p className="text-sm text-muted-foreground mt-1">Choose something you'll remember.</p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (8+ characters)"
                  required
                  autoFocus
                  className="w-full px-4 py-3 pr-11 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
                />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer" tabIndex={-1}>
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
              />
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
              >
                {loading ? "Saving…" : "Save new password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
  )
}
