export type CrisisHelpline = {
  name: string
  number: string
  description: string
  hours: string
  languages?: string[]
  sms?: string
  chat?: string
}

export type SupportGroup = {
  name: string
  description: string
  url?: string
  type: "community" | "peer" | "cultural" | "youth" | "online"
}

export type RegionResources = {
  id: string
  label: string
  flag: string
  helplines: CrisisHelpline[]
  supportGroups: SupportGroup[]
}

export const REGIONS: RegionResources[] = [
  {
    id: "us",
    label: "United States",
    flag: "US",
    helplines: [
      {
        name: "988 Suicide & Crisis Lifeline",
        number: "988",
        description: "Free, confidential support for people in distress",
        hours: "24/7",
        languages: ["English", "Spanish"],
        sms: "Text HOME to 741741",
        chat: "988lifeline.org/chat",
      },
      {
        name: "Crisis Text Line",
        number: "",
        description: "Text-based crisis support for when you can't talk",
        hours: "24/7",
        languages: ["English", "Spanish"],
        sms: "Text HELLO to 741741",
      },
      {
        name: "SAMHSA National Helpline",
        number: "1-800-662-4357",
        description: "Treatment referrals and information (free, confidential)",
        hours: "24/7",
        languages: ["English", "Spanish"],
      },
      {
        name: "Trevor Project (LGBTQ+ Youth)",
        number: "1-866-488-7386",
        description: "Crisis intervention for LGBTQ+ young people",
        hours: "24/7",
        sms: "Text START to 678-678",
        chat: "thetrevorproject.org/get-help",
      },
      {
        name: "National Alliance on Mental Illness (NAMI)",
        number: "1-800-950-NAMI (6264)",
        description: "Mental health information, referrals, and support",
        hours: "Mon-Fri, 10am-10pm ET",
        languages: ["English", "Spanish"],
      },
    ],
    supportGroups: [
      { name: "NAMI Support Groups", description: "Free peer-led support groups in every state", url: "nami.org/support-education", type: "peer" },
      { name: "Active Minds", description: "Mental health advocacy community for young adults", url: "activeminds.org", type: "youth" },
      { name: "7 Cups", description: "Free online chat with trained listeners", url: "7cups.com", type: "online" },
      { name: "Immigrant Hope", description: "Support and resources for immigrant communities", url: "immigranthope.org", type: "cultural" },
      { name: "To Write Love on Her Arms", description: "Community for people struggling with depression, self-harm, addiction", url: "twloha.com", type: "community" },
    ],
  },
  {
    id: "uk",
    label: "United Kingdom",
    flag: "GB",
    helplines: [
      {
        name: "Samaritans",
        number: "116 123",
        description: "Emotional support for anyone in distress",
        hours: "24/7",
        languages: ["English", "Welsh"],
      },
      {
        name: "Childline",
        number: "0800 1111",
        description: "Support for children and young people under 19",
        hours: "24/7",
        chat: "childline.org.uk/get-support",
      },
      {
        name: "Shout",
        number: "",
        description: "UK crisis text service",
        hours: "24/7",
        sms: "Text SHOUT to 85258",
      },
      {
        name: "CALM (Campaign Against Living Miserably)",
        number: "0800 58 58 58",
        description: "Support for men in crisis",
        hours: "5pm-midnight daily",
        chat: "thecalmzone.net/get-support",
      },
      {
        name: "Mind Infoline",
        number: "0300 123 3393",
        description: "Mental health information and support",
        hours: "Mon-Fri, 9am-6pm",
        languages: ["English"],
      },
    ],
    supportGroups: [
      { name: "Mind Side by Side", description: "Online community for mental health support", url: "mind.org.uk", type: "online" },
      { name: "Young Minds", description: "UK charity for children and young people's mental health", url: "youngminds.org.uk", type: "youth" },
      { name: "Refugee Council", description: "Support services for refugees and asylum seekers", url: "refugeecouncil.org.uk", type: "cultural" },
      { name: "Togetherall", description: "Free online mental health community", url: "togetherall.com", type: "peer" },
    ],
  },
  {
    id: "ca",
    label: "Canada",
    flag: "CA",
    helplines: [
      {
        name: "988 Suicide Crisis Helpline",
        number: "988",
        description: "National crisis helpline",
        hours: "24/7",
        languages: ["English", "French"],
        sms: "Text 988",
      },
      {
        name: "Kids Help Phone",
        number: "1-800-668-6868",
        description: "24/7 support for young people",
        hours: "24/7",
        languages: ["English", "French"],
        sms: "Text CONNECT to 686868",
      },
      {
        name: "Hope for Wellness Help Line",
        number: "1-855-242-3310",
        description: "For Indigenous peoples across Canada",
        hours: "24/7",
        languages: ["English", "French", "Cree", "Ojibway", "Inuktitut"],
      },
      {
        name: "Trans Lifeline",
        number: "1-877-330-6366",
        description: "Support for trans and gender diverse people",
        hours: "24/7",
      },
    ],
    supportGroups: [
      { name: "Canadian Mental Health Association", description: "Community mental health programs", url: "cmha.ca", type: "community" },
      { name: "Foundry", description: "Health and wellness services for ages 12-24", url: "foundrybc.ca", type: "youth" },
      { name: "Newcomers Centre", description: "Support for immigrants and refugees", url: "newcomerscentre.ca", type: "cultural" },
      { name: "Wellness Together Canada", description: "Free mental health and substance use support", url: "wellnesstogether.ca", type: "online" },
    ],
  },
  {
    id: "au",
    label: "Australia",
    flag: "AU",
    helplines: [
      {
        name: "Lifeline",
        number: "13 11 14",
        description: "24/7 crisis support and suicide prevention",
        hours: "24/7",
        sms: "Text 0477 13 11 14",
        chat: "lifeline.org.au/crisis-chat",
      },
      {
        name: "Kids Helpline",
        number: "1800 55 1800",
        description: "Support for young people aged 5-25",
        hours: "24/7",
        chat: "kidshelpline.com.au",
      },
      {
        name: "Beyond Blue",
        number: "1300 22 4636",
        description: "Anxiety, depression, and suicide prevention support",
        hours: "24/7",
        chat: "beyondblue.org.au/get-support",
      },
      {
        name: "QLife (LGBTQ+)",
        number: "1800 184 527",
        description: "Anonymous LGBTQ+ peer support",
        hours: "3pm-midnight daily",
      },
    ],
    supportGroups: [
      { name: "headspace", description: "Mental health support for young people 12-25", url: "headspace.org.au", type: "youth" },
      { name: "SANE Australia", description: "Support for people affected by complex mental health issues", url: "sane.org", type: "peer" },
      { name: "Settlement Services International", description: "Support for refugees and migrants", url: "ssi.org.au", type: "cultural" },
    ],
  },
  {
    id: "in",
    label: "India",
    flag: "IN",
    helplines: [
      {
        name: "iCall (TISS)",
        number: "9152987821",
        description: "Psychosocial helpline by Tata Institute",
        hours: "Mon-Sat, 8am-10pm IST",
        languages: ["English", "Hindi", "Marathi"],
      },
      {
        name: "Vandrevala Foundation",
        number: "1860-2662-345",
        description: "Mental health counseling",
        hours: "24/7",
        languages: ["English", "Hindi", "Gujarati", "Marathi", "Tamil", "Telugu"],
      },
      {
        name: "AASRA",
        number: "9820466726",
        description: "Crisis intervention and suicide prevention",
        hours: "24/7",
      },
      {
        name: "Snehi",
        number: "044-24640050",
        description: "Emotional support and crisis helpline",
        hours: "24/7",
        languages: ["English", "Hindi", "Tamil"],
      },
    ],
    supportGroups: [
      { name: "The Live Love Laugh Foundation", description: "Mental health awareness and support", url: "thelivelovelaughfoundation.org", type: "community" },
      { name: "YourDOST", description: "Online counseling and emotional wellness", url: "yourdost.com", type: "online" },
      { name: "Mpower", description: "Youth mental health programs", url: "mpowerminds.com", type: "youth" },
    ],
  },
  {
    id: "de",
    label: "Germany",
    flag: "DE",
    helplines: [
      {
        name: "Telefonseelsorge",
        number: "0800 111 0 111",
        description: "Free anonymous crisis support",
        hours: "24/7",
        languages: ["German"],
      },
      {
        name: "Telefonseelsorge (alternate)",
        number: "0800 111 0 222",
        description: "Free anonymous crisis support (second line)",
        hours: "24/7",
        languages: ["German"],
      },
      {
        name: "Nummer gegen Kummer (Youth)",
        number: "116 111",
        description: "Helpline for children and young people",
        hours: "Mon-Sat, 2pm-8pm",
        languages: ["German"],
      },
      {
        name: "Muslimisches Seelsorge Telefon",
        number: "030 443 509 821",
        description: "Crisis support for Muslim communities",
        hours: "Daily, various hours",
        languages: ["German", "Turkish", "Arabic"],
      },
    ],
    supportGroups: [
      { name: "Deutsche Depressionshilfe", description: "Depression support and information", url: "deutsche-depressionshilfe.de", type: "peer" },
      { name: "Caritas Migrationsberatung", description: "Counseling for immigrants and refugees", url: "caritas.de", type: "cultural" },
    ],
  },
  {
    id: "ph",
    label: "Philippines",
    flag: "PH",
    helplines: [
      {
        name: "National Center for Mental Health Crisis Hotline",
        number: "0917-899-8727",
        description: "Government mental health crisis line",
        hours: "24/7",
        languages: ["Filipino", "English"],
      },
      {
        name: "Hopeline PH",
        number: "0917-558-4673",
        description: "Crisis support and suicide prevention",
        hours: "24/7",
        languages: ["Filipino", "English"],
      },
      {
        name: "In Touch Crisis Line",
        number: "0917-800-1123",
        description: "Volunteer emotional and crisis support",
        hours: "24/7",
      },
    ],
    supportGroups: [
      { name: "Philippine Mental Health Association", description: "Community mental health programs", url: "pmha.org.ph", type: "community" },
      { name: "MindNation", description: "Mental health support for Filipino youth", url: "mindnation.com", type: "youth" },
    ],
  },
  {
    id: "mx",
    label: "Mexico",
    flag: "MX",
    helplines: [
      {
        name: "SAPTEL",
        number: "55 5259 8121",
        description: "Crisis intervention and psychological support",
        hours: "24/7",
        languages: ["Spanish"],
      },
      {
        name: "Linea de la Vida",
        number: "800 911 2000",
        description: "Addiction and mental health support",
        hours: "24/7",
        languages: ["Spanish"],
      },
    ],
    supportGroups: [
      { name: "Voz Pro Salud Mental", description: "Mental health advocacy and support", url: "vozprosaludmental.org.mx", type: "community" },
    ],
  },
  {
    id: "ng",
    label: "Nigeria",
    flag: "NG",
    helplines: [
      {
        name: "SURPIN (Suicide Research and Prevention Initiative)",
        number: "+234 806 210 6493",
        description: "Suicide prevention and crisis support",
        hours: "Mon-Fri, 8am-5pm WAT",
        languages: ["English"],
      },
      {
        name: "Mental Health Foundation Nigeria",
        number: "+234 809 111 6264",
        description: "Mental health support and referrals",
        hours: "Mon-Fri, 9am-5pm WAT",
      },
    ],
    supportGroups: [
      { name: "She Writes Woman", description: "Mental health advocacy and community support", url: "shewriteswoman.org", type: "community" },
      { name: "Mentally Aware Nigeria Initiative", description: "Youth mental health awareness", url: "mentallyaware.org", type: "youth" },
    ],
  },
  {
    id: "global",
    label: "Other / Global",
    flag: "GLOBAL",
    helplines: [
      {
        name: "International Association for Suicide Prevention",
        number: "",
        description: "Find crisis centers worldwide",
        hours: "Varies by center",
        chat: "iasp.info/resources/Crisis_Centres",
      },
      {
        name: "Befrienders Worldwide",
        number: "",
        description: "Emotional support in 39 countries",
        hours: "Varies by center",
        chat: "befrienders.org",
      },
      {
        name: "Crisis Text Line (International)",
        number: "",
        description: "Text-based crisis support in US, UK, Canada, Ireland",
        hours: "24/7",
        sms: "crisistextline.org for local keyword",
      },
    ],
    supportGroups: [
      { name: "7 Cups", description: "Free online emotional support chat", url: "7cups.com", type: "online" },
      { name: "TalkLife", description: "Peer support app for young people worldwide", url: "talklife.com", type: "youth" },
      { name: "Refugees Welcome", description: "International community for refugee support", url: "refugees-welcome.net", type: "cultural" },
    ],
  },
]

export function getRegionById(id: string): RegionResources | undefined {
  return REGIONS.find((r) => r.id === id)
}
