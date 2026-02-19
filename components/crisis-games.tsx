"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { type EmotionCategory } from "@/lib/emotions-data"
import { Gamepad2, Wind, Puzzle, Palette } from "lucide-react"

type CrisisGamesProps = {
  emotion: EmotionCategory
  onClose: () => void
  onComplete: () => void
}

// -- BREATHING GAME --
function BreathingGame({ emotion, onComplete }: { emotion: EmotionCategory; onComplete: () => void }) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "done">("inhale")
  const [timer, setTimer] = useState(4)
  const [cycles, setCycles] = useState(0)
  const totalCycles = 4

  useEffect(() => {
    if (phase === "done") return
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          if (phase === "inhale") {
            setPhase("hold")
            return 4
          } else if (phase === "hold") {
            setPhase("exhale")
            return 6
          } else {
            const newCycles = cycles + 1
            setCycles(newCycles)
            if (newCycles >= totalCycles) {
              setPhase("done")
              return 0
            }
            setPhase("inhale")
            return 4
          }
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, cycles])

  const circleSize = phase === "inhale" ? 180 : phase === "hold" ? 180 : 100
  const label = phase === "inhale" ? "Breathe in..." : phase === "hold" ? "Hold..." : phase === "exhale" ? "Breathe out..." : "Great job!"

  return (
    <div className="flex flex-col items-center gap-6">
      <h4 className="text-lg font-bold text-foreground">Breathing Game</h4>
      <p className="text-sm text-muted-foreground text-center leading-relaxed">
        Follow the circle. Based on the 4-4-6 technique used by therapists.
      </p>
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        <div
          className="rounded-full flex items-center justify-center transition-all duration-1000 ease-in-out"
          style={{
            width: circleSize,
            height: circleSize,
            background: `${emotion.color}33`,
            border: `4px solid ${emotion.color}`,
            boxShadow: `0 0 ${circleSize / 3}px ${emotion.color}44`,
          }}
        >
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: emotion.color }}>
              {phase === "done" ? "" : timer}
            </p>
          </div>
        </div>
      </div>
      <p className="text-base font-medium" style={{ color: emotion.color }}>
        {label}
      </p>
      <div className="flex gap-1.5">
        {Array.from({ length: totalCycles }, (_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-colors duration-300"
            style={{ background: i < cycles ? emotion.color : `${emotion.color}22` }}
          />
        ))}
      </div>
      {phase === "done" && (
        <button
          onClick={onComplete}
          className="px-6 py-3 rounded-xl text-sm font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          style={{ background: emotion.color, color: "#FFF" }}
        >
          Done! +25pts
        </button>
      )}
    </div>
  )
}

// -- COLOR MATCHING GAME --
const GAME_COLORS = ["#FF6B35", "#06D6A0", "#118AB2", "#FFD166", "#EF476F", "#A78BFA"]

function ColorMatchGame({ emotion, onComplete }: { emotion: EmotionCategory; onComplete: () => void }) {
  const [target, setTarget] = useState<string[]>([])
  const [playerSequence, setPlayerSequence] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [showTarget, setShowTarget] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const maxRounds = 5

  const generateTarget = useCallback(() => {
    const len = Math.min(round + 2, 6)
    const t: string[] = []
    for (let i = 0; i < len; i++) {
      t.push(GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)])
    }
    return t
  }, [round])

  useEffect(() => {
    const t = generateTarget()
    setTarget(t)
    setShowTarget(true)
    setPlayerSequence([])
    const timer = setTimeout(() => setShowTarget(false), 2000 + round * 500)
    return () => clearTimeout(timer)
  }, [round, generateTarget])

  function handlePick(color: string) {
    if (showTarget || gameOver) return
    const idx = playerSequence.length
    const newSeq = [...playerSequence, color]
    setPlayerSequence(newSeq)

    if (color !== target[idx]) {
      setGameOver(true)
      return
    }

    if (newSeq.length === target.length) {
      setScore((s) => s + round * 5)
      if (round >= maxRounds) {
        setGameOver(true)
      } else {
        setRound((r) => r + 1)
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <h4 className="text-lg font-bold text-foreground">Color Match</h4>
      <p className="text-sm text-muted-foreground text-center leading-relaxed">
        Remember the color sequence and tap to repeat it. Engaging your memory interrupts distressing thought loops.
      </p>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">Round {round}/{maxRounds}</span>
        <span className="text-sm font-bold" style={{ color: emotion.color }}>Score: {score}</span>
      </div>

      {/* Target display */}
      <div className="flex gap-2 p-3 rounded-xl" style={{ background: "var(--muted)" }}>
        {target.map((c, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-lg transition-all duration-300"
            style={{
              background: showTarget ? c : "var(--border)",
              boxShadow: showTarget ? `0 0 8px ${c}44` : "none",
            }}
          />
        ))}
      </div>

      {showTarget && (
        <p className="text-xs text-muted-foreground animate-pulse">Memorize the colors...</p>
      )}

      {/* Color picker */}
      {!showTarget && !gameOver && (
        <div className="flex flex-wrap justify-center gap-3">
          {GAME_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handlePick(color)}
              className="w-14 h-14 rounded-xl cursor-pointer transition-all duration-150 hover:scale-110 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ background: color, boxShadow: `0 4px 12px ${color}44` }}
              aria-label={`Pick color ${color}`}
            />
          ))}
        </div>
      )}

      {/* Player sequence */}
      {!showTarget && playerSequence.length > 0 && (
        <div className="flex gap-2">
          {playerSequence.map((c, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-lg"
              style={{ background: c }}
            />
          ))}
        </div>
      )}

      {gameOver && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-base font-bold text-foreground">
            {round >= maxRounds && playerSequence.length === target.length ? "Perfect!" : "Nice try!"}
          </p>
          <p className="text-sm text-muted-foreground">You scored {score} points</p>
          <button
            onClick={onComplete}
            className="px-6 py-3 rounded-xl text-sm font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            style={{ background: emotion.color, color: "#FFF" }}
          >
            Done! +{Math.max(score, 15)}pts
          </button>
        </div>
      )}
    </div>
  )
}

