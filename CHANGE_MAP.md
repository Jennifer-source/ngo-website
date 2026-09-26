# CHANGE MAP — "WHERE DO I CHANGE THIS?"

**site.ts** = `src/content/site.ts` (the content file). All paths relative to project root.

---

## THE CHANGE TABLE

| I want to… | File | Exact location / notes |
|---|---|---|
| Change hero headline | site.ts | `HERO.titleLines` (array of lines) |
| Change hero subline / kicker | site.ts | `HERO.subline` / `HERO.kicker` |
| Change hero image | site.ts | `HERO.image.src` + rewrite `HERO.image.alt` |
| Change hero CTA labels | Hero.tsx | **hard-coded in JSX** ("Explore our journey" / "Be part of the journey") — editing `HERO.primaryCta` in site.ts does NOT affect render (audit #H4) |
| Change navigation items | site.ts | `NAV_LINKS` — label + `#anchor`; section must have matching `id` |
| Reorder navigation | site.ts | reorder `NAV_LINKS` array |
| Change page title / meta | index.html | `<title>`, `meta[name=description]` |
| Change favicon | public/logo.svg | replace file (sunrise mark) |
| Change colors | src/index.css | `@theme` `--color-*` tokens + `:root`/`.dark` shadcn vars |
| Change fonts | index.html (load) + site-wide classes | Google Fonts `<link>` in index.html; swap `--font-sans`/`--font-serif` in index.css `@theme` |
| Change button style globally | motion/Primitives.tsx | `MagneticButton` `base` classes |
| Change section spacing globally | index.css / components | per-section `py-28 md:py-40` in each chapter file; page frame `max-w-[1600px] px-6 md:px-12` repeated per component |
| **Reorder homepage sections** | pages/Landing.tsx | move the chapter JSX blocks; then renumber `chapter={N}` props + `id="top…"` references; Navigation dark-list `["film","climax","footer"]` |
| Remove a section | pages/Landing.tsx | delete its import + JSX; remove matching NAV_LINKS entry in site.ts; note chapter numbering |
| Add a new section | pages/Landing.tsx + new file | create `src/components/NewSection.tsx` (copy a chapter's skeleton), import in Landing, add anchor id, add NAV_LINKS entry, bump `CHAPTER_COUNT`, renumber subsequent `chapter={N}` |
| Change chapter counter "NN / 13" | site.ts | `CHAPTER_COUNT`; per-section `chapter={N}` prop in each component |
| **Add a journey milestone** | site.ts | append to `JOURNEY_MILESTONES` (year, moment, whatHappened, whyItMattered, location, image) — horizontal strip math adapts automatically |
| Edit a milestone | site.ts | `JOURNEY_MILESTONES[i]` |
| Change journey statement | site.ts | `JOURNEY_OPENING.statementLines` / `.intro` |
| Add an impact region | site.ts | `IMPACT.regions` + `{id,name,detail,x,y}` — x/y are % coordinates on the dot map (India 71.9/39.5 for reference) |
| **Add verified impact figures** | site.ts | `IMPACT.fields[i].value = "1,240"` — renders instead of "—" automatically |
| Add impact metric row | site.ts | append `{id,label,value}` to `IMPACT.fields` |
| **Replace the film video** | site.ts | `FILM.videoUrl = "https://…/film.mp4"` — play button starts working immediately |
| Change film poster/quote | site.ts | `FILM.poster` / `FILM.closingQuote` |
| **Add a social URL** | site.ts | `SOCIAL_HANDLES[i].href = "https://instagram.com/…"` — card becomes a real link automatically; also update handle/note |
| Add a social platform | site.ts | append to `SOCIAL_HANDLES` (id, platform, handle, href, action, note, editable) |
| Change kinetic words | site.ts | `SOCIAL.kinetic` |
| **Change founder name/role/story** | site.ts | `FOUNDERS[i].name/.role/.story/.vision/.contribution` |
| **Change founder image** | site.ts | `FOUNDERS[i].image.src` (portrait, ideally 3:4, ≥1000px) |
| Add a third founder | site.ts | append to `FOUNDERS` — layout alternates automatically |
| Add/remove serve pathway | site.ts | `SERVE_PATHWAYS` — orbit math + mobile grid adapt; keep `lines` exactly 3 items |
| Change a serve CTA target | site.ts | `SERVE_PATHWAYS[i].href` |
| **Add a human story** | site.ts | append to `IMPACT_STORIES` (person, moment, need, response, change, location, image) |
| Add a fragment | site.ts | append to `FRAGMENTS_ITEMS` — `span`: "tall"/"wide"/"square"/"full" |
| Change form fields/labels/placeholders | TalkToUs.tsx / Donate.tsx | hard-coded in JSX `Field` blocks |
| Change form validation | TalkToUs.tsx / Donate.tsx | `validate()` functions |
| Change success/error messages | TalkToUs.tsx / Donate.tsx | success JSX + catch blocks |
| **Change donation amounts** | site.ts | `DONATE.amounts` (INR numbers) + `DONATE.customRange.min/max` |
| Change donation frequency labels | site.ts | `DONATE.frequencies` |
| Change trust note | site.ts | `DONATE.secureNote` |
| **Add bank details** | site.ts | `DONATE.bankDetails = { accountName, accountNumber, ifsc, bank }` — schema-ready but **no UI renders it yet** (see audit #H3); until then the honest "recorded intent" note shows |
| Enable card payments | Env (Keys tab) | `STRIPE_SECRET_KEY` (+ optional `FRONTEND_URL` for redirect origin) — code path already live in `convex/donations.ts` |
| Change donation product name on Stripe | convex/donations.ts | `product_data.name` |
| Change enquiry pathway list | site.ts + schema.ts | `TALK_TO_US.pathways` AND the `pathway` union in `convex/schema.ts` + `convex/conversations.ts` args (must match) |
| Change contact email/phone/address | site.ts | `CONTACT.email/phone/address` (null = hidden) |
| Change footer wordmark/words/closing | site.ts | `FOOTER.*` |
| Change footer legal links | site.ts | `FOOTER.legal` (⚠️ Privacy/Terms currently `href="#"`) |
| Change copyright line | site.ts | `FOOTER.copyright` (year is generated) |
| Change climax text/CTAs | site.ts | `CLIMAX` |
| Change/map the world map | ImpactMap.tsx | `WorldDots`/`dotInLand()` (geometry) — region pins come from site.ts |
| Change custom cursor | motion/Primitives.tsx | `ChapterCursor` (labels/colors/size) |
| Change scroll progress bar | motion/Primitives.tsx | `ScrollProgress` gradient/height |
| Change grain intensity | index.css + call sites | `.grain::before opacity` base + `FilmGrain opacity={x}` props |
| Change duotone strength | index.css | `.duotone::before/::after` gradient opacities |
| Change easing curve globally | motion/Primitives.tsx | `EASE` const |
| Disable motion site-wide | system | prefers-reduced-motion already honored; force via the `reduced` checks pattern used in Journey |

---

## MASTER MAP (every major element)

| Website Element | File | Component | Data Source | Editable? | Notes |
|---|---|---|---|---|---|
| Fixed navigation | Navigation.tsx | Navigation | site.ts `NAV_LINKS` | ✅ | dark-mode ids hard-coded in file |
| Scroll progress bar | motion/Primitives.tsx | ScrollProgress | — | ✅ | mounted in Landing |
| Custom cursor | motion/Primitives.tsx | ChapterCursor | `[data-cursor]` attrs | ✅ | desktop only |
| Hero | Hero.tsx | Hero | `HERO` | ✅ | CTA labels hard-coded in JSX |
| Journey (horizontal) | Journey.tsx | Journey | `JOURNEY_OPENING`, `JOURNEY_MILESTONES` | ✅ | 420vh sticky; vertical fallback |
| Impact map | ImpactMap.tsx | ImpactMap/WorldDots | `IMPACT` | ✅ | dot geometry in component |
| Journey Film | JourneyFilm.tsx | JourneyFilm | `FILM` | ✅ | videoUrl empty → honest state |
| Social ecosystem | SocialHandles.tsx | SocialHandles | `SOCIAL`, `SOCIAL_HANDLES` | ✅ | null href = non-link card |
| Founders | Founders.tsx | Founders/FounderChapter | `FOUNDERS`, `FOUNDERS_INTRO` | ✅ | alternating chapters |
| Serve orbit | Serve.tsx | Serve/ServeOrbit | `SERVE`, `SERVE_PATHWAYS` | ✅ | 7-node trig layout |
| Impact stories | ImpactStories.tsx | ImpactStories/StoryChapter | `IMPACT_STORIES(+INTRO)` | ✅ | 5-beat structure |
| Fragments grid | Fragments.tsx | Fragments/FragmentCard | `FRAGMENTS(+ITEMS)` | ✅ | span map in component |
| Talk to Us form | TalkToUs.tsx | TalkToUs | `TALK_TO_US`, `CONTACT` | ✅ | → conversations table |
| Donate | Donate.tsx | Donate | `DONATE`, `PARTNERSHIP` | ✅ | → Stripe or intent |
| Climax | StoryClimax.tsx | StoryClimax | `CLIMAX` | ✅ | word blur reveal |
| Footer | Footer.tsx | Footer | `FOOTER`, `NAV_LINKS`, `SOCIAL_HANDLES`, `CONTACT` | ✅ | live local time |
| Design tokens | index.css | — | — | ✅ | Tailwind v4 @theme |
| Fonts | index.html | — | — | ✅ | Google Fonts CDN |
| Database tables | convex/schema.ts | — | — | 🟡 | requires convex push |
| Contact endpoint | convex/conversations.ts | submitConversation | — | 🟡 | mirror args in form |
| Payments | convex/donations.ts | actions | STRIPE_SECRET_KEY env | 🟡 | keys via Keys tab |
| Motion primitives | motion/Primitives.tsx | 8 exports | — | 🟡 | shared by all sections |
| Route table | main.tsx | — | — | 🟡 | add/remove routes only |
| Convex generated | convex/_generated | — | auto | 🔴 | never hand-edit |
| Platform files | vite.config.ts, main.tsx(root), instrumentation, vly-integrations, auth/* | — | — | 🔴 | template read-only |

---

## SAFE EDITING GUIDE

### 🟢 SAFE TO EDIT (no code knowledge needed)
- **All of `src/content/site.ts`** — strings, arrays, URLs, amounts. The architecture exists precisely so this file is safe.
- `index.html` title/meta. `public/logo.svg` + manifest. Colors/fonts by token value in `index.css`.
- Per-component text that is hard-coded (labels, headings) — change strings, keep className structure.

### 🟡 EDIT WITH CAUTION (typecheck + preview after)
- Component **structure** (grid classes, order, conditions) — visual regressions are silent (tsc won't catch them).
- `motion/Primitives.tsx` defaults — site-wide timing changes.
- `convex/*.ts` — must run `bunx convex dev --once` after; arg shapes must match the calling form component; keep `authTables` in schema.
- `Landing.tsx` order/numbering; `Navigation.tsx` dark-section list when adding dark sections.
- Tailwind classes you're not sure exist — invalid utilities fail silently (no CSS generated).

### 🔴 DO NOT EDIT WITHOUT UNDERSTANDING (or at all)
- `src/convex/_generated/**` — regenerated; hand edits are clobbered and break type linkage.
- `src/convex/auth.ts`, `auth.config.ts`, `auth/emailOtp.ts`, `users.ts` — template read-only (federated JWT validation is fragile; comments in-file explain the failure mode).
- `vite.config.ts` — HMR/alias/chunking contract with the Freebuff runtime.
- Root `main.tsx`, `sst-env.d.ts`, `src/instrumentation.tsx`, `src/lib/vly-integrations.ts` — platform runtime.
- `src/main.tsx` beyond route changes — RootErrorBoundary protects the preview from blank screens.
- Environment secrets — manage via the platform Keys/API-keys UI only; never commit values.

---

## EXACT CHANGE WORKFLOW (repeated from master doc for daily use)

1. Find the element in the CHANGE TABLE above.
2. Edit **site.ts** first if it's content; component file if it's layout/behavior.
3. Run `bun tsc -b --noEmit` — must exit clean.
4. If you touched `src/convex/`: `bunx convex dev --once`, then step 3 again.
5. Preview (platform auto-runs both): verify desktop 1440, tablet 768, mobile 390.
6. Check the touched flow end-to-end (form → Convex dashboard Data tab; donate → intent/Stripe).
7. Re-check with OS reduced-motion ON (Journey must go vertical, marquees must stop).
8. Update alt text / placeholder flags in this doc's sibling inventories when media changes.
