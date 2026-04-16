"use client"

import { useState } from "react"
import { Flame, Home, BarChart3, Zap, LogOut, Palette, Brain, Trophy, Settings, Globe } from "lucide-react"
import { getLevel } from "@/lib/game-store"
import { signOut } from "@/lib/auth"
import { getLanguageByCode } from "@/lib/languages"

type NavBarProps = {
  activeScreen: string
  onNavigate: (screen: string) => void
  streak: number
  points: number
  displayName?: string
  avatarEmoji?: string
  onShowThemes?: () => void
  onShowSettings?: () => void
  language?: string
  onShowLanguage?: () => void
}

export function NavBar({
  activeScreen,
  onNavigate,
  streak,
  points,
  displayName,
  avatarEmoji = "🌸",
  onShowThemes,
  onShowSettings,
  language = "en",
  onShowLanguage,
}: NavBarProps) {
  const [showMenu, setShowMenu] = useState(false)
  const level = getLevel(points)
  const langLabel = getLanguageByCode(language)?.nativeName ?? language.toUpperCase()

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
        <div className="flex items-center justify-between px-4 py-2 bg-background/60 backdrop-blur-md">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-game-coral/10">
              <Zap size={14} className="text-game-coral" aria-hidden="true" />
              <span className="text-xs font-bold text-game-coral">{points} pts</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-game-teal/10">
                <Flame size={14} className="text-game-teal" aria-hidden="true" />
                <span className="text-xs font-bold text-game-teal">{streak}d</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary/10">
              <span className="text-xs" aria-hidden="true">{level.emoji}</span>
              <span className="text-xs font-bold text-primary">{level.name}</span>
            </div>
            <button
              onClick={() => { onShowThemes?.() }}
              style={{ minHeight: 36 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Change app theme"
            >
              <Palette size={13} className="text-primary" aria-hidden="true" />
              <span className="text-xs font-bold text-primary">Themes</span>
            </button>

            {/* Language toggle */}
            <button
              onClick={() => { onShowLanguage?.() }}
              style={{ minHeight: 36 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={`Language: ${langLabel}. Tap to change.`}
            >
              <Globe size={13} className="text-primary" aria-hidden="true" />
              <span className="text-xs font-bold text-primary">{langLabel}</span>
            </button>
          </div>

          {/* Avatar / Profile menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((s) => !s)}
              style={{ minWidth: 44, minHeight: 44 }}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-muted border-2 border-border hover:border-primary transition-colors cursor-pointer text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Profile menu"
              aria-expanded={showMenu}
              aria-haspopup="menu"
            >
              {avatarEmoji}
            </button>
            {showMenu && (
              <div
                className="absolute bottom-12 right-0 w-52 bg-card border border-border rounded-2xl shadow-xl p-2 flex flex-col gap-1"
                role="menu"
                aria-label="Profile menu"
              >
                {displayName && (
                  <div className="px-3 py-2 text-sm text-muted-foreground font-medium border-b border-border mb-1">
                    Hi, {displayName}
                  </div>
                )}
                <button
                  onClick={() => { onShowSettings?.(); setShowMenu(false) }}
                  role="menuitem"
                  style={{ minHeight: 44 }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors cursor-pointer text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Settings size={15} aria-hidden="true" />
                  Account Settings
                </button>
                <button
                  onClick={handleSignOut}
                  role="menuitem"
                  style={{ minHeight: 44 }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-destructive/10 transition-colors cursor-pointer text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                >
                  <LogOut size={15} aria-hidden="true" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <div className="flex items-center justify-around p-3 rounded-t-3xl bg-card/95 backdrop-blur-xl border-t border-border/60 shadow-[0_-8px_32px_rgba(0,0,0,0.10)]">
          {items.map((item) => {
            const isActive = activeScreen === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setShowMenu(false) }}
                style={{ minWidth: 60, minHeight: 56, background: isActive ? "var(--primary)" : "transparent" }}
                className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
              >
                <Icon size={22} style={{ color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)" }} aria-hidden="true" />
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
