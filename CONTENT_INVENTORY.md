# CONTENT INVENTORY

Every visible string, image, button and link in the homepage, with edit location. Content file = `src/content/site.ts` (referred to as **site.ts**). "STATUS" flags honest placeholders.

---

## PART 1 — TEXT INVENTORY

### Navigation (site.ts → `NAV_LINKS`; hard-coded strings in Navigation.tsx)
| Text | Location | Safe | Status |
|---|---|---|---|
| "Hands of Grace" wordmark | Navigation.tsx (hard-coded, `&nbsp;` joins) | ✅ | final |
| Journey / Impact / Serve / Founders / Fragments / Talk To Us | site.ts NAV_LINKS labels | ✅ | final |
| "Donate" | Navigation.tsx (desktop pill + mobile pill) — hard-coded twice | ✅ | final |
| "Hands of Grace International Ministries Trust" | Navigation.tsx mobile-menu footer line | ✅ | final |

### 01 Hero (site.ts → `HERO`)
| Text | Key | Status |
|---|---|---|
| "Hands of Grace" | `kicker` | final |
| "Where faith" / "becomes action." | `titleLines[0..1]` | final |
| "Serving communities. Restoring dignity. Carrying hope forward." | `subline` | final |
| "Explore our journey" | `primaryCta.label` (component hard-codes identical string in JSX) | final |
| "Be part of the journey" | `secondaryCta.label` (hard-coded in JSX too) | final |
| "Scroll to discover" | `scrollLabel` | final |
| "01 / 13" | generated from CHAPTER_COUNT | generated |

