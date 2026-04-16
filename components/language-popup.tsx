"use client"

import { useState, useMemo } from "react"
import { FEATURED_LANGUAGES, ALL_LANGUAGES, saveLanguage, type Language } from "@/lib/languages"
import { PronunciationGuide } from "@/components/pronunciation-guide"

type LanguagePopupProps = {
  onSelect: (languageCode: string) => void
}

export function LanguagePopup({ onSelect }: LanguagePopupProps) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string | null>(null)

  const filteredLanguages = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return ALL_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q)
    ).slice(0, 12)
  }, [search])

  function handleSelect(lang: Language) {
    setSelected(lang.code)
    saveLanguage(lang.code)
    setTimeout(() => onSelect(lang.code), 120)
  }

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Language selection"
    >
      <div className="w-full max-w-sm bg-card rounded-3xl shadow-2xl border border-border flex flex-col gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-7 pt-8 pb-6 flex flex-col items-center gap-3 border-b border-border">
          <BhavaLotus size={52} />
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <h1
                className="text-4xl tracking-wide leading-none"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  background: "linear-gradient(135deg, #C9A84C 0%, #F5D77E 50%, #C9A84C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Bhava
              </h1>
              <span
                className="text-2xl"
                style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                  background: "linear-gradient(135deg, #C9A84C 0%, #F5D77E 50%, #C9A84C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                · भाव
              </span>
              <PronunciationGuide size="sm" />
            </div>
            <p className="text-sm text-muted-foreground italic tracking-wide mt-0.5">
              the felt sense of being
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-6 flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-bold text-foreground text-center">
              What language would you like to use?
            </h2>
          </div>

          {/* Featured language buttons */}
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Featured languages">
            {FEATURED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang)}
                style={{ minHeight: 44 }}
                aria-pressed={selected === lang.code}
                className={[
                  "px-2 py-2.5 rounded-xl text-sm font-semibold text-center transition-all duration-150 cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  "hover:scale-[1.03] active:scale-[0.97]",
                  selected === lang.code
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-foreground hover:bg-primary/10",
                ].join(" ")}
              >
                <span className="block text-xs text-muted-foreground font-normal leading-tight">
                  {lang.nativeName !== lang.name ? lang.nativeName : ""}
                </span>
                {lang.name}
              </button>
            ))}
          </div>

          {/* Searchable dropdown */}
          <div className="flex flex-col gap-2">
            <label htmlFor="language-search" className="text-sm font-semibold text-foreground">
              Search all languages
            </label>
            <input
              id="language-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a language name..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base transition"
              aria-controls="language-results"
              aria-autocomplete="list"
              style={{ minHeight: 44 }}
            />
            {filteredLanguages.length > 0 && (
              <ul
                id="language-results"
                role="listbox"
                aria-label="Language results"
                className="max-h-44 overflow-y-auto rounded-xl border border-border bg-background divide-y divide-border"
              >
                {filteredLanguages.map((lang) => (
                  <li key={lang.code} role="option" aria-selected={selected === lang.code}>
                    <button
                      type="button"
                      onClick={() => handleSelect(lang)}
                      style={{ minHeight: 44 }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-muted transition-colors focus-visible:outline-none focus-visible:bg-muted cursor-pointer"
                    >
                      <span className="text-base text-foreground font-medium">{lang.name}</span>
                      <span className="text-sm text-muted-foreground">{lang.nativeName}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="px-7 pb-6">
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            You can change your language anytime from the top of the screen.
          </p>
        </div>
      </div>
    </div>
  )
}

function BhavaLotus({ size = 52 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id="gold-lang" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="50%" stopColor="#F5D77E" />
          <stop offset="100%" stopColor="#C9A84C" />
        </linearGradient>
        <filter id="glow-lang">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow-lang)">
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-lang)" opacity="0.9" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-lang)" opacity="0.9" transform="rotate(45 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-lang)" opacity="0.9" transform="rotate(90 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-lang)" opacity="0.9" transform="rotate(135 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-lang)" opacity="0.9" transform="rotate(180 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-lang)" opacity="0.9" transform="rotate(225 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-lang)" opacity="0.9" transform="rotate(270 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-lang)" opacity="0.9" transform="rotate(315 50 50)" />
        <circle cx="50" cy="50" r="10" fill="url(#gold-lang)" />
        <circle cx="50" cy="50" r="5" fill="#FFF8E7" opacity="0.8" />
      </g>
    </svg>
  )
}
