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

export type TherapistTag = "directory" | "low-cost" | "cultural" | "online" | "free" | "student" | "multilingual"
export type CommunityTag = "newcomer" | "diaspora" | "lgbtq" | "youth" | "women" | "faith" | "local-meetup" | "online"

export type TherapistResource = {
  name: string
  description: string
  url: string
  tags: TherapistTag[]
  note?: string
}

export type CommunityResource = {
  name: string
  description: string
  url: string
  tags: CommunityTag[]
  note?: string
}

export type LegalAidResource = {
  name: string
  description: string
  url: string
  note?: string
}

export const LEGAL_AID: Record<string, LegalAidResource[]> = {
  us: [
    { name: "Immigrant Legal Resource Center (ILRC)", description: "National nonprofit providing free immigration legal information, red-card materials, and directory of free/low-cost legal help.", url: "https://www.ilrc.org", note: "Free" },
    { name: "CLINIC (Catholic Legal Immigration Network)", description: "Directory of over 400 affiliate free/low-cost immigration legal services across the US.", url: "https://cliniclegal.org/find-help", note: "Free / sliding scale" },
    { name: "Informed Immigrant", description: "Plain-language guides on your rights, DACA, asylum, work permits — by community, in multiple languages.", url: "https://www.informedimmigrant.com", note: "Free" },
  ],
  uk: [
    { name: "Citizens Advice — Immigration", description: "Free confidential advice on visas, status, settled status, family reunification.", url: "https://www.citizensadvice.org.uk/immigration/", note: "Free" },
    { name: "JCWI (Joint Council for the Welfare of Immigrants)", description: "Legal help for complex immigration cases; campaigns on migrant rights.", url: "https://www.jcwi.org.uk", note: "Free / donation" },
    { name: "Right to Remain", description: "Toolkit for people navigating the UK asylum and immigration system — written with lived experience.", url: "https://righttoremain.org.uk", note: "Free" },
  ],
  canada: [
    { name: "CLEO (Community Legal Education Ontario)", description: "Plain-language legal information on immigration, refugee claims, and family sponsorship.", url: "https://www.cleo.on.ca/en/publications/topic/immigration-refugee-law", note: "Free" },
    { name: "Settlement.Org", description: "Free guide for newcomers to Ontario — legal, work, health, schools. Government-funded.", url: "https://settlement.org", note: "Free" },
    { name: "Canadian Council for Refugees", description: "National advocacy + referral network for refugees and vulnerable migrants.", url: "https://ccrweb.ca", note: "Free" },
  ],
  australia: [
    { name: "RACS (Refugee Advice & Casework Service)", description: "Free legal help for people seeking asylum and refugees in NSW.", url: "https://www.racs.org.au", note: "Free" },
    { name: "Legal Aid NSW — Immigration", description: "Free legal advice on visas, cancellations, detention, deportation for people who can't afford a lawyer.", url: "https://www.legalaid.nsw.gov.au/my-problem-is-about/my-immigration-status", note: "Free (income-tested)" },
    { name: "RACS National Referral (other states)", description: "Links to free immigration legal help in VIC, QLD, SA, WA.", url: "https://www.racs.org.au/legal-help-for-asylum-seekers-and-refugees", note: "Free" },
  ],
  india: [
    { name: "UNHCR India", description: "Support for refugees and asylum seekers in India — legal guidance, protection, registration.", url: "https://www.unhcr.org/in/", note: "Free" },
  ],
  germany: [
    { name: "Pro Asyl", description: "Legal counseling and advocacy for refugees and migrants in Germany.", url: "https://www.proasyl.de/en/", note: "Free" },
  ],
}

export function legalAidFor(regionId: string | null | undefined): LegalAidResource[] {
  if (!regionId) return []
  return LEGAL_AID[regionId] ?? []
}

