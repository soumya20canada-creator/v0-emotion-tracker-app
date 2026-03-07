"use client"

import { useState } from "react"
import { Flame, Home, BarChart3, Zap, LogOut, Palette, Brain, Trophy } from "lucide-react"
import { getLevel } from "@/lib/game-store"
import { signOut } from "@/lib/auth"

type NavBarProps = {
  activeScreen: string
  onNavigate: (screen: string) => void
  streak: number
  points: number
  displayName?: string
  avatarEmoji?: string
  onShowThemes?: () => void
}

export function NavBar({ activeScreen, onNavigate, streak, points, displayName, avatarEmoji = "🌸", onShowThemes }: NavBarProps) {
  const [showMenu, setShowMenu] = useState(false)
  const level = getLevel(points)

  const items = [
    { id: "home",     label: "Feel",     icon: Home },
    { id: "progress", label: "Journey",  icon: BarChart3 },
    { id: "patterns", label: "Patterns", icon: Brain },
    { id: "badges",   label: "Badges",   icon: Trophy },
  ]

  async function handleSignOut() {
    await signOut()
    window.location.reload()
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" aria-label="Main navigation">
      <div className="max-w-lg mx-auto">
        {/* Stats bar */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-game-coral/10">
              <Zap size={14} className="text-game-coral" />
              <span className="text-xs font-bold text-game-coral">{points} pts</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-game-teal/10">
                <Flame size={14} className="text-game-teal" />
                <span className="text-xs font-bold text-game-teal">{streak}d</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary/10">
              <span className="text-xs">{level.emoji}</span>
              <span className="text-xs font-bold text-primary">{level.name}</span>
            </div>
            <button
              onClick={() => { onShowThemes?.(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
              aria-label="Change theme"
            >
              <Palette size={13} className="text-primary" />
              <span className="text-xs font-bold text-primary">Themes</span>
            </button>
          </div>

          {/* Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((s) => !s)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-muted border-2 border-border hover:border-primary transition-colors cursor-pointer text-lg"
              aria-label="Profile menu"
            >
              {avatarEmoji}
            </button>
            {showMenu && (
              <div className="absolute bottom-11 right-0 w-48 bg-card border border-border rounded-2xl shadow-xl p-2 flex flex-col gap-1">
                {displayName && (
                  <div className="px-3 py-2 text-xs text-muted-foreground font-medium border-b border-border mb-1">
                    Hi, {displayName} 👋
                  </div>
                )}
                {onShowThemes && (
                  <button
                    onClick={() => { onShowThemes(); setShowMenu(false) }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors cursor-pointer text-foreground"
                  >
                    <Palette size={15} />
                    Change theme
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-destructive/10 transition-colors cursor-pointer text-destructive"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <div className="flex items-center justify-around p-3 rounded-t-2xl bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          {items.map((item) => {
            const isActive = activeScreen === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setShowMenu(false) }}
                className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ background: isActive ? "var(--primary)" : "transparent" }}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={22} style={{ color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)" }} />
                <span className="text-sm font-bold" style={{ color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>
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