⚠️ Note: HERO.cta labels exist in data but the Hero component renders them from hard-coded JSX strings. Changing `primaryCta.label` in site.ts will NOT change the rendered button (audit #H4).

### 02 Our Journey
| Text | Key | Status |
|---|---|---|
| "Our journey" | `JOURNEY_OPENING.label` | final |
| "From prayer to presence." (2 lines) | `statementLines[0..1]` | final |
| "From presence to action." (2 lines) | `statementLines[2..3]` | final |
| "A movement rarely begins with a plan. This one began with people, prayer, and a willingness to show up. The chapters that follow trace the road so far — and the road ahead." | `intro` | final |
| "The journey so far — scroll on" | hard-coded, Journey.tsx strip header | final |
| 5× year "20XX"/"Today", moment, whatHappened, whyItMattered, location | `JOURNEY_MILESTONES[i]` | 🟡 **placeholders** |
| "And the road keeps opening." | hard-coded end plate, Journey.tsx | final |

### 03 Impact (site.ts → `IMPACT`)
| Text | Key | Status |
|---|---|---|
| "Impact" | `label` | final |
| "A small act of grace" / "can travel far." | `statementLines` | final |
| "Where the journey has reached, and where it is going next…" | `intro` | final |
| "The record — to be filled with verified figures" | hard-coded, ImpactMap.tsx | final |
| 5 field labels (Communities reached / People served / Outreaches / Volunteers / Years of service) | `fields[].label` | final |
| "—" em-dashes | render when `fields[].value` empty | placeholder by design |
| India / Nepal / Eastern Africa + details | `regions[]` | 🟡 2 of 3 details are placeholders |

### 04 Film (site.ts → `FILM`)
| Text | Key | Status |
|---|---|---|
| "Our journey" / "Film" | `label` / `title` | final |
| description | `description` (⚠️ rendered nowhere — unused key) | final |
| "Play film →" | hard-coded, JourneyFilm.tsx | final |
| "The film is being prepared" + body + "← Back" | hard-coded honest state | final |
| "Documentary · Placeholder poster" | hard-coded metadata (right side) | 🟡 says "placeholder" |
| "Every journey begins with a step. Ours began with prayer." | `closingQuote` | final |

### 05 Social (site.ts → `SOCIAL`, `SOCIAL_HANDLES`)
| Text | Key | Status |
|---|---|---|
| "Follow the journey" | `SOCIAL.label` | final |
| "Watch." "Share." "Pray." "Serve." | `SOCIAL.kinetic` | final |
| intro | `SOCIAL.intro` | final |
| 4× platform, handle, note, action | `SOCIAL_HANDLES[]` | 🟡 handles are guesses (`@handsofgrace`), all hrefs null |
| "Opening soon" | rendered when href null (4/4 currently) | by design |

### 06 Founders (site.ts → `FOUNDERS_INTRO`, `FOUNDERS`)
| Text | Key | Status |
|---|---|---|
| "The founders" + 3 statement lines + intro | `FOUNDERS_INTRO` | final |
| "Founder name" / "Co-founder name" | `FOUNDERS[].name` | 🔴 **placeholder — must replace** |
| Roles: "Founder & Managing Trustee" / "Co-founder & Trustee" | `role` | 🟡 plausible defaults, confirm |
| story / vision / contribution ×2 | `FOUNDERS[]` | 🔴 **placeholders — must replace** |
| "The story" / "The vision" / "The contribution" | hard-coded field labels, Founders.tsx | final |

### 07 Serve (site.ts → `SERVE`, `SERVE_PATHWAYS`)
| Text | Key | Status |
|---|---|---|
| "Serve" + 3 statement lines | `SERVE` | final |
| "Choose a pathway — the circle responds. Every way of serving is honored here." | hard-coded, Serve.tsx | final |
| "Pathway NN" | generated | generated |
| 7× title, 3 lines, cta | `SERVE_PATHWAYS[]` | final |

### 08 Impact in Action
| Text | Key | Status |
|---|---|---|
| "Impact in action" + 2 statement lines + intro | `IMPACT_STORIES_INTRO` | final |
| 2× person/moment/need/response/change | `IMPACT_STORIES[]` | 🔴 **all "Editable — …" placeholders** |
| "A person / A moment / A need / A response / A change" | hard-coded beat labels, ImpactStories.tsx | final |
| "Editable location" chips | `location` | 🔴 placeholder |

### 09 Fragments
| Text | Key | Status |
|---|---|---|
| "Fragments" + 2 lines + intro | `FRAGMENTS` | final |
| 8× caption + detail ("Fragment / 001", "Morning light, first prayers"…) | `FRAGMENTS_ITEMS[]` | 🟡 captions are structural; details are evocative defaults |

### 10 Talk to Us (site.ts → `TALK_TO_US`, `CONTACT`)
| Text | Key | Status |
|---|---|---|
| "Talk to us" + 3 lines + intro | `TALK_TO_US` | final |
| "What is this about?" | hard-coded legend | final |
| 5 pathway labels | `TALK_TO_US.pathways[].label` | final |
| Field labels/placeholders: "Your name"/"Full name", "Email"/"you@example.com", "Phone (optional)"/"+91", "Your message"/"Tell us what's on your heart…" | hard-coded in TalkToUs.tsx | final |
| Validation messages (3) | hard-coded in `validate()` | final |
| "Start a conversation" / "Sending…" | `TALK_TO_US.cta` / hard-coded | final |
| "Your message stays private." | hard-coded | final |
| "Message received." + success body + "Send another message" | hard-coded | final |
| Server error message | hard-coded in catch | final |
| Contact block (email/phone/hours) | `CONTACT` | 🟡 email/phone null → hidden; hours final |

### 11 Donate (site.ts → `DONATE`, `PARTNERSHIP`, `CONTACT`)
| Text | Key | Status |
|---|---|---|
| "Donate" + 3 lines + intro | `DONATE` | final |
| "A note on trust" | hard-coded ledger title | final |
| secureNote + "Official bank and payment details will appear here only once verified by the trust." | `DONATE.secureNote` + hard-coded tail | final |
| "Payment method: recorded intent — online payment arrives with the next update" | hard-coded; shows only when no bank/provider configured | 🟡 shows in current state |
| "For organisations" + 3 lines + note + "Discuss a partnership →" | `PARTNERSHIP` + hard-coded link label | final |
| "One time" / "Monthly" | `DONATE.frequencies` | final |
| ₹500 / ₹1,000 / ₹2,500 / ₹5,000 + "Custom" | `DONATE.amounts` + hard-coded | final (amounts editable) |
| "Choose an amount", "Your amount (₹)", field labels, placeholders | hard-coded | final |
| Validation messages incl. min/max | hard-coded (min/max values from `customRange`) | final |
| "Giving ₹X every month/once" | generated | generated |
| Submit: `Give ₹X monthly/now` / "Recording…" | generated | generated |
| "Payments are processed over an encrypted connection · No card details are stored on this website" | hard-coded | final |
| Success states (2 variants + "Make another gift") | hard-coded | final |
| Cancelled notice | hard-coded in Donate.tsx useEffect | final |
| Server error | hard-coded | final |

### 12 Climax (site.ts → `CLIMAX`)
| Text | Key | Status |
|---|---|---|
| "Chapter twelve" | `label` | final |
| "The story isn't over." | `titleLines` (joined for animation) | final |
| "Be a part of what comes next." | `subLines` | final |
| "Join the journey" / "Serve with us" / "Give" / "Connect" | CTAs | final |

### 13 Footer (site.ts → `FOOTER`, `CONTACT`)
| Text | Key | Status |
|---|---|---|
| "Hands of Grace" wordmark | `FOOTER.title` | final |
| "Faith. Compassion. Action." | `FOOTER.words` | final |
| "Navigate" / "Follow the journey" / "Contact" | hard-coded column headers | final |
| "Official channels opening soon" | hard-coded; shows when no social hrefs | by design |
| "Contact details coming soon" | hard-coded; shows when CONTACT.email null | 🟡 current state |
| "Enquiries receive a personal reply, usually within two working days." | `CONTACT.hours` | final |
| "Local time — HH:MM" | generated | generated |
| "© YYYY Hands of Grace International Ministries Trust" | `FOOTER.copyright` + year | final |
| "Privacy policy" / "Terms" / "Donation information" | `FOOTER.legal` | 🟡 first two href="#" |
| "The journey continues." | `FOOTER.closing` | final |

### Global meta
| Text | Where |
|---|---|
| Page title + meta description | `index.html` |
| PWA name/description | `public/manifest.webmanifest` |

---

## PART 2 — IMAGE INVENTORY (19 images, ALL Unsplash placeholders)

All are loaded as plain `<img>` with `object-cover`, treated by `.duotone` (grayscale + orange multiply/screen) unless noted. All `loading="lazy" decoding="async"` except hero (`fetchPriority="high"`).

| # | Image | Defined in | Used in / section | Ratio rendered | Overlay | Replace how |
|---|---|---|---|---|---|---|
| 1 | `photo-1470319169494-595b6ff3c7d6` w=2400 | site.ts `HERO.image` | Hero full-bleed | fills 100svh | ink gradients + grain | edit `HERO.image.src` (+ alt) |
| 2–6 | prayer / community / volunteers / hands / sunrise (w=1200) | `JOURNEY_MILESTONES[i].image` | Journey cards (h-38vh) & vertical stack (4/3) | container-cropped | duotone | per-milestone `image.src` |
| 7 | `photo-1470071459604-3b5ec3a7fe05` w=2000 | `FILM.poster` | Film poster (aspect-video) | 16:9 | duotone + ink/35 | `FILM.poster.src` |
| 8 | founder 1 `photo-1507003211169-0a1dd7228f2d` w=1000 | `FOUNDERS[0].image` | Founders overlap + chapter 1 (3/4) | 3:4 | duotone + shadow | `FOUNDERS[0].image` |
| 9 | founder 2 `photo-1573496359142-b8d87734a5a2` w=1000 | `FOUNDERS[1].image` | Founders chapter 2 (3/4) | 3:4 | duotone | `FOUNDERS[1].image` |
| 10–11 | story photos (w=1400) | `IMPACT_STORIES[i].image` | ImpactStories (4/5, 5/6) | 4:5 | duotone + location chip | per-story `image` |
| 12–19 | fragments (w=1000–1400) | `FRAGMENTS_ITEMS[i].image` | Fragments grid (3/4, 16/10, 1/1) | per span | duotone + caption plate | per-item `image` |

**DPI note:** request widths (w=1000–2400) are baked into the Unsplash URLs. Mobile serves desktop-size files — see audit #M1.
**Alt text:** every image has alt; all say "Placeholder — …". When replacing, rewrite alts (they are visitor-facing for screen readers).
**Local assets:** none for the homepage. `public/logo.svg` is favicon only; `src/assets/logo.svg` is unused by the homepage.

## PART 3 — VIDEO INVENTORY

| Property | Value |
|---|---|
| Video source | `FILM.videoUrl` in site.ts — **currently `""` → no video renders** |
| Poster | `FILM.poster.src` (image #7) |
| Element | native `<video controls autoPlay playsInline>`; rendered only after Play click AND videoUrl set |
| loop / muted / preload | not set (no autoplay-before-interaction; user-initiated) |
| Container | `aspect-video w-full`, full-width column |
| Fallback | "The film is being prepared" state with ← Back button |
| Mobile | same element; `playsInline` prevents iOS fullscreen takeover |
| To go live | paste an mp4 URL (or adapt component for embed providers — iframe NOT currently supported) into `FILM.videoUrl` |

## PART 4 — BUTTON/LINK INVENTORY (all actions verified in code)

| Button | Text | Section | File | Action | Internal/External | API | Safe |
|---|---|---|---|---|---|---|---|
| Nav link ×6 | labels above | 00 | Navigation.tsx | preventDefault + `scrollIntoView(smooth)` | internal anchor | — | ✅ |
| Nav Donate pill | "Donate" | 00 | Navigation.tsx | scroll to #donate | internal | — | ✅ |
| Mobile menu items | same 6 + Donate | 00 | Navigation.tsx | scroll + close | internal | — | ✅ |
| Hero primary | "Explore our journey" | 01 | Hero.tsx | scroll #journey | internal | — | ✅ |
| Hero secondary | "Be part of the journey" | 01 | Hero.tsx | scroll #talk-to-us | internal | — | ✅ |
| Serve node ×7 | pathway title | 07 | Serve.tsx | select pathway (state) | internal | — | ✅ |
| Serve CTA (per pathway) | e.g. "Become a volunteer" | 07 | Serve.tsx | MagneticButton href from data (#talk-to-us/#donate/#social) | internal | — | ✅ |
| Impact region ×3 | region name | 03 | ImpactMap.tsx | toggle detail panel | — | — | ✅ |
| Film play | "Play film →" | 04 | JourneyFilm.tsx | setPlaying(true) | — | — | ✅ |
| Film back | "← Back" | 04 | JourneyFilm.tsx | setPlaying(false) | — | — | ✅ |
| Social card ×4 | platform/handle | 05 | SocialHandles.tsx | **none — href null → renders non-link "Opening soon" card** | — | — | ✅ |
| TalkToUs pathway chips ×5 | pathway label | 10 | TalkToUs.tsx | select | — | — | ✅ |
| TalkToUs submit | "Start a conversation" | 10 | TalkToUs.tsx | validate → `submitConversation` mutation | API | conversations table | ✅ |
| TalkToUs reset | "Send another message" | 10 | TalkToUs.tsx | reset form state | — | — | ✅ |
| Donate frequency ×2 | One time / Monthly | 11 | Donate.tsx | radiogroup select | — | — | ✅ |
| Donate amounts ×5 | ₹… / Custom | 11 | Donate.tsx | select | — | — | ✅ |
| Donate submit | "Give ₹X monthly/now" | 11 | Donate.tsx | validate → `createDonationCheckout` action → Stripe redirect OR intent | API | donations/donationIntents | ✅ |
| Donate reset | "Make another gift" | 11 | Donate.tsx | setStatus idle | — | — | ✅ |
| Discuss partnership | "Discuss a partnership →" | 11 | Donate.tsx | scroll #talk-to-us | internal | — | ✅ |
| Climax CTAs ×4 | labels above | 12 | StoryClimax.tsx | MagneticButton hrefs (#talk-to-us/#serve/#donate/#social) | internal | — | ✅ |
| Footer nav ×7 | labels | 13 | Footer.tsx | **native anchor href (no smooth-scroll JS)** | internal | — | ✅ |
| Footer socials | conditional | 13 | Footer.tsx | only when href non-null (currently none render) | external | — | ✅ |
| Footer legal ×3 | Privacy/Terms/Donation info | 13 | Footer.tsx | **href="#" (dead)** / #donate | — | — | ⚠️ see audit |
