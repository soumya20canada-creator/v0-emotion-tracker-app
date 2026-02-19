"use client"

import { useState } from "react"
import { type MicroAction, type EmotionCategory, CATEGORY_ICONS } from "@/lib/emotions-data"
import {
  Dumbbell,
  Heart,
  Palette,
  Brain,
  Sparkles,
  Check,
  Clock,
  Star,
  Info,
} from "lucide-react"

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  Dumbbell,
  Heart,
  Palette,
  Brain,
  Sparkles,
}

const CATEGORY_LABELS: Record<string, string> = {
  body: "Body",
  social: "Social",
  creative: "Creative",
  mindful: "Mindful",
  fun: "Fun",
}

type ActionCardsProps = {
  actions: MicroAction[]
  emotion: EmotionCategory
  onComplete: (action: MicroAction) => void
  completedIds: string[]
}

export function ActionCards({ actions, emotion, onComplete, completedIds }: ActionCardsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Your Moves</h3>
        <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: `${emotion.color}15`, color: emotion.color }}>
          {completedIds.length}/{actions.length} done
        </span>
      </div>
      {actions.map((action) => {
        const isDone = completedIds.includes(action.id)
        const isExpanded = expandedId === action.id
        const iconName = CATEGORY_ICONS[action.category]
        const Icon = CATEGORY_ICON_MAP[iconName]

        return (
          <div
            key={action.id}
            className="rounded-2xl border-2 transition-all duration-200 overflow-hidden"
            style={{
              borderColor: isDone ? emotion.color : "var(--border)",
              background: isDone ? `${emotion.color}08` : "var(--card)",
            }}
          >
            <div className="flex items-start gap-3 p-4">
              {/* Category icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: isDone ? emotion.color : `${emotion.color}15`,
                }}
              >
                {isDone ? (
                  <Check size={18} style={{ color: "#FFF" }} />
                ) : Icon ? (
                  <Icon size={18} style={{ color: emotion.color }} />
                ) : (
                  <Star size={18} style={{ color: emotion.color }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-relaxed ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {action.text}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} aria-hidden="true" />
                    {action.timeMinutes}min
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${emotion.color}15`, color: emotion.color }}
                  >
                    +{action.points}pts
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {CATEGORY_LABELS[action.category]}
                  </span>
                  {(action.researchBasis || action.culturalNote) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedId(isExpanded ? null : action.id)
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label="Show research info"
                    >
                      <Info size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Complete button */}
              {!isDone && (
                <button
                  onClick={() => onComplete(action)}
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    background: `${emotion.color}15`,
                    color: emotion.color,
                    border: `2px dashed ${emotion.color}44`,
                  }}
                  aria-label={`Mark "${action.text}" as complete`}
                >
                  <Check size={18} />
                </button>
              )}
            </div>

            {/* Research/Cultural note */}
            {isExpanded && (
              <div
                className="px-4 pb-4 text-xs leading-relaxed"
                style={{ color: emotion.color }}
              >
                {action.researchBasis && (
                  <p className="flex items-start gap-1">
                    <Brain size={12} className="shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>Research:</strong> {action.researchBasis}</span>
                  </p>
                )}
                {action.culturalNote && (
                  <p className="flex items-start gap-1 mt-1">
                    <Heart size={12} className="shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>Cultural note:</strong> {action.culturalNote}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
