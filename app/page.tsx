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
import { getSession, onAuthStateChange } from "@/lib/auth"
import { getProfile, updateProfile, type Profile } from "@/lib/profile"
import { applyTheme } from "@/lib/themes"
import { getRegionById } from "@/lib/crisis-resources"
import type { Badge } from "@/lib/emotions-data"
import type { ThemeId } from "@/lib/themes"
import { ArrowLeft, Sparkles, X, Lock, Info } from "lucide-react"

type Screen = "home" | "sub-emotion" | "context" | "intensity" | "actions" | "crisis" | "progress"

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
    return unsub
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
            {screen !== "home" && screen !== "progress" && (
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
                fontFamily: "var(--font-cinzel), 'Cinzel Decorative', serif",
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
            <div className="flex flex-col items-center gap-3">
              <h2 className="text-2xl font-extrabold text-foreground text-center text-balance">What is this about?</h2>
              <p className="text-base text-muted-foreground text-center leading-relaxed">
                Tag what might be stirring this feeling. Pick as many as feel true.
              </p>
            </div>
            <ContextTagPicker selected={contextTags} onToggle={(tagId) => setContextTags((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId])} accentColor={selectedEmotion.color} />
            <button
              onClick={() => setScreen("intensity")}
              className="w-full max-w-sm mx-auto py-4 rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: selectedEmotion.color, color: "#FFFFFF", boxShadow: `0 4px 20px ${selectedEmotion.color}44` }}
            >
              {contextTags.length > 0 ? `Continue with ${contextTags.length} tag${contextTags.length !== 1 ? "s" : ""}` : "Skip - not sure why"}
            </button>
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
      </div>

      {/* Ambient music */}
      <MusicPlayer emotionId={selectedEmotion?.id ?? null} accentColor={selectedEmotion?.color} />

      {/* Point popup */}
      {pointPopup && <PointPopup points={pointPopup.points} color={pointPopup.color} onDone={() => setPointPopup(null)} />}

      {/* Badge popup */}
      {badgePopup && <BadgePopup badge={badgePopup} onDone={() => { setBadgePopup(null); showNextBadge() }} />}

      {/* Theme picker modal */}
      {showThemePicker && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowThemePicker(false)}>
          <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 pb-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Your palette</h3>
              <button onClick={() => setShowThemePicker(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <ThemePicker userId={profile.id} currentTheme={currentTheme} onThemeChange={handleThemeChange} />
          </div>
        </div>
      )}

      {/* How it works modal */}
      {showHowItWorks && <HowItWorks onClose={() => setShowHowItWorks(false)} />}

      {/* Onboarding tooltips */}
      <OnboardingTooltips isNewUser={isNewUser} />

      {/* Bottom nav */}
      <NavBar
        activeScreen={screen === "progress" ? "progress" : "home"}
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
