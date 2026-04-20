export type CulturalDay = {
  name: string
  // month (1-12) and day — fixed or approximate. For lunar holidays we hard-code the Gregorian date for the next 2 years.
  date: string // "YYYY-MM-DD" or "MM-DD" for yearly-recurring
  countries: string[]
  note: string
}

// A small, curated list. Not exhaustive — the point is to name the obvious load-days for diaspora users.
// Lunar / hijri dates are hard-coded for 2026 + 2027 so we don't ship an astronomy library.
export const CULTURAL_DAYS: CulturalDay[] = [
  // India / South Asia
  { name: "Diwali",        date: "2026-11-08", countries: ["India", "Nepal", "Sri Lanka"], note: "A festival of light. Heavy for a lot of people far from home." },
  { name: "Diwali",        date: "2027-10-29", countries: ["India", "Nepal", "Sri Lanka"], note: "A festival of light. Heavy for a lot of people far from home." },
  { name: "Holi",          date: "2026-03-03", countries: ["India", "Nepal"], note: "A festival of color and spring." },
  { name: "Eid al-Fitr",   date: "2026-03-20", countries: ["Pakistan", "Bangladesh", "Indonesia", "Malaysia", "Egypt", "Saudi Arabia", "United Arab Emirates", "Morocco", "Nigeria", "Iran", "Turkey", "Lebanon"], note: "Marks the end of Ramadan. Family-heavy." },
  { name: "Eid al-Adha",   date: "2026-05-27", countries: ["Pakistan", "Bangladesh", "Indonesia", "Malaysia", "Egypt", "Saudi Arabia", "United Arab Emirates", "Morocco", "Nigeria", "Iran", "Turkey", "Lebanon"], note: "Festival of sacrifice. Can be isolating away from family." },
  // East Asia
  { name: "Lunar New Year", date: "2026-02-17", countries: ["China", "Taiwan", "Hong Kong", "Vietnam", "South Korea", "Singapore", "Malaysia"], note: "The big one — when everyone is supposed to be home." },
  { name: "Lunar New Year", date: "2027-02-06", countries: ["China", "Taiwan", "Hong Kong", "Vietnam", "South Korea", "Singapore", "Malaysia"], note: "The big one — when everyone is supposed to be home." },
  { name: "Chuseok",        date: "2026-09-25", countries: ["South Korea"], note: "Korean harvest — traditionally a time to be with family." },
  { name: "Mid-Autumn Festival", date: "2026-09-25", countries: ["China", "Taiwan", "Hong Kong", "Vietnam"], note: "Moon festival. Family-heavy." },
  // Latin America
  { name: "Día de los Muertos", date: "11-02", countries: ["Mexico"], note: "Day of the Dead. Ancestors, memory, and distance." },
  { name: "Posadas",            date: "12-16", countries: ["Mexico", "Colombia", "Guatemala"], note: "Nine nights of Christmas gatherings — hard to replicate abroad." },
  // Middle East / Persian
  { name: "Nowruz",         date: "03-21", countries: ["Iran", "Afghanistan", "Azerbaijan", "Tajikistan", "Turkey"], note: "Persian New Year. The table, the haft-sin, the missing people." },
  // African
  { name: "Kwanzaa",        date: "12-26", countries: ["United States"], note: "African-American cultural week — community-centered." },
  { name: "Eid Mawlid",     date: "2026-08-25", countries: ["Nigeria", "Egypt", "Morocco", "Pakistan", "Indonesia"], note: "The Prophet's birthday." },
]

// Returns the nearest upcoming cultural day within `windowDays` for the user's country, or null.
export function upcomingCulturalDay(country: string | null | undefined, windowDays: number = 5): { day: CulturalDay; daysUntil: number } | null {
  if (!country) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const nowYear = now.getFullYear()
  let best: { day: CulturalDay; daysUntil: number } | null = null

  for (const day of CULTURAL_DAYS) {
    if (!day.countries.includes(country)) continue
    const candidates: Date[] = []
    if (day.date.length === 10) {
      candidates.push(new Date(day.date + "T00:00:00"))
    } else {
      // MM-DD — recurring, generate current year and next year
      candidates.push(new Date(`${nowYear}-${day.date}T00:00:00`))
      candidates.push(new Date(`${nowYear + 1}-${day.date}T00:00:00`))
    }
    for (const d of candidates) {
      const ms = d.getTime() - now.getTime()
      const daysUntil = Math.floor(ms / 86400000)
      if (daysUntil >= 0 && daysUntil <= windowDays) {
        if (!best || daysUntil < best.daysUntil) best = { day, daysUntil }
      }
    }
  }
  return best
}
