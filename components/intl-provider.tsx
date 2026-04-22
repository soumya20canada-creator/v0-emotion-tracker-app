"use client"

import { NextIntlClientProvider } from "next-intl"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  DEFAULT_LOCALE,
  detectBrowserLocale,
  isRTL,
  isSupportedLocale,
  type Locale,
} from "@/lib/locales"

const STORAGE_KEY = "bhava-locale"

type LocaleSwitchValue = {
  locale: Locale
  setLocale: (next: Locale) => Promise<void>
}

const LocaleSwitchContext = createContext<LocaleSwitchValue | null>(null)

export function useLocaleSwitch(): LocaleSwitchValue {
  const ctx = useContext(LocaleSwitchContext)
  if (!ctx) throw new Error("useLocaleSwitch must be used inside <IntlProvider>")
  return ctx
}

async function loadMessages(locale: Locale): Promise<Record<string, unknown>> {
  const mod = await import(`@/messages/${locale}.json`)
  return mod.default as Record<string, unknown>
}

function applyDocumentDir(locale: Locale) {
  if (typeof document === "undefined") return
  document.documentElement.dir = isRTL(locale) ? "rtl" : "ltr"
  document.documentElement.lang = locale
}

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null)

  // Initial load — read from localStorage or detect browser.
  useEffect(() => {
    let cancelled = false
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    const initial: Locale = isSupportedLocale(saved) ? saved : detectBrowserLocale()
    loadMessages(initial)
      .then((m) => {
        if (cancelled) return
        setMessages(m)
        setLocaleState(initial)
        applyDocumentDir(initial)
      })
      .catch(() => {
        // Fallback to English on error.
        loadMessages(DEFAULT_LOCALE).then((m) => {
          if (cancelled) return
          setMessages(m)
          setLocaleState(DEFAULT_LOCALE)
          applyDocumentDir(DEFAULT_LOCALE)
        })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const setLocale = useCallback(async (next: Locale) => {
    const m = await loadMessages(next)
    setMessages(m)
    setLocaleState(next)
    applyDocumentDir(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  // Until messages load, render nothing — prevents a flash of raw keys.
  if (!messages) return null

  return (
    <LocaleSwitchContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        onError={() => {
          /* swallow missing-key warnings in prod */
        }}
        getMessageFallback={({ key }) => key}
      >
        {children}
      </NextIntlClientProvider>
    </LocaleSwitchContext.Provider>
  )
}
