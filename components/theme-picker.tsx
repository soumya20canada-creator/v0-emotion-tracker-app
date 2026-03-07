"use client"

import { THEMES, applyTheme, type ThemeId } from "@/lib/themes"
import { updateProfile } from "@/lib/profile"
import { Check } from "lucide-react"

type ThemePickerProps = {
  userId: string
  currentTheme: string
  onThemeChange: (themeId: ThemeId) => void
}

const lightThemes = THEMES.filter((t) => !t.dark)
const darkThemes  = THEMES.filter((t) =>  t.dark)

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: (typeof THEMES)[0]
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={isActive}
      className="group relative flex flex-col gap-2 rounded-2xl p-2 border-2 transition-all duration-200 cursor-pointer hover:scale-[1.04] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        borderColor: isActive ? theme.vars["--primary"] : theme.vars["--border"],
        background: isActive ? `${theme.vars["--primary"]}18` : theme.vars["--card"],
        boxShadow: isActive
          ? `0 4px 20px ${theme.vars["--primary"]}40`
          : `0 1px 4px ${theme.vars["--border"]}88`,
      }}
    >
      {/* Mini app preview */}
      <div
        className="w-full rounded-xl overflow-hidden relative"
        style={{ height: 52, background: theme.vars["--background"] }}
      >
        {/* Simulated header bar */}
        <div
          className="absolute top-2 left-2 right-2 h-2.5 rounded-full opacity-30"
          style={{ background: theme.vars["--foreground"] }}
        />
        {/* Primary color stripe / pill */}
        <div
          className="absolute bottom-2 left-2 h-5 rounded-lg"
          style={{ width: "55%", background: theme.vars["--primary"] }}
        />
        {/* Accent dot */}
        <div
          className="absolute bottom-2 right-2 w-5 h-5 rounded-full"
          style={{ background: theme.vars["--accent"] }}
        />
        {/* Active checkmark */}
        {isActive && (
          <div
            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: theme.vars["--primary"] }}
          >
            <Check size={10} style={{ color: theme.vars["--primary-foreground"] }} strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="px-0.5 text-center">
        <p className="text-[11px] font-bold text-foreground leading-tight">
          {theme.emoji} {theme.name}
        </p>
        <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">
          {theme.description}
        </p>
      </div>
    </button>
  )
}

export function ThemePicker({ userId, currentTheme, onThemeChange }: ThemePickerProps) {
  async function handleSelect(themeId: ThemeId) {
    applyTheme(themeId)
    onThemeChange(themeId)
    await updateProfile(userId, { color_theme: themeId })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Light themes */}
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
          ☀️ Light
        </p>
        <div className="grid grid-cols-5 gap-2">
          {lightThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={currentTheme === theme.id}
              onSelect={() => handleSelect(theme.id as ThemeId)}
            />
          ))}
        </div>
      </div>

      {/* Dark themes */}
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
          🌙 Dark
        </p>
        <div className="grid grid-cols-5 gap-2">
          {darkThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={currentTheme === theme.id}
              onSelect={() => handleSelect(theme.id as ThemeId)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
