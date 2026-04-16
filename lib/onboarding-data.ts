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
