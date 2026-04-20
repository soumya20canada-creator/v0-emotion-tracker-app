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
  if (sit.has("international-student")) {
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

export type ToolSuggestionId = "breathe" | "journal" | "grounding-note" | "meditate" | "reach-out"

export type ToolSuggestion = {
  id: ToolSuggestionId
  title: string
  reason: string
}

const TOOL_TITLES: Record<ToolSuggestionId, string> = {
  "breathe": "Breathe",
  "journal": "Write it down",
  "grounding-note": "A small note for today",
  "meditate": "Sit quietly",
  "reach-out": "Reach out to someone",
}

// Build up to 3 tool suggestions from onboarding answers. Ordered by confidence.
export function suggestTools(session: OnboardingSession | null): ToolSuggestion[] {
  const picks: { id: ToolSuggestionId; reason: string; priority: number }[] = []
  const add = (id: ToolSuggestionId, reason: string, priority: number) => {
    picks.push({ id, reason, priority })
  }

  if (!session) {
    add("breathe", "A soft place to start.", 1)
    add("grounding-note", "One short note for today.", 2)
    return finalize(picks)
  }

  const body = new Set(session.body_feelings)
  const going = new Set(session.whats_been_going_on)
  const support = new Set(session.support_preferences)
  const duration = session.duration

  // Body-driven suggestions (highest priority — most embodied)
  if (body.has("chest-tightness")) {
    add("breathe", "because you mentioned a tight chest — breathing can help your body settle.", 10)
  }
  if (body.has("restlessness")) {
    add("breathe", "because restlessness often eases when you slow your breath.", 9)
  }
  if (body.has("stomach-knot")) {
    add("breathe", "a slow breath can loosen what your stomach is holding.", 9)
  }
  if (body.has("dizziness")) {
    add("breathe", "steady breathing can help the ground come back.", 8)
  }
  if (body.has("heaviness")) {
    add("journal", "because heaviness often wants words more than action.", 8)
    add("grounding-note", "a short note to hold onto.", 5)
  }
  if (body.has("numbness")) {
    add("journal", "writing gently can help you feel your way back.", 7)
    add("grounding-note", "something quiet to read when the inside is quiet.", 5)
  }
  if (body.has("in-thoughts")) {
    add("meditate", "a quiet timer, so your thoughts can settle on their own.", 6)
  }

  // Situation-driven
  if (going.has("adjusting")) {
    add("grounding-note", "for when you miss home.", 7)
  }
  if (going.has("lonely")) {
    add("reach-out", "loneliness eases a little when someone hears it.", 7)
    add("grounding-note", "a small reminder you're not the only one.", 5)
  }
  if (going.has("process")) {
    add("journal", "for putting what happened somewhere outside your head.", 8)
  }
  if (going.has("off")) {
    add("grounding-note", "when it's hard to name, a few words from someone else can help.", 4)
  }

  // Duration-driven
  if (duration === "months" || duration === "comes-and-goes") {
    add("journal", "writing it down over time helps you see the shape of it.", 6)
  }

  // Support-preference-driven
  if (support.has("therapist") || support.has("community")) {
    add("reach-out", "here's who's near you, if you'd like to reach out.", 9)
  }
  if (support.has("do-something")) {
    add("breathe", "something small you can do right now.", 6)
  }
  if (support.has("express")) {
    add("journal", "a private page, just for you.", 7)
  }

  // Fallback
  if (picks.length === 0) {
    add("breathe", "a soft place to start.", 1)
    add("grounding-note", "one short note for today.", 1)
  }

  // If the user said "just today," keep it light — one tool.
  if (duration === "just-today") {
    const top = finalize(picks).slice(0, 1)
    return top
  }

  return finalize(picks)
}

function finalize(
  picks: { id: ToolSuggestionId; reason: string; priority: number }[]
): ToolSuggestion[] {
  // Keep highest-priority reason per tool id.
  const byId = new Map<ToolSuggestionId, { reason: string; priority: number }>()
  for (const p of picks) {
    const existing = byId.get(p.id)
    if (!existing || p.priority > existing.priority) {
      byId.set(p.id, { reason: p.reason, priority: p.priority })
    }
  }
  return Array.from(byId.entries())
    .sort((a, b) => b[1].priority - a[1].priority)
    .slice(0, 3)
    .map(([id, v]) => ({ id, title: TOOL_TITLES[id], reason: v.reason }))
}

// Warm, plain-language reflection. Ends with a softly named interpretation.
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function joinList(items: string[]): string {
  if (items.length === 0) return ""
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1]
}

