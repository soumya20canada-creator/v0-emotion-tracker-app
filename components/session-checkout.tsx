"use client"

import { useState } from "react"
import { AppLogo } from "@/components/app-logo"

export type CheckoutFeel = "lighter" | "same" | "need-more" | "okay"
export type PositiveEmotionId = "calm" | "grateful" | "relieved" | "hopeful" | "proud" | "loved"

type SessionCheckoutProps = {
  onDone: () => void
  onNeedMore: () => void
  onSavePositive?: (positiveId: PositiveEmotionId) => void
}

const POSITIVE_CHIPS: { id: PositiveEmotionId; label: string }[] = [
  { id: "calm", label: "calm" },
  { id: "grateful", label: "grateful" },
  { id: "relieved", label: "relieved" },
  { id: "hopeful", label: "hopeful" },
  { id: "proud", label: "proud" },
  { id: "loved", label: "loved" },
]

export function SessionCheckout({ onDone, onNeedMore, onSavePositive }: SessionCheckoutProps) {
  const [feel, setFeel] = useState<CheckoutFeel | null>(null)

  return (
    <main className="min-h-dvh bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center px-5 py-3 gap-3">
          <AppLogo size={32} />
          <span
            className="text-2xl tracking-wide"
            style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
              background: "linear-gradient(135deg, #C9A84C 0%, #F5D77E 50%, #C9A84C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Bhava · भाव
          </span>
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-7 justify-center">
        {feel === null && (
          <>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">A small check-in</p>
              <h2 className="text-2xl font-extrabold text-foreground leading-tight">
                How are you feeling now?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No right answer. Whatever's true.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <CheckoutButton label="A little lighter" onClick={() => setFeel("lighter")} />
              <CheckoutButton label="About the same" onClick={() => setFeel("same")} />
              <CheckoutButton label="I needed more" onClick={() => setFeel("need-more")} />
              <CheckoutButton label="Actually pretty okay" onClick={() => setFeel("okay")} />
            </div>
            <button
              onClick={onDone}
              style={{ minHeight: 44 }}
              className="w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Skip
            </button>
          </>
        )}

        {(feel === "lighter" || feel === "okay") && (
          <>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Name it if you want</p>
              <h2 className="text-2xl font-extrabold text-foreground leading-tight">
                {feel === "okay" ? "Pretty okay is beautiful." : "A little lighter is a lot."}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If a word fits, tap it. No pressure.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {POSITIVE_CHIPS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSavePositive?.(c.id)}
                  style={{
                    minHeight: 44,
                    background: "var(--muted)",
                    color: "var(--foreground)",
                  }}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {c.label}
                </button>
              ))}
            </div>
            <button
              onClick={onDone}
              style={{ minHeight: 52 }}
              className="w-full rounded-2xl text-base font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              No word — I'm done for now
            </button>
          </>
        )}

        {(feel === "same" || feel === "need-more") && (
          <>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">That's okay</p>
              <h2 className="text-2xl font-extrabold text-foreground leading-tight">
                {feel === "need-more"
                  ? "Some feelings need more than one tool."
                  : "Sometimes it doesn't shift right away."}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feel === "need-more"
                  ? "Try a short grounding note, or come back when you're ready."
                  : "You showed up. That's the part that matters."}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={onNeedMore}
                style={{ minHeight: 52, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
                className="w-full rounded-2xl text-base font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Try a grounding note
              </button>
              <button
                onClick={onDone}
                style={{ minHeight: 52 }}
                className="w-full rounded-2xl text-base font-semibold bg-card border border-border hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                I'm done for now
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

function CheckoutButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ minHeight: 56 }}
      className="w-full rounded-2xl text-base font-semibold bg-card border border-border hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-left px-5 text-foreground"
    >
      {label}
    </button>
  )
}
