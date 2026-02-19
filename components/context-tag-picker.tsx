"use client"

import { CONTEXT_TAGS } from "@/lib/context-tags"
import {
  GraduationCap,
  Briefcase,
  Home,
  Heart,
  Globe,
  MapPin,
  Users,
  FileText,
  Moon,
  Smartphone,
  Wallet,
  Activity,
  CloudRain,
  MessageCircle,
  Check,
} from "lucide-react"

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  Briefcase,
  Home,
  Heart,
  Globe,
  MapPin,
  Users,
  FileText,
  Moon,
  Smartphone,
  Wallet,
  Activity,
  CloudRain,
  MessageCircle,
}

type ContextTagPickerProps = {
  selected: string[]
  onToggle: (tagId: string) => void
  accentColor: string
}

export function ContextTagPicker({ selected, onToggle, accentColor }: ContextTagPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2.5">
        {CONTEXT_TAGS.map((tag) => {
          const Icon = ICON_MAP[tag.icon] || Globe
          const isSelected = selected.includes(tag.id)
          return (
            <button
              key={tag.id}
              onClick={() => onToggle(tag.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-[0.97] border-2"
              style={{
                background: isSelected ? accentColor : "var(--card)",
                color: isSelected ? "#FFFFFF" : "var(--foreground)",
                borderColor: isSelected ? accentColor : "var(--border)",
                boxShadow: isSelected ? `0 2px 12px ${accentColor}33` : "none",
              }}
              aria-pressed={isSelected}
              aria-label={`${tag.label}: ${tag.description}`}
            >
              {isSelected ? (
                <Check size={16} aria-hidden="true" />
              ) : (
                <Icon size={16} aria-hidden="true" />
              )}
              {tag.label}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selected.length} context{selected.length !== 1 ? "s" : ""} tagged
        </p>
      )}
    </div>
  )
}
