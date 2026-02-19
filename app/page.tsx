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
import {
  type EmotionCategory,
  type MicroAction,
  getActionsForEmotion,
  getIntensityLevel,
} from "@/lib/emotions-data"
import {
  type GameState,
  loadState,
  processCheckIn,
} from "@/lib/game-store"
import type { Badge } from "@/lib/emotions-data"
import { ArrowLeft, Sparkles } from "lucide-react"

type Screen = "home" | "sub-emotion" | "intensity" | "actions" | "crisis" | "progress"

export default function FeelsMovesApp() {
  const [screen, setScreen] = useState<Screen>("home")
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionCategory | null>(null)
  const [subEmotion, setSubEmotion] = useState<string | null>(null)
  const [intensity, setIntensity] = useState(5)
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
    setSubEmotion(null)
    setScreen("sub-emotion")
  }, [])

  const handleSubEmotionContinue = useCallback(() => {
    setScreen("intensity")
  }, [])

  const handleIntensityConfirm = useCallback(() => {
    if (!selectedEmotion) return
    const a = getActionsForEmotion(selectedEmotion.id, intensity)
    setActions(a)
    setCompletedActionIds([])
    setShowCrisis(false)
    if (intensity >= 7) {
      setShowCrisis(true)
    }
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

      // Process check-in with just this action
      const newState = processCheckIn(
        gameState,
        selectedEmotion.id,
        subEmotion || selectedEmotion.label,
        intensity,
        [{ id: action.id, points: action.points, category: action.category }],
        showCrisis
      )

      // Check for newly unlocked badges
      const newlyUnlocked = newState.badges.filter(
        (b) => b.unlocked && !gameState.badges.find((ob) => ob.id === b.id && ob.unlocked)
      )

      setGameState(newState)

      if (newlyUnlocked.length > 0) {
        badgeQueueRef.current.push(...newlyUnlocked)
        // Show first badge after point popup
        setTimeout(showNextBadge, 1400)
      }
    },
    [selectedEmotion, gameState, subEmotion, intensity, showCrisis, showNextBadge]
  )

  const handleCrisisComplete = useCallback(() => {
    if (!selectedEmotion || !gameState) return
    setPointPopup({ points: 25, color: selectedEmotion.color })
    const newState = processCheckIn(
      gameState,
      selectedEmotion.id,
      subEmotion || selectedEmotion.label,
      intensity,
      [{ id: "crisis-game", points: 25, category: "mindful" }],
      true
    )
    const newlyUnlocked = newState.badges.filter(
      (b) => b.unlocked && !gameState.badges.find((ob) => ob.id === b.id && ob.unlocked)
    )
    setGameState(newState)
    if (newlyUnlocked.length > 0) {
      badgeQueueRef.current.push(...newlyUnlocked)
      setTimeout(showNextBadge, 1400)
    }
  }, [selectedEmotion, gameState, subEmotion, intensity, showNextBadge])

  const handleReset = useCallback(() => {
    setSelectedEmotion(null)
    setSubEmotion(null)
    setIntensity(5)
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
        <div className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-dvh bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {screen !== "home" && screen !== "progress" && (
              <button
                onClick={() => {
                  if (screen === "sub-emotion") setScreen("home")
                  else if (screen === "intensity") setScreen("sub-emotion")
                  else if (screen === "actions") setScreen("intensity")
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft size={18} className="text-foreground" />
              </button>
            )}
            <h1 className="text-lg font-bold text-foreground">
              <span className="text-primary">Feels</span>
              <span className="text-muted-foreground mx-1">{"→"}</span>
              <span className="text-game-teal">Moves</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
              <Sparkles size={12} className="text-primary" />
              <span className="text-xs font-bold text-primary">{gameState.totalPoints}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {screen === "home" && (
          <div className="flex flex-col items-center gap-8 pt-4">
            <EmotionWheel onSelect={handleEmotionSelect} selectedId={selectedEmotion?.id || null} />

            {/* Research note */}
            <div className="w-full max-w-sm p-4 rounded-2xl bg-secondary border border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Why this works:</strong> Research from CBT, DBT, and
                ACT therapies shows that naming emotions reduces their intensity (affect labeling, Lieberman et al., 2007), 
                and pairing feelings with specific actions creates new neural pathways for emotional regulation.
              </p>
            </div>
          </div>
        )}

        {screen === "sub-emotion" && selectedEmotion && (
          <div className="flex flex-col gap-6 pt-4">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ background: selectedEmotion.color, color: "#FFF" }}
              >
                {selectedEmotion.label.slice(0, 2)}
              </div>
              <h2 className="text-xl font-bold text-foreground text-balance text-center">
                You picked: {selectedEmotion.label}
              </h2>
            </div>
            <SubEmotionPicker
              emotion={selectedEmotion}
              selected={subEmotion}
              onSelect={setSubEmotion}
            />
            <button
              onClick={handleSubEmotionContinue}
              className="w-full max-w-sm mx-auto py-3 rounded-2xl text-base font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: selectedEmotion.color,
                color: "#FFF",
                boxShadow: `0 4px 20px ${selectedEmotion.color}44`,
              }}
            >
              {subEmotion ? `Continue with "${subEmotion}"` : "Skip - keep it simple"}
            </button>
          </div>
        )}

        {screen === "intensity" && selectedEmotion && (
          <div className="flex flex-col gap-6 pt-4">
            <div className="flex flex-col items-center gap-1">
              <h2 className="text-xl font-bold text-foreground text-center text-balance">
                How intense is this feeling?
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                {subEmotion
                  ? `Feeling ${subEmotion} - slide to rate`
                  : `Feeling ${selectedEmotion.label.toLowerCase()} - slide to rate`}
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
          <div className="flex flex-col gap-6 pt-2">
            {/* Emotion summary */}
            <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: `${selectedEmotion.color}12` }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: selectedEmotion.color, color: "#FFF" }}
              >
                {intensity}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {selectedEmotion.label}
                  {subEmotion ? ` - ${subEmotion}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Intensity: {getIntensityLevel(intensity)} ({intensity}/10)
                </p>
              </div>
            </div>

            {/* Crisis mode toggle */}
            {intensity >= 7 && (
              <button
                onClick={() => setShowCrisis(!showCrisis)}
                className="w-full py-3 rounded-2xl text-sm font-bold border-2 transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  borderColor: selectedEmotion.color,
                  background: showCrisis ? selectedEmotion.color : "transparent",
                  color: showCrisis ? "#FFF" : selectedEmotion.color,
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
                className="w-full py-4 rounded-2xl text-base font-bold bg-game-teal cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
                style={{ color: "#FFF", boxShadow: "0 4px 20px rgba(6, 214, 160, 0.3)" }}
              >
                Check in again
              </button>
            )}

            {/* Research note */}
            <div className="p-4 rounded-2xl bg-secondary border border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">The science:</strong> Behavioral activation (Lejuez et al., 2001) shows
                that even small actions can shift emotional states. The TIPP technique from DBT uses Temperature, 
                Intense exercise, Paced breathing, and Paired muscle relaxation for high-intensity emotions.
                {intensity >= 7 && " Crisis games use cognitive load to redirect the brain from emotional distress (distress tolerance from DBT)."}
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
