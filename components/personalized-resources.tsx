"use client"

import { ExternalLink } from "lucide-react"

type PersonalizedResourcesProps = {
  supportPreferences: string[]
  country: string | null
}

type Resource = {
  title: string
  description: string
  action: string
  href?: string
  category: string
}

const COUNTRY_RESOURCES: Record<string, Resource[]> = {
  Canada: [
    { title: "Crisis Services Canada", description: "24/7 crisis support by phone or text.", action: "Call 1-833-456-4566", href: "tel:18334564566", category: "crisis" },
    { title: "Immigration, Refugees and Citizenship Canada", description: "Settlement support and newcomer services.", action: "Learn more", href: "https://www.canada.ca/en/immigration-refugees-citizenship.html", category: "community" },
    { title: "Psychology Today — Canada", description: "Find a therapist near you.", action: "Search therapists", href: "https://www.psychologytoday.com/ca/therapists", category: "therapist" },
    { title: "Wellness Together Canada", description: "Free mental health and substance use support.", action: "Access free support", href: "https://www.wellnesstogether.ca", category: "wellness" },
  ],
  "United States": [
    { title: "988 Suicide and Crisis Lifeline", description: "Call or text 988 for crisis support.", action: "Call 988", href: "tel:988", category: "crisis" },
    { title: "SAMHSA National Helpline", description: "Free, confidential treatment referral and information.", action: "Call 1-800-662-4357", href: "tel:18006624357", category: "crisis" },
    { title: "Psychology Today — USA", description: "Find a therapist, psychiatrist, or counsellor near you.", action: "Search therapists", href: "https://www.psychologytoday.com/us/therapists", category: "therapist" },
    { title: "NAMI — National Alliance on Mental Illness", description: "Local groups, education, and peer support.", action: "Find support", href: "https://www.nami.org", category: "community" },
  ],
  "United Kingdom": [
    { title: "Samaritans", description: "Free, 24/7 emotional support for anyone struggling.", action: "Call 116 123", href: "tel:116123", category: "crisis" },
    { title: "Mind UK", description: "Mental health support and local Mind services.", action: "Find support", href: "https://www.mind.org.uk", category: "wellness" },
    { title: "NHS — Find a therapist", description: "NHS-funded talking therapies in England.", action: "Self-refer", href: "https://www.nhs.uk/mental-health/talking-therapies-medicine-treatments/talking-therapies-and-counselling/nhs-talking-therapies/", category: "therapist" },
  ],
  Australia: [
    { title: "Lifeline Australia", description: "24/7 crisis support and suicide prevention.", action: "Call 13 11 14", href: "tel:131114", category: "crisis" },
    { title: "Beyond Blue", description: "Support for anxiety, depression, and mental wellbeing.", action: "Get support", href: "https://www.beyondblue.org.au", category: "wellness" },
    { title: "Head to Health", description: "Australian Government mental health resources.", action: "Explore services", href: "https://www.headtohealth.gov.au", category: "therapist" },
  ],
  India: [
    { title: "iCall", description: "Psychosocial helpline by TISS — counselling and support.", action: "Call 9152987821", href: "tel:9152987821", category: "crisis" },
    { title: "Vandrevala Foundation", description: "24/7 mental health helpline.", action: "Call 1860-2662-345", href: "tel:18602662345", category: "crisis" },
    { title: "The Live Love Laugh Foundation", description: "Mental health awareness and resources in India.", action: "Learn more", href: "https://www.thelivelovelaughfoundation.org", category: "wellness" },
  ],
  Philippines: [
    { title: "In Touch Community Services", description: "24/7 crisis hotline.", action: "Call (02) 8893-7603", href: "tel:028893760", category: "crisis" },
    { title: "Natasha Goulbourn Foundation", description: "Depression awareness and suicide prevention.", action: "Learn more", href: "https://www.ngf.com.ph", category: "wellness" },
  ],
}

