"use client"

import { useState } from "react"
import { signUpWithPassword, signInWithPassword } from "@/lib/auth"
import { getProfile, createProfile, isUsernameTaken } from "@/lib/profile"
import type { Profile } from "@/lib/profile"
import { Eye, EyeOff } from "lucide-react"

type Step = "welcome" | "signin" | "signup" | "profile"

type AuthGateProps = {
  onAuthenticated: (profile: Profile) => void
}

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [step, setStep] = useState<Step>("welcome")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError(null)
    const { user, error } = await signInWithPassword(email.trim().toLowerCase(), password)
    setLoading(false)
    if (error || !user) {
      setError("Couldn't sign you in — double-check your email and password.")
      return
    }
    const existing = await getProfile(user.id)
    if (existing) {
      onAuthenticated(existing)
    } else {
      setUserId(user.id)
      setStep("profile")
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setLoading(true)
    setError(null)
    const { user, error } = await signUpWithPassword(email.trim().toLowerCase(), password)
    setLoading(false)
    if (error || !user) {
      if (error?.includes("already registered")) {
        setError("That email already has an account — try signing in instead.")
      } else {
        setError("Something went wrong. Please try again.")
      }
      return
    }
    setUserId(user.id)
    setStep("profile")
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

  function reset() {
    setError(null)
    setPassword("")
    setShowPassword(false)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm mx-auto px-6 flex flex-col items-center gap-8">
        {/* Logo */}
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

          {/* ── Welcome ── */}
          {step === "welcome" && (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Welcome to Bhava 🌸</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Are you new here, or coming back?
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { reset(); setStep("signup") }}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
                >
                  I'm new here ✨
                </button>
                <button
                  onClick={() => { reset(); setStep("signin") }}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm border-2 border-primary/30 text-foreground hover:bg-muted transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  Welcome back 🌿
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                No verification email. You're in instantly.
              </p>
            </>
          )}

          {/* ── Sign in ── */}
          {step === "signin" && (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Welcome back 🌿</h2>
                <p className="text-sm text-muted-foreground mt-1">Sign in to your space.</p>
              </div>
              <form onSubmit={handleSignIn} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                    className="w-full px-4 py-3 pr-11 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email.trim() || !password}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
                >
                  {loading ? "Signing in…" : "Enter Bhava ✨"}
                </button>
              </form>
              <button
                onClick={() => { reset(); setStep("welcome") }}
                className="text-xs text-muted-foreground text-center hover:text-foreground transition cursor-pointer"
              >
                ← Back
              </button>
            </>
          )}

          {/* ── Sign up ── */}
          {step === "signup" && (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Create your space 🌸</h2>
                <p className="text-sm text-muted-foreground mt-1">Just an email and a password — you're in.</p>
              </div>
              <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (8+ characters)"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 pr-11 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email.trim() || password.length < 8}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
                >
                  {loading ? "Creating your space…" : "Continue →"}
                </button>
              </form>
              <button
                onClick={() => { reset(); setStep("welcome") }}
                className="text-xs text-muted-foreground text-center hover:text-foreground transition cursor-pointer"
              >
                ← Back
              </button>
            </>
          )}

          {/* ── Profile setup ── */}
          {step === "profile" && (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">You're in 🌺</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  One last thing — what shall we call you?
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
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" transform="rotate(45 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" transform="rotate(90 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" transform="rotate(135 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" transform="rotate(180 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" transform="rotate(225 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" transform="rotate(270 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-auth)" opacity="0.9" transform="rotate(315 50 50)" />
        <circle cx="50" cy="50" r="10" fill="url(#gold-auth)" />
        <circle cx="50" cy="50" r="5" fill="#FFF8E7" opacity="0.8" />
      </g>
    </svg>
  )
}
