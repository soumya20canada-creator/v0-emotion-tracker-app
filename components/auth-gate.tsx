"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { signUpWithPassword, signInWithPassword, resetPassword, signInWithGoogle } from "@/lib/auth"
import { getProfile, createProfile } from "@/lib/profile"
import type { Profile } from "@/lib/profile"
import { PronunciationGuide } from "@/components/pronunciation-guide"

type Step = "signin" | "signup" | "forgot" | "forgot-sent"

type PasswordStrength = {
  score: number
  label: string
  color: string
  checks: { label: string; met: boolean }[]
}

function getPasswordStrength(pw: string): PasswordStrength {
  const checks = [
    { label: "At least 8 characters", met: pw.length >= 8 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(pw) },
    { label: "At least one number", met: /[0-9]/.test(pw) },
    { label: "At least one special character", met: /[^A-Za-z0-9]/.test(pw) },
  ]
  const score = checks.filter((c) => c.met).length
  const labels = ["", "Weak", "Fair", "Good", "Strong"]
  const colors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"]
  return { score, label: labels[score] ?? "", color: colors[score] ?? "#EF4444", checks }
}

type AuthGateProps = {
  onAuthenticated: (profile: Profile, isNewUser: boolean) => void
}

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [step, setStep] = useState<Step>("signin")

  // Shared fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Signup-only
  const [firstName, setFirstName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)

  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pwStrength = getPasswordStrength(password)

  function reset() {
    setError(null)
    setPassword("")
    setConfirmPassword("")
    setShowPassword(false)
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError(null)
    const { error } = await signInWithGoogle()
    setGoogleLoading(false)
    if (error) setError("Could not sign in with Google. Please try again.")
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError(null)
    const { user, error } = await signInWithPassword(email.trim().toLowerCase(), password)
    setLoading(false)
    if (error || !user) {
      setError("We could not sign you in. Please check your email and password.")
      return
    }
    const existing = await getProfile(user.id)
    if (existing) {
      onAuthenticated(existing, false)
    } else {
      // First time — create profile with email as placeholder name
      const name = user.email?.split("@")[0] ?? "Friend"
      const profile = await createProfile(user.id, user.email ?? "", name)
      if (profile) onAuthenticated(profile, true)
      else setError("Could not load your profile. Please try again.")
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !email.trim() || !password) return
    if (pwStrength.score < 2) {
      setError("Please choose a stronger password.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.")
      return
    }
    setLoading(true)
    setError(null)
    const { user, error } = await signUpWithPassword(email.trim().toLowerCase(), password)
    setLoading(false)
    if (error || !user) {
      if (error?.includes("already registered")) {
        setError("An account already exists with this email. Please sign in instead.")
      } else {
        setError("Something went wrong. Please try again.")
      }
      return
    }
    const profile = await createProfile(user.id, user.email ?? email, firstName.trim())
    if (profile) onAuthenticated(profile, true)
    else setError("Account created but could not load profile. Please sign in.")
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const { error } = await resetPassword(email.trim().toLowerCase())
    setLoading(false)
    if (error) {
      setError("Could not send the reset link. Please check the email address.")
      return
    }
    setStep("forgot-sent")
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background overflow-y-auto py-8 px-5">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-accent/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm flex flex-col items-center gap-8">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <BhavaLotus size={68} />
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <h1
                className="text-5xl tracking-wide leading-none"
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
              <span
                className="text-3xl leading-none"
                style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                  background: "linear-gradient(135deg, #C9A84C 0%, #F5D77E 50%, #C9A84C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                · भाव
              </span>
              <PronunciationGuide size="sm" />
            </div>
            <p className="text-base text-muted-foreground italic tracking-wide">
              the felt sense of being
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full bg-card rounded-3xl p-7 shadow-[0_8px_40px_rgba(0,0,0,0.10)] border border-border flex flex-col gap-5">

          {/* ── Sign In ── */}
          {step === "signin" && (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
                <p className="text-base text-muted-foreground mt-1 leading-relaxed">
                  Sign in to continue your journey.
                </p>
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                style={{ minHeight: 48 }}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border-2 border-border bg-background text-foreground font-semibold text-base hover:bg-muted transition-colors disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <GoogleIcon />
                {googleLoading ? "Redirecting..." : "Continue with Google"}
              </button>

              <Divider />

              <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="signin-email" className="text-sm font-semibold text-foreground">
                    Email address
                  </label>
                  <input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    style={{ minHeight: 48 }}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-base"
                    placeholder="you@email.com"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="signin-password" className="text-sm font-semibold text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      style={{ minHeight: 48 }}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-base"
                      placeholder="Your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={{ minWidth: 44, minHeight: 44 }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground hover:text-foreground transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer" style={{ minHeight: 44 }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-foreground">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { reset(); setStep("forgot") }}
                    style={{ minHeight: 44 }}
                    className="text-sm text-primary hover:underline transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
                  >
                    Forgot your password?
                  </button>
                </div>

                {error && (
                  <p className="text-sm text-destructive text-center" role="alert">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim() || !password}
                  style={{ minHeight: 52, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
                  className="w-full rounded-2xl font-bold text-base transition-all duration-200 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {loading ? "Signing in..." : "Log in"}
                </button>
              </form>

              <p className="text-sm text-muted-foreground text-center">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => { reset(); setStep("signup") }}
                  className="text-primary font-semibold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                >
                  Register
                </button>
              </p>
            </>
          )}

          {/* ── Sign Up ── */}
          {step === "signup" && (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
                <p className="text-base text-muted-foreground mt-1 leading-relaxed">
                  A safe, private space for your emotions.
                </p>
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                style={{ minHeight: 48 }}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border-2 border-border bg-background text-foreground font-semibold text-base hover:bg-muted transition-colors disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <GoogleIcon />
                {googleLoading ? "Redirecting..." : "Continue with Google"}
              </button>

              <Divider />

              <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="signup-firstname" className="text-sm font-semibold text-foreground">
                    First name
                  </label>
                  <input
                    id="signup-firstname"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoFocus
                    autoComplete="given-name"
                    style={{ minHeight: 48 }}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-base"
                    placeholder="e.g. Soumya"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="signup-email" className="text-sm font-semibold text-foreground">
                    Email address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={{ minHeight: 48 }}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-base"
                    placeholder="you@email.com"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="signup-password" className="text-sm font-semibold text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null) }}
                      required
                      autoComplete="new-password"
                      style={{ minHeight: 48 }}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-base"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={{ minWidth: 44, minHeight: 44 }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground hover:text-foreground transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {password && (
                    <div className="flex flex-col gap-2 mt-1" aria-live="polite" aria-label="Password strength">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${(pwStrength.score / 4) * 100}%`, background: pwStrength.color }}
                          />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: pwStrength.color, minWidth: 40 }}>
                          {pwStrength.label}
                        </span>
                      </div>
                      <ul className="flex flex-col gap-0.5" aria-label="Password requirements">
                        {pwStrength.checks.map((c) => (
                          <li key={c.label} className="flex items-center gap-2 text-sm">
                            <span
                              className={c.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}
                              aria-hidden="true"
                            >
                              {c.met ? "✓" : "○"}
                            </span>
                            <span className={c.met ? "text-foreground" : "text-muted-foreground"}>
                              {c.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="signup-confirm" className="text-sm font-semibold text-foreground">
                    Confirm password
                  </label>
                  <input
                    id="signup-confirm"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(null) }}
                    required
                    autoComplete="new-password"
                    style={{ minHeight: 48 }}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-base"
                    placeholder="Confirm your password"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive text-center" role="alert">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !firstName.trim() || !email.trim() || !password || !confirmPassword}
                  style={{ minHeight: 52, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
                  className="w-full rounded-2xl font-bold text-base transition-all duration-200 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {loading ? "Creating your account..." : "Create Account"}
                </button>
              </form>

              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { reset(); setStep("signin") }}
                  className="text-primary font-semibold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                >
                  Log in
                </button>
              </p>
            </>
          )}

          {/* ── Forgot password ── */}
          {step === "forgot" && (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Reset your password</h2>
                <p className="text-base text-muted-foreground mt-1 leading-relaxed">
                  Enter your email and we will send you a link to create a new password.
                </p>
              </div>
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="forgot-email" className="text-sm font-semibold text-foreground">
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    style={{ minHeight: 48 }}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-base"
                    placeholder="you@email.com"
                  />
                </div>
                {error && <p className="text-sm text-destructive text-center" role="alert">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  style={{ minHeight: 52, background: "linear-gradient(135deg, #C9A84C, #F5D77E, #C9A84C)", color: "#3B1F00" }}
                  className="w-full rounded-2xl font-bold text-base transition-all duration-200 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
              <button
                type="button"
                onClick={() => { reset(); setStep("signin") }}
                style={{ minHeight: 44 }}
                className="text-sm text-muted-foreground text-center hover:text-foreground transition cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
              >
                Back to sign in
              </button>
            </>
          )}

          {/* ── Forgot sent ── */}
          {step === "forgot-sent" && (
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center" aria-hidden="true">
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Check your inbox</h2>
                <p className="text-base text-muted-foreground mt-2 leading-relaxed">
                  We sent a reset link to <strong>{email}</strong>. It is valid for one hour.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { reset(); setStep("signin") }}
                style={{ minHeight: 44 }}
                className="text-sm text-muted-foreground hover:text-foreground transition cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground text-center px-4 leading-relaxed">
          Bhava is a safe, private space. Your feelings belong to you.
        </p>
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="flex-1 h-px bg-border" />
      <span className="text-sm text-muted-foreground font-medium px-1">or</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function BhavaLotus({ size = 68 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="gold-authv2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="50%" stopColor="#F5D77E" />
          <stop offset="100%" stopColor="#C9A84C" />
        </linearGradient>
        <filter id="glow-authv2">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter="url(#glow-authv2)">
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-authv2)" opacity="0.9" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-authv2)" opacity="0.9" transform="rotate(45 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-authv2)" opacity="0.9" transform="rotate(90 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-authv2)" opacity="0.9" transform="rotate(135 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-authv2)" opacity="0.9" transform="rotate(180 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-authv2)" opacity="0.9" transform="rotate(225 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-authv2)" opacity="0.9" transform="rotate(270 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-authv2)" opacity="0.9" transform="rotate(315 50 50)" />
        <circle cx="50" cy="50" r="10" fill="url(#gold-authv2)" />
        <circle cx="50" cy="50" r="5" fill="#FFF8E7" opacity="0.8" />
      </g>
    </svg>
  )
}
