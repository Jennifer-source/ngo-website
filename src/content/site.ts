/**
 * HANDS OF GRACE — SITE CONTENT
 * ------------------------------------------------------------------
 * Every piece of real-world content on the website lives here.
 * Nothing below is presented as fact unless the ministry confirms it:
 * values marked `editable: true` are honest placeholders awaiting
 * real data — they render as clearly-labeled structure, never fiction.
 *
 * This file is the single source of truth. UI components never hardcode
 * ministry facts.
 */

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export const NAV_LINKS = [
  { label: "Journey", href: "#journey" },
  { label: "Impact", href: "#impact" },
  { label: "Serve", href: "#serve" },
  { label: "Founders", href: "#founders" },
  { label: "Fragments", href: "#fragments" },
  { label: "Talk To Us", href: "#talk-to-us" },
  { label: "Events", href: "/events" },
] as const;

export const CHAPTER_COUNT = 11;

/* ------------------------------------------------------------------ */
/* Hero — image supplied by the ministry (placeholder until provided)  */
/* ------------------------------------------------------------------ */

export const HERO = {
  kicker: "Hands of Grace",
  titleLines: ["Where faith", "becomes action."],
  subline: "Serving communities. Restoring dignity. Carrying hope forward.",
  primaryCta: { label: "Explore our journey", href: "#journey" },
  secondaryCta: { label: "Be part of the journey", href: "#talk-to-us" },
  scrollLabel: "Scroll to discover",
  /** Ministry hero artwork — verified: public/assets/Untitled_design.png, 1920×1080 PNG. */
  image: {
    src: "/assets/Untitled_design.png",
    alt: "By His power, with His love, for His glory — Romans 11:36 — Hands of Grace Trust",
    editable: false as const,
  },
};

/* ------------------------------------------------------------------ */
/* Journey milestones — editable documentary fragments                 */
/* ------------------------------------------------------------------ */

export type JourneyMilestone = {
  year: string;
  moment: string;
  whatHappened: string;
  whyItMattered: string;
  location: string;
  image: { src: string; alt: string; editable: boolean };
};

export const JOURNEY_OPENING = {
  label: "Our journey",
  statementLines: [
    "From prayer",
    "to presence.",
    "From presence",
    "to action.",
  ],
  intro:
    "A movement rarely begins with a plan. This one began with people, prayer, and a willingness to show up. The chapters that follow trace the road so far — and the road ahead.",
};

export const JOURNEY_MILESTONES: JourneyMilestone[] = [
  {
    year: "20XX",
    moment: "A prayer becomes a promise",
    whatHappened:
      "Placeholder — describe the beginning: where the first prayer gathering happened, and who was in the room.",
    whyItMattered:
      "Every movement has a first breath. This is the moment to record it.",
    location: "Editable location",
    image: {
      src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
      alt: "Placeholder image — hands folded in prayer",
      editable: true,
    },
  },
  {
    year: "20XX",
    moment: "Presence before programs",
    whatHappened:
      "Placeholder — describe how the ministry first arrived in a community and began listening before acting.",
    whyItMattered:
      "Trust is built by showing up again and again, before anything is asked.",
    location: "Editable location",
    image: {
      src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80",
      alt: "Placeholder image — a community gathered outdoors",
      editable: true,
    },
  },
  {
    year: "20XX",
    moment: "The first act of service",
    whatHappened:
      "Placeholder — the first outreach: what was done, who came, what changed that day.",
    whyItMattered:
      "Faith became visible. Service became the language of the ministry.",
    location: "Editable location",
    image: {
      src: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80",
      alt: "Placeholder image — volunteers serving together",
      editable: true,
    },
  },
  {
    year: "20XX",
    moment: "Grace multiplies",
    whatHappened:
      "Placeholder — when others joined: volunteers, partners, churches, families.",
    whyItMattered:
      "A single act of grace, shared, becomes a way of life for many.",
    location: "Editable location",
    image: {
      src: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
      alt: "Placeholder image — people joining hands in community",
      editable: true,
    },
  },
  {
    year: "Today",
    moment: "The journey continues",
    whatHappened:
      "Placeholder — where the work stands now, and what the next chapter holds.",
    whyItMattered:
      "The story is still being written — by everyone who chooses to be part of it.",
    location: "Editable location",
    image: {
      src: "https://images.unsplash.com/photo-1509059852496-f3822ae057bf?auto=format&fit=crop&w=1200&q=80",
      alt: "Placeholder image — sunrise over a landscape",
      editable: true,
    },
  },
];