// -- PATTERN PUZZLE GAME --
function PatternPuzzle({ emotion, onComplete }: { emotion: EmotionCategory; onComplete: () => void }) {
  const [grid, setGrid] = useState<boolean[]>(Array(9).fill(false))
  const [target, setTarget] = useState<boolean[]>(Array(9).fill(false))
  const [solved, setSolved] = useState(false)
  const [moves, setMoves] = useState(0)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    // Generate a random target pattern
    const t = Array(9)
      .fill(false)
      .map(() => Math.random() > 0.5)
    // Ensure at least 3 cells are on
    let onCount = t.filter(Boolean).length
    while (onCount < 3) {
      const idx = Math.floor(Math.random() * 9)
      if (!t[idx]) {
        t[idx] = true
        onCount++
      }
    }
    setTarget(t)
  }, [])

  function toggle(idx: number) {
    if (solved) return
    const newGrid = [...grid]
    newGrid[idx] = !newGrid[idx]
    // Toggle adjacent cells
    if (idx % 3 !== 0) newGrid[idx - 1] = !newGrid[idx - 1]
    if (idx % 3 !== 2) newGrid[idx + 1] = !newGrid[idx + 1]
    if (idx >= 3) newGrid[idx - 3] = !newGrid[idx - 3]
    if (idx < 6) newGrid[idx + 3] = !newGrid[idx + 3]
    setGrid(newGrid)
    setMoves((m) => m + 1)

    // Check match
    if (newGrid.every((v, i) => v === target[i])) {
      setSolved(true)
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <h4 className="text-lg font-bold text-foreground">Pattern Puzzle</h4>
      <p className="text-sm text-muted-foreground text-center leading-relaxed">
        Match the target pattern. Tapping a square toggles it and its neighbors. Puzzles engage your problem-solving brain, giving your emotional brain a break.
      </p>

      <div className="flex gap-8 items-start">
        {/* Target */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Target</span>
          <div className="grid grid-cols-3 gap-1.5">
            {target.map((on, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-md transition-colors"
                style={{ background: on ? emotion.color : "var(--border)" }}
              />
            ))}
          </div>
        </div>

        {/* Player grid */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Your grid</span>
          <div className="grid grid-cols-3 gap-1.5">
            {grid.map((on, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className="w-10 h-10 rounded-md cursor-pointer transition-all duration-150 hover:scale-105 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  background: on ? emotion.color : "var(--muted)",
                  border: `2px solid ${on ? emotion.color : "var(--border)"}`,
                  boxShadow: on ? `0 0 8px ${emotion.color}44` : "none",
                }}
                aria-label={`Cell ${i + 1}, ${on ? "on" : "off"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <span className="text-xs text-muted-foreground">{moves} moves</span>

      {solved && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-base font-bold" style={{ color: emotion.color }}>
            Solved!
          </p>
          <button
            onClick={onComplete}
            className="px-6 py-3 rounded-xl text-sm font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            style={{ background: emotion.color, color: "#FFF" }}
          >
            Done! +20pts
          </button>
        </div>
      )}
    </div>
  )
}

// -- MAIN CRISIS GAMES COMPONENT --
const GAMES = [
  { id: "breathing", name: "Breathing", icon: Wind, description: "Calm your nervous system" },
  { id: "colors", name: "Color Match", icon: Palette, description: "Engage your memory" },
  { id: "puzzle", name: "Pattern Puzzle", icon: Puzzle, description: "Focus your mind" },
]

export function CrisisGames({ emotion, onClose, onComplete }: CrisisGamesProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null)

  function handleGameComplete() {
    onComplete()
    setActiveGame(null)
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 size={20} style={{ color: emotion.color }} />
          <h3 className="text-lg font-bold text-foreground">Crisis Toolkit</h3>
        </div>
        <button
          onClick={onClose}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        These games are designed to activate different parts of your brain, giving your emotional center a chance to cool down. Based on DBT distress tolerance techniques.
      </p>

      {!activeGame ? (
        <div className="flex flex-col gap-3">
          {GAMES.map((game) => {
            const GameIcon = game.icon
            return (
              <button
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                className="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  borderColor: `${emotion.color}33`,
                  background: `${emotion.color}08`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${emotion.color}22` }}
                >
                  <GameIcon size={22} style={{ color: emotion.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{game.name}</p>
                  <p className="text-xs text-muted-foreground">{game.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      ) : activeGame === "breathing" ? (
        <BreathingGame emotion={emotion} onComplete={handleGameComplete} />
      ) : activeGame === "colors" ? (
        <ColorMatchGame emotion={emotion} onComplete={handleGameComplete} />
      ) : activeGame === "puzzle" ? (
        <PatternPuzzle emotion={emotion} onComplete={handleGameComplete} />
      ) : null}

      {activeGame && (
        <button
          onClick={() => setActiveGame(null)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-center"
        >
          Back to games
        </button>
      )}
    </div>
  )
}
