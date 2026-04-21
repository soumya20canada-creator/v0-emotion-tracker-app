"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Shuffle, List } from "lucide-react"
import { ThemeHeader } from "@/components/theme-header"
import { GROUNDING_NOTES, getNoteOfTheDay, type GroundingNote } from "@/lib/grounding-notes"

type GroundingNotesProps = {
  onClose: () => void
}

type View = "today" | "library"

const TAG_LABELS: Record<string, string> = {
  immigrant: "for when you miss home",
  loss: "for grief",
  anxious: "for when it's loud inside",
  lonely: "for loneliness",
  tired: "for the exhausted days",
  hopeful: "a small reminder",
  body: "about your body",
  identity: "about who you are",
}

function tagPhrase(tag?: string): string {
  if (!tag) return "a note for today"
  return TAG_LABELS[tag] ?? "a note for today"
}

const ALL_TAGS = Array.from(new Set(GROUNDING_NOTES.map((n) => n.tag).filter(Boolean))) as string[]

export function GroundingNotes({ onClose }: GroundingNotesProps) {
  const [view, setView] = useState<View>("today")
  const todayNote = useMemo(() => getNoteOfTheDay(), [])
  const [current, setCurrent] = useState<GroundingNote>(todayNote)
  const [filter, setFilter] = useState<string | null>(null)

  function readAnother() {
    const pool = GROUNDING_NOTES.filter((n) => n.id !== current.id)
    const next = pool[Math.floor(Math.random() * pool.length)]
    setCurrent(next)
  }

  const filtered = filter ? GROUNDING_NOTES.filter((n) => n.tag === filter) : GROUNDING_NOTES

  return (
    <main className="min-h-dvh bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <ThemeHeader />
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3 gap-3">
          <button
            onClick={onClose}
            style={{ minWidth: 44, minHeight: 44 }}
            className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Back to My Space"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground">Grounding notes</h2>
          <span style={{ minWidth: 44 }} />
        </div>
      </header>

      {view === "today" ? (
        <div className="flex-1 max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-8 justify-center">
          <div className="flex flex-col gap-4 items-center text-center">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {tagPhrase(current.tag)}
            </p>
            <p className="text-2xl font-semibold text-foreground leading-relaxed text-balance">
              {current.body}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={readAnother}
              style={{ minHeight: 52 }}
              className="w-full rounded-2xl text-base font-bold bg-card border border-border hover:bg-muted cursor-pointer transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Shuffle size={16} />
              Read another
            </button>
            <button
              onClick={() => setView("library")}
              style={{ minHeight: 48 }}
              className="w-full rounded-2xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <List size={14} />
              See all
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <TagChip label="All" active={filter === null} onClick={() => setFilter(null)} />
            {ALL_TAGS.map((t) => (
              <TagChip
                key={t}
                label={TAG_LABELS[t] ?? t}
                active={filter === t}
                onClick={() => setFilter(t)}
              />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {filtered.map((n) => (
              <article key={n.id} className="p-4 rounded-2xl bg-card border border-border">
                {n.tag && (
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                    {TAG_LABELS[n.tag] ?? n.tag}
                  </p>
                )}
                <p className="text-base text-foreground leading-relaxed">{n.body}</p>
              </article>
            ))}
          </div>
          <button
            onClick={() => setView("today")}
            style={{ minHeight: 48 }}
            className="w-full rounded-2xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Back to today's note
          </button>
        </div>
      )}
    </main>
  )
}

function TagChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        minHeight: 32,
        background: active ? "var(--primary)" : "var(--muted)",
        color: active ? "var(--primary-foreground)" : "var(--foreground)",
      }}
      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {label}
    </button>
  )
}
