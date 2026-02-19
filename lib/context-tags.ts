export type ContextTag = {
  id: string
  label: string
  icon: string
  description: string
}

export const CONTEXT_TAGS: ContextTag[] = [
  { id: "school", label: "School", icon: "GraduationCap", description: "Classes, homework, teachers" },
  { id: "work", label: "Work", icon: "Briefcase", description: "Job, boss, coworkers" },
  { id: "family", label: "Family", icon: "Home", description: "Parents, siblings, relatives" },
  { id: "relationships", label: "Relationships", icon: "Heart", description: "Friends, partner, dating" },
  { id: "immigration", label: "Immigration stress", icon: "Globe", description: "Visa, status, belonging" },
  { id: "homesick", label: "Homesick", icon: "MapPin", description: "Missing home, food, language" },
  { id: "cultural-pressure", label: "Cultural pressure", icon: "Users", description: "Expectations, identity, fitting in" },
  { id: "exams", label: "Exams", icon: "FileText", description: "Tests, grades, performance" },
  { id: "sleep", label: "Sleep", icon: "Moon", description: "Insomnia, nightmares, exhaustion" },
  { id: "social-media", label: "Social media", icon: "Smartphone", description: "Comparison, FOMO, cyberbullying" },
  { id: "money", label: "Money", icon: "Wallet", description: "Bills, expenses, financial stress" },
  { id: "health", label: "Health", icon: "Activity", description: "Body image, illness, pain" },
  { id: "loneliness", label: "Loneliness", icon: "CloudRain", description: "No friends nearby, isolation" },
  { id: "language", label: "Language barrier", icon: "MessageCircle", description: "Not understood, accent, fluency" },
]
