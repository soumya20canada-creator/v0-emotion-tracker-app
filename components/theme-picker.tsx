"use client"

import { THEMES, applyTheme, type ThemeId } from "@/lib/themes"
import { updateProfile } from "@/lib/profile"

type ThemePickerProps = {
  userId: string
  currentTheme: string
  onThemeChange: (themeId: ThemeId) => void
}

export function ThemePicker({ userId, currentTheme, onThemeChange }: ThemePickerProps) {
  async function handleSelect(themeId: ThemeId) {
    applyTheme(themeId)
    onThemeChange(themeId)
    await updateProfile(userId, { color_theme: themeId })
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your space, your palette</p>
      <div className="grid grid-cols-3 gap-2">
        {THEMES.map((theme) => {
          const isActive = currentTheme === theme.id
          return (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id as ThemeId)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
              style={{
                borderColor: isActive ? theme.vars["--primary"] : "var(--border)",
                background: isActive ? `${theme.vars["--primary"]}15` : "var(--card)",
                boxShadow: isActive ? `0 2px 12px ${theme.vars["--primary"]}33` : "none",
              }}
              aria-pressed={isActive}
            >
              <div
                className="w-8 h-8 rounded-full border-2"
                style={{
                  background: `linear-gradient(135deg, ${theme.vars["--primary"]}, ${theme.vars["--accent"]})`,
                  borderColor: isActive ? theme.vars["--primary"] : "transparent",
                }}
              />
              <span className="text-xs font-semibold text-foreground">{theme.emoji} {theme.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
