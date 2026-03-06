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
      <h4 className="text-xl font-extrabold text-foreground">Breathing Game</h4>
      <p className="text-base text-muted-foreground text-center leading-relaxed">
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
          style={{ background: emotion.color, color: "#FFFFFF" }}
        >
          Done! +25pts
        </button>
      )}
    </div>
  )
}

// -- COLOR MATCHING GAME --
const GAME_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6"]

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
      <h4 className="text-xl font-extrabold text-foreground">Color Match</h4>
      <p className="text-base text-muted-foreground text-center leading-relaxed">
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
            style={{ background: emotion.color, color: "#FFFFFF" }}
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
      <h4 className="text-xl font-extrabold text-foreground">Pattern Puzzle</h4>
      <p className="text-base text-muted-foreground text-center leading-relaxed">
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
            style={{ background: emotion.color, color: "#FFFFFF" }}
          >
            Done! +20pts
          </button>
        </div>
      )}
    </div>
  )
}

// -- BUBBLE WRAP GAME --
function BubbleWrapGame({ emotion, onComplete }: { emotion: EmotionCategory; onComplete: () => void }) {
  const [popped, setPopped] = useState<boolean[]>(Array(20).fill(false))
  const allPopped = popped.every(Boolean)

  function pop(i: number) {
    if (popped[i]) return
    setPopped(prev => { const n = [...prev]; n[i] = true; return n })
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <h4 className="text-xl font-extrabold text-foreground">Bubble Wrap</h4>
      <p className="text-base text-muted-foreground text-center leading-relaxed">
        Pop every bubble. Simple. Satisfying. 🫧
      </p>
      <div className="grid grid-cols-5 gap-2">
        {popped.map((isPop, i) => (
          <button
            key={i}
            onClick={() => pop(i)}
            className="w-12 h-12 rounded-full transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              background: isPop ? "var(--muted)" : `${emotion.color}33`,
              border: `3px solid ${isPop ? "var(--border)" : emotion.color}`,
              transform: isPop ? "scale(0.85)" : "scale(1)",
              boxShadow: isPop ? "none" : `0 2px 8px ${emotion.color}44`,
            }}
            aria-label={isPop ? "Bubble popped" : "Pop bubble"}
            aria-pressed={isPop}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{popped.filter(Boolean).length}/20 popped</p>
      {allPopped && (
        <button
          onClick={onComplete}
          className="px-6 py-3 rounded-xl text-sm font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          style={{ background: emotion.color, color: "#FFFFFF" }}
        >
          Done! +15pts
        </button>
      )}
    </div>
  )
}

// -- SAND DRAW GAME --
function SandDrawGame({ emotion, onComplete }: { emotion: EmotionCategory; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const [strokeCount, setStrokeCount] = useState(0)
  const [canFinish, setCanFinish] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setCanFinish(true), 20000)
    return () => clearTimeout(timer)
  }, [])

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function draw(x: number, y: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.globalAlpha = 0.6
    ctx.fillStyle = emotion.color
    for (let i = 0; i < 6; i++) {
      const px = x + (Math.random() - 0.5) * 16
      const py = y + (Math.random() - 0.5) * 16
      const r = Math.random() * 3 + 1
      ctx.beginPath()
      ctx.arc(px, py, r, 0, Math.PI * 2)
      ctx.fill()
    }
    if (lastPos.current) {
      ctx.globalAlpha = 0.3
      ctx.strokeStyle = emotion.color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    lastPos.current = { x, y }
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    ctx?.clearRect(0, 0, canvas.width, canvas.height)
    setStrokeCount(0)
  }

  function handleStart(e: React.MouseEvent | React.TouchEvent) {
    isDrawing.current = true
    lastPos.current = null
    const canvas = canvasRef.current
    if (canvas) {
      const pos = getPos(e, canvas)
      draw(pos.x, pos.y)
    }
  }

  function handleMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (canvas) {
      const pos = getPos(e, canvas)
      draw(pos.x, pos.y)
      setStrokeCount(s => s + 1)
    }
  }

  function handleEnd() {
    isDrawing.current = false
    lastPos.current = null
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h4 className="text-xl font-extrabold text-foreground">Sand Drawing</h4>
      <p className="text-base text-muted-foreground text-center leading-relaxed">
        Draw freely. Let it out. No rules, no judgment. 🌊
      </p>
      <canvas
        ref={canvasRef}
        width={280}
        height={220}
        className="rounded-2xl border-2 border-border touch-none cursor-crosshair"
        style={{ background: "var(--secondary)" }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 rounded-xl text-xs font-bold border border-border text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          Clear canvas
        </button>
        {canFinish ? (
          <button
            onClick={onComplete}
            className="px-6 py-2 rounded-xl text-sm font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            style={{ background: emotion.color, color: "#FFFFFF" }}
          >
            Done! +15pts
          </button>
        ) : (
          <p className="text-xs text-muted-foreground">Keep drawing...</p>
        )}
      </div>
    </div>
  )
}

