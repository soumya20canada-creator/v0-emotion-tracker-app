"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Eye, EyeOff, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { updateProfile, getOnboardingSessions, deleteAccount, type Profile } from "@/lib/profile"
import { updatePassword } from "@/lib/auth"
import { IDENTITY_OPTIONS, GENDER_OPTIONS, PRONOUN_OPTIONS, COUNTRIES, type OnboardingSession } from "@/lib/onboarding-data"

type AccountSettingsProps = {
  profile: Profile
  onClose: () => void
  onProfileUpdate: (updates: Partial<Profile>) => void
  onAccountDeleted: () => void
}

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
  return { score, label: labels[score] || "", color: colors[score] || "#EF4444", checks }
}

export function AccountSettings({ profile, onClose, onProfileUpdate, onAccountDeleted }: AccountSettingsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [sessions, setSessions] = useState<OnboardingSession[]>([])
  const [sessionsLoaded, setSessionsLoaded] = useState(false)

  // Name / email
  const [firstName, setFirstName] = useState(profile.first_name ?? profile.display_name ?? "")
  const [email] = useState(profile.email)

  // Password
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  // Identity
  const [identity, setIdentity] = useState<string[]>(profile.identity_selections ?? [])
  const [gender, setGender] = useState<string[]>(profile.gender_identity ?? [])
  const [pronouns, setPronouns] = useState(profile.pronouns ?? "")

  // Country
  const [country, setCountry] = useState(profile.country ?? "")

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const pwStrength = getPasswordStrength(newPw)

  function toggle<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
  }

  function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    const open = activeSection === id
    return (
      <div className="border border-border rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setActiveSection(open ? null : id)}
          aria-expanded={open}
          aria-controls={`section-${id}`}
          style={{ minHeight: 56 }}
          className="w-full flex items-center justify-between px-5 py-4 text-left bg-card hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
        >
          <span className="text-base font-semibold text-foreground">{title}</span>
          {open ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
        </button>
        {open && (
          <div id={`section-${id}`} className="px-5 pb-6 pt-4 bg-card flex flex-col gap-4 border-t border-border">
            {children}
          </div>
        )}
      </div>
    )
  }

  async function saveName() {
    setSaving(true)
    await updateProfile(profile.id, { first_name: firstName, display_name: firstName })
    onProfileUpdate({ first_name: firstName, display_name: firstName })
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError(null)
    if (pwStrength.score < 3) { setPwError("Please choose a stronger password."); return }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return }
    setSaving(true)
    const { error } = await updatePassword(newPw)
    setSaving(false)
    if (error) { setPwError("Could not update password. Please try again."); return }
    setPwSuccess(true)
    setNewPw("")
    setConfirmPw("")
    setTimeout(() => setPwSuccess(false), 3000)
  }

  async function saveIdentity() {
    setSaving(true)
    await updateProfile(profile.id, { identity_selections: identity, gender_identity: gender, pronouns })
    onProfileUpdate({ identity_selections: identity, gender_identity: gender, pronouns })
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  async function saveCountry() {
    setSaving(true)
    await updateProfile(profile.id, { country })
    onProfileUpdate({ country })
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  async function loadSessions() {
    if (sessionsLoaded) return
    const data = await getOnboardingSessions(profile.id)
    setSessions(data)
    setSessionsLoaded(true)
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    await deleteAccount(profile.id)
    onAccountDeleted()
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-background overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-5 py-3" style={{ minHeight: 60 }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to app"
            style={{ minWidth: 44, minHeight: 44 }}
            className="flex items-center justify-center rounded-xl hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-foreground">Account Settings</h1>
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-8 flex flex-col gap-4">

        {/* Name */}
        <Section id="name" title="Update your name">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="first-name" className="text-sm font-semibold text-foreground">
              First name
            </label>
            <input
              id="first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{ minHeight: 44 }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base transition"
            />
          </div>
          <button
            type="button"
            onClick={saveName}
            disabled={saving || !firstName.trim()}
            style={{ minHeight: 44 }}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring self-start"
          >
            {saving ? "Saving..." : saveSuccess ? "Saved" : "Save"}
          </button>
        </Section>

        {/* Email */}
        <Section id="email" title="Email address">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Current email</label>
            <p className="text-base text-foreground px-4 py-3 rounded-xl border border-border bg-muted/40">
              {email}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To change your email address, please contact support. Email changes require verification for your security.
            </p>
          </div>
        </Section>

        {/* Password */}
        <Section id="password" title="Update password">
          <form onSubmit={savePassword} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="new-password" className="text-sm font-semibold text-foreground">
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPw ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => { setNewPw(e.target.value); setPwError(null) }}
                  autoComplete="new-password"
                  style={{ minHeight: 44 }}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  style={{ minWidth: 44, minHeight: 44 }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground hover:text-foreground transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {newPw && (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${(pwStrength.score / 4) * 100}%`, background: pwStrength.color }}
                      />
                    </div>
                    <span className="text-sm font-medium" style={{ color: pwStrength.color, minWidth: 44 }}>
                      {pwStrength.label}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1" aria-label="Password requirements">
                    {pwStrength.checks.map((c) => (
                      <li key={c.label} className="flex items-center gap-2 text-sm">
                        <span
                          className={c.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}
                          aria-hidden="true"
                        >
                          {c.met ? "✓" : "○"}
                        </span>
                        <span className={c.met ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm-password" className="text-sm font-semibold text-foreground">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type={showPw ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                autoComplete="new-password"
                style={{ minHeight: 44 }}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base transition"
              />
            </div>

            {pwError && <p className="text-sm text-destructive" role="alert">{pwError}</p>}
            {pwSuccess && <p className="text-sm text-green-600 dark:text-green-400" role="status">Password updated successfully.</p>}

            <button
              type="submit"
              disabled={saving || !newPw || !confirmPw}
              style={{ minHeight: 44 }}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring self-start"
            >
              {saving ? "Updating..." : "Update password"}
            </button>
          </form>
        </Section>

        {/* Country */}
        <Section id="country" title="Update country">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-country" className="text-sm font-semibold text-foreground">
              Country you are living in
            </label>
            <select
              id="settings-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{ minHeight: 44 }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base transition"
            >
              <option value="">Choose a country...</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={saveCountry}
            disabled={saving}
            style={{ minHeight: 44 }}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring self-start"
          >
            {saving ? "Saving..." : saveSuccess ? "Saved" : "Save"}
          </button>
        </Section>

        {/* Identity */}
        <Section id="identity" title="Update identity">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-base font-semibold text-foreground mb-2">I am...</p>
              <div className="flex flex-col gap-2" role="group" aria-label="Identity options">
                {IDENTITY_OPTIONS.map((opt) => (
                  <ToggleRow
                    key={opt.id}
                    label={opt.label}
                    checked={identity.includes(opt.id)}
                    onToggle={() => setIdentity(toggle(identity, opt.id))}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-base font-semibold text-foreground mb-2">Gender identity</p>
              <div className="flex flex-col gap-2" role="group" aria-label="Gender identity options">
                {GENDER_OPTIONS.map((opt) => (
                  <ToggleRow
                    key={opt.id}
                    label={opt.label}
                    checked={gender.includes(opt.id)}
                    onToggle={() => setGender(toggle(gender, opt.id))}
                  />
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="settings-pronouns" className="text-base font-semibold text-foreground block mb-2">
                Pronouns
              </label>
              <select
                id="settings-pronouns"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                style={{ minHeight: 44 }}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base transition"
              >
                <option value="">Prefer not to say</option>
                {PRONOUN_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={saveIdentity}
            disabled={saving}
            style={{ minHeight: 44 }}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring self-start"
          >
            {saving ? "Saving..." : saveSuccess ? "Saved" : "Save"}
          </button>
        </Section>

        {/* Session history */}
        <Section id="history" title="Session history">
          <button
            type="button"
            onClick={loadSessions}
            style={{ minHeight: 44 }}
            className="px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary self-start"
          >
            {sessionsLoaded ? "Refresh" : "Load session history"}
          </button>
          {sessionsLoaded && sessions.length === 0 && (
            <p className="text-base text-muted-foreground">No sessions recorded yet.</p>
          )}
          {sessionsLoaded && sessions.length > 0 && (
            <ul className="flex flex-col gap-4" aria-label="Past sessions">
              {sessions.map((s, i) => (
                <li key={s.id ?? i} className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col gap-2">
                  <time className="text-sm font-semibold text-muted-foreground" dateTime={s.created_at}>
                    {s.created_at ? new Date(s.created_at).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Unknown date"}
                  </time>
                  {s.support_preferences?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground">Support requested:</p>
                      <ul className="list-disc list-inside">
                        {s.support_preferences.map((sp) => (
                          <li key={sp} className="text-sm text-muted-foreground">{sp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {s.duration && (
                    <p className="text-sm text-muted-foreground">
                      Duration: <span className="text-foreground font-medium">{s.duration}</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Delete account */}
        <div className="border border-destructive/30 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm((s) => !s)}
            aria-expanded={showDeleteConfirm}
            style={{ minHeight: 56 }}
            className="w-full flex items-center justify-between px-5 py-4 text-left bg-card hover:bg-destructive/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={18} className="text-destructive" aria-hidden="true" />
              <span className="text-base font-semibold text-destructive">Delete account</span>
            </div>
            {showDeleteConfirm ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
          </button>
          {showDeleteConfirm && (
            <div className="px-5 pb-6 pt-4 bg-card flex flex-col gap-4 border-t border-destructive/20">
              <p className="text-base text-foreground leading-relaxed">
                This will permanently delete all your data from Bhava. This action cannot be undone.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All your check-ins, session history, points, and profile information will be removed.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ minHeight: 44 }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  style={{ minHeight: 44 }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 disabled:opacity-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                >
                  {deleteLoading ? "Deleting..." : "Yes, delete my account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <label
      style={{ minHeight: 44 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="w-5 h-5 rounded border-border accent-primary cursor-pointer"
        aria-label={label}
      />
      <span className="text-base text-foreground">{label}</span>
    </label>
  )
}
