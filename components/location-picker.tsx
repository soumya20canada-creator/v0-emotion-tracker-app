"use client"

import { REGIONS } from "@/lib/crisis-resources"
import { MapPin, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"

type LocationPickerProps = {
  selectedRegion: string | null
  onSelect: (regionId: string) => void
}

export function LocationPicker({ selectedRegion, onSelect }: LocationPickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = REGIONS.find((r) => r.id === selectedRegion)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border hover:bg-muted transition-colors cursor-pointer text-sm font-semibold text-foreground"
        aria-label="Select your location"
        aria-expanded={open}
      >
        <MapPin size={16} className="text-accent shrink-0" />
        <span className="truncate max-w-[120px]">
          {selected ? selected.flag === "GLOBAL" ? "Global" : selected.label : "Set location"}
        </span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-2xl bg-card border border-border shadow-lg z-50">
          <div className="p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-3 px-1">
              Where are you right now?
            </p>
            <div className="flex flex-col gap-1">
              {REGIONS.map((region) => {
                const isActive = region.id === selectedRegion
                return (
                  <button
                    key={region.id}
                    onClick={() => {
                      onSelect(region.id)
                      setOpen(false)
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive ? "bg-primary/10" : "hover:bg-secondary"
                    }`}
                  >
                    <span className="text-base w-7 text-center shrink-0 font-mono text-xs text-muted-foreground">
                      {region.flag}
                    </span>
                    <span className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                      {region.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
