// Research-backed emotion categorization based on Plutchik's Wheel of Emotions
// and adapted for teen/young adult/immigrant audiences with culturally-aware actions

export type EmotionCategory = {
  id: string
  label: string
  color: string
  icon: string
  subEmotions: string[]
}

export type MicroAction = {
  id: string
  text: string
  category: "body" | "social" | "creative" | "mindful" | "fun"
  timeMinutes: number
  points: number
  culturalNote?: string
  researchBasis?: string
}

export type Badge = {
  id: string
  name: string
  description: string
  icon: string
  requirement: string
  unlocked: boolean
}

export const EMOTION_CATEGORIES: EmotionCategory[] = [
  {
    id: "joy",
    label: "Happy",
    color: "#FFD166",
    icon: "Sun",
    subEmotions: ["excited", "grateful", "proud", "peaceful", "hopeful", "loved"],
  },
  {
    id: "sadness",
    label: "Sad",
    color: "#118AB2",
    icon: "CloudRain",
    subEmotions: ["lonely", "disappointed", "grief", "empty", "homesick", "lost"],
  },
  {
    id: "anger",
    label: "Angry",
    color: "#EF476F",
    icon: "Flame",
    subEmotions: ["frustrated", "annoyed", "resentful", "overwhelmed", "misunderstood", "disrespected"],
  },
  {
    id: "fear",
    label: "Anxious",
    color: "#06D6A0",
    icon: "Wind",
    subEmotions: ["worried", "nervous", "panicked", "insecure", "uncertain", "pressured"],
  },
  {
    id: "surprise",
    label: "Confused",
    color: "#FF6B35",
    icon: "Zap",
    subEmotions: ["shocked", "overwhelmed", "disoriented", "culture-shocked", "out-of-place", "unsure"],
  },
  {
    id: "calm",
    label: "Calm",
    color: "#A78BFA",
    icon: "Leaf",
    subEmotions: ["content", "relaxed", "balanced", "grounded", "safe", "present"],
  },
]

