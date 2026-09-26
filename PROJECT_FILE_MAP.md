# PROJECT FILE MAP

Actual project structure with dependencies, safety ratings, and impact warnings. Everything below was verified by reading the files.

Safety legend:
- 🟢 **SAFE** — edit freely for content/styling; worst case is a visual bug
- 🟡 **CAUTION** — edit with understanding of consumers; run typecheck after
- 🔴 **DO NOT EDIT** — platform-managed or generated; changes break builds/preview

---

## ROOT

### `index.html` 🟢
- **Purpose:** HTML shell — `<title>`, meta description, theme-color, Google Fonts links, `#root`, module script.
- **Controls:** Browser tab title, SEO snippet, font loading.
- **Depended on by:** Vite build (entry), fonts consumed by `src/index.css` tokens.
- **Safe changes:** title, meta description, add OG tags, add preconnect tweaks.
- **Breakage risk:** Removing the Google Fonts `<link>` silently degrades all type to system fonts; removing `#root` or the script tag blanks the app.

### `package.json` 🟡
- Scripts: `dev` (vite), `build` (`tsc -b && vite build`), `preview`, `lint`, `format`. Dependencies listed in master doc §2.
- **Caution:** removing template packages (convex auth, radix) can break imports in files you aren't editing; `package-lock.json` coexists with `bun.lock`.

### `vite.config.ts` 🔴
- Plugins: `react()`, `vlyPlugin()`, `tailwindcss()`; alias `@ → ./src`; `dedupe` react; manual chunks; `server.hmr.overlay:false`; port 5173. Platform requires HMR config preserved. **Do not edit.**

### `main.tsx` (root) / `sst-env.d.ts` / `components.json` / `postcss.config.cjs` 🔴/🟢
- Root `main.tsx`: Deno static server for `dist/` — platform runtime. `sst-env.d.ts`: generated. `components.json`: shadcn generator config (safe but pointless to edit). `postcss.config.cjs`: intentionally empty (Tailwind v4 via Vite).

---

## PUBLIC

### `public/logo.svg` 🟢
- **Purpose:** favicon + PWA icon. Custom sunrise mark (ink square, sun ring, two strokes in sunlight/mist).
- **Used in:** `index.html` icon link, `manifest.webmanifest` icons.
- **Safe changes:** replace with ministry logo, same filename.
- **Note:** `src/assets/logo.svg` is the OLD template logo — still imported by `LogoDropdown.tsx` only. Two logos exist; homepage shows neither (nav is a text wordmark).

### `public/manifest.webmanifest` 🟢
- Name, short_name, theme `#FB8C00`, background `#14100C`. Fully safe to rebrand.

---

## SRC — BOOTSTRAP

### `src/main.tsx` 🟡
- **Purpose:** creates React root; RootErrorBoundary; ToolbarErrorBoundary; ConvexAuthProvider; BrowserRouter; lazy routes: `/` Landing, `/auth` Auth, `/dashboard` (RequireAuth), `*` NotFound; RouteSyncer (iframe ↔ platform nav); Toaster.
- **Depended on by:** everything (it mounts everything).
- **Caution:** edit only to add/remove ROUTES. Deleting the error boundaries re-exposes full-screen crash on runtime errors. `import "@vly-ai/integrations"` must stay first.

### `src/index.css` 🟢 (the design system)
- **Purpose:** Tailwind v4 entry; `@theme` tokens (colors, fonts, keyframes); shadcn variable maps (light + dark); base layer; editorial utilities.
- **Controls:** every color/font/utility on the site.
- **Depended on by:** every component (token names: mist, apricot, sunlight, sun, ember, rust, clay, ivory, cream, sand, fog, smoke, charcoal, ink; `.editorial-label`, `.grain`, `.duotone`, `.rule`, `.link-reveal`, `.vertical-text`, `.headline-crop`, `.marquee-track`, `.hog-cursor`).
- **Safe changes:** token VALUES, new utilities. **Breakage:** deleting the `@theme` color tokens breaks every `bg-sun`-style class (build errors point at many files); removing `@tailwind`-equivalent v4 imports or the `@theme inline` block breaks the shadcn variables and dark theme.

### `src/lib/utils.ts` 🟢 — `cn()` (clsx + tailwind-merge). Imported by most components.

