// Private journal store. Local-only. Never synced to Supabase.
// Stored under `bhava-journal:${userId}` in localStorage.

export type JournalEntry = {
  id: string
  createdAt: string // ISO
  updatedAt: string // ISO
  title: string
  body: string
  mood?: string // optional emotion category id
}

function storageKey(userId: string): string {
  return `bhava-journal:${userId}`
}

function safeParse(raw: string | null): JournalEntry[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter((e) => e && typeof e.id === "string")
    return []
  } catch {
    return []
  }
}

export function getEntries(userId: string): JournalEntry[] {
  if (typeof window === "undefined") return []
  const all = safeParse(localStorage.getItem(storageKey(userId)))
  return [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function writeAll(userId: string, entries: JournalEntry[]): void {
  if (typeof window === "undefined") return
  try { localStorage.setItem(storageKey(userId), JSON.stringify(entries)) } catch { /* quota */ }
}

function newId(): string {
  return `j_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function addEntry(userId: string, input: { title: string; body: string; mood?: string }): JournalEntry {
  const now = new Date().toISOString()
  const entry: JournalEntry = {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    title: input.title.trim(),
    body: input.body,
    mood: input.mood,
  }
  const all = safeParse(localStorage.getItem(storageKey(userId)))
  writeAll(userId, [entry, ...all])
  return entry
}

export function updateEntry(
  userId: string,
  id: string,
  patch: { title?: string; body?: string; mood?: string }
): JournalEntry | null {
  const all = safeParse(localStorage.getItem(storageKey(userId)))
  const idx = all.findIndex((e) => e.id === id)
  if (idx < 0) return null
  const updated: JournalEntry = {
    ...all[idx],
    ...patch,
    title: patch.title !== undefined ? patch.title.trim() : all[idx].title,
    updatedAt: new Date().toISOString(),
  }
  all[idx] = updated
  writeAll(userId, all)
  return updated
}

export function deleteEntry(userId: string, id: string): void {
  const all = safeParse(localStorage.getItem(storageKey(userId)))
  writeAll(userId, all.filter((e) => e.id !== id))
}

export function exportEntries(userId: string): string {
  const all = getEntries(userId)
  if (all.length === 0) return "No journal entries yet.\n"
  const lines: string[] = []
  lines.push("Bhava Journal — private export")
  lines.push(`Exported: ${new Date().toISOString()}`)
  lines.push("")
  for (const e of all) {
    const date = new Date(e.createdAt).toLocaleString()
    lines.push("─".repeat(40))
    lines.push(date)
    if (e.title) lines.push(e.title)
    if (e.mood) lines.push(`(mood: ${e.mood})`)
    lines.push("")
    lines.push(e.body)
    lines.push("")
  }
  return lines.join("\n")
}
