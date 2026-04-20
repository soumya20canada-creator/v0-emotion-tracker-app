"use client"

import { useState } from "react"
import { ArrowLeft, Printer, Share2, Check } from "lucide-react"
import type { MonthlyReport } from "@/lib/monthly-report"

type MonthlyReportProps = {
  report: MonthlyReport
  onClose: () => void
}

const TIME_SENTENCES: Record<string, string> = {
  morning: "Mornings tended to hold the most.",
  afternoon: "Afternoons were the heaviest stretch.",
  evening: "Evenings were when it showed up most.",
  night: "Late hours carried the weight.",
}

function buildShareText(r: MonthlyReport): string {
  const lines: string[] = []
  lines.push(`Bhava — ${r.monthLabel}`)
  lines.push("")
  lines.push(r.narrative)
  lines.push("")
  lines.push(`Check-ins: ${r.totalCheckIns}`)
  lines.push(`Days active: ${r.daysActive}`)
  if (r.averageIntensity !== null) lines.push(`Average intensity: ${r.averageIntensity} / 5`)
  lines.push(`Actions completed: ${r.actionsCompleted}`)
  if (r.topEmotions.length > 0) {
    lines.push("")
    lines.push("Top feelings:")
    r.topEmotions.forEach((e) => lines.push(`  • ${e.label} (${e.count})`))
  }
  return lines.join("\n")
}

export function MonthlyReportView({ report, onClose }: MonthlyReportProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const text = buildShareText(report)
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({ title: `Your month — Bhava`, text })
        return
      }
    } catch {
      // user cancelled or share failed — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // noop
    }
  }

  function handlePrint() {
    if (typeof window !== "undefined") window.print()
  }

  const isEmpty = report.totalCheckIns === 0
  const topEmotionMax = report.topEmotions[0]?.count ?? 1

  return (
    <main className="min-h-dvh bg-background flex flex-col monthly-report-root">
      <style>{`
        @media print {
          .monthly-report-print-hide { display: none !important; }
          .monthly-report-root { background: #fff !important; }
          .monthly-report-card { border-color: #d4d4d4 !important; background: #fff !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <header className="monthly-report-print-hide sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3 gap-3">
          <button
            onClick={onClose}
            style={{ minWidth: 44, minHeight: 44 }}
            className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Back to My Space"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground">Your month</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              style={{ minWidth: 40, minHeight: 40 }}
              className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Print"
            >
              <Printer size={18} className="text-foreground" />
            </button>
            <button
              onClick={handleShare}
              style={{ minWidth: 40, minHeight: 40 }}
              className="rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Share"
            >
              {copied ? <Check size={18} className="text-primary" /> : <Share2 size={18} className="text-foreground" />}
            </button>
          </div>
        </div>
        {copied && (
          <div className="max-w-lg mx-auto px-5 pb-2">
            <p className="text-xs text-primary font-semibold">Copied to clipboard</p>
          </div>
        )}
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">A look back</p>
          <h3 className="text-3xl font-extrabold text-foreground">{report.monthLabel}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">
            A quiet look back at {report.monthLabel}. Keep it, print it, or let it go.
          </p>
        </div>

        {isEmpty ? (
          <div className="monthly-report-card p-5 rounded-2xl bg-card border border-border">
            <p className="text-base text-foreground leading-relaxed">
              No check-ins in {report.monthLabel}. That's okay — some months are quiet.
              You don't owe anyone a record of your feelings.
            </p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-3">
              <StatTile label="Check-ins" value={report.totalCheckIns.toString()} />
              <StatTile label="Days active" value={report.daysActive.toString()} />
              <StatTile label="Actions completed" value={report.actionsCompleted.toString()} />
              <StatTile
                label="Avg. intensity"
                value={report.averageIntensity !== null ? `${report.averageIntensity} / 5` : "—"}
              />
            </section>

            {report.topEmotions.length > 0 && (
              <section className="monthly-report-card flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  What came up most
                </h4>
                <div className="flex flex-col gap-2">
                  {report.topEmotions.map((e) => {
                    const pct = Math.round((e.count / topEmotionMax) * 100)
                    return (
                      <div key={e.emotionId} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">{e.label}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {e.count} {e.count === 1 ? "time" : "times"}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {(report.peakDayOfWeek || report.peakTimeOfDay || report.topContextTags.length > 0) && (
              <section className="monthly-report-card flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Patterns
                </h4>
                <ul className="flex flex-col gap-2 text-sm text-foreground leading-relaxed">
                  {report.peakDayOfWeek && (
                    <li>Most feelings landed on <span className="font-semibold">{report.peakDayOfWeek}s</span>.</li>
                  )}
                  {report.peakTimeOfDay && (
                    <li>{TIME_SENTENCES[report.peakTimeOfDay]}</li>
                  )}
                  {report.topContextTags.length > 0 && (
                    <li>
                      Often showed up around{" "}
                      <span className="font-semibold">
                        {report.topContextTags.map((t) => t.tag).join(", ")}
                      </span>
                      .
                    </li>
                  )}
                  {report.crisisModeUsed > 0 && (
                    <li>
                      You reached for grounding {report.crisisModeUsed}{" "}
                      {report.crisisModeUsed === 1 ? "time" : "times"} when things got loud.
                    </li>
                  )}
                </ul>
              </section>
            )}

            <section className="monthly-report-card p-5 rounded-2xl bg-secondary/60 border border-border">
              <p className="text-base text-foreground leading-relaxed">{report.narrative}</p>
            </section>
          </>
        )}

        <p className="text-xs text-muted-foreground/80 text-center italic leading-relaxed mt-2">
          Private. Generated on your device. We never see it.
        </p>
      </div>
    </main>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="monthly-report-card flex flex-col gap-1 p-4 rounded-2xl bg-card border border-border">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label}</span>
      <span className="text-2xl font-extrabold text-foreground tabular-nums">{value}</span>
    </div>
  )
}