/* ------------------------------------------------------------------ */
/* Impact — global map + editable qualitative fields                   */
/* ------------------------------------------------------------------ */

export const IMPACT = {
  label: "Impact",
  statementLines: ["A small act of grace", "can travel far."],
  intro:
    "Where the journey has reached, and where it is going next.",
  /** Regions only. No invented statistics. */
  regions: [
    {
      id: "india",
      name: "India",
      detail: "Community outreach, care initiatives, and meals served.",
      x: 71.9,
      y: 39.5,
    },
    {
      id: "nepal",
      name: "Nepal",
      detail: "Placeholder — describe the work in this region.",
      x: 74.6,
      y: 34.5,
    },
    { id: "africa", name: "Eastern Africa", detail: "Placeholder — describe the work in this region.", x: 60.6, y: 49.5 },
  ],
  /** Impact metrics — verified figures recorded by the trust. */
  fields: [
    { id: "communities", label: "Communities reached", value: "25+" },
    { id: "people", label: "People served", value: "10,000+" },
    { id: "outreaches", label: "Outreaches", value: "100+" },
    { id: "years", label: "Years of service", value: "20+" },
  ],
};

/* ------------------------------------------------------------------ */
/* Journey film                                                        */
/* ------------------------------------------------------------------ */

export const FILM = {
  label: "Our journey",
  title: "Film",
  description:
    "A short documentary on the work — the people, the places and the quiet hours in between — told in the community's own words.",
  /** Set the ministry's documentary URL here (mp4 or embed provider). */
  videoUrl: "" as string,
  /** Poster shown before playback. */
  poster: {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2000&q=80",
    alt: "Placeholder — documentary poster frame",
    editable: true as const,
  },
  closingQuote: "Every journey begins with a step. Ours began with prayer.",
};

/* ------------------------------------------------------------------ */
/* Social handles — official channels only (add real URLs when ready)  */
/* ------------------------------------------------------------------ */

export type SocialHandle = {
  id: string;
  platform: string;
  handle: string;
  href: string | null;
  action: string;
  note: string;
  editable: boolean;
};

export const SOCIAL = {
  label: "Follow the journey",
  kinetic: ["Watch.", "Share.", "Pray.", "Serve."],
  intro:
    "Field notes, stories and announcements from the work. For press requests or collaboration enquiries, please write to us through the contact chapter below.",
};

export const SOCIAL_HANDLES: SocialHandle[] = [
  {
    id: "youtube",
    platform: "YouTube",
    handle: "Hands of Grace",
    href: "https://www.youtube.com/@joffynayanapogula",
    action: "Watch",
    note: "Stories, films and gatherings.",
    editable: true,
  },
  {
    id: "facebook",
    platform: "Facebook",
    handle: "Hands of Grace",
    href: "https://www.facebook.com/joffy.nayanapogula/",
    action: "Explore",
    note: "Community announcements.",
    editable: true,
  },
  {
    id: "instagram",
    platform: "Instagram",
    handle: "@joffynayanapogula",
    href: "https://www.instagram.com/joffynayanapogula/",
    action: "Follow",
    note: "Daily moments from the field.",
    editable: true,
  },
];

/* ------------------------------------------------------------------ */
/* Founders                                                            */
/* ------------------------------------------------------------------ */

