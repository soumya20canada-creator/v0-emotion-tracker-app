export type OnboardingSession = {
  id?: string
  user_id?: string
  current_situation: string[]
  whats_been_going_on: string[]
  body_feelings: string[]
  duration: string
  support_preferences: string[]
  created_at?: string
}

export const IDENTITY_OPTIONS = [
  { id: "immigrant", label: "An immigrant or newcomer" },
  { id: "first-gen", label: "A first-generation immigrant in my family" },
  { id: "cultural-identity", label: "Navigating cultural or religious identity" },
  { id: "lgbtq", label: "Part of the LGBTQ+ community" },
  { id: "mental-health-condition", label: "Living with a mental health condition" },
  { id: "prefer-not-to-say", label: "I'd rather not say" },
]

export const GENDER_OPTIONS = [
  { id: "man", label: "Man" },
  { id: "woman", label: "Woman" },
  { id: "non-binary", label: "Non-binary" },
  { id: "transgender", label: "Transgender" },
  { id: "gender-fluid", label: "Gender fluid" },
  { id: "different-term", label: "I use a different term" },
  { id: "prefer-not-to-say", label: "I'd rather not say" },
]

export const PRONOUN_OPTIONS = [
  { id: "she-her", label: "She / her" },
  { id: "he-him", label: "He / him" },
  { id: "they-them", label: "They / them" },
  { id: "custom", label: "I use different pronouns" },
]

export const SITUATION_OPTIONS = [
  { id: "employed", label: "I am employed or working" },
  { id: "student", label: "I am a student" },
  { id: "international-student", label: "I am an international student" },
  { id: "unemployed", label: "I am between jobs or unemployed" },
  { id: "caregiver", label: "I am a caregiver" },
  { id: "complicated", label: "It is complicated right now" },
  { id: "prefer-not-to-say", label: "I'd rather not say" },
]

export const GOING_ON_OPTIONS = [
  { id: "adjusting", label: "I am still adjusting to life in a new country" },
  { id: "lonely", label: "I have been feeling lonely or disconnected" },
  { id: "process", label: "Something happened and I need to process it" },
  { id: "off", label: "I have been feeling off and cannot explain why" },
  { id: "not-sure", label: "I am not sure — I just needed somewhere to go" },
]

export const BODY_FEELING_OPTIONS = [
  { id: "chest-tightness", label: "A tightness in my chest or throat" },
  { id: "heaviness", label: "A heaviness, like something is sitting on me" },
  { id: "restlessness", label: "Restlessness — I cannot seem to settle" },
  { id: "stomach-knot", label: "A knot in my stomach" },
  { id: "numbness", label: "A numbness or emptiness inside" },
  { id: "dizziness", label: "Dizziness" },
  { id: "in-thoughts", label: "It is more in my thoughts than my body" },
  { id: "nothing", label: "I do not notice anything right now" },
]

export const DURATION_OPTIONS = [
  { id: "just-today", label: "Just today" },
  { id: "few-days", label: "A few days" },
  { id: "few-weeks", label: "A few weeks" },
  { id: "months", label: "A few months or longer" },
  { id: "comes-and-goes", label: "It comes and goes" },
]

export const SUPPORT_OPTIONS = [
  { id: "figure-out-feelings", label: "Help me figure out what I am feeling" },
  { id: "do-something", label: "Give me something I can do right now to feel better" },
  { id: "community", label: "Connect me with people or communities near me" },
  { id: "therapist", label: "Help me find a therapist or counsellor" },
  { id: "express", label: "Just give me a space to express myself" },
  { id: "not-sure", label: "I am not sure yet" },
]

export type PathChoice = "wheel" | "quick-actions" | "support" | "look-around"

export function supportPrefToPath(prefs: string[]): PathChoice {
  if (prefs.includes("figure-out-feelings") || prefs.includes("express")) return "wheel"
  if (prefs.includes("do-something")) return "quick-actions"
  if (prefs.includes("community") || prefs.includes("therapist")) return "support"
  return "look-around"
}

export type InferredEmotion = "fear" | "sadness" | "surprise" | "calm" | "anger" | "joy"

export function bodyToEmotion(body: string[]): InferredEmotion {
  const b = new Set(body)
  if (b.has("chest-tightness") || b.has("restlessness") || b.has("dizziness") || b.has("stomach-knot")) return "fear"
  if (b.has("heaviness") || b.has("numbness")) return "sadness"
  if (b.has("in-thoughts")) return "surprise"
  return "calm"
}

export function durationToIntensity(duration: string): number {
  switch (duration) {
    case "just-today": return 2
    case "few-days": return 3
    case "few-weeks": return 3
    case "months": return 4
    case "comes-and-goes": return 3
    default: return 3
  }
}