export type RegionResources = {
  id: string
  label: string
  flag: string
  helplines: CrisisHelpline[]
  supportGroups: SupportGroup[]
  therapists: TherapistResource[]
  community: CommunityResource[]
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
    therapists: [
      { name: "Open Path Collective", description: "In-network therapists offering sessions at reduced rates to members.", url: "https://openpathcollective.org", tags: ["low-cost", "directory"], note: "$40–80 / session · one-time $65 membership" },
      { name: "Inclusive Therapists", description: "Directory centering marginalized and multicultural communities.", url: "https://www.inclusivetherapists.com", tags: ["directory", "cultural", "multilingual"], note: "Directory · fees vary" },
      { name: "Therapy for Black Girls", description: "Directory of Black women therapists and a podcast community.", url: "https://therapyforblackgirls.com", tags: ["directory", "cultural"], note: "Directory · fees vary" },
      { name: "Latinx Therapy", description: "Bilingual directory of Latinx mental health professionals.", url: "https://latinxtherapy.com", tags: ["directory", "cultural", "multilingual"], note: "Directory · fees vary" },
      { name: "Asian Mental Health Collective", description: "Directory of Asian and Asian-American therapists plus subsidy fund.", url: "https://www.asianmhc.org", tags: ["directory", "cultural"], note: "Subsidy fund for approved applicants" },
      { name: "National Queer & Trans Therapists of Color Network", description: "Directory of QTBIPOC-identified mental health practitioners.", url: "https://nqttcn.com/en/", tags: ["directory", "cultural"], note: "Some free-session programs" },
      { name: "SAMHSA Treatment Locator", description: "Federal search tool for confidential, free treatment referrals.", url: "https://findtreatment.gov", tags: ["free", "directory"], note: "Free" },
      { name: "Psychology Today US", description: "Largest US therapist directory, filter by insurance and specialty.", url: "https://www.psychologytoday.com/us/therapists", tags: ["directory"], note: "Directory · check insurance" },
      { name: "7 Cups", description: "Free trained listeners plus online therapy add-on.", url: "https://www.7cups.com", tags: ["free", "online"], note: "Peer support free · therapy from $150/mo" },
    ],
    community: [
      { name: "NAMI Local Affiliates", description: "Free peer-led support groups in every state.", url: "https://www.nami.org/findsupport", tags: ["local-meetup"] },
      { name: "International Institute of New England", description: "Newcomer services, English classes, community events.", url: "https://iine.org", tags: ["newcomer"] },
      { name: "Meetup — Mental Health", description: "Location-based groups and wellness meetups.", url: "https://www.meetup.com/find/?keywords=mental%20health", tags: ["local-meetup", "online"] },
      { name: "The Trevor Project Community", description: "Peer spaces for LGBTQ+ young people under 25.", url: "https://www.thetrevorproject.org/get-help/", tags: ["lgbtq", "youth"] },
      { name: "Sister Song", description: "Women of color reproductive justice and wellness community.", url: "https://www.sistersong.net", tags: ["women", "diaspora"] },
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
    therapists: [
      { name: "NHS Talking Therapies", description: "Free NHS-funded talking therapy — self-referral, no GP needed in most areas.", url: "https://www.nhs.uk/mental-health/talking-therapies-medicine-treatments/talking-therapies-and-counselling/nhs-talking-therapies/", tags: ["free"], note: "NHS covered" },
      { name: "BACP Therapist Directory", description: "Accredited UK counsellors and psychotherapists.", url: "https://www.bacp.co.uk/search/Therapists", tags: ["directory"], note: "Directory · typically £40–90/session" },
      { name: "BAATN", description: "Black, African and Asian Therapy Network — culturally-matched practitioners.", url: "https://www.baatn.org.uk", tags: ["directory", "cultural"], note: "Directory · fees vary · some low-cost" },
      { name: "Pink Therapy", description: "Directory of gender and sexual diversity-friendly therapists.", url: "https://www.pinktherapy.com", tags: ["directory", "cultural"], note: "Directory · fees vary" },
      { name: "Counselling Directory", description: "UK-wide search by issue, location, fee.", url: "https://www.counselling-directory.org.uk", tags: ["directory"], note: "Directory · filter by fee" },
      { name: "Student Minds", description: "UK student mental health charity with peer support and uni services guide.", url: "https://www.studentminds.org.uk", tags: ["student", "free"], note: "Free · students" },
    ],
    community: [
      { name: "Mind Local Branches", description: "Community groups, befriending, local wellbeing services.", url: "https://www.mind.org.uk/about-us/local-minds/", tags: ["local-meetup"] },
      { name: "Migrants Organise", description: "Community organisation by and for refugees and migrants.", url: "https://www.migrantsorganise.org", tags: ["newcomer"] },
      { name: "Refugee Council", description: "Casework, therapy groups, and community for refugees.", url: "https://www.refugeecouncil.org.uk", tags: ["newcomer"] },
      { name: "Meetup UK — Wellbeing", description: "Local wellness and support meetups.", url: "https://www.meetup.com/find/?location=gb&keywords=wellbeing", tags: ["local-meetup"] },
      { name: "Switchboard LGBT+", description: "LGBTQ+ listening line and community directory.", url: "https://switchboard.lgbt", tags: ["lgbtq"] },
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
    therapists: [
      { name: "Wellness Together Canada", description: "Free, government-funded counselling, coaching, and self-guided programs.", url: "https://www.wellnesstogether.ca", tags: ["free"], note: "Free · gov-funded" },
      { name: "BounceBack", description: "Free CBT-based coaching by phone in ON, BC, MB, SK, NS, NL, PEI.", url: "https://bouncebackontario.ca", tags: ["free"], note: "Free · provincial coverage" },
      { name: "Psychology Today Canada", description: "Canada-wide directory — filter by province, fee, and specialty.", url: "https://www.psychologytoday.com/ca/therapists", tags: ["directory"], note: "Directory · check coverage" },
      { name: "Affordable Therapy Network", description: "Canadian therapists offering sliding-scale and reduced-fee sessions.", url: "https://affordabletherapynetwork.com", tags: ["low-cost", "directory"], note: "Sliding scale from ~$50" },
      { name: "Counsellors of Colour Collective", description: "BIPOC-identified Canadian therapists for culturally-matched care.", url: "https://counsellorsofcolour.ca", tags: ["cultural", "directory"], note: "Directory · fees vary" },
      { name: "Healthy Minds Canada — Student Fund", description: "Grants and student-focused mental health resources.", url: "https://healthymindscanada.ca", tags: ["student"], note: "Student · grants available" },
      { name: "7 Cups", description: "Free trained listeners; paid online therapy available.", url: "https://www.7cups.com", tags: ["free", "online"], note: "Peer support free · therapy from $150/mo" },
    ],
    community: [
      { name: "MOSAIC", description: "Vancouver-area newcomer settlement, counselling, and community programs.", url: "https://mosaicbc.org", tags: ["newcomer", "diaspora"] },
      { name: "COSTI", description: "Toronto-area settlement services and mental health programs.", url: "https://www.costi.org", tags: ["newcomer", "diaspora"] },
      { name: "CMHA Branches", description: "Canadian Mental Health Association — local community programs.", url: "https://cmha.ca/find-your-cmha", tags: ["local-meetup"] },
      { name: "YMCA Newcomer Services", description: "Orientation, language, and connection programs for newcomers.", url: "https://www.ymca.ca/what-we-do/newcomer-services", tags: ["newcomer"] },
      { name: "Meetup Canada", description: "Local wellbeing and community groups across Canada.", url: "https://www.meetup.com/find/?location=ca&keywords=mental%20health", tags: ["local-meetup"] },
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
    therapists: [
      { name: "Medicare Better Access", description: "Up to 10 subsidised sessions per year with a GP Mental Health Plan.", url: "https://www.health.gov.au/our-work/better-access-initiative", tags: ["low-cost"], note: "Medicare rebate" },
      { name: "APS Find a Psychologist", description: "Australian Psychological Society's official practitioner directory.", url: "https://psychology.org.au/find-a-psychologist", tags: ["directory"], note: "Directory · Medicare rebate applies" },
      { name: "Psychology Today Australia", description: "AU directory, filter by fee and focus.", url: "https://www.psychologytoday.com/au/psychologists", tags: ["directory"], note: "Directory · check coverage" },
      { name: "headspace", description: "Free mental health support for 12–25-year-olds, in-person and online.", url: "https://headspace.org.au", tags: ["free", "student"], note: "Free · ages 12–25" },
      { name: "Embrace Multicultural Mental Health", description: "Resources and practitioner search for CALD communities.", url: "https://embracementalhealth.org.au", tags: ["cultural", "multilingual"], note: "Directory · fees vary" },
    ],
    community: [
      { name: "Settlement Services International", description: "Settlement, community, and wellbeing programs for new arrivals.", url: "https://www.ssi.org.au", tags: ["newcomer"] },
      { name: "Multicultural Mental Health Australia", description: "Cultural community programs and resources.", url: "https://embracementalhealth.org.au", tags: ["diaspora"] },
      { name: "Meetup Australia", description: "Local wellbeing meetups across AU cities.", url: "https://www.meetup.com/find/?location=au&keywords=wellbeing", tags: ["local-meetup"] },
      { name: "QLife Community", description: "LGBTQ+ peer support and community linkage.", url: "https://qlife.org.au", tags: ["lgbtq"] },
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
    therapists: [
      { name: "iCall (TISS)", description: "Free counselling by phone, email, and chat from Tata Institute.", url: "https://icallhelpline.org", tags: ["free", "multilingual"], note: "Free · multiple languages" },
      { name: "YourDOST", description: "Online counselling platform with sliding-fee options.", url: "https://yourdost.com", tags: ["online", "low-cost"], note: "Sliding fee · from ~₹299" },
      { name: "The MindClan", description: "Curated directory of queer- and trauma-informed therapists.", url: "https://themindclan.com", tags: ["directory", "cultural"], note: "Directory · fees vary" },
      { name: "Manastha", description: "Affordable online therapy platform with Indian therapists.", url: "https://www.manastha.com", tags: ["online", "low-cost"], note: "Low-cost online" },
      { name: "Mpower Helpline", description: "Free 24/7 helpline and therapist network.", url: "https://mpowerminds.com", tags: ["free"], note: "Free 24/7 helpline" },
      { name: "Live Love Laugh Directory", description: "Curated list of psychiatrists and therapists across India.", url: "https://www.thelivelovelaughfoundation.org", tags: ["directory"], note: "Directory · fees vary" },
    ],
    community: [
      { name: "Mariwala Health Initiative", description: "Community mental health programs grounded in social justice.", url: "https://mhi.org.in", tags: ["local-meetup"] },
      { name: "Nazariya LGBTQ+ Community", description: "Queer feminist resource group and community spaces.", url: "https://nazariyaqfrg.wordpress.com", tags: ["lgbtq"] },
      { name: "Meetup India", description: "Local wellness meetups in Indian cities.", url: "https://www.meetup.com/find/?location=in&keywords=wellbeing", tags: ["local-meetup"] },
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
    therapists: [
      { name: "KBV Arztsuche", description: "Official search for psychotherapists with statutory insurance.", url: "https://arztsuche.kbv.de", tags: ["free"], note: "Covered by gesetzliche Krankenkasse" },
      { name: "Psychotherapiesuche (BPtK)", description: "Federal chamber directory of licensed psychotherapists.", url: "https://www.psychotherapiesuche.de", tags: ["directory"], note: "Directory · Krankenkasse may cover" },
      { name: "Deutsche PsychotherapeutenVereinigung", description: "Association directory with specialist filters.", url: "https://www.dptv.de", tags: ["directory"], note: "Directory · fees vary" },
      { name: "Minds International", description: "English-speaking therapists for expats across Germany.", url: "https://minds-international.com", tags: ["cultural", "multilingual"], note: "Paid · English-speaking" },
    ],
    community: [
      { name: "Caritas Migrationsberatung", description: "Local counselling and community linkage for migrants.", url: "https://www.caritas.de", tags: ["newcomer"] },
      { name: "Meetup Germany", description: "Expat and wellbeing meetups across German cities.", url: "https://www.meetup.com/find/?location=de&keywords=wellbeing", tags: ["local-meetup"] },
      { name: "Expats in Berlin Groups", description: "Community meetups and social support for internationals.", url: "https://www.meetup.com/find/?location=de--Berlin&keywords=expats", tags: ["newcomer", "local-meetup"] },
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
    therapists: [
      { name: "MindNation", description: "Affordable therapy and wellness coaching for Filipinos.", url: "https://www.mindnation.com", tags: ["online", "low-cost"], note: "Low-cost · online" },
      { name: "MentalHealthPH Directory", description: "Community-maintained list of Filipino mental health professionals.", url: "https://mentalhealthph.org", tags: ["directory"], note: "Directory · fees vary" },
      { name: "Empath", description: "Online therapy platform with licensed Filipino therapists.", url: "https://empath.ph", tags: ["online"], note: "Paid · online" },
      { name: "NCMH Crisis Hotline", description: "Government mental health line — also refers to ongoing care.", url: "https://ncmh.gov.ph", tags: ["free"], note: "Free · government" },
    ],
    community: [
      { name: "MentalHealthPH Peer Groups", description: "Online peer spaces and local advocacy chapters.", url: "https://mentalhealthph.org/community", tags: ["online", "local-meetup"] },
      { name: "Meetup Philippines", description: "Local wellbeing meetups across Manila and beyond.", url: "https://www.meetup.com/find/?location=ph&keywords=wellness", tags: ["local-meetup"] },
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
    therapists: [
      { name: "SAPTEL", description: "Free 24/7 psychological support line operated by UNAM/Cruz Roja.", url: "https://www.saptel.org.mx", tags: ["free"], note: "Gratuito" },
      { name: "Terapify", description: "Online therapy platform with Mexican licensed therapists.", url: "https://terapify.com", tags: ["online"], note: "Paid · online" },
      { name: "Voz Pro Salud Mental", description: "Directory and advocacy with family support groups.", url: "https://vozprosaludmental.org.mx", tags: ["directory"], note: "Directorio · costos variables" },
    ],
    community: [
      { name: "CAPA (Centros de Atención Primaria)", description: "Local community addictions and mental health centers.", url: "https://www.gob.mx/salud/conadic", tags: ["local-meetup"] },
      { name: "Meetup México", description: "Local bienestar and community meetups.", url: "https://www.meetup.com/find/?location=mx&keywords=bienestar", tags: ["local-meetup"] },
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
    therapists: [
      { name: "Mentally Aware Nigeria (MANI)", description: "Counselling referrals and low-cost therapist network.", url: "https://www.mentallyaware.org", tags: ["low-cost", "directory"], note: "Low-cost · subsidised" },
      { name: "She Writes Woman", description: "Women-led mental health support with safe-space therapy.", url: "https://shewriteswoman.org", tags: ["cultural"], note: "Some free · women-focused" },
      { name: "Mind Africa", description: "Nigerian counsellor and therapist directory.", url: "https://mindafrica.org", tags: ["directory"], note: "Directory · fees vary" },
    ],
    community: [
      { name: "MANI Peer Groups", description: "Youth-led peer support groups and online community.", url: "https://www.mentallyaware.org/community", tags: ["youth", "online"] },
      { name: "She Writes Woman Safe Place", description: "Community space and weekly circles for women.", url: "https://shewriteswoman.org", tags: ["women"] },
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
    therapists: [
      { name: "Inclusive Therapists (Global)", description: "Multicultural, trauma-informed directory — many offer virtual sessions across borders where licensing allows.", url: "https://www.inclusivetherapists.com", tags: ["directory", "cultural", "online"], note: "Directory · fees vary" },
      { name: "7 Cups", description: "Free trained peer listeners in 140+ countries, plus paid online therapy.", url: "https://www.7cups.com", tags: ["free", "online"], note: "Peer support free · therapy from $150/mo" },
      { name: "International Therapist Directory", description: "Worldwide directory of English-speaking therapists for expats.", url: "https://internationaltherapistdirectory.com", tags: ["directory", "online", "multilingual"], note: "Directory · paid" },
      { name: "Online-Therapy.com", description: "Structured CBT-based online therapy — check local licensing.", url: "https://www.online-therapy.com", tags: ["online"], note: "Paid · verify coverage in your country" },
    ],
    community: [
      { name: "7 Cups Community", description: "Free global peer support forums and group chats.", url: "https://www.7cups.com/connect/", tags: ["online"] },
      { name: "Meetup (Global)", description: "Find wellbeing and community meetups in most major cities.", url: "https://www.meetup.com/find/?keywords=mental%20health", tags: ["local-meetup", "online"] },
      { name: "InterNations", description: "Expat communities and meetups worldwide.", url: "https://www.internations.org", tags: ["newcomer", "diaspora"] },
    ],
  },
]

export function getRegionById(id: string): RegionResources | undefined {
  return REGIONS.find((r) => r.id === id)
}