export type Founder = {
  name: string;
  role: string;
  story: string;
  vision: string;
  contribution: string;
  image: { src: string; alt: string; editable: boolean };
};

export const FOUNDERS_INTRO = {
  label: "The founders",
  statementLines: ["The people", "behind the", "mission."],
  intro:
    "The trust is led by its founders, supported by a board of trustees and accountable to every partner and donor who walks with it.",
};

export const FOUNDERS: Founder[] = [
  {
    name: "PS. Joshua Nayanapogula",
    role: "Founder",
    story: "",
    vision: "",
    contribution: "",
    image: {
      src: "/assets/founder-1.jpg",
      alt: "Portrait of PS. Joshua Nayanapogula, Founder",
      editable: true,
    },
  },
  {
    name: "PS. Joffy Nayanapogula",
    role: "Founder",
    story: "",
    vision: "",
    contribution: "",
    image: {
      src: "/assets/founder-2.jpg",
      alt: "Portrait of PS. Joffy Nayanapogula, Founder",
      editable: true,
    },
  },
  {
    name: "Mr. Shalom Joshua Nayanapogula",
    role: "Co-Founder",
    story: "",
    vision: "",
    contribution: "",
    image: {
      src: "/assets/cofounder.jpg",
      alt: "Portrait of Mr. Shalom Joshua Nayanapogula, Co-Founder",
      editable: true,
    },
  },
];

/* ------------------------------------------------------------------ */
/* Serve pathways                                                      */
/* ------------------------------------------------------------------ */

export type ServePathway = {
  id: string;
  title: string;
  lines: [string, string, string];
  cta: string;
  href: string;
};

export const SERVE = {
  label: "Serve",
  statementLines: [
    "There is more",
    "than one way",
    "to make a difference.",
  ],
};

export const SERVE_PATHWAYS: ServePathway[] = [
  {
    id: "volunteer",
    title: "Volunteer",
    lines: ["Give your time.", "Use your skills.", "Stand with communities."],
    cta: "Become a volunteer",
    href: "#talk-to-us",
  },
  {
    id: "pray",
    title: "Pray",
    lines: ["Carry the work.", "Lift the people.", "Believe with us."],
    cta: "Join the prayer circle",
    href: "#talk-to-us",
  },
  {
    id: "give",
    title: "Give",
    lines: ["Sow generously.", "Sustain the journey.", "Change a next step."],
    cta: "Make a gift",
    href: "#donate",
  },
  {
    id: "partner",
    title: "Partner",
    lines: ["Bring your organization.", "Share resources.", "Multiply reach."],
    cta: "Start a partnership",
    href: "#talk-to-us",
  },
  {
    id: "serve",
    title: "Serve",
    lines: ["Go where needed.", "Do the quiet work.", "Lead by serving."],
    cta: "Offer your service",
    href: "#talk-to-us",
  },
  {
    id: "share",
    title: "Share",
    lines: ["Tell the story.", "Amplify hope.", "Bring others along."],
    cta: "Share the journey",
    href: "#social",
  },
  {
    id: "connect",
    title: "Connect",
    lines: ["Ask questions.", "Meet the team.", "Begin a conversation."],
    cta: "Talk to us",
    href: "#talk-to-us",
  },
];

/* ------------------------------------------------------------------ */
/* Impact in action — human stories                                    */
/* ------------------------------------------------------------------ */

export type ImpactStory = {
  person: string;
  moment: string;
  need: string;
  response: string;
  change: string;
  location: string;
  image: { src: string; alt: string; editable: boolean };
};

export const IMPACT_STORIES_INTRO = {
  label: "Impact in action",
  statementLines: ["Where impact", "becomes personal."],
  intro:
    "Behind every figure is a face. These accounts are drawn from the trust's own records and are shared only with consent — told with dignity, never as spectacle.",
};

