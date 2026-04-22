"use client"

import { useState } from "react"
import { Globe, Check, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useLocaleSwitch } from "@/components/intl-provider"
import { LOCALE_META, SUPPORTED_LOCALES, type Locale } from "@/lib/locales"

export function LanguagePicker() {
  const { locale, setLocale } = useLocaleSwitch()
  const [open, setOpen] = useState(false)
  const t = useTranslations("language")

  async function pick(next: Locale) {
    await setLocale(next)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ minHeight: 36 }}
        className="flex items-center gap-1.5 px-2.5 h-9 rounded-full bg-muted hover:bg-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={t("picker")}
      >
        <Globe size={13} className="text-foreground" aria-hidden="true" />
        <span className="text-[11px] font-semibold text-foreground uppercase">{locale}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t("chooseLanguage")}
        >
          <div
            className="w-full max-w-lg bg-card rounded-t-3xl p-5 pb-10 shadow-2xl border-t border-border/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" aria-hidden="true" />
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-foreground">{t("chooseLanguage")}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{t("note")}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ minWidth: 44, minHeight: 44 }}
                className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
              {SUPPORTED_LOCALES.map((id) => {
                const meta = LOCALE_META[id]
                const isActive = id === locale
                return (
                  <button
                    key={id}
                    onClick={() => pick(id)}
                    style={{ minHeight: 48 }}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive ? "bg-primary/10" : "hover:bg-secondary"
                    }`}
                    aria-pressed={isActive}
                  >
                    <span className="flex flex-col">
                      <span
                        className={`text-base font-semibold ${isActive ? "text-primary" : "text-foreground"}`}
                      >
                        {meta.native}
                      </span>
                      <span className="text-xs text-muted-foreground">{meta.name}</span>
                    </span>
                    {isActive && <Check size={18} className="text-primary shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
