"use client"

import { type RegionResources } from "@/lib/crisis-resources"
import { Phone, MessageCircle, Globe, Clock, Users, Heart, Languages } from "lucide-react"
import { useState } from "react"

type CrisisResourcesProps = {
  region: RegionResources
  accentColor: string
}

export function CrisisResources({ region, accentColor }: CrisisResourcesProps) {
  const [expandedHelpline, setExpandedHelpline] = useState<number | null>(null)
  const [showGroups, setShowGroups] = useState(false)

  return (
    <div className="flex flex-col gap-5">
      {/* Helplines Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Phone size={18} style={{ color: accentColor }} aria-hidden="true" />
          <h4 className="text-lg font-extrabold text-foreground">
            Crisis Helplines
          </h4>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {region.flag === "GLOBAL" ? "Global" : region.label}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {region.helplines.map((helpline, i) => {
            const isExpanded = expandedHelpline === i
            return (
              <div
                key={i}
                className="rounded-2xl border border-border overflow-hidden transition-all"
                style={{ background: isExpanded ? `${accentColor}08` : "var(--card)" }}
              >
                <button
                  onClick={() => setExpandedHelpline(isExpanded ? null : i)}
                  className="w-full flex items-start gap-3 p-4 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-expanded={isExpanded}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${accentColor}18` }}
                  >
                    <Phone size={18} style={{ color: accentColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-foreground leading-tight">
                      {helpline.name}
                    </p>
                    {helpline.number && (
                      <a
                        href={`tel:${helpline.number.replace(/\s/g, "")}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-lg font-extrabold mt-1 block hover:underline"
                        style={{ color: accentColor }}
                        aria-label={`Call ${helpline.name} at ${helpline.number}`}
                      >
                        {helpline.number}
                      </a>
                    )}
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {helpline.description}
                    </p>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 flex flex-col gap-2 ml-[52px]">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock size={14} className="shrink-0" aria-hidden="true" />
                      <span>{helpline.hours}</span>
                    </div>
                    {helpline.languages && helpline.languages.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Languages size={14} className="shrink-0" aria-hidden="true" />
                        <span>{helpline.languages.join(", ")}</span>
                      </div>
                    )}
                    {helpline.sms && (
                      <div className="flex items-center gap-2 text-sm">
                        <MessageCircle size={14} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                        <span className="font-semibold" style={{ color: accentColor }}>
                          {helpline.sms}
                        </span>
                      </div>
                    )}
                    {helpline.chat && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe size={14} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                        <a
                          href={helpline.chat.startsWith("http") ? helpline.chat : `https://${helpline.chat}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:underline"
                          style={{ color: accentColor }}
                        >
                          Online chat available
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Support Groups Toggle */}
      <button
        onClick={() => setShowGroups(!showGroups)}
        className="flex items-center gap-2 w-full py-3 px-4 rounded-2xl border-2 text-left transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          borderColor: `${accentColor}33`,
          background: showGroups ? `${accentColor}08` : "transparent",
        }}
      >
        <Users size={18} style={{ color: accentColor }} aria-hidden="true" />
        <span className="text-base font-bold text-foreground flex-1">
          Community Support Groups
        </span>
        <span className="text-sm text-muted-foreground">
          {showGroups ? "Hide" : `${region.supportGroups.length} groups`}
        </span>
      </button>

      {showGroups && (
        <div className="flex flex-col gap-2">
          {region.supportGroups.map((group, i) => {
            const typeLabels: Record<string, { label: string; icon: typeof Heart }> = {
              community: { label: "Community", icon: Users },
              peer: { label: "Peer Support", icon: Heart },
              cultural: { label: "Cultural", icon: Globe },
              youth: { label: "Youth", icon: Users },
              online: { label: "Online", icon: Globe },
            }
            const typeInfo = typeLabels[group.type] || typeLabels.community
            const TypeIcon = typeInfo.icon

            return (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${accentColor}15` }}
                >
                  <TypeIcon size={18} style={{ color: accentColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-bold text-foreground">
                      {group.name}
                    </p>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${accentColor}15`, color: accentColor }}
                    >
                      {typeInfo.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {group.description}
                  </p>
                  {group.url && (
                    <a
                      href={group.url.startsWith("http") ? group.url : `https://${group.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold mt-1 inline-block hover:underline"
                      style={{ color: accentColor }}
                    >
                      Visit website
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Gentle note */}
      <div className="p-4 rounded-2xl bg-secondary border border-border">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">You are not alone.</strong> These
          resources are real, staffed by trained people who care. If you are in
          immediate danger, please call your local emergency number. It is always
          okay to ask for help.
        </p>
      </div>
    </div>
  )
}
