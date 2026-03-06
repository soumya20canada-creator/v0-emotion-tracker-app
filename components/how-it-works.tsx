"use client"

import { X, Shield, Heart, TrendingUp, Zap, Lock } from "lucide-react"

type HowItWorksProps = {
  onClose: () => void
}

export function HowItWorks({ onClose }: HowItWorksProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-background overflow-y-auto">
      <div className="max-w-lg mx-auto w-full px-5 py-8 flex flex-col gap-8 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-foreground">How Bhava works</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Hero statement */}
        <div className="text-center p-6 rounded-3xl bg-primary/5 border border-primary/10">
          <p className="text-xl font-bold text-foreground leading-snug text-balance">
            "From scattered feelings to clear patterns."
          </p>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Most of us never learned to name what we feel. Bhava gives you a gentle place to start — one check-in at a time.
          </p>
        </div>

        {/* Section: Why daily check-ins work */}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#F59E0B22" }}>
            <Heart size={22} style={{ color: "#F59E0B" }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-1">Why daily check-ins work</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Naming your emotion — even in one tap — activates your prefrontal cortex and quiets your brain's threat response. Scientists call this affect labeling. It takes 30 seconds, and the effect compounds over time.
            </p>
            <p className="text-xs text-muted-foreground/50 mt-1.5">Lieberman et al., 2007 · UCLA</p>
          </div>
        </div>

        {/* Section: From crisis to calm */}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#10B98122" }}>
            <Shield size={22} style={{ color: "#10B981" }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-1">From crisis to calm</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When feelings get overwhelming, Bhava's grounding toolkit is always one tap away — breathing exercises, gentle games, and sensory activities designed to bring you back to your body. You are never left alone with a big feeling.
            </p>
          </div>
        </div>

        {/* Section: Patterns reveal triggers */}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#3B82F622" }}>
            <TrendingUp size={22} style={{ color: "#3B82F6" }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-1">Patterns reveal your triggers</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your mood calendar shows you exactly when and what you feel most. Over time you'll see: "I feel most anxious on Sunday evenings." That awareness alone starts to change things.
            </p>
          </div>
        </div>

        {/* Section: Small actions */}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#8B5CF622" }}>
            <Zap size={22} style={{ color: "#8B5CF6" }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-1">Small actions, real change</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              After naming your emotion, Bhava suggests micro-actions — things that take 2 to 10 minutes, backed by therapy research. Each one gently rewires how your nervous system responds over time.
            </p>
          </div>
        </div>

        {/* Privacy guarantee */}
        <div className="flex gap-4 p-5 rounded-2xl border-2 border-border">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-muted">
            <Lock size={22} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-1">Your data is yours. Full stop.</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bhava uses end-to-end encryption. Your emotional data is never sold, never shared, never seen by anyone but you. You can request deletion at any time.
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl text-lg font-bold bg-primary text-primary-foreground cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
          style={{ boxShadow: "0 4px 20px rgba(59,130,246,0.3)" }}
        >
          Start tracking today 🌸
        </button>
      </div>
    </div>
  )
}
