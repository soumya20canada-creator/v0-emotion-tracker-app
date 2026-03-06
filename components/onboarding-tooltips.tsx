"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

type Tip = {
  id: string
  emoji: string
  title: string
  description: string
  position: "top" | "bottom"
}

const TIPS: Tip[] = [
  { id: "emotion", emoji: "💙", title: "Start here", description: "Tap the feeling that's closest to where you are right now. No right answer.", position: "bottom" },
  { id: "journey", emoji: "📊", title: "Your Journey tab", description: "Track your streaks, badges, and emotional patterns over time.", position: "top" },
  { id: "theme", emoji: "🎨", title: "Make it yours", description: "Tap 'Themes' to change the look and feel of your space.", position: "top" },
  { id: "avatar", emoji: "🌸", title: "Your profile", description: "Tap your avatar to access settings, themes, and sign out.", position: "top" },
]

export function OnboardingTooltips({ isNewUser }: { isNewUser: boolean }) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!isNewUser) return
    const done = localStorage.getItem("bhava-onboarding-done")
    if (!done) {
      // Small delay so the UI has time to render
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [isNewUser])

  function dismiss() {
    setDismissed(true)
    setVisible(false)
    localStorage.setItem("bhava-onboarding-done", "true")
  }

  if (!visible || dismissed) return null

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-[1px] pointer-events-auto"
        onClick={dismiss}
      />

      {/* Central tooltip card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] bg-card rounded-3xl p-6 shadow-2xl border border-border pointer-events-auto flex flex-col gap-5 z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-foreground">Welcome to Bhava 🌸</h3>
          <button onClick={dismiss} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Here's a quick guide to your space. Hover over anything to explore.
        </p>
        <div className="flex flex-col gap-3">
          {TIPS.map(tip => (
            <div key={tip.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
              <span className="text-xl shrink-0">{tip.emoji}</span>
              <div>
                <p className="text-sm font-bold text-foreground">{tip.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={dismiss}
          className="w-full py-3 rounded-2xl font-bold text-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
          style={{ background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
        >
          Got it — let's go 🌿
        </button>
      </div>
    </div>
  )
}
