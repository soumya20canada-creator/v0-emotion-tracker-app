export type Suggestion = {
  icon: string
  title: string
  description: string
  link?: string
}

type Rule = {
  keywords: string[]
  suggestions: Suggestion[]
}

const RULES: Rule[] = [
  {
    keywords: ["suicide", "end my life", "don't want to be here", "kill myself", "self harm", "hurt myself"],
    suggestions: [
      { icon: "🆘", title: "Crisis Line (Canada)", description: "Talk to someone right now: 1-833-456-4566 (24/7)", link: "tel:18334564566" },
      { icon: "💬", title: "Crisis Text Line", description: "Text HOME to 741741 — free, confidential, 24/7" },
      { icon: "🌐", title: "Crisis Services Canada", description: "crisisservicescanada.ca", link: "https://www.crisisservicescanada.ca" },
    ],
  },
  {
    keywords: ["lonely", "alone", "no one", "isolated", "no friends", "nobody cares"],
    suggestions: [
      { icon: "🤝", title: "Reach out to one person", description: "Even a short text — 'thinking of you' — can shift how alone you feel." },
      { icon: "🌍", title: "7 Cups", description: "Free online chat with trained listeners, 24/7", link: "https://www.7cups.com" },
      { icon: "📖", title: "Try journaling", description: "Writing to yourself can be a form of connection too." },
    ],
  },
  {
    keywords: ["anxious", "anxiety", "panic", "worried", "scared", "fear", "nervous", "overwhelmed", "can't breathe"],
    suggestions: [
      { icon: "🌬️", title: "Try box breathing", description: "In 4 counts, hold 4, out 4, hold 4 — repeat 4 times. It works fast." },
      { icon: "👁️", title: "5-4-3-2-1 grounding", description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste." },
      { icon: "📱", title: "Calm app", description: "Guided breathing and meditation", link: "https://www.calm.com" },
    ],
  },
  {
    keywords: ["angry", "furious", "rage", "mad", "frustrated", "hate", "unfair"],
    suggestions: [
      { icon: "🏃", title: "Move your body", description: "A brisk 5-minute walk or 20 jumping jacks can release anger physically." },
      { icon: "✍️", title: "Write the unsent letter", description: "Say everything you need to say — then don't send it. It still helps." },
      { icon: "🧊", title: "Cold water technique", description: "Splash cold water on your wrists or face — it resets your nervous system fast." },
    ],
  },
  {
    keywords: ["sad", "depressed", "crying", "grief", "loss", "heartbreak", "hopeless", "empty", "numb", "tired of"],
    suggestions: [
      { icon: "☀️", title: "One tiny thing", description: "You don't have to fix everything. Just one tiny gentle thing — step outside, make tea, wrap in a blanket." },
      { icon: "🎵", title: "Music therapy", description: "Put on the song that matches how you feel — not to fix it, but to be with it." },
      { icon: "💙", title: "BetterHelp", description: "Online therapy, when you're ready", link: "https://www.betterhelp.com" },
    ],
  },
  {
    keywords: ["work", "job", "boss", "deadline", "burnout", "exhausted", "no energy", "tired", "drained"],
    suggestions: [
      { icon: "⏸️", title: "Pause intentionally", description: "Even 5 minutes away from a screen can reset your nervous system." },
      { icon: "📋", title: "Name what's in your control", description: "Write two columns: what you can control, what you can't. Focus only on the first." },
      { icon: "🛁", title: "Tonight's recovery", description: "Plan one thing that's just for you tonight. Protect that time." },
    ],
  },
  {
    keywords: ["relationship", "breakup", "partner", "divorce", "family", "conflict", "fight", "argument"],
    suggestions: [
      { icon: "💬", title: "Name your need", description: "What do you actually need right now — to be heard? to feel safe? to feel less alone? Start there." },
      { icon: "🧘", title: "Give yourself space", description: "You don't have to resolve it tonight. Breathe first." },
      { icon: "📞", title: "Talk to someone", description: "A trusted friend, family member, or therapist. You don't have to carry this alone." },
    ],
  },
]

export function getSuggestions(text: string): Suggestion[] {
  if (!text || text.length < 15) return []
  const lower = text.toLowerCase()

  // Crisis keywords always take priority
  const crisisRule = RULES[0]
  if (crisisRule.keywords.some(k => lower.includes(k))) {
    return crisisRule.suggestions
  }

  // Collect suggestions from all matching rules
  const matched: Suggestion[] = []
  for (const rule of RULES.slice(1)) {
    if (rule.keywords.some(k => lower.includes(k))) {
      matched.push(...rule.suggestions)
    }
  }

  // Return up to 3 suggestions
  return matched.slice(0, 3)
}
