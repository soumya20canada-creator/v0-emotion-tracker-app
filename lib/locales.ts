export const SUPPORTED_LOCALES = ["en", "fr", "hi", "pa", "ur", "ar", "tl", "zh", "es"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "en"

export const LOCALE_META: Record<Locale, { name: string; native: string; rtl?: boolean }> = {
  en: { name: "English", native: "English" },
  fr: { name: "French", native: "Français" },
  hi: { name: "Hindi", native: "हिन्दी" },
  pa: { name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  ur: { name: "Urdu", native: "اردو", rtl: true },
  ar: { name: "Arabic", native: "العربية", rtl: true },
  tl: { name: "Tagalog", native: "Tagalog" },
  zh: { name: "Mandarin", native: "中文" },
  es: { name: "Spanish", native: "Español" },
}

export function isRTL(locale: Locale): boolean {
  return LOCALE_META[locale].rtl === true
}

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE
  const nav = navigator.language?.toLowerCase() ?? ""
  const short = nav.split("-")[0] as Locale
  return isSupportedLocale(short) ? short : DEFAULT_LOCALE
}
