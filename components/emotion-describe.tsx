"use client"

import { useState } from "react"
import type { EmotionCategory } from "@/lib/emotions-data"

type EmotionDescribeProps = {
  emotion: EmotionCategory
  onContinue: (note: string) => void
}

const MAX_CHARS = 150

export function EmotionDescribe({ emotion, onContinue }: EmotionDescribeProps) {
  const [text, setText] = useState("")

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      {/* Emotion indicator */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: emotion.color }}
        >
          {emotion.label.slice(0, 2)}
        </div>
        <p className="text-sm text-muted-foreground">
          You selected <span className="font-medium text-foreground">{emotion.label}</span>
        </p>
      </div>

      {/* Heading */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground leading-snug">
          Want to tell us more?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Use your own words — this helps us understand what you need right now.
        </p>
      </div>

      {/* Text input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Optional
          </span>
          <span className="text-xs text-muted-foreground">
            {text.length}/{MAX_CHARS}
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Describe what you're feeling in your own words..."
          rows={4}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => onContinue(text)}
          className="w-full py-4 rounded-2xl text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          style={{
            background: emotion.color,
            color: "#FFFFFF",
            boxShadow: `0 4px 20px ${emotion.color}44`,
          }}
        >
          Continue
        </button>
        <button
          onClick={() => onContinue("")}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
