"use client"

import { useState } from "react"
import { Home, BarChart3, LogOut, Brain, Sparkles, Settings, Palette } from "lucide-react"
import { signOut } from "@/lib/auth"

type NavBarProps = {
  activeScreen: string
  onNavigate: (screen: string) => void
  displayName?: string
  avatarEmoji?: string
  onShowThemes?: () => void
  onShowSettings?: () => void
}

export function NavBar({
  activeScreen,
  onNavigate,
  displayName,
  avatarEmoji = "🌸",
  onShowThemes,
  onShowSettings,
}: NavBarProps) {
  const [showMenu, setShowMenu] = useState(false)

  const items = [
    { id: "home",     label: "Feel",     icon: Home },
    { id: "progress", label: "Journey",  icon: BarChart3 },
    { id: "patterns", label: "Patterns", icon: Brain },
    { id: "badges",   label: "My Space", icon: Sparkles },
  ]

  async function handleSignOut() {
    await signOut()
    window.location.reload()
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" aria-label="Main navigation">
      <div className="max-w-lg mx-auto">
        {/* Avatar row */}
        <div className="flex items-center justify-end px-4 py-2 bg-background/60 backdrop-blur-md">
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
                {onShowThemes && (
                  <button
                    onClick={() => { onShowThemes(); setShowMenu(false) }}
                    role="menuitem"
                    style={{ minHeight: 44 }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors cursor-pointer text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Palette size={15} aria-hidden="true" />
                    Theme
                  </button>
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
