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
import { ThemeToggle } from "@/components/theme-toggle"
import { AppLogo } from "@/components/app-logo"
import { LocationPicker } from "@/components/location-picker"
import { CrisisResources } from "@/components/crisis-resources"
import { ContextTagPicker } from "@/components/context-tag-picker"
import {
  type EmotionCategory,
  type MicroAction,
  INTENSITY_OPTIONS,
  getActionsForEmotion,
  getIntensityLevel,
} from "@/lib/emotions-data"
import {
  type GameState,
  loadState,
  saveState,
  processCheckIn,
} from "@/lib/game-store"
import { getRegionById } from "@/lib/crisis-resources"
import type { Badge } from "@/lib/emotions-data"
import { ArrowLeft, Sparkles } from "lucide-react"

type Screen = "home" | "sub-emotion" | "context" | "intensity" | "actions" | "crisis" | "progress"

export default function FeelsMovesApp() {
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
  const badgeQueueRef = useRef<Badge[]>([])

  useEffect(() => {
    setGameState(loadState())
  }, [])

  const handleEmotionSelect = useCallback((emotion: EmotionCategory) => {
    setSelectedEmotion(emotion)
    setSubEmotions([])
    setScreen("sub-emotion")
  }, [])

  const handleSubEmotionToggle = useCallback((sub: string) => {
    setSubEmotions((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    )
  }, [])

  const handleSubEmotionContinue = useCallback(() => {
    setScreen("context")
  }, [])

  const handleContextTagToggle = useCallback((tagId: string) => {
    setContextTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
  }, [])

  const handleContextContinue = useCallback(() => {
    setScreen("intensity")
  }, [])

  const handleIntensityConfirm = useCallback(() => {
    if (!selectedEmotion) return
    const a = getActionsForEmotion(selectedEmotion.id, intensity)
    setActions(a)
    setCompletedActionIds([])
    const option = INTENSITY_OPTIONS.find((o) => o.level === intensity)
    const crisis = option?.isCrisis || false
    setShowCrisis(crisis)
    setScreen("actions")
  }, [selectedEmotion, intensity])

  const showNextBadge = useCallback(() => {
    if (badgeQueueRef.current.length > 0) {
      const next = badgeQueueRef.current.shift()!
      setBadgePopup(next)
    }
  }, [])

  const handleActionComplete = useCallback(
    (action: MicroAction) => {
      if (!selectedEmotion || !gameState) return
      setCompletedActionIds((prev) => [...prev, action.id])
      setPointPopup({ points: action.points, color: selectedEmotion.color })

      const subLabel = subEmotions.length > 0 ? subEmotions.join(", ") : selectedEmotion.label
      const newState = processCheckIn(
        gameState,
        selectedEmotion.id,
        subLabel,
        intensity,
        [{ id: action.id, points: action.points, category: action.category }],
        showCrisis,
        contextTags,
        journalNote
      )

      const newlyUnlocked = newState.badges.filter(
        (b) => b.unlocked && !gameState.badges.find((ob) => ob.id === b.id && ob.unlocked)
      )

      setGameState(newState)

      if (newlyUnlocked.length > 0) {
        badgeQueueRef.current.push(...newlyUnlocked)
        setTimeout(showNextBadge, 1400)
      }
    },
    [selectedEmotion, gameState, subEmotions, intensity, showCrisis, showNextBadge, contextTags, journalNote]
  )

  const handleCrisisComplete = useCallback(() => {
    if (!selectedEmotion || !gameState) return
    setPointPopup({ points: 25, color: selectedEmotion.color })
    const subLabel = subEmotions.length > 0 ? subEmotions.join(", ") : selectedEmotion.label
    const newState = processCheckIn(
      gameState,
      selectedEmotion.id,
      subLabel,
      intensity,
      [{ id: "crisis-game", points: 25, category: "mindful" }],
      true,
      contextTags,
      journalNote
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

  const handleRegionSelect = useCallback(
    (regionId: string) => {
      if (!gameState) return
      const updated = { ...gameState, selectedRegion: regionId }
      setGameState(updated)
      saveState(updated)
    },
    [gameState]
  )

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

  const handleNavigate = useCallback(
    (target: string) => {
      if (target === "home") {
        handleReset()
      } else if (target === "progress") {
        setScreen("progress")
      }
    },
    [handleReset]
  )

  if (!gameState) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

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
            <AppLogo size={36} />
            <h1 className="text-xl font-extrabold text-foreground">
              <span className="text-primary">Feels</span>
              <span className="text-muted-foreground mx-1">{">"}</span>
              <span className="text-game-teal">Moves</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10">
              <Sparkles size={14} className="text-primary" />
              <span className="text-sm font-bold text-primary">{gameState.totalPoints}</span>
            </div>
            <LocationPicker
              selectedRegion={gameState.selectedRegion}
              onSelect={handleRegionSelect}
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-5 py-8">
        {screen === "home" && (
          <div className="flex flex-col items-center gap-10">
            <EmotionWheel onSelect={handleEmotionSelect} selectedId={selectedEmotion?.id || null} />

            {/* Research note */}
            <div className="w-full p-5 rounded-2xl bg-secondary border border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Why this works:</strong> Research from CBT, DBT, and
                ACT therapies shows that naming emotions reduces their intensity (affect labeling, Lieberman et al., 2007),
                and pairing feelings with specific actions creates new neural pathways for emotional regulation.
              </p>
            </div>
          </div>
        )}

        {screen === "sub-emotion" && selectedEmotion && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{ background: selectedEmotion.color, color: "#FFFFFF" }}
              >
                {selectedEmotion.label.slice(0, 2)}
              </div>
              <h2 className="text-2xl font-extrabold text-foreground text-balance text-center">
                You picked: {selectedEmotion.label}
              </h2>
              <p className="text-base text-muted-foreground text-center">
                Can you get more specific?
              </p>
            </div>
            <SubEmotionPicker
              emotion={selectedEmotion}
              selected={subEmotions}
              onToggle={handleSubEmotionToggle}
            />

            {/* Optional 1-sentence journal */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="journal-note"
                className="text-base font-bold text-foreground"
              >
                Want to write 1 sentence about why?
              </label>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Totally optional. Sometimes naming the reason helps.
              </p>
              <textarea
                id="journal-note"
                value={journalNote}
                onChange={(e) => setJournalNote(e.target.value.slice(0, 200))}
                placeholder={`I feel ${selectedEmotion.label.toLowerCase()} because...`}
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-base placeholder:text-muted-foreground/60 border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
              />
              <span className="text-xs text-muted-foreground text-right">
                {journalNote.length}/200
              </span>
            </div>

            <button
              onClick={handleSubEmotionContinue}
              className="w-full max-w-sm mx-auto py-4 rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: selectedEmotion.color,
                color: "#FFFFFF",
                boxShadow: `0 4px 20px ${selectedEmotion.color}44`,
              }}
            >
              {subEmotions.length > 0
                ? `Continue with ${subEmotions.length} selected`
                : "Skip - keep it simple"}
            </button>
          </div>
        )}

        {screen === "context" && selectedEmotion && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-center gap-3">
              <h2 className="text-2xl font-extrabold text-foreground text-center text-balance">
                What is this about?
              </h2>
              <p className="text-base text-muted-foreground text-center leading-relaxed">
                Tag what might be causing this feeling. Pick as many as apply.
              </p>
            </div>
            <ContextTagPicker
              selected={contextTags}
              onToggle={handleContextTagToggle}
              accentColor={selectedEmotion.color}
            />
            <button
              onClick={handleContextContinue}
              className="w-full max-w-sm mx-auto py-4 rounded-2xl text-lg font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: selectedEmotion.color,
                color: "#FFFFFF",
                boxShadow: `0 4px 20px ${selectedEmotion.color}44`,
              }}
            >
              {contextTags.length > 0
                ? `Continue with ${contextTags.length} tag${contextTags.length !== 1 ? "s" : ""}`
                : "Skip - not sure why"}
            </button>
          </div>
        )}

        {screen === "intensity" && selectedEmotion && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-2xl font-extrabold text-foreground text-center text-balance">
                How big is this feeling?
              </h2>
              <p className="text-base text-muted-foreground text-center">
                {subEmotions.length > 0
                  ? `Feeling ${subEmotions.join(", ")}`
                  : `Feeling ${selectedEmotion.label.toLowerCase()}`}
              </p>
            </div>
            <IntensitySlider
              emotion={selectedEmotion}
              intensity={intensity}
              onChange={setIntensity}
              onConfirm={handleIntensityConfirm}
            />
          </div>
        )}

        {screen === "actions" && selectedEmotion && (
          <div className="flex flex-col gap-6">
            {/* Emotion summary */}
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: `${selectedEmotion.color}12` }}>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold shrink-0"
                style={{ background: selectedEmotion.color, color: "#FFFFFF" }}
              >
                {selectedEmotion.label.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-foreground">
                  {selectedEmotion.label}
                  {subEmotions.length > 0 ? ` - ${subEmotions.join(", ")}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {INTENSITY_OPTIONS.find((o) => o.level === intensity)?.label || ""}
                </p>
                {journalNote && (
                  <p className="text-sm text-muted-foreground mt-1 italic leading-relaxed">
                    {'"'}{journalNote}{'"'}
                  </p>
                )}
                {contextTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {contextTags.map((tagId) => (
                      <span
                        key={tagId}
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: `${selectedEmotion.color}15`,
                          color: selectedEmotion.color,
                        }}
                      >
                        {tagId.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Crisis mode toggle */}
            {INTENSITY_OPTIONS.find((o) => o.level === intensity)?.isCrisis && (
              <button
                onClick={() => setShowCrisis(!showCrisis)}
                className="w-full py-4 rounded-2xl text-base font-bold border-2 transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  borderColor: selectedEmotion.color,
                  background: showCrisis ? selectedEmotion.color : "transparent",
                  color: showCrisis ? "#FFFFFF" : selectedEmotion.color,
                }}
              >
                {showCrisis ? "Hide Crisis Tools" : "Open Crisis Toolkit"}
              </button>
            )}

            {/* Crisis games */}
            {showCrisis && (
              <CrisisGames
                emotion={selectedEmotion}
                onClose={() => setShowCrisis(false)}
                onComplete={handleCrisisComplete}
              />
            )}

            {/* Crisis resources - helplines & support groups */}
            {/* Always shown when location is set; prompts to set location in crisis mode */}
            {gameState.selectedRegion ? (
              (() => {
                const regionData = getRegionById(gameState.selectedRegion)
                if (!regionData) return null
                return (
                  <CrisisResources
                    region={regionData}
                    accentColor={selectedEmotion.color}
                  />
                )
              })()
            ) : showCrisis ? (
              <div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border-2 border-accent/30">
                <p className="text-base font-bold text-foreground">
                  Where are you right now?
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Set your location so we can show you real crisis helplines
                  and community support groups near you.
                </p>
                <LocationPicker
                  selectedRegion={gameState.selectedRegion}
                  onSelect={handleRegionSelect}
                />
              </div>
            ) : null}

            {/* Action cards */}
            <ActionCards
              actions={actions}
              emotion={selectedEmotion}
              onComplete={handleActionComplete}
              completedIds={completedActionIds}
            />

            {/* Finish button */}
            {completedActionIds.length > 0 && (
              <button
                onClick={handleReset}
                className="w-full py-4 rounded-2xl text-lg font-bold bg-primary text-primary-foreground cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
                style={{ boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)" }}
              >
                Check in again
              </button>
            )}

            {/* Research note */}
            <div className="p-5 rounded-2xl bg-secondary border border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">The science:</strong> Behavioral activation (Lejuez et al., 2001) shows
                that even small actions can shift emotional states. The TIPP technique from DBT uses Temperature,
                Intense exercise, Paced breathing, and Paired muscle relaxation for high-intensity emotions.
                {(INTENSITY_OPTIONS.find((o) => o.level === intensity)?.isCrisis) && " Crisis games use cognitive load to redirect the brain from emotional distress (distress tolerance from DBT)."}
              </p>
            </div>
          </div>
        )}

        {screen === "progress" && (
          <ProgressTracker
            gameState={gameState}
            onClose={handleReset}
          />
        )}
      </div>

      {/* Point popup */}
      {pointPopup && (
        <PointPopup
          points={pointPopup.points}
          color={pointPopup.color}
          onDone={() => setPointPopup(null)}
        />
      )}

      {/* Badge popup */}
      {badgePopup && (
        <BadgePopup
          badge={badgePopup}
          onDone={() => {
            setBadgePopup(null)
            showNextBadge()
          }}
        />
      )}

      {/* Bottom nav */}
      <NavBar
        activeScreen={screen === "progress" ? "progress" : "home"}
        onNavigate={handleNavigate}
        streak={gameState.currentStreak}
        points={gameState.totalPoints}
      />
    </main>
  )
}