### `src/types/global.d.ts`, `src/vite-env.d.ts`, `src/instrumentation.tsx`, `src/lib/vly-integrations.ts` — 🔴 platform/shims.

---

## SRC — CONTENT

### `src/content/site.ts` 🟢 ★ THE content file (641 lines)
- **Purpose:** single source of truth for all visible content. Exports: `NAV_LINKS`, `CHAPTER_COUNT`, `HERO`, `JOURNEY_OPENING`, `JOURNEY_MILESTONES` (typed `JourneyMilestone[]`), `IMPACT`, `FILM`, `SOCIAL`, `SOCIAL_HANDLES` (`SocialHandle[]`), `FOUNDERS_INTRO`, `FOUNDERS` (`Founder[]`), `SERVE`, `SERVE_PATHWAYS` (`ServePathway[]`), `IMPACT_STORIES_INTRO`, `IMPACT_STORIES` (`ImpactStory[]`), `FRAGMENTS`, `FRAGMENTS_ITEMS` (`Fragment[]`), `TALK_TO_US`, `PARTNERSHIP`, `DONATE`, `CLIMAX`, `FOOTER`, `CONTACT`.
- **Depended on by:** ALL 13 chapter components + Navigation + Footer.
- **Safe changes:** any string, image URL, array length (components map arrays). Keep `ServePathway.lines` a 3-tuple (typed). Keep region `x/y` numbers within 0–100.
- **Breakage:** renaming an export breaks importing components at compile time (caught by tsc). Adding a `Fragment.span` value outside tall|wide|square|full silently falls back to square (spanMap default).

---

## SRC — PAGES

### `src/pages/Landing.tsx` 🟡
- **Purpose:** the homepage; imports + orders all 13 chapters (order documented in master §3); mounts ScrollProgress + ChapterCursor + Navigation.
- **Safe changes:** reorder/remove imports+JSX to change section order; comment markers `01 — …` label each block.
- **Breakage:** removing a component that owns an anchor id (`#journey`, `#donate`…) leaves nav links dead (silent scroll no-op). `CHAPTER_COUNT` stays 13 — chapter indices in SectionHeader are hard-coded per component, so reordering without renumbering shows wrong "NN / 13" labels.

### `src/pages/Auth.tsx` 🟡 — sign-in (email OTP + guest) with returnTo handling. Template-styled, unthemed. Used by RequireAuth flow only.
### `src/pages/Dashboard.tsx` 🟢 — placeholder protected page ("replace this starter content"). Not linked from anywhere public.
### `src/pages/NotFound.tsx` 🟢 — 404.

---

## SRC — CHAPTER COMPONENTS (all 🟢 for content, 🟡 for structural edits)

| File | Default export | Reads from site.ts | Convex | Unique behavior |
|---|---|---|---|---|
| `Navigation.tsx` | Navigation | NAV_LINKS | — | IntersectionObserver theme switch; body scroll lock |
| `Hero.tsx` | Hero | HERO, CHAPTER_COUNT | — | 100svh; scroll-parallax exit |
| `Journey.tsx` | Journey | JOURNEY_OPENING, JOURNEY_MILESTONES | — | 420vh sticky horizontal; reduced-motion fallback |
| `ImpactMap.tsx` | ImpactMap | IMPACT | — | memoized SVG dot world; `dotInLand()` geo test |
| `JourneyFilm.tsx` | JourneyFilm | FILM | — | honest no-video state |
| `SocialHandles.tsx` | SocialHandles | SOCIAL, SOCIAL_HANDLES | — | double-marquee; null-href = non-link card |
| `Founders.tsx` | Founders | FOUNDERS, FOUNDERS_INTRO | — | overlapping portrait; alternating chapters |
| `Serve.tsx` | Serve | SERVE, SERVE_PATHWAYS | — | trig orbit (7 nodes) vs mobile grid |
| `ImpactStories.tsx` | ImpactStories | IMPACT_STORIES(+_INTRO) | — | 5-beat structure; parallax image |
| `Fragments.tsx` | Fragments | FRAGMENTS, FRAGMENTS_ITEMS | — | spanMap; index%3 offsets |
| `TalkToUs.tsx` | TalkToUs | TALK_TO_US, CONTACT | submitConversation | full form lifecycle |
| `Donate.tsx` | Donate | DONATE, PARTNERSHIP, CONTACT | createDonationCheckout, verifyDonation | Stripe redirect + URL-param state machine |
| `StoryClimax.tsx` | StoryClimax | CLIMAX | — | word-blur reveal; sr-only title |
| `Footer.tsx` | Footer | FOOTER, NAV_LINKS, SOCIAL_HANDLES, CONTACT | — | live local time (30s interval) |