const DEFAULT_RESOURCES: Resource[] = [
  { title: "Find Help Now", description: "International Association for Suicide Prevention — global crisis centres directory.", action: "Find a crisis centre", href: "https://www.iasp.info/resources/Crisis_Centres/", category: "crisis" },
  { title: "Open Path Collective", description: "Affordable therapy ($30–$80/session) for those in need.", action: "Search therapists", href: "https://openpathcollective.org", category: "therapist" },
  { title: "7 Cups", description: "Free online chat with trained listeners, 24/7.", action: "Talk to someone", href: "https://www.7cups.com", category: "community" },
  { title: "Headspace", description: "Guided meditation and mindfulness for stress and anxiety.", action: "Explore free content", href: "https://www.headspace.com", category: "express" },
]

function getResourcesForSupport(supportPrefs: string[], country: string | null): Resource[] {
  const countryResources = country ? (COUNTRY_RESOURCES[country] ?? DEFAULT_RESOURCES) : DEFAULT_RESOURCES

  if (supportPrefs.length === 0 || supportPrefs.includes("not-sure")) {
    return countryResources.slice(0, 3)
  }

  const filtered: Resource[] = []
  const prefSet = new Set(supportPrefs)

  if (prefSet.has("figure-out-feelings") || prefSet.has("express")) {
    filtered.push({
      title: "Guided Emotional Check-In",
      description: "Use the emotion wheel below to explore what you are feeling right now — one step at a time.",
      action: "Start check-in",
      category: "express",
    })
  }

  if (prefSet.has("do-something")) {
    filtered.push({
      title: "Grounding Techniques",
      description: "The 5-4-3-2-1 technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This grounds you in the present moment.",
      action: "Try the emotion tracker",
      category: "do-something",
    })
  }

  if (prefSet.has("therapist")) {
    const therapistResources = countryResources.filter((r) => r.category === "therapist")
    filtered.push(...(therapistResources.length > 0 ? therapistResources : DEFAULT_RESOURCES.filter((r) => r.category === "therapist")))
  }

  if (prefSet.has("community")) {
    const communityResources = countryResources.filter((r) => r.category === "community")
    filtered.push(...(communityResources.length > 0 ? communityResources : DEFAULT_RESOURCES.filter((r) => r.category === "community")))
  }

  if (prefSet.has("crisis") || prefSet.has("do-something")) {
    const crisisResources = countryResources.filter((r) => r.category === "crisis")
    if (crisisResources.length > 0) filtered.push(crisisResources[0])
  }

  if (filtered.length === 0) {
    return countryResources.slice(0, 3)
  }

  // Deduplicate by title
  const seen = new Set<string>()
  return filtered.filter((r) => {
    if (seen.has(r.title)) return false
    seen.add(r.title)
    return true
  })
}

export function PersonalizedResources({ supportPreferences, country }: PersonalizedResourcesProps) {
  const resources = getResourcesForSupport(supportPreferences, country)

  if (resources.length === 0) return null

  return (
    <section aria-labelledby="resources-heading" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id="resources-heading" className="text-xl font-bold text-foreground">
          Here for you right now
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          Based on what you shared, these might help.
          {country && <span className="text-sm"> Resources for {country}.</span>}
        </p>
      </div>

      <ul className="flex flex-col gap-3" aria-label="Recommended resources">
        {resources.map((r, i) => (
          <li key={i}>
            <ResourceCard resource={r} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3 shadow-sm">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-foreground">{resource.title}</h3>
        <p className="text-base text-muted-foreground leading-relaxed">{resource.description}</p>
      </div>
      {resource.href ? (
        <a
          href={resource.href}
          target={resource.href.startsWith("tel:") || resource.href.startsWith("/") ? "_self" : "_blank"}
          rel="noopener noreferrer"
          style={{ minHeight: 44 }}
          className="self-start flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${resource.action} — ${resource.title}`}
        >
          {resource.action}
          {!resource.href.startsWith("tel:") && (
            <ExternalLink size={14} aria-hidden="true" />
          )}
        </a>
      ) : (
        <div
          style={{ minHeight: 44 }}
          className="self-start flex items-center px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold"
        >
          {resource.action}
        </div>
      )}
    </div>
  )
}