// Research-backed micro-actions categorized by emotion and intensity
// Sources: CBT (Cognitive Behavioral Therapy), DBT (Dialectical Behavior Therapy),
// ACT (Acceptance and Commitment Therapy), and culturally-responsive care practices
export const MICRO_ACTIONS: Record<string, { low: MicroAction[]; medium: MicroAction[]; high: MicroAction[] }> = {
  joy: {
    low: [
      { id: "j1", text: "Write down 3 things you're grateful for right now", category: "mindful", timeMinutes: 2, points: 10, researchBasis: "Gratitude journaling (Emmons & McCullough, 2003)" },
      { id: "j2", text: "Send a thank-you message to someone who helped you", category: "social", timeMinutes: 3, points: 15, culturalNote: "In many cultures, expressing gratitude strengthens community bonds" },
      { id: "j3", text: "Do a little victory dance for 30 seconds", category: "body", timeMinutes: 1, points: 5 },
      { id: "j4", text: "Draw or doodle what happiness looks like to you", category: "creative", timeMinutes: 5, points: 15 },
    ],
    medium: [
      { id: "j5", text: "Call or voice-note a friend and share your good news", category: "social", timeMinutes: 5, points: 20, researchBasis: "Capitalization theory - sharing positive events amplifies joy (Gable et al., 2004)" },
      { id: "j6", text: "Make a playlist of songs that match this feeling", category: "creative", timeMinutes: 10, points: 25 },
      { id: "j7", text: "Cook or eat a food that reminds you of a happy memory", category: "fun", timeMinutes: 15, points: 30, culturalNote: "Food connects us to heritage and happy memories across all cultures" },
      { id: "j8", text: "Take a photo walk - capture 5 things that bring you joy", category: "creative", timeMinutes: 10, points: 25 },
    ],
    high: [
      { id: "j9", text: "Plan something fun for this week to keep the momentum", category: "fun", timeMinutes: 10, points: 30, researchBasis: "Behavioral activation - planning positive activities sustains wellbeing (Lejuez et al., 2001)" },
      { id: "j10", text: "Write a letter to your future self about this moment", category: "creative", timeMinutes: 10, points: 35 },
      { id: "j11", text: "Teach someone something you're good at", category: "social", timeMinutes: 15, points: 40, culturalNote: "Knowledge sharing is valued across cultures as a way to build community" },
      { id: "j12", text: "Start a mini passion project inspired by this energy", category: "creative", timeMinutes: 15, points: 35 },
    ],
  },
  sadness: {
    low: [
      { id: "s1", text: "Put on a cozy blanket and listen to your comfort song", category: "mindful", timeMinutes: 5, points: 10, researchBasis: "Music therapy reduces cortisol and promotes emotional regulation (Thoma et al., 2013)" },
      { id: "s2", text: "Text someone you trust: 'Hey, thinking of you'", category: "social", timeMinutes: 2, points: 15 },
      { id: "s3", text: "Step outside for fresh air, even just for 2 minutes", category: "body", timeMinutes: 2, points: 10, researchBasis: "Nature exposure reduces rumination (Bratman et al., 2015)" },
      { id: "s4", text: "Watch a short funny video that always makes you smile", category: "fun", timeMinutes: 3, points: 5 },
    ],
    medium: [
      { id: "s5", text: "Write down what you're feeling without judging it", category: "mindful", timeMinutes: 5, points: 20, researchBasis: "Expressive writing reduces emotional distress (Pennebaker, 1997)" },
      { id: "s6", text: "Go for a 10-minute walk and notice 5 colors around you", category: "body", timeMinutes: 10, points: 25, researchBasis: "Grounding techniques from DBT - using senses to anchor to present" },
      { id: "s7", text: "Cook a comfort food from your childhood or culture", category: "creative", timeMinutes: 20, points: 30, culturalNote: "Comfort food varies by culture - any food that feels like home counts" },
      { id: "s8", text: "Call someone who gets you - family, friend, or mentor", category: "social", timeMinutes: 10, points: 25 },
    ],
    high: [
      { id: "s9", text: "Hold an ice cube in your hand for 60 seconds, focus on the cold", category: "body", timeMinutes: 2, points: 20, researchBasis: "DBT TIPP skill - Temperature change activates dive reflex, calming the nervous system" },
      { id: "s10", text: "Do 20 jumping jacks right now to shift your body state", category: "body", timeMinutes: 2, points: 20, researchBasis: "Exercise releases endorphins and interrupts depressive rumination (Rethorst & Trivedi, 2013)" },
      { id: "s11", text: "Name 5 things you can see, 4 you can touch, 3 you can hear", category: "mindful", timeMinutes: 3, points: 15, researchBasis: "5-4-3-2-1 grounding technique from anxiety management research" },
      { id: "s12", text: "Draw or scribble your feelings - no rules, just let it out", category: "creative", timeMinutes: 5, points: 25 },
      { id: "s13", text: "Splash cold water on your face 3 times", category: "body", timeMinutes: 1, points: 15, researchBasis: "Mammalian dive reflex - cold water activates parasympathetic nervous system" },
    ],
  },
  anger: {
    low: [
      { id: "a1", text: "Take 5 slow, deep breaths - in for 4, out for 6", category: "mindful", timeMinutes: 2, points: 10, researchBasis: "Extended exhale activates parasympathetic nervous system (Zaccaro et al., 2018)" },
      { id: "a2", text: "Write an angry letter you'll never send", category: "creative", timeMinutes: 5, points: 15, researchBasis: "Expressive writing processes anger safely (Pennebaker, 1997)" },
      { id: "a3", text: "Listen to a song that matches your anger - let it out", category: "fun", timeMinutes: 4, points: 10 },
      { id: "a4", text: "Squeeze a pillow as hard as you can for 30 seconds, then release", category: "body", timeMinutes: 1, points: 10, researchBasis: "Progressive muscle relaxation (Jacobson, 1938)" },
    ],
    medium: [
      { id: "a5", text: "Do a 5-minute power walk - walk fast and let the tension go", category: "body", timeMinutes: 5, points: 20, researchBasis: "Physical activity is one of the most effective anger management strategies (Craft & Perna, 2004)" },
      { id: "a6", text: "Rip up old paper or magazines into tiny pieces", category: "fun", timeMinutes: 5, points: 15 },
      { id: "a7", text: "Write a rap, poem, or rant about what's making you mad", category: "creative", timeMinutes: 10, points: 25, culturalNote: "Many cultures use storytelling and music to process strong emotions" },
      { id: "a8", text: "Talk to someone you trust about what happened", category: "social", timeMinutes: 10, points: 25 },
    ],
    high: [
      { id: "a9", text: "Do 20 push-ups or 30 jumping jacks RIGHT NOW", category: "body", timeMinutes: 3, points: 25, researchBasis: "Intense exercise rapidly reduces anger arousal (Thayer, 2001)" },
      { id: "a10", text: "Hold ice cubes in both hands until the anger shifts", category: "body", timeMinutes: 2, points: 20, researchBasis: "DBT TIPP technique - temperature change interrupts emotional escalation" },
      { id: "a11", text: "Scream into a pillow for 10 seconds, then breathe", category: "body", timeMinutes: 1, points: 15 },
      { id: "a12", text: "Count backwards from 100 by 7s - focus on the math", category: "mindful", timeMinutes: 3, points: 20, researchBasis: "Cognitive defusion from ACT - redirecting attention to reduce emotional intensity" },
      { id: "a13", text: "Splash very cold water on your face and wrists", category: "body", timeMinutes: 1, points: 15 },
    ],
  },
  fear: {
    low: [
      { id: "f1", text: "Try box breathing: in 4, hold 4, out 4, hold 4", category: "mindful", timeMinutes: 3, points: 10, researchBasis: "Box breathing is used by Navy SEALs for stress regulation" },
      { id: "f2", text: "List 3 times you handled something scary and survived", category: "mindful", timeMinutes: 3, points: 15, researchBasis: "Self-efficacy building (Bandura, 1977)" },
      { id: "f3", text: "Ground yourself: press your feet firmly into the floor", category: "body", timeMinutes: 1, points: 5, researchBasis: "Somatic grounding reduces anxiety activation" },
      { id: "f4", text: "Text a friend: 'What's the silliest thing that happened to you today?'", category: "social", timeMinutes: 2, points: 10 },
    ],
    medium: [
      { id: "f5", text: "Do a body scan: slowly notice each part of your body from toes to head", category: "mindful", timeMinutes: 5, points: 20, researchBasis: "Body scan meditation reduces anxiety (Kabat-Zinn, 1990)" },
      { id: "f6", text: "Write your worry on paper, then fold it into a tiny square", category: "creative", timeMinutes: 3, points: 15, researchBasis: "Externalization of worry reduces its power (narrative therapy)" },
      { id: "f7", text: "Put on your favorite upbeat song and walk in place to the beat", category: "body", timeMinutes: 5, points: 20 },
      { id: "f8", text: "Make a 'What I Can Control' vs 'What I Can't' list", category: "mindful", timeMinutes: 5, points: 20, researchBasis: "Circle of control/influence from CBT" },
    ],
    high: [
      { id: "f9", text: "Butterfly tap: cross your arms and tap shoulders alternately", category: "body", timeMinutes: 3, points: 20, researchBasis: "Bilateral stimulation from EMDR reduces acute anxiety (Shapiro, 2001)" },
      { id: "f10", text: "Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste", category: "mindful", timeMinutes: 3, points: 20, researchBasis: "5-4-3-2-1 grounding - evidence-based anxiety intervention" },
      { id: "f11", text: "Hum your favorite song loudly - humming activates your vagus nerve", category: "body", timeMinutes: 2, points: 15, researchBasis: "Vagal toning through vocalization (Porges, 2011)" },
      { id: "f12", text: "Run cold water over your wrists for 30 seconds", category: "body", timeMinutes: 1, points: 15 },
      { id: "f13", text: "Do the 4-7-8 breath: in 4, hold 7, out 8 - repeat 4 times", category: "mindful", timeMinutes: 2, points: 15, researchBasis: "Dr. Andrew Weil's relaxation breath technique" },
    ],
  },
  surprise: {
    low: [
      { id: "su1", text: "Pause and take 3 deep breaths before reacting", category: "mindful", timeMinutes: 1, points: 10 },
      { id: "su2", text: "Write down what just happened in simple words", category: "mindful", timeMinutes: 3, points: 15, researchBasis: "Narrative processing helps integrate unexpected experiences" },
      { id: "su3", text: "Ask someone to explain something you're confused about - it's okay!", category: "social", timeMinutes: 5, points: 15, culturalNote: "Asking questions is brave - every culture values learning" },
      { id: "su4", text: "Look up one new thing about what's confusing you", category: "fun", timeMinutes: 5, points: 10 },
    ],
    medium: [
      { id: "su5", text: "Talk it through with someone: 'I'm feeling confused about...'", category: "social", timeMinutes: 5, points: 20 },
      { id: "su6", text: "Draw a mind map of your thoughts - put confusion in the center", category: "creative", timeMinutes: 10, points: 25 },
      { id: "su7", text: "Write down what you DO know vs what you DON'T know", category: "mindful", timeMinutes: 5, points: 20 },
      { id: "su8", text: "Move your body - a short walk helps the brain process", category: "body", timeMinutes: 10, points: 20 },
    ],
    high: [
      { id: "su9", text: "Focus on one thing at a time - pick the most important one", category: "mindful", timeMinutes: 5, points: 25 },
      { id: "su10", text: "Call someone you trust for perspective", category: "social", timeMinutes: 10, points: 30, culturalNote: "In many cultures, community elders or mentors help navigate confusion" },
      { id: "su11", text: "Do something physical: jumping jacks, stretches, or a quick walk", category: "body", timeMinutes: 5, points: 20 },
      { id: "su12", text: "Write yourself a pep talk: 'I've been confused before and figured it out'", category: "creative", timeMinutes: 5, points: 25 },
    ],
  },
  calm: {
    low: [
      { id: "c1", text: "Savor this moment - close your eyes and breathe for 30 seconds", category: "mindful", timeMinutes: 1, points: 10, researchBasis: "Savoring positive experiences extends their benefit (Bryant & Veroff, 2007)" },
      { id: "c2", text: "Send a kind message to someone who might need it", category: "social", timeMinutes: 2, points: 15 },
      { id: "c3", text: "Stretch gently for 2 minutes - enjoy how your body feels", category: "body", timeMinutes: 2, points: 10 },
    ],
    medium: [
      { id: "c4", text: "Journal about what brought you to this calm place", category: "creative", timeMinutes: 5, points: 20, researchBasis: "Reflecting on calm states builds emotional awareness" },
      { id: "c5", text: "Try a new creative activity while you're in this good headspace", category: "creative", timeMinutes: 15, points: 25 },
      { id: "c6", text: "Go for a mindful walk - notice nature around you", category: "body", timeMinutes: 10, points: 20 },
    ],
    high: [
      { id: "c7", text: "Set a meaningful intention or goal for this week", category: "mindful", timeMinutes: 5, points: 25, researchBasis: "Implementation intentions increase goal success (Gollwitzer, 1999)" },
      { id: "c8", text: "Reach out to someone you've been meaning to connect with", category: "social", timeMinutes: 10, points: 30 },
      { id: "c9", text: "Create something: write, draw, cook, build - channel this energy", category: "creative", timeMinutes: 15, points: 35 },
    ],
  },
}