export const IMPACT_STORIES: ImpactStory[] = [
  {
    person: "Editable — person's first name only",
    moment: "Editable — the day the story begins",
    need: "Editable — what was needed",
    response: "Editable — what the community and ministry did together",
    change: "Editable — what is different now",
    location: "Editable location",
    image: {
      src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1400&q=80",
      alt: "Placeholder — story photograph (to be replaced with consented imagery)",
      editable: true,
    },
  },
  {
    person: "Editable — person's first name only",
    moment: "Editable — a turning point",
    need: "Editable — what was needed",
    response: "Editable — how help arrived",
    change: "Editable — the change that followed",
    location: "Editable location",
    image: {
      src: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1400&q=80",
      alt: "Placeholder — story photograph (to be replaced with consented imagery)",
      editable: true,
    },
  },
];

/* ------------------------------------------------------------------ */
/* Fragments — documentary archive                                     */
/* ------------------------------------------------------------------ */

export type Fragment = {
  id: string;
  caption: string;
  detail: string;
  span: "tall" | "wide" | "square" | "full";
  image: { src: string; alt: string; editable: boolean };
};

export const FRAGMENTS = {
  label: "Fragments",
  statementLines: ["Small moments.", "Kept carefully."],
  intro:
    "An archive of the ordinary — the hands, faces and quiet hours that make up the work.",
};

export const FRAGMENTS_ITEMS: Fragment[] = [
  {
    id: "001",
    caption: "Fragment / 001",
    detail: "Morning light, first prayers",
    span: "tall",
    image: {
      src: "/assets/frag-1.jpg",
      alt: "Field photograph — Hands of Grace fragment 1",
      editable: true,
    },
  },
  {
    id: "002",
    caption: "A moment from the field",
    detail: "Preparing the meal, together",
    span: "wide",
    image: {
      src: "/assets/frag-2.jpg",
      alt: "Field photograph — Hands of Grace fragment 2",
      editable: true,
    },
  },
  {
    id: "003",
    caption: "Field note / 004",
    detail: "The road between villages",
    span: "square",
    image: {
      src: "/assets/frag-3.jpg",
      alt: "Field photograph — Hands of Grace fragment 3",
      editable: true,
    },
  },
  {
    id: "004",
    caption: "Fragment / 012",
    detail: "Hands that build",
    span: "tall",
    image: {
      src: "/assets/frag-4.jpg",
      alt: "Field photograph — Hands of Grace fragment 4",
      editable: true,
    },
  },
  {
    id: "005",
    caption: "A day in the community",
    detail: "Children, unhurried",
    span: "wide",
    image: {
      src: "/assets/frag-5.jpg",
      alt: "Field photograph — Hands of Grace fragment 5",
      editable: true,
    },
  },
  {
    id: "006",
    caption: "Fragment / 021",
    detail: "An evening gathering",
    span: "square",
    image: {
      src: "/assets/frag-6.jpg",
      alt: "Field photograph — Hands of Grace fragment 6",
      editable: true,
    },
  },
  {
    id: "007",
    caption: "Fragment / 030",
    detail: "Quiet smiles",
    span: "tall",
    image: {
      src: "/assets/frag-7.jpg",
      alt: "Field photograph — Hands of Grace fragment 7",
      editable: true,
    },
  },
  {
    id: "008",
    caption: "Field note / 011",
    detail: "The long walk home",
    span: "wide",
    image: {
      src: "/assets/frag-8.jpg",
      alt: "Field photograph — Hands of Grace fragment 8",
      editable: true,
    },
  },
  {
    id: "009",
    caption: "Fragment / 009",
    detail: "Field photograph",
    span: "tall",
    image: {
      src: "/assets/frag-9.jpg",
      alt: "Field photograph — Hands of Grace fragment 9",
      editable: true,
    },
  },
  {
    id: "010",
    caption: "Fragment / 010",
    detail: "Field photograph",
    span: "wide",
    image: {
      src: "/assets/frag-10.jpg",
      alt: "Field photograph — Hands of Grace fragment 10",
      editable: true,
    },
  },
  {
    id: "011",
    caption: "Fragment / 011",
    detail: "Field photograph",
    span: "square",
    image: {
      src: "/assets/frag-11.jpg",
      alt: "Field photograph — Hands of Grace fragment 11",
      editable: true,
    },
  },
  {
    id: "012",
    caption: "Fragment / 012",
    detail: "Field photograph",
    span: "tall",
    image: {
      src: "/assets/frag-12.jpg",
      alt: "Field photograph — Hands of Grace fragment 12",
      editable: true,
    },
  },
];

