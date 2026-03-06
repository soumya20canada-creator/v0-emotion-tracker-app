"use client"

import { useState } from "react"
import { signInWithOtp, verifyOtp } from "@/lib/auth"
import { getProfile, createProfile, isUsernameTaken } from "@/lib/profile"
import type { Profile } from "@/lib/profile"

type Step = "email" | "otp" | "profile"

type AuthGateProps = {
  onAuthenticated: (profile: Profile) => void
}

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const { error } = await signInWithOtp(email.trim().toLowerCase())
    setLoading(false)
    if (error) { setError("Something gentle went wrong. Try again?"); return }
    setStep("otp")
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length < 6) return
    setLoading(true)
    setError(null)
    const { user, error } = await verifyOtp(email.trim().toLowerCase(), otp.trim())
    if (error || !user) {
      setLoading(false)
      setError("That code didn't match. Check your inbox and try again.")
      return
    }
    setUserId(user.id)
    const existing = await getProfile(user.id)
    setLoading(false)
    if (existing) {
      onAuthenticated(existing)
    } else {
      setStep("profile")
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !displayName.trim() || !username.trim()) return
    setLoading(true)
    setError(null)
    const taken = await isUsernameTaken(username.trim().toLowerCase())
    if (taken) {
      setLoading(false)
      setError("That username is taken — try something uniquely you.")
      return
    }
    const profile = await createProfile(userId, email, username.trim().toLowerCase(), displayName.trim())
    setLoading(false)
    if (!profile) { setError("Couldn't save your profile. Try again?"); return }
    onAuthenticated(profile)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background">
      {/* Soft background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm mx-auto px-6 flex flex-col items-center gap-8">
        {/* Logo + wordmark */}
        <div className="flex flex-col items-center gap-3">
          <BhavaLotus size={72} />
          <div className="flex flex-col items-center gap-1">
            <h1
              className="text-5xl tracking-wide"
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                background: "linear-gradient(135deg, #C9A84C 0%, #F5D77E 50%, #C9A84C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Bhava
            </h1>
            <p className="text-sm text-muted-foreground italic tracking-widest">
              भाव · the felt sense of being
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full bg-card rounded-3xl p-7 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-border flex flex-col gap-5">
          {step === "email" && (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Welcome home 🌸</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Enter your email and we'll send you a gentle sign-in code.
                </p>
              </div>
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
                />
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
                >
                  {loading ? "Sending..." : "Send my code ✨"}
                </button>
              </form>
              <p className="text-xs text-muted-foreground text-center">
                No password needed. Your privacy is sacred here.
              </p>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Check your inbox 📬</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>
              <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="· · · · · ·"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-center text-2xl tracking-[0.5em] font-bold"
                />
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
                >
                  {loading ? "Verifying..." : "Enter Bhava ✨"}
                </button>
              </form>
              <button
                onClick={() => { setStep("email"); setOtp(""); setError(null) }}
                className="text-xs text-muted-foreground text-center hover:text-foreground transition cursor-pointer"
              >
                ← Use a different email
              </button>
            </>
          )}

          {step === "profile" && (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">You're in 🌺</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Let's set up your space. What shall we call you?
                </p>
              </div>
              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Your name or nickname
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Soumya"
                    maxLength={40}
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Choose a username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase())}
                      placeholder="yourname"
                      maxLength={30}
                      required
                      className="w-full pl-8 pr-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !displayName.trim() || !username.trim()}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
                >
                  {loading ? "Creating your space..." : "Begin my journey 🌸"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center px-4 leading-relaxed">
          Bhava is a safe, private space. Your feelings belong to you.
        </p>
      </div>
    </div>
  )
}

function BhavaLotus({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gold-auth" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="50%" stopColor="#F5D77E" />
          <stop offset="100%" stopColor="#C9A84C" />
        </linearGradient>
        <filter id="glow-auth">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter="url(#glow-auth)">
        {/* Outer petals */}
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" transform="rotate(45 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" transform="rotate(90 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" transform="rotate(135 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" transform="rotate(180 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" transform="rotate(225 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" transform="rotate(270 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" transform="rotate(315 50 50)" />
        {/* Center */}
        <circle cx="50" cy="50" r="10" fill="url(#gold-auth)" />
        <circle cx="50" cy="50" r="5" fill="#FFF8E7" opacity="0.8" />
      </g>
    </svg>
  )
}