export const BADGES: Badge[] = [
  { id: "first-check", name: "First Check-In", description: "Complete your first emotion check-in", icon: "Star", requirement: "1 check-in", unlocked: false },
  { id: "explorer", name: "Emotion Explorer", description: "Check in with 3 different emotions", icon: "Compass", requirement: "3 unique emotions", unlocked: false },
  { id: "streak-3", name: "3-Day Streak", description: "Check in 3 days in a row", icon: "Flame", requirement: "3-day streak", unlocked: false },
  { id: "streak-7", name: "Week Warrior", description: "Check in 7 days in a row", icon: "Trophy", requirement: "7-day streak", unlocked: false },
  { id: "action-hero", name: "Action Hero", description: "Complete 10 micro-actions", icon: "Zap", requirement: "10 actions", unlocked: false },
  { id: "all-emotions", name: "Full Spectrum", description: "Experience all 6 emotion categories", icon: "Rainbow", requirement: "All 6 emotions", unlocked: false },
  { id: "crisis-calm", name: "Storm Surfer", description: "Use crisis mode tools and come through", icon: "Shield", requirement: "Use crisis mode", unlocked: false },
  { id: "social-star", name: "Social Star", description: "Complete 5 social micro-actions", icon: "Heart", requirement: "5 social actions", unlocked: false },
  { id: "body-mover", name: "Body Mover", description: "Complete 5 body micro-actions", icon: "Dumbbell", requirement: "5 body actions", unlocked: false },
  { id: "points-100", name: "Century Club", description: "Earn 100 total points", icon: "Award", requirement: "100 points", unlocked: false },
  { id: "points-500", name: "High Scorer", description: "Earn 500 total points", icon: "Crown", requirement: "500 points", unlocked: false },
  { id: "mindful-5", name: "Mindful Maven", description: "Complete 5 mindful micro-actions", icon: "Brain", requirement: "5 mindful actions", unlocked: false },
]

