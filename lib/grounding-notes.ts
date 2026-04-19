// Short, rotating grounding notes. Tone: gentle, specific, not generic.
// Mix of immigrant-centered, universally human, and culturally varied.
// Feel free to edit, reorder, or delete. Each note should stand alone.

export type GroundingNote = {
  id: string
  body: string
  tag?: "immigrant" | "loss" | "anxious" | "lonely" | "tired" | "hopeful" | "body" | "identity"
}

export const GROUNDING_NOTES: GroundingNote[] = [
  { id: "n01", body: "Homesickness isn't a sign you chose wrong. It's a sign something mattered.", tag: "immigrant" },
  { id: "n02", body: "You don't have to be okay right now. You just have to be honest about not being okay.", tag: "anxious" },
  { id: "n03", body: "Missing a place doesn't mean you don't belong here. You can belong to two places at once.", tag: "immigrant" },
  { id: "n04", body: "Your body is tired because it has been carrying something. That is not weakness. That is proof.", tag: "tired" },
  { id: "n05", body: "Loneliness in a new country is a specific kind of ache. It deserves its own name.", tag: "lonely" },
  { id: "n06", body: "Speaking a second language all day is work. It's okay if you're tired before you've done anything else.", tag: "immigrant" },
  { id: "n07", body: "The version of yourself you were before this season is still in you. Nothing about you is lost.", tag: "identity" },
  { id: "n08", body: "You are allowed to grieve a life that didn't end, but changed beyond recognition.", tag: "loss" },
  { id: "n09", body: "Rest is not a reward for finishing. Rest is how you keep going.", tag: "tired" },
  { id: "n10", body: "The people you love across time zones still love you back, even when the phones are quiet.", tag: "lonely" },
  { id: "n11", body: "Feeling out of place in two countries is not a failure. It's the cost of having lived in both.", tag: "immigrant" },
  { id: "n12", body: "You do not have to earn the right to be cared for. You have it because you exist.", tag: "hopeful" },
  { id: "n13", body: "Anxiety is your body trying to keep you safe. It's not lying. It's just loud.", tag: "anxious" },
  { id: "n14", body: "Your ancestors survived enough to make you possible. Their steadiness is in you.", tag: "identity" },
  { id: "n15", body: "If today you only drank water and got out of bed, you did two brave things.", tag: "tired" },
  { id: "n16", body: "You are allowed to change your mind about what home means. More than once.", tag: "immigrant" },
  { id: "n17", body: "Grief doesn't move in a straight line. It loops back on quiet Tuesdays for no reason at all.", tag: "loss" },
  { id: "n18", body: "You can love your parents and still need space from their expectations. Both can be true.", tag: "identity" },
  { id: "n19", body: "Not knowing what you're feeling is its own kind of knowing. It's called 'this is too much right now.'", tag: "anxious" },
  { id: "n20", body: "A small kindness you did last week is still alive in the person who received it.", tag: "hopeful" },
  { id: "n21", body: "Your name, said correctly, is a gift. It's okay to insist on it.", tag: "immigrant" },
  { id: "n22", body: "Numbness is not absence. It's protection. Your feelings are underneath, resting.", tag: "body" },
  { id: "n23", body: "You are not behind. Other people's timelines don't belong to you.", tag: "anxious" },
  { id: "n24", body: "Cooking food from home is a way of telling yourself you're still connected.", tag: "immigrant" },
  { id: "n25", body: "Crying is not losing control. It's your body releasing what it has been holding.", tag: "body" },
  { id: "n26", body: "The feeling will move. It always does. Even when it doesn't feel like it will.", tag: "hopeful" },
  { id: "n27", body: "You are allowed to outgrow roles other people are still assigning you.", tag: "identity" },
  { id: "n28", body: "Being misunderstood is exhausting. You don't have to keep explaining yourself today.", tag: "lonely" },
  { id: "n29", body: "The silence of a new place isn't the same silence you grew up with. Give yourself time to learn it.", tag: "immigrant" },
  { id: "n30", body: "You came here. You're still here. That's the whole practice.", tag: "hopeful" },
]

// Deterministic note-of-the-day based on the date. Same for everyone, rotates daily.
export function getNoteOfTheDay(date: Date = new Date()): GroundingNote {
  const y = date.getFullYear()
  const m = date.getMonth()
  const d = date.getDate()
  // Day-of-year-ish
  const key = y * 400 + m * 32 + d
  return GROUNDING_NOTES[key % GROUNDING_NOTES.length]
}
