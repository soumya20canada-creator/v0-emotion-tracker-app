"use client"

import { Flame, Home, BarChart3, Zap } from "lucide-react"

type NavBarProps = {
  activeScreen: string
  onNavigate: (screen: string) => void
  streak: number
  points: number
}

export function NavBar({ activeScreen, onNavigate, streak, points }: NavBarProps) {
  const items = [
    { id: "home", label: "Feel", icon: Home },
    { id: "progress", label: "Progress", icon: BarChart3 },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" aria-label="Main navigation">
      <div className="max-w-md mx-auto">
        {/* Stats bar */}
        <div className="flex items-center justify-center gap-4 px-4 py-1.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-game-coral/10">
            <Zap size={14} className="text-game-coral" />
            <span className="text-xs font-bold text-game-coral">{points} pts</span>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-game-teal/10">
              <Flame size={14} className="text-game-teal" />
              <span className="text-xs font-bold text-game-teal">{streak} day streak</span>
            </div>
          )}
        </div>

        {/* Nav items */}
        <div className="flex items-center justify-around p-2 rounded-t-2xl bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          {items.map((item) => {
            const isActive = activeScreen === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  background: isActive ? "var(--primary)" : "transparent",
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={20} style={{ color: isActive ? "#FFF" : "var(--muted-foreground)" }} />
                <span
                  className="text-xs font-bold"
                  style={{ color: isActive ? "#FFF" : "var(--muted-foreground)" }}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