// -- TAP THE DOT GAME --
function TapTheDotGame({ emotion, onComplete }: { emotion: EmotionCategory; onComplete: () => void }) {
  const DURATION = 30
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [score, setScore] = useState(0)
  const [dotPos, setDotPos] = useState({ x: 50, y: 50 })
  const [popped, setPopped] = useState(false)
  const [done, setDone] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  function randomPos() {
    // Keep dot inside bounds (dot is 60px, container ~280px)
    const margin = 15
    return {
      x: margin + Math.random() * (70 - margin * 2),
      y: margin + Math.random() * (70 - margin * 2),
    }
  }

  useEffect(() => {
    if (done) return
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(t); setDone(true); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [done])

  // Auto-move dot every 2.5 s if not tapped
  useEffect(() => {
    if (done) return
    const t = setTimeout(() => {
      setDotPos(randomPos())
      setPopped(false)
    }, 2500)
    return () => clearTimeout(t)
  }, [dotPos, done])

  function handleTap() {
    if (popped || done) return
    setPopped(true)
    setScore((s) => s + 1)
    setTimeout(() => {
      setDotPos(randomPos())
      setPopped(false)
    }, 200)
  }

  const dotSize = 60

  return (
    <div className="flex flex-col items-center gap-5">
      <h4 className="text-xl font-extrabold text-foreground">Tap the Dot</h4>
      <p className="text-base text-muted-foreground text-center leading-relaxed">
        Tap the circle before it moves! Focusing on a moving target draws you into the present moment. 🎯
      </p>
      <div className="flex items-center gap-6">
        <span className="text-sm font-bold" style={{ color: emotion.color }}>Score: {score}</span>
        <span className="text-sm font-medium text-muted-foreground">
          {done ? "Time's up!" : `${timeLeft}s`}
        </span>
      </div>
      {/* Play area */}
      <div
        ref={containerRef}
        className="relative rounded-2xl border-2 overflow-hidden"
        style={{ width: 280, height: 200, borderColor: `${emotion.color}33`, background: `${emotion.color}08` }}
      >
        {!done && (
          <button
            onClick={handleTap}
            className="absolute transition-all duration-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              width: dotSize,
              height: dotSize,
              left: `${dotPos.x}%`,
              top: `${dotPos.y}%`,
              transform: "translate(-50%, -50%)",
              background: popped ? `${emotion.color}33` : emotion.color,
              boxShadow: popped ? "none" : `0 0 20px ${emotion.color}66`,
              cursor: popped ? "default" : "pointer",
              transition: popped ? "all 0.15s ease" : "left 0.25s ease, top 0.25s ease",
            }}
            aria-label="Tap the dot"
          />
        )}
        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-2xl font-extrabold" style={{ color: emotion.color }}>{score}</p>
            <p className="text-sm text-muted-foreground">dots tapped!</p>
          </div>
        )}
      </div>
      {done && (
        <button
          onClick={onComplete}
          className="px-6 py-3 rounded-xl text-sm font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          style={{ background: emotion.color, color: "#FFFFFF" }}
        >
          Done! +{Math.max(score * 2, 10)}pts
        </button>
      )}
    </div>
  )
}

// -- MAIN CRISIS GAMES COMPONENT --
const GAMES = [
  { id: "breathing", name: "Breathing", icon: Wind, description: "Calm your nervous system" },
  { id: "colors", name: "Color Match", icon: Palette, description: "Engage your memory" },
  { id: "puzzle", name: "Pattern Puzzle", icon: Puzzle, description: "Focus your mind" },
  { id: "bubble", name: "Bubble Wrap", icon: Gamepad2, description: "Pop every bubble" },
  { id: "sand", name: "Sand Drawing", icon: Palette, description: "Draw freely, let it out" },
  { id: "tapdot", name: "Tap the Dot", icon: Gamepad2, description: "Chase the dot — stay present" },
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
          <Gamepad2 size={22} style={{ color: emotion.color }} />
          <h3 className="text-xl font-extrabold text-foreground">Grounding Toolkit</h3>
        </div>
        <button
          onClick={onClose}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>

      <p className="text-base text-muted-foreground leading-relaxed">
        Take a moment for yourself. These tools help your nervous system settle.
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
                  <p className="text-base font-bold text-foreground">{game.name}</p>
                  <p className="text-sm text-muted-foreground">{game.description}</p>
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
      ) : activeGame === "bubble" ? (
        <BubbleWrapGame emotion={emotion} onComplete={handleGameComplete} />
      ) : activeGame === "sand" ? (
        <SandDrawGame emotion={emotion} onComplete={handleGameComplete} />
      ) : activeGame === "tapdot" ? (
        <TapTheDotGame emotion={emotion} onComplete={handleGameComplete} />
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
