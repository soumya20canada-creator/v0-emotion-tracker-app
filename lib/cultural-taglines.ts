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

export function taglineFor(country: string | null | undefined): Tagline {
  if (!country) return DEFAULT_TAGLINE
  return MAP[country] ?? DEFAULT_TAGLINE
}