/* ------------------------------------------------------------------ */
/* Talk to us                                                          */
/* ------------------------------------------------------------------ */

export const TALK_TO_US = {
  label: "Talk to us",
  statementLines: ["Some journeys", "begin with", "a conversation."],
  intro:
    "Whether you are exploring a partnership, considering volunteering, or simply wish to understand the work more closely — this is the place to begin. Every enquiry receives a personal reply.",
  pathways: [
    { id: "general", label: "General enquiry" },
    { id: "volunteer", label: "Volunteer" },
    { id: "partnership", label: "Partnership" },
    { id: "prayer", label: "Prayer" },
  ],
  cta: "Start a conversation",
};

/** For organisations considering corporate giving or programme partnership. */
export const PARTNERSHIP = {
  title: "For organisations",
  lines: [
    "Corporate social responsibility programmes designed around your goals and measured against agreed outcomes.",
    "Programme partnerships for institutions and foundations that share a commitment to dignity and long-term change.",
    "In-kind partnerships for professional services, logistics and skills.",
  ],
  note:
    "Partners receive regular field documentation, audited statements and a named point of contact.",
};

/* ------------------------------------------------------------------ */
/* Donate — trust-first. No payment processor configured in v1.        */
/* ------------------------------------------------------------------ */

export const DONATE = {
  label: "Donate",
  statementLines: ["Your generosity", "becomes someone's", "next step."],
  intro:
    "Give once, or commit to the work month by month. Every contribution is stewarded with care, recorded by the trust, and acknowledged with a receipt.",
  frequencies: [
    { id: "one-time", label: "One time" },
    { id: "monthly", label: "Monthly" },
  ],
  /** Editable preset amounts (INR). Adjust in this file only. */
  amounts: [500, 1000, 2500, 5000],
  customRange: { min: 100, max: 500000 },
  secureNote:
    "Payments are processed over an encrypted connection by an accredited payment provider, and no card details are stored on this website. Receipts are issued for every contribution.",
  /** Official payment details — left empty until the ministry provides them. */
  bankDetails: null as
    | { accountName: string; accountNumber: string; ifsc: string; bank: string }
    | null,
  /** Payment provider becomes available when configured (e.g. Razorpay). */
  paymentProvider: null as string | null,
};

/* ------------------------------------------------------------------ */
/* Climax                                                              */
/* ------------------------------------------------------------------ */

export const CLIMAX = {
  label: "Chapter ten",
  titleLines: ["The story", "isn't over."],
  subLines: ["Be a part of", "what comes next."],
  primaryCta: { label: "Join the journey", href: "#talk-to-us" },
  secondaryCtas: [
    { label: "Serve with us", href: "#serve" },
    { label: "Give", href: "#donate" },
    { label: "Connect", href: "#social" },
  ],
};

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export const FOOTER = {
  title: "Hands of Grace",
  words: ["Faith.", "Compassion.", "Action."],
  legal: [
    { label: "Privacy policy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Donation information", href: "#donate" },
  ],
  copyright: "Hands of Grace International Ministries Trust",
  closing: "The journey continues.",
};

/** Official contact details — fill in only verified information. */
export const CONTACT = {
  email: null as string | null,
  phone: null as string | null,
  address: null as string | null,
  hours: "Enquiries receive a personal reply, usually within two working days.",
};
