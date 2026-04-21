export type Tagline = { script: string; gloss: string }

const DEFAULT_TAGLINE: Tagline = { script: "भाव", gloss: "the felt sense of being" }

const MAP: Record<string, Tagline> = {
  India:       { script: "भाव",      gloss: "the felt sense of being" },
  Pakistan:    { script: "احساس",    gloss: "Urdu: a felt sense" },
  Bangladesh:  { script: "অনুভূতি",  gloss: "Bangla: what you feel" },
  "Sri Lanka": { script: "හැඟීම",    gloss: "Sinhala: a feeling" },
  Nepal:       { script: "भाव",      gloss: "the felt sense of being" },
  China:       { script: "感受",      gloss: "to feel, to sense" },
  Taiwan:      { script: "感受",      gloss: "to feel, to sense" },
  "Hong Kong": { script: "感受",      gloss: "to feel, to sense" },
  Japan:       { script: "気持ち",    gloss: "kimochi — feeling, heart" },
  "South Korea": { script: "마음",   gloss: "maeum — heart, mind, feeling" },
  Vietnam:     { script: "cảm xúc",   gloss: "emotion, what you feel" },
  Thailand:    { script: "ความรู้สึก", gloss: "a feeling, a sense" },
  Philippines: { script: "damdamin",  gloss: "Tagalog: what the heart feels" },
  Indonesia:   { script: "perasaan",  gloss: "a feeling, inside" },
  Malaysia:    { script: "perasaan",  gloss: "a feeling, inside" },
  Mexico:      { script: "sentir",    gloss: "to feel, in the body" },
  Colombia:    { script: "sentir",    gloss: "to feel, in the body" },
  Argentina:   { script: "sentir",    gloss: "to feel, in the body" },
  Brazil:      { script: "sentir",    gloss: "Portuguese: to feel" },
  Spain:       { script: "sentir",    gloss: "to feel, in the body" },
  France:      { script: "ressenti",  gloss: "a felt sense" },
  Germany:     { script: "Gefühl",    gloss: "a feeling, a sense" },
  Italy:       { script: "sentire",   gloss: "to feel, to sense" },
  Poland:      { script: "uczucie",   gloss: "a feeling" },
  Russia:      { script: "чувство",   gloss: "chuvstvo — a feeling" },
  Ukraine:     { script: "почуття",   gloss: "pochuttia — a feeling" },
  Turkey:      { script: "duygu",     gloss: "a feeling, a sense" },
  Iran:        { script: "احساس",     gloss: "Persian: a felt sense" },
  "Saudi Arabia": { script: "شعور", gloss: "Arabic: a feeling" },
  Egypt:       { script: "شعور",      gloss: "Arabic: a feeling" },
  Morocco:     { script: "شعور",      gloss: "Arabic: a feeling" },
  Lebanon:     { script: "شعور",      gloss: "Arabic: a feeling" },
  "United Arab Emirates": { script: "شعور", gloss: "Arabic: a feeling" },
  Nigeria:     { script: "ìmọ̀lára",  gloss: "Yoruba: a felt knowing" },
  Ghana:       { script: "atenka",    gloss: "Twi: what you feel" },
  Kenya:       { script: "hisia",     gloss: "Swahili: a feeling" },
  Tanzania:    { script: "hisia",     gloss: "Swahili: a feeling" },
  Ethiopia:    { script: "ስሜት",       gloss: "Amharic: a feeling" },
  "South Africa": { script: "imvakalelo", gloss: "Zulu: how you feel" },
}

export function taglineFor(country: string | null | undefined, regionLabel?: string | null): Tagline {
  // Prefer the cultural origin (country) when it maps; otherwise fall back to the
  // user's picked region label (e.g. "Nigeria" → ìmọ̀lára) so the script follows
  // wherever the user identifies. Default only if neither resolves.
  if (country && MAP[country]) return MAP[country]
  if (regionLabel && MAP[regionLabel]) return MAP[regionLabel]
  return DEFAULT_TAGLINE
}