export type IntensityOption = {
  level: number
  label: string
  description: string
  size: number
  actionLevel: "low" | "medium" | "high"
  isCrisis: boolean
}

export const INTENSITY_OPTIONS: IntensityOption[] = [
  { level: 1, label: "A whisper", description: "Barely there, just a hint", size: 44, actionLevel: "low", isCrisis: false },
  { level: 2, label: "Noticeable", description: "I can feel it, but it's manageable", size: 56, actionLevel: "low", isCrisis: false },
  { level: 3, label: "Strong", description: "Hard to ignore, taking up space", size: 68, actionLevel: "medium", isCrisis: false },
  { level: 4, label: "Intense", description: "Really powerful, I need to do something", size: 80, actionLevel: "high", isCrisis: true },
  { level: 5, label: "Overwhelming", description: "It's all I can think about right now", size: 92, actionLevel: "high", isCrisis: true },
]

export function getIntensityLevel(intensity: number): "low" | "medium" | "high" {
  const option = INTENSITY_OPTIONS.find((o) => o.level === intensity)
  return option?.actionLevel || "medium"
}

export function getActionsForEmotion(emotionId: string, intensity: number): MicroAction[] {
  const level = getIntensityLevel(intensity)
  const actions = MICRO_ACTIONS[emotionId]?.[level] || []
  // Shuffle and return 3-5 actions
  const shuffled = [...actions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(5, Math.max(3, shuffled.length)))
}

export const CATEGORY_ICONS: Record<string, string> = {
  body: "Dumbbell",
  social: "Heart",
  creative: "Palette",
  mindful: "Brain",
  fun: "Sparkles",
}
