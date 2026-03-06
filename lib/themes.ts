export type ThemeId = "default" | "ocean" | "forest" | "sunset" | "lavender" | "midnight"

export type Theme = {
  id: ThemeId
  name: string
  emoji: string
  description: string
  vars: Record<string, string>
}

export const THEMES: Theme[] = [
  {
    id: "default",
    name: "Bhava",
    emoji: "✨",
    description: "Calm blue focus",
    vars: {
      "--background": "#FFFDF8",
      "--foreground": "#1E293B",
      "--card": "#FFFFFF",
      "--card-foreground": "#1E293B",
      "--primary": "#3B82F6",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#F0F7FF",
      "--secondary-foreground": "#1E293B",
      "--muted": "#F1F5F9",
      "--muted-foreground": "#64748B",
      "--accent": "#10B981",
      "--accent-foreground": "#FFFFFF",
      "--border": "#E2E8F0",
      "--input": "#E2E8F0",
      "--ring": "#3B82F6",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    emoji: "🌊",
    description: "Deep & serene",
    vars: {
      "--background": "#F0F9FF",
      "--foreground": "#0C2340",
      "--card": "#E0F2FE",
      "--card-foreground": "#0C2340",
      "--primary": "#0891B2",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#BAE6FD",
      "--secondary-foreground": "#0C2340",
      "--muted": "#E0F2FE",
      "--muted-foreground": "#0369A1",
      "--accent": "#1D4ED8",
      "--accent-foreground": "#FFFFFF",
      "--border": "#BAE6FD",
      "--input": "#BAE6FD",
      "--ring": "#0891B2",
    },
  },
  {
    id: "forest",
    name: "Forest",
    emoji: "🌿",
    description: "Earthy & grounded",
    vars: {
      "--background": "#F0FDF4",
      "--foreground": "#14532D",
      "--card": "#DCFCE7",
      "--card-foreground": "#14532D",
      "--primary": "#16A34A",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#BBF7D0",
      "--secondary-foreground": "#14532D",
      "--muted": "#DCFCE7",
      "--muted-foreground": "#166534",
      "--accent": "#D97706",
      "--accent-foreground": "#FFFFFF",
      "--border": "#BBF7D0",
      "--input": "#BBF7D0",
      "--ring": "#16A34A",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    description: "Warm & energetic",
    vars: {
      "--background": "#FFF7ED",
      "--foreground": "#431407",
      "--card": "#FFEDD5",
      "--card-foreground": "#431407",
      "--primary": "#EA580C",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#FED7AA",
      "--secondary-foreground": "#431407",
      "--muted": "#FFEDD5",
      "--muted-foreground": "#9A3412",
      "--accent": "#E11D48",
      "--accent-foreground": "#FFFFFF",
      "--border": "#FED7AA",
      "--input": "#FED7AA",
      "--ring": "#EA580C",
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    emoji: "💜",
    description: "Soft & dreamy",
    vars: {
      "--background": "#FAF5FF",
      "--foreground": "#3B0764",
      "--card": "#F3E8FF",
      "--card-foreground": "#3B0764",
      "--primary": "#7C3AED",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#E9D5FF",
      "--secondary-foreground": "#3B0764",
      "--muted": "#F3E8FF",
      "--muted-foreground": "#6D28D9",
      "--accent": "#DB2777",
      "--accent-foreground": "#FFFFFF",
      "--border": "#E9D5FF",
      "--input": "#E9D5FF",
      "--ring": "#7C3AED",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    emoji: "🌙",
    description: "Dark & focused",
    vars: {
      "--background": "#0F0F23",
      "--foreground": "#E2E8F0",
      "--card": "#1A1A3E",
      "--card-foreground": "#E2E8F0",
      "--primary": "#4F46E5",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#1E1B4B",
      "--secondary-foreground": "#E2E8F0",
      "--muted": "#1E1B4B",
      "--muted-foreground": "#94A3B8",
      "--accent": "#7C3AED",
      "--accent-foreground": "#FFFFFF",
      "--border": "#2D2B55",
      "--input": "#2D2B55",
      "--ring": "#4F46E5",
    },
  },
]

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

export function applyTheme(id: string): void {
  const theme = getTheme(id)
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
