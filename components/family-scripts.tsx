"use client"

import { useState } from "react"
import { AppLogo } from "@/components/app-logo"
import { ArrowLeft, MessageCircleHeart, Copy, Check } from "lucide-react"

// Scripts are phrased for the common diaspora shape — kids telling parents back
// home something they've been hiding. The three columns are three entry points
// users actually describe: "I'm not okay," "I need money help," "I'm seeing a
// therapist" — all three carry cultural stigma in many South Asian, East Asian,
// Middle Eastern, African, and Latin American families.
//
// Each script is short, first-person, and sized for a text message or a
// 90-second phone call opener. Users can copy/paste it, edit it, send it.
// The point isn't the words — it's breaking the "I can't even start" block.

type ScriptKey = "not-okay" | "money" | "therapy" | "visa" | "delay-plans"

type Script = {
  id: ScriptKey
  title: string
  subtitle: string
  body: string
}

const SCRIPTS: Script[] = [
  {
    id: "not-okay",
    title: "I'm not doing okay",
    subtitle: "For the call you've been avoiding",
    body: `I've been wanting to tell you something for a while. I haven't been doing okay. It's not one big thing — it's a lot of small things adding up, and I've been hiding it because I didn't want you to worry. I'm telling you now because hiding it is making it heavier. I don't need you to fix it. I just needed you to know.`,
  },
  {
    id: "therapy",
    title: "I'm talking to someone",
    subtitle: "When you've started (or want to start) therapy",
    body: `I wanted to tell you — I've started talking to a counsellor. It's not because something is wrong with me. It's because life here is a lot, and I needed someone who is not family to hear it. You raised me to take care of myself, and this is me doing that. I hope you can be proud of that, even if it feels unfamiliar.`,
  },
  {
    id: "money",
    title: "Money is tight",
    subtitle: "For the conversation about finances",
    body: `I've been worried about money and I haven't said anything because I didn't want to add to your stress. But the cost of living here is more than I budgeted for, and my visa renewal is coming up. I'm not asking for anything right now — I just need you to know so I'm not carrying it alone. Can we talk about it this week?`,
  },
  {
    id: "visa",
    title: "My visa situation is stressful",
    subtitle: "When paperwork is taking up all your headspace",
    body: `There's something I've been dealing with that I haven't told you about. My immigration status requires a lot of paperwork and it's been taking up most of my energy. It's going to be okay, but I can't promise I'll be my usual self until it's sorted. If I seem distant, it's not about you — it's this.`,
  },
  {
    id: "delay-plans",
    title: "I need to delay coming home",
    subtitle: "When you can't make it to a family event",
    body: `I know you've been looking forward to me coming back, and I've been looking forward to it too. But the timing isn't going to work this year — money, work, and paperwork are all stacking up, and I can't do a good visit right now. I'd rather come when I can actually be present, not when I'm running on empty. I'm sorry.`,
  },
]

type FamilyScriptsProps = {
  onClose: () => void
}

export function FamilyScripts({ onClose }: FamilyScriptsProps) {
  const [openId, setOpenId] = useState<ScriptKey | null>(null)
  const [copiedId, setCopiedId] = useState<ScriptKey | null>(null)

  async function handleCopy(script: Script) {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(script.body)
        setCopiedId(script.id)
        window.setTimeout(() => setCopiedId((id) => (id === script.id ? null : id)), 2200)
      }
    } catch {
      // clipboard blocked — the text is visible on screen, the user can still select it
    }
  }

  return (
    <main className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center px-5 py-3 gap-3">
          <button
            onClick={onClose}
            style={{ minWidth: 44, minHeight: 44 }}
            className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <AppLogo size={32} />
          <span className="text-lg font-bold text-foreground">Tell your family</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-8 flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/15 shrink-0 mt-1">
              <MessageCircleHeart size={18} className="text-primary" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-extrabold text-foreground leading-tight text-balance">
                The hardest part is starting.
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                Drafts you can copy, edit, send as-is, or read aloud. Pick one, make it yours.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          {SCRIPTS.map((s) => {
            const isOpen = openId === s.id
            const isCopied = copiedId === s.id
            return (
              <div key={s.id} className="rounded-2xl bg-card border border-border overflow-hidden">
                <button
                  onClick={() => setOpenId((cur) => (cur === s.id ? null : s.id))}
                  style={{ minHeight: 72 }}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-expanded={isOpen}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.subtitle}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold shrink-0">
                    {isOpen ? "Hide" : "Read"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border bg-muted/20">
                    <p className="text-base text-foreground leading-relaxed pt-3 whitespace-pre-line">
                      {s.body}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(s)}
                        style={{ minHeight: 44 }}
                        className="flex items-center gap-2 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {isCopied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                        {isCopied ? "Copied" : "Copy text"}
                      </button>
                      <p className="text-xs text-muted-foreground italic">
                        Edit it before you send. Your words, your pace.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </section>

        <section className="p-5 rounded-2xl bg-secondary/60 border border-border">
          <p className="text-sm text-foreground leading-relaxed">
            <strong>A note: </strong>
            Some families will respond with love. Some won't — at first, or ever. Telling them doesn't
            guarantee they'll meet you where you are, but it does end the loneliness of carrying it
            alone. You get to decide when, and to whom.
          </p>
        </section>
      </div>
    </main>
  )
}
