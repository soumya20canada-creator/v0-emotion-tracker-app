"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Plus, Trash2, Download, Lock, Pencil, Search, AlertTriangle, Printer } from "lucide-react"
import {
  type JournalEntry,
  addEntry,
  deleteEntry,
  exportEntries,
  getEntries,
  updateEntry,
} from "@/lib/journal-store"

type JournalProps = {
  userId: string
  onClose: () => void
}

type Mode =
  | { kind: "list" }
  | { kind: "edit"; entry: JournalEntry | null }

export function Journal({ userId, onClose }: JournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [mode, setMode] = useState<Mode>({ kind: "list" })
  const [query, setQuery] = useState("")

  useEffect(() => {
    setEntries(getEntries(userId))
  }, [userId])

  function refresh() {
    setEntries(getEntries(userId))
  }

  function handleSave(title: string, body: string, existingId: string | null) {
    if (!body.trim() && !title.trim()) {
      setMode({ kind: "list" })
      return
    }
    if (existingId) {
      updateEntry(userId, existingId, { title, body })
    } else {
      addEntry(userId, { title, body })
    }
    refresh()
    setMode({ kind: "list" })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this entry? This can't be undone.")) return
    deleteEntry(userId, id)
    refresh()
  }

  function handleExport() {
    const text = exportEntries(userId)
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `bhava-journal-${date}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (mode.kind === "edit") {
    return (
      <JournalEditor
        entry={mode.entry}
        onCancel={() => setMode({ kind: "list" })}
        onSave={handleSave}
      />
    )
  }

  return (
    <main className="min-h-dvh bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3 gap-3">
          <button
            onClick={onClose}
            style={{ minWidth: 44, minHeight: 44 }}
            className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Back to My Space"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground">Your journal</h2>
          <button
            onClick={handleExport}
            style={{ minHeight: 40 }}
            disabled={entries.length === 0}
            className="flex items-center gap-1.5 px-3 rounded-full bg-muted hover:bg-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-xs font-semibold disabled:opacity-40"
            aria-label="Export journal as text file"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-6 flex flex-col gap-5">
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-secondary border border-border">
          <div className="flex items-start gap-2.5">
            <Lock size={14} className="text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Private. </span>
              Stored only on this device. We never see it, never upload it, never analyze it.
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-semibold">Heads up: </span>
              If you log out, clear your browser, or switch devices, these entries are <strong>gone forever</strong>.
              If they matter to you, <strong>export</strong> or <strong>print</strong> them to keep a copy you own.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              style={{ minHeight: 44 }}
              className="flex-1 flex items-center justify-center gap-2 px-3 rounded-xl text-sm font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Download size={14} aria-hidden="true" />
              Export as .txt
            </button>
            <button
              onClick={() => { if (typeof window !== "undefined") window.print() }}
              style={{ minHeight: 44 }}
              className="flex-1 flex items-center justify-center gap-2 px-3 rounded-xl text-sm font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Printer size={14} aria-hidden="true" />
              Print / Save PDF
            </button>
          </div>
        </div>

        <button
          onClick={() => setMode({ kind: "edit", entry: null })}
          style={{ minHeight: 56, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
          className="w-full rounded-2xl text-base font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          New entry
        </button>

        {entries.length > 0 && (
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your entries"
              style={{ minHeight: 44 }}
              className="w-full pl-10 pr-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>
        )}

        {entries.length === 0 ? (
          <div className="text-center p-8 rounded-2xl bg-muted/50">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-base font-bold text-foreground">A blank page, just for you.</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Whatever you write here stays here. No one else is reading.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {(() => {
              const q = query.trim().toLowerCase()
              const filtered = q
                ? entries.filter((e) => e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q))
                : entries
              if (filtered.length === 0) {
                return <p className="text-sm text-muted-foreground text-center py-6">No entries match "{query}".</p>
              }
              return filtered.map((e) => (
              <EntryCard
                key={e.id}
                entry={e}
                onEdit={() => setMode({ kind: "edit", entry: e })}
                onDelete={() => handleDelete(e.id)}
              />
            ))
            })()}
          </div>
        )}
      </div>
    </main>
  )
}

function EntryCard({
  entry, onEdit, onDelete,
}: { entry: JournalEntry; onEdit: () => void; onDelete: () => void }) {
  const date = new Date(entry.createdAt).toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric",
  })
  const preview = entry.body.slice(0, 160)
  return (
    <article className="p-4 rounded-2xl bg-card border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground">{date}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            style={{ minWidth: 36, minHeight: 36 }}
            className="rounded-lg flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Edit entry"
          >
            <Pencil size={14} className="text-muted-foreground" />
          </button>
          <button
            onClick={onDelete}
            style={{ minWidth: 36, minHeight: 36 }}
            className="rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
            aria-label="Delete entry"
          >
            <Trash2 size={14} className="text-destructive" />
          </button>
        </div>
      </div>
      {entry.title && (
        <h3 className="text-base font-bold text-foreground mb-1 leading-tight">{entry.title}</h3>
      )}
      {preview && (
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {preview}{entry.body.length > 160 ? "…" : ""}
        </p>
      )}
    </article>
  )
}

function JournalEditor({
  entry, onCancel, onSave,
}: {
  entry: JournalEntry | null
  onCancel: () => void
  onSave: (title: string, body: string, existingId: string | null) => void
}) {
  const [title, setTitle] = useState(entry?.title ?? "")
  const [body, setBody] = useState(entry?.body ?? "")

  return (
    <main className="min-h-dvh bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3 gap-3">
          <button
            onClick={onCancel}
            style={{ minWidth: 44, minHeight: 44 }}
            className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Cancel"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground">
            {entry ? "Edit entry" : "New entry"}
          </h2>
          <button
            onClick={() => onSave(title, body, entry?.id ?? null)}
            style={{ minHeight: 40 }}
            disabled={!title.trim() && !body.trim()}
            className="px-4 rounded-full text-sm font-bold bg-primary text-primary-foreground disabled:opacity-40 cursor-pointer hover:scale-105 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Save
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          style={{ minHeight: 52 }}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary transition"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write whatever feels true right now."
          autoFocus
          rows={16}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary transition resize-none flex-1"
        />
        <p className="text-xs text-muted-foreground/70 text-center italic flex items-center justify-center gap-1.5">
          <Lock size={10} aria-hidden="true" />
          Only on this device. Only you.
        </p>
      </div>
    </main>
  )
}
