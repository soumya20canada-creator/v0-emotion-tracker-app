export type ContextTagMood = "negative" | "neutral" | "positive"

export type ContextTag = {
  id: string
  label: string
  icon: string
  description: string
  mood: ContextTagMood
}

export const CONTEXT_TAGS: ContextTag[] = [
  // Neutral — can show for any emotion
  { id: "school", label: "School", icon: "GraduationCap", description: "Classes, homework, teachers", mood: "neutral" },
  { id: "work", label: "Work", icon: "Briefcase", description: "Job, coworkers, career", mood: "neutral" },
  { id: "family", label: "Family", icon: "Home", description: "Parents, siblings, relatives", mood: "neutral" },
  { id: "relationships", label: "Relationships", icon: "Heart", description: "Friends, partner, dating", mood: "neutral" },
  { id: "exams", label: "Exams", icon: "FileText", description: "Tests, assessments, performance", mood: "neutral" },
  { id: "money", label: "Money", icon: "Wallet", description: "Finances, spending, saving", mood: "neutral" },
  { id: "health", label: "Health", icon: "Activity", description: "Body, energy, wellbeing", mood: "neutral" },
  { id: "social-media", label: "Social media", icon: "Smartphone", description: "Online world, scrolling", mood: "neutral" },
  { id: "sleep", label: "Sleep", icon: "Moon", description: "Rest, tiredness, nights", mood: "neutral" },

  // Negative-coded — only surface for difficult emotions
  { id: "immigration", label: "Immigration stress", icon: "Globe", description: "Visa, status, belonging", mood: "negative" },
  { id: "homesick", label: "Homesick", icon: "MapPin", description: "Missing home, food, language", mood: "negative" },
  { id: "cultural-pressure", label: "Cultural pressure", icon: "Users", description: "Expectations, identity, fitting in", mood: "negative" },
  { id: "family-stigma", label: "Can't tell my family", icon: "Lock", description: "Hiding how bad it's gotten from people back home", mood: "negative" },
  { id: "loneliness", label: "Loneliness", icon: "CloudRain", description: "No one nearby, isolation", mood: "negative" },
  { id: "language", label: "Language barrier", icon: "MessageCircle", description: "Not understood, accent, fluency", mood: "negative" },

  // Positive-coded — only surface for joy / calm / surprise
  { id: "small-win", label: "A small win", icon: "Sparkles", description: "Something little went right", mood: "positive" },
  { id: "connection", label: "Time with someone", icon: "Users", description: "A good moment with a person", mood: "positive" },
  { id: "rest", label: "Real rest", icon: "Moon", description: "Slept well, took a break", mood: "positive" },
  { id: "nature", label: "Outside / nature", icon: "Leaf", description: "Fresh air, green space, sky", mood: "positive" },
  { id: "creative", label: "Made something", icon: "Palette", description: "Wrote, cooked, built, drew", mood: "positive" },
  { id: "movement", label: "Moved my body", icon: "Activity", description: "Walk, workout, stretch", mood: "positive" },
  { id: "gratitude", label: "Noticed something good", icon: "Heart", description: "A small thing I'm grateful for", mood: "positive" },
  { id: "milestone", label: "Something I worked for", icon: "Award", description: "A goal, a step forward", mood: "positive" },
]

// Positive emotion ids that should only see neutral + positive tags.
const POSITIVE_EMOTION_IDS = new Set(["joy", "calm", "surprise"])

export function contextTagsForEmotion(emotionId: string | null | undefined): ContextTag[] {
  if (!emotionId) return CONTEXT_TAGS.filter((t) => t.mood !== "positive")
  if (POSITIVE_EMOTION_IDS.has(emotionId)) {
    return CONTEXT_TAGS.filter((t) => t.mood === "neutral" || t.mood === "positive")
  }
  return CONTEXT_TAGS.filter((t) => t.mood === "neutral" || t.mood === "negative")
}