// Default IANA timezone + capital label per country — for "what time is it at home" moments.
const HOME_TIMEZONES: Record<string, { tz: string; city: string }> = {
  India:       { tz: "Asia/Kolkata",       city: "India" },
  Pakistan:    { tz: "Asia/Karachi",       city: "Pakistan" },
  Bangladesh:  { tz: "Asia/Dhaka",         city: "Bangladesh" },
  "Sri Lanka": { tz: "Asia/Colombo",       city: "Sri Lanka" },
  Nepal:       { tz: "Asia/Kathmandu",     city: "Nepal" },
  China:       { tz: "Asia/Shanghai",      city: "China" },
  Taiwan:      { tz: "Asia/Taipei",        city: "Taiwan" },
  "Hong Kong": { tz: "Asia/Hong_Kong",     city: "Hong Kong" },
  Japan:       { tz: "Asia/Tokyo",         city: "Japan" },
  "South Korea": { tz: "Asia/Seoul",       city: "Korea" },
  Vietnam:     { tz: "Asia/Ho_Chi_Minh",   city: "Vietnam" },
  Thailand:    { tz: "Asia/Bangkok",       city: "Thailand" },
  Philippines: { tz: "Asia/Manila",        city: "the Philippines" },
  Indonesia:   { tz: "Asia/Jakarta",       city: "Indonesia" },
  Malaysia:    { tz: "Asia/Kuala_Lumpur",  city: "Malaysia" },
  Mexico:      { tz: "America/Mexico_City", city: "Mexico" },
  Colombia:    { tz: "America/Bogota",     city: "Colombia" },
  Argentina:   { tz: "America/Argentina/Buenos_Aires", city: "Argentina" },
  Brazil:      { tz: "America/Sao_Paulo",  city: "Brazil" },
  Spain:       { tz: "Europe/Madrid",      city: "Spain" },
  France:      { tz: "Europe/Paris",       city: "France" },
  Germany:     { tz: "Europe/Berlin",      city: "Germany" },
  Italy:       { tz: "Europe/Rome",        city: "Italy" },
  Poland:      { tz: "Europe/Warsaw",      city: "Poland" },
  Russia:      { tz: "Europe/Moscow",      city: "Russia" },
  Ukraine:     { tz: "Europe/Kyiv",        city: "Ukraine" },
  Turkey:      { tz: "Europe/Istanbul",    city: "Turkey" },
  Iran:        { tz: "Asia/Tehran",        city: "Iran" },
  "Saudi Arabia": { tz: "Asia/Riyadh",     city: "Saudi Arabia" },
  Egypt:       { tz: "Africa/Cairo",       city: "Egypt" },
  Morocco:     { tz: "Africa/Casablanca",  city: "Morocco" },
  Lebanon:     { tz: "Asia/Beirut",        city: "Lebanon" },
  "United Arab Emirates": { tz: "Asia/Dubai", city: "the UAE" },
  Nigeria:     { tz: "Africa/Lagos",       city: "Nigeria" },
  Ghana:       { tz: "Africa/Accra",       city: "Ghana" },
  Kenya:       { tz: "Africa/Nairobi",     city: "Kenya" },
  Tanzania:    { tz: "Africa/Dar_es_Salaam", city: "Tanzania" },
  Ethiopia:    { tz: "Africa/Addis_Ababa", city: "Ethiopia" },
  "South Africa": { tz: "Africa/Johannesburg", city: "South Africa" },
}

export function homeTimeLineFor(country: string | null | undefined): string | null {
  if (!country) return null
  const entry = HOME_TIMEZONES[country]
  if (!entry) return null
  try {
    const time = new Intl.DateTimeFormat("en-US", { timeZone: entry.tz, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date())
    return `It's ${time} in ${entry.city} right now.`
  } catch {
    return null
  }
}
