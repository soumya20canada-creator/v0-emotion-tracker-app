"use client"

import { useEffect, useState } from "react"
import { Moon, Sun, Palette, X, Check } from "lucide-react"
import { THEMES, applyTheme, type ThemeId } from "@/lib/themes"

const STORAGE_KEY = "bhava-theme"
const LIGHT_DEFAULT: ThemeId = "default"
const DARK_DEFAULT: ThemeId = "midnight"

type ThemeHeaderProps = {
  onThemeChange?: (themeId: ThemeId) => void
}

export function ThemeHeader({ onThemeChange }: ThemeHeaderProps) {
  const [theme, setTheme] = useState<ThemeId>(LIGHT_DEFAULT)
  const [showSheet, setShowSheet] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null
      if (saved && THEMES.some((t) => t.id === saved)) {
        setTheme(saved)
        applyTheme(saved)
      }
    } catch { /* ignore */ }
  }, [])

  function pick(id: ThemeId) {
    setTheme(id)
    applyTheme(id)
    try { localStorage.setItem(STORAGE_KEY, id) } catch { /* ignore */ }
    onThemeChange?.(id)
  }

  function quickToggle() {
    const current = THEMES.find((t) => t.id === theme)
    pick(current?.dark ? LIGHT_DEFAULT : DARK_DEFAULT)
  }

  const isDark = THEMES.find((t) => t.id === theme)?.dark

  return (
    <>
      <div className="flex items-center justify-end gap-2 px-4 py-2">
        <button
          onClick={quickToggle}
          style={{ minWidth: 40, minHeight: 40 }}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-muted hover:bg-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={16} className="text-foreground" /> : <Moon size={16} className="text-foreground" />}
        </button>
        <button
          onClick={() => setShowSheet(true)}
          style={{ minHeight: 40 }}
          className="flex items-center gap-1.5 px-3 h-10 rounded-full bg-muted hover:bg-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Pick a color theme"
        >
          <Palette size={14} className="text-foreground" aria-hidden="true" />
          <span className="text-xs font-semibold text-foreground">Theme</span>
        </button>
      </div>

      {showSheet && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/30 backdrop-blur-sm"
          onClick={() => setShowSheet(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Theme picker"
        >
          <div
            className="w-full max-w-lg bg-card rounded-t-3xl p-5 pb-10 shadow-2xl border-t border-border/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" aria-hidden="true" />
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-foreground">Your palette</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Pick the look that feels like you.</p>
              </div>
              <button
                onClick={() => setShowSheet(false)}
                style={{ minWidth: 44, minHeight: 44 }}
                className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close theme picker"
              >
                <X size={16} />
              </button>
            </div>
            <ThemeGrid currentTheme={theme} onSelect={pick} />
          </div>
        </div>
      )}
    </>
  )
}

function ThemeGrid({ currentTheme, onSelect }: { currentTheme: ThemeId; onSelect: (id: ThemeId) => void }) {
  const lightThemes = THEMES.filter((t) => !t.dark)
  const darkThemes = THEMES.filter((t) => t.dark)
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">☀️ Light</p>
        <div className="grid grid-cols-4 gap-2">
          {lightThemes.map((t) => (
            <ThemeCard key={t.id} theme={t} isActive={currentTheme === t.id} onSelect={() => onSelect(t.id)} />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">🌙 Dark</p>
        <div className="grid grid-cols-5 gap-2">
          {darkThemes.map((t) => (
            <ThemeCard key={t.id} theme={t} isActive={currentTheme === t.id} onSelect={() => onSelect(t.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ThemeCard({
  theme, isActive, onSelect,
}: { theme: (typeof THEMES)[0]; isActive: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={isActive}
      className="group relative flex flex-col gap-2 rounded-2xl p-2 border-2 transition-all duration-200 cursor-pointer hover:scale-[1.04] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        borderColor: isActive ? theme.vars["--primary"] : theme.vars["--border"],
        background: isActive ? `${theme.vars["--primary"]}18` : theme.vars["--card"],
      }}
    >
      <div className="w-full rounded-xl overflow-hidden relative" style={{ height: 52, background: theme.vars["--background"] }}>
        <div className="absolute top-2 left-2 right-2 h-2.5 rounded-full opacity-30" style={{ background: theme.vars["--foreground"] }} />
        <div className="absolute bottom-2 left-2 h-5 rounded-lg" style={{ width: "55%", background: theme.vars["--primary"] }} />
        <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full" style={{ background: theme.vars["--accent"] }} />
        {isActive && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: theme.vars["--primary"] }}>
            <Check size={10} style={{ color: theme.vars["--primary-foreground"] }} strokeWidth={3} />
          </div>
        )}
      </div>
      <div className="px-0.5 text-center">
        <p className="text-[11px] font-bold text-foreground leading-tight">{theme.emoji} {theme.name}</p>
        <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{theme.description}</p>
      </div>
    </button>
  )
}