export function bodyFeelingPhrase(body: string[]): string {
  const map: Record<string, string> = {
    "chest-tightness": "a tightness in your chest",
    "heaviness": "a heaviness",
    "restlessness": "a restlessness",
    "stomach-knot": "a knot in your stomach",
    "numbness": "a numbness",
    "dizziness": "dizziness",
    "in-thoughts": "a lot in your thoughts",
  }
  const first = body.find((b) => map[b])
  return first ? map[first] : ""
}

export function pathLabel(path: PathChoice): { label: string; reason: string } {
  switch (path) {
    case "wheel":
      return { label: "a space to name what you're feeling", reason: "so you can put words to it without pressure." }
    case "quick-actions":
      return { label: "a few small things you can try right now", reason: "picked from what you just told me." }
    case "support":
      return { label: "people who can actually help", reason: "real humans, free, near you." }
    case "look-around":
      return { label: "a gentle tour of your space", reason: "no pressure — just look around." }
  }
}

export function situationToContextTags(session: OnboardingSession | null): string[] {
  if (!session) return []
  const suggested = new Set<string>()
  const going = new Set(session.whats_been_going_on)
  const sit = new Set(session.current_situation)
  if (going.has("adjusting")) {
    suggested.add("immigration")
    suggested.add("homesick")
    suggested.add("cultural-pressure")
    suggested.add("language")
  }
  if (going.has("lonely")) suggested.add("loneliness")
  if (sit.has("student") || sit.has("international-student")) {
    suggested.add("school")
    suggested.add("exams")
  }
  if (sit.has("employed")) suggested.add("work")
  if (sit.has("unemployed")) suggested.add("money")
  if (sit.has("caregiver")) suggested.add("family")
  return Array.from(suggested)
}

export function reflectOnboarding(session: OnboardingSession | null, country?: string | null): string {
  if (!session) return ""
  const parts: string[] = []
  const going = session.whats_been_going_on
  if (going.includes("adjusting")) parts.push("adjusting to life in a new place")
  if (going.includes("lonely")) parts.push("feeling lonely")
  if (going.includes("process")) parts.push("processing something")
  if (going.includes("off")) parts.push("feeling off")
  const body = session.body_feelings.find((b) => b !== "nothing")
  const bodyPhrase: Record<string, string> = {
    "chest-tightness": "a tightness in your chest",
    "heaviness": "a heaviness",
    "restlessness": "a restlessness",
    "stomach-knot": "a knot in your stomach",
    "numbness": "a numbness",
    "dizziness": "dizziness",
    "in-thoughts": "a lot in your thoughts",
  }
  const durationPhrase: Record<string, string> = {
    "just-today": "today",
    "few-days": "for a few days",
    "few-weeks": "for a few weeks",
    "months": "for a few months",
    "comes-and-goes": "on and off",
  }
  const bits: string[] = []
  if (country) bits.push(`You're in ${country}`)
  if (parts.length) bits.push(parts.join(" and "))
  if (body && bodyPhrase[body]) {
    const dur = session.duration && durationPhrase[session.duration] ? ` ${durationPhrase[session.duration]}` : ""
    bits.push(`carrying ${bodyPhrase[body]}${dur}`)
  }
  return bits.join(", ")
}

export function countryToRegionId(country: string | null | undefined): string {
  if (!country) return "global"
  const map: Record<string, string> = {
    "United States": "us",
    "United Kingdom": "uk",
    "Canada": "ca",
    "Australia": "au",
    "India": "in",
    "Germany": "de",
    "Philippines": "ph",
    "Mexico": "mx",
    "Nigeria": "ng",
  }
  return map[country] ?? "global"
}

export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belgium", "Bolivia",
  "Bosnia and Herzegovina", "Brazil", "Bulgaria", "Cambodia", "Canada",
  "Chile", "China", "Colombia", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Ecuador", "Egypt", "Estonia", "Ethiopia", "Finland", "France",
  "Georgia", "Germany", "Ghana", "Greece", "Guatemala", "Honduras", "Hong Kong",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "South Korea", "Kuwait", "Kyrgyzstan", "Latvia", "Lebanon", "Libya",
  "Lithuania", "Luxembourg", "Malaysia", "Mexico", "Morocco", "Nepal",
  "Netherlands", "New Zealand", "Nigeria", "Norway", "Oman", "Pakistan",
  "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Saudi Arabia", "Senegal", "Serbia", "Singapore",
  "Slovakia", "Slovenia", "South Africa", "Spain", "Sri Lanka", "Sudan",
  "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
].sort()