**Cross-cutting cautions:**
- Anchor ids are contracts with Navigation/Footer/Serve CTAs: `journey, impact, serve, founders, fragments, talk-to-us, donate, social, film, climax, impact-stories, footer, top`.
- Navigation.tsx hard-codes dark ids `["film","climax","footer"]` — if you add a dark section, add its id there or the nav stays light/illegible.
- Every component imports `./motion/Primitives` — see below.

### `src/components/motion/Primitives.tsx` 🟡 ★
- **Exports:** `EASE` (0.22,1,0.36,1), `usePrefersReducedMotion`, `ChapterIndex`, `SectionHeader`, `AnimatedText`, `RevealImage` (currently unused — available), `MagneticButton`, `FilmGrain`, `ScrollProgress`, `ChapterCursor`, `FadeIn`.
- **Depended on by:** all 14 homepage files.
- **Safe changes:** per-instance props via call sites. Editing shared defaults (stagger, viewport margins, EASE) re-times the entire site at once.
- **Breakage:** ChapterCursor relies on `[data-cursor]` attributes in consumers (Fragments "VIEW", JourneyFilm "PLAY"); `.hog-cursor` class in index.css hides it on touch.

### `src/components/RequireAuth.tsx`, `LogoDropdown.tsx`, `src/hooks/*` 🟢 — template helpers; RequireAuth guards /dashboard; LogoDropdown is unused by homepage.

### `src/components/ui/*` (40+ shadcn files) 🟢 — generated primitives. Only `button/card/input`-family used by template pages, NOT by the homepage's custom design system.

---

## SRC — CONVEX (backend)

### `src/convex/schema.ts` 🟡
- Tables: `users` (template), `conversations`, `donationIntents`, `donations` (+ authTables spread). Indexes documented in API_DATABASE_MAP.
- **Caution:** every field/index change requires `bunx convex dev --once` and regenerates `_generated`. Removing `authTables` or the `users` table breaks the template auth compile (verified during development of this project).

### `src/convex/conversations.ts` 🟡
- `submitConversation` (public mutation) — the TalkToUs endpoint. `listConversations` — intentional no-op placeholder.
- **Safe changes:** arg validation strictness, status defaults. **Breakage:** changing arg names/shapes must be mirrored in TalkToUs.tsx call.

### `src/convex/donations.ts` 🟡 (157 lines)
- `submitDonationIntent` (public mutation — fallback), `createDonationCheckout` (public ACTION — Stripe session OR intent), `verifyDonation` (public ACTION — retrieves session, marks paid), `recordDonation` + `markPaid` (internal mutations).
- **Breakage:** amount math (`unit_amount = amountInr * 100`); `FRONTEND_URL` fallback is localhost; markPaid scans `by_status` index then filters in JS (fine at small scale, quadratic at large).

### `src/convex/auth.ts`, `auth.config.ts`, `auth/emailOtp.ts`, `users.ts`, `http.ts` 🔴
- Template-marked READ-ONLY. emailOtp posts OTPs to the Freebuff mail service. http.ts exposes only auth routes.

### `src/convex/_generated/**` 🔴 — regenerated on every `convex dev`. Never hand-edit; never commit-edit.

---

## ORPHANED / LEGACY FILES (safe to leave, candidates for cleanup)

| File | Status |
|---|---|
| `src/assets/logo.svg` | Unused by homepage (template logo; only LogoDropdown imports it) |
| `src/components/LogoDropdown.tsx` | Unused by homepage |
| `package-lock.json` | Project uses bun; npm lockfile is residual |
| `src/components/RevealImage` (in Primitives) | Exported but never consumed yet |
| `README.md`, `integrations.md` | Template docs, possibly stale |