export function humanReflection(session: OnboardingSession | null, country?: string | null): string {
  if (!session) {
    return pick([
      "Thank you for showing up.",
      "I'm glad you're here.",
      "Whatever brought you here today — welcome.",
    ])
  }

  const going = new Set(session.whats_been_going_on)
  const body = new Set(session.body_feelings)
  const situation = new Set(session.current_situation)
  const duration = session.duration

  // Varied body phrasings — each slot has 2–3 ways to say it
  const bodyPhrases: Record<string, string[]> = {
    "chest-tightness": ["a tightness in your chest", "your chest feeling tight", "that tight feeling in your chest"],
    "heaviness": ["a heaviness", "something heavy sitting on you", "this weight that won't quite lift"],
    "restlessness": ["a restlessness", "this buzzing you can't put down", "a hum that won't settle"],
    "stomach-knot": ["a knot in your stomach", "that pit in your stomach", "your gut clenched up"],
    "numbness": ["a numbness", "a kind of blank feeling", "that cut-off feeling"],
    "dizziness": ["dizziness", "the world feeling a bit tilted", "that spinny, untethered feeling"],
    "in-thoughts": ["a lot moving in your thoughts", "a head that won't go quiet", "your mind running laps"],
  }
  const durationPhrases: Record<string, string[]> = {
    "just-today": ["today", "just today", "for today at least"],
    "few-days": ["for a few days", "the last few days", "for the past few days"],
    "few-weeks": ["for a few weeks now", "the last couple of weeks", "over the last few weeks"],
    "months": ["for months", "for a long time now", "for months at this point"],
    "comes-and-goes": ["on and off", "in waves", "coming and going"],
  }

  const firstBody = session.body_feelings.find((b) => bodyPhrases[b])
  const bodyText = firstBody ? pick(bodyPhrases[firstBody]) : null
  const durText = duration && durationPhrases[duration] ? pick(durationPhrases[duration]) : ""

  // Situation-tinted openers
  const situationOpeners: string[] = []
  if (situation.has("international-student")) {
    situationOpeners.push("far from home and studying")
    situationOpeners.push("building a life somewhere new while in school")
  }
  if (situation.has("employed")) situationOpeners.push("carrying a job on top of everything else")
  if (situation.has("between-jobs")) situationOpeners.push("in between jobs right now")
  if (situation.has("caregiver")) situationOpeners.push("taking care of someone else")
  if (situation.has("complicated")) situationOpeners.push("in a complicated season")

  // "What you told me" — varied lead-ins, varied clause phrasings
  const told: string[] = []
  if (going.has("adjusting")) {
    told.push(pick([
      "you're still adjusting to a new place",
      "you're trying to settle somewhere new",
      "you're finding your footing somewhere unfamiliar",
    ]))
  }
  if (going.has("lonely")) {
    told.push(pick([
      "you've been feeling lonely",
      "the loneliness has been real",
      "you've been missing people",
    ]))
  }
  if (going.has("process")) {
    told.push(pick([
      "something happened you're still trying to process",
      "there's something you're working through",
      "you're trying to make sense of something",
    ]))
  }
  if (going.has("off")) {
    told.push(pick([
      "things have felt off in a way that's hard to name",
      "something's felt a little off, even if you can't quite say what",
      "there's a feeling you can't quite put a word to",
    ]))
  }

  // Opener templates
  const openerLeads = [
    "You told me",
    "From what you shared,",
    "What I'm hearing is",
    "It sounds like",
    "Reading what you wrote,",
  ]

  const sentences: string[] = []

  if (told.length > 0 || bodyText || situationOpeners.length > 0) {
    const parts: string[] = []
    if (situationOpeners.length > 0 && Math.random() < 0.5) {
      parts.push(pick(situationOpeners))
    }
    if (told.length > 0) parts.push(joinList(told))
    if (bodyText) {
      const bodyClause = durText
        ? pick([`carrying ${bodyText} ${durText}`, `holding ${bodyText} ${durText}`, `${bodyText}, ${durText}`])
        : pick([`carrying ${bodyText}`, `holding ${bodyText}`, `with ${bodyText}`])
      parts.push(bodyClause)
    }
    const lead = pick(openerLeads)
    sentences.push(`${lead} ${joinList(parts)}.`)
  } else {
    sentences.push(pick([
      "You showed up, and that already counts for something.",
      "Even without words, you're here. That matters.",
      "Sometimes just opening the app is the work.",
    ]))
  }

  // Soft named interpretation — varied framings
  const interpretations: string[] = []
  if (going.has("adjusting")) {
    interpretations.push(pick(["homesickness", "the ache of being far from home", "that homesick feeling"]))
  }
  if (going.has("lonely")) {
    interpretations.push(pick(["loneliness", "a real loneliness", "the quiet kind of lonely"]))
  }
  if (going.has("process")) {
    interpretations.push(pick(["something still unresolved", "grief that hasn't had space yet", "an unfinished feeling"]))
  }
  if (body.has("chest-tightness") || body.has("restlessness") || body.has("dizziness") || body.has("stomach-knot")) {
    interpretations.push(pick([
      "fear your body is holding",
      "anxiety that's landed in your body",
      "a nervous system that hasn't been able to rest",
    ]))
  }
  if (body.has("heaviness") || body.has("numbness")) {
    interpretations.push(pick([
      "a kind of quiet grief",
      "something sad sitting underneath",
      "the kind of tired that isn't about sleep",
    ]))
  }

  if (interpretations.length > 0) {
    const interpLead = pick([
      "That sounds like",
      "From the outside, that reads as",
      "If I had to name it, I'd call it",
      "That has the shape of",
    ])
    sentences.push(`${interpLead} ${joinList(interpretations)}.`)
  }

  // Closing warmth — varied, responsive to context
  const closers: string[] = []
  if (interpretations.length >= 2 || told.length >= 2) {
    closers.push(
      "That's a lot to be holding.",
      "That's more than one thing, and it's a lot.",
      "No wonder you're tired.",
      "That's a heavy mix. You're not imagining it.",
    )
  } else if (duration === "months" || duration === "comes-and-goes") {
    closers.push(
      "Carrying this for that long takes a toll.",
      "That's a long time to sit with something like this.",
      "You've been strong about this for a while now.",
    )
  } else if (situation.has("international-student") || going.has("adjusting")) {
    closers.push(
      "Being far from what's familiar is its own kind of work.",
      "Rebuilding in a new place is quietly exhausting.",
      "That's a lot, especially when home isn't nearby.",
    )
  } else {
    closers.push(
      "Thank you for telling me.",
      "That's real, and I hear you.",
      "Whatever this is, you don't have to carry it alone right now.",
      "You're allowed to feel this.",
    )
  }
  sentences.push(pick(closers))

  return sentences.join(" ")
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
