# DESIGN SYSTEM

Source of truth: `src/index.css`. All values below were read from that file and from actual component usage. Section colors listed per section follow the homepage map (master doc §3).

---

## 1. COLOR PALETTE

### A. Brand sunrise palette — `@theme` tokens in index.css

| Token | Hex | Role in practice |
|---|---|---|
| `--color-mist` | `#FBE9E7` | Softest surface: Founders + TalkToUs section bg; Donate trust-ledger bg; text accents on dark (hero subline `mist/85`, nav links) |
| `--color-apricot` | `#FDC591` | Accent on dark: hero kicker, scroll-cue hairline, footer column headers, climax label, fragment detail captions |
| `--color-sunlight` | `#FFA951` | Hover/active accent: CTA hover bg, film title italic, nav underline on dark, left-borders (journey "why", impact detail, donate ledger), ScrollProgress gradient mid |
| `--color-sun` | `#FB8C00` | Primary CTA fill (hero Explore, mobile-menu Donate, hero solid button), impact map dots, pathway nodes, For-organisations bullets; also `--primary` |
| `--color-ember` | `#F57C00` | Hover deepen: map dot hover, marquee node hover; ScrollProgress gradient |
| `--color-rust` | `#E65100` | Workhorse accent on light: section labels, meta lines, link hover/active, journey second statement, impact value placeholders (rust/40), form focus borders, founder names' emphasis, background `--ring` |
| `--color-clay` | `#BF360C` | Deepest drama: selected/active states (pathway title, serve chips, amount buttons hover-deepen, journey "why" text), cursor label bg rgba(191,54,12,.92), climax glow core |

### B. Warm neutrals — `@theme` tokens

| Token | Hex | Role |
|---|---|---|
| `--color-ivory` | `#FBF9F4` | Default page bg (`--background`); Journey/Serve/Social bg; headline text on dark |
| `--color-cream` | `#F4EEE4` | Secondary bg: Impact + Fragments + Donate sections; Serve mobile stage |
| `--color-sand` | `#E8DFD2` | Ghost year text (`sand/70`); fragment card base; also `--border`/`--input` |
| `--color-fog` | `#A89C8E` | Dark-theme muted text (`--muted-foreground` in `.dark`) |
| `--color-smoke` | `#73685C` | Body text on light; captions; meta (`smoke/70–80` used constantly) |
| `--color-charcoal` | `#221C16` | Primary text on light; map dot fill (#221c16 at opacity .13); marquee words |
| `--color-ink` | `#14100C` | Near-black: dark section bgs (hero/film/climax/footer), nav text, buttons text on orange |

### C. shadcn variable maps (also in index.css — power ui/ components + Toaster)
- Light `:root`: background/foreground/card `#FBF9F4`/`#221C16`; primary `#FB8C00` (fg `#FFF8F2`); secondary/muted `#F4EEE4`; accent `#FBE9E7` (fg `#BF360C`); destructive `#B3261E`; border/input `#E8DFD2`; ring `#FB8C00`; radius `0.25rem` (sharp editorial corners)
- Dark `.dark`: bg `#14100C`, fg `#FBF9F4`, primary `#FFA951`, accent `#BF360C`, borders `rgba(251,249,244,.12)`, ring `#FFA951`
- Charts 1–5 = the 5 oranges. `--radius: 0.25rem` ⇒ default radius = 2px (sharp, editorial).

### D. Hex values hard-coded outside index.css (found by inspection)

| Hex | Where |
|---|---|
| `#FB8C00` | TalkToUs success circle stroke |
| `#BF360C` | TalkToUs success check stroke |
| `#221c16` | ImpactMap `<circle fill>` for every map dot |
| `rgba(191,54,12,0.92)` | ChapterCursor labeled state bg (Primitives) |
| `rgba(251,140,0,0.9)` | ChapterCursor default dot bg (Primitives) |
| `#FFF8F2` | primary-foreground (index.css) |

### E. Gradients & overlays actually in use
- ScrollProgress bar: `from-sun via-ember to-clay` (2px, origin-left)
- Hero: `bg-gradient-to-b from-ink/50 via-ink/20 to-ink/80` + `bg-gradient-to-r from-ink/45 via-transparent` (left edge)
- Journey progress thread: `from-sun to-clay`
- Fragments caption plate: `bg-gradient-to-t from-ink/75 to-transparent`
- Duotone image treatment: two layers — multiply `linear-gradient(160deg, rgba(251,140,0,.38), rgba(191,54,12,.5))` + screen `linear-gradient(20deg, rgba(253,197,145,.28), rgba(255,169,81,.06) 55%, rgba(251,233,231,.14))` over grayscale img
- Climax glow: `bg-gradient-to-t from-clay via-ember/60 to-sunlight/30`, blur-3xl, 70vmin
- Film-grain: inline SVG feTurbulence data-URI, `mix-blend-mode: overlay`, animated by 4-step `grain-shift` keyframes

### F. Opacity conventions (system-wide)
Text on dark: mist at /85 /70 /60 /50 /40. Accents: apricot at /90 /80 /70 /60. On light: ink at /10 /15 /25 /70; rust at /25 /40 /50. Placeholder values render at rust/40 (impact record) and rust/25 (founder numerals).

---

## 2. TYPOGRAPHY

### Families (Google Fonts, loaded in index.html)
- **Serif = Playfair Display** — variable 400–800 + italic. Class: `font-serif`. All emotional headlines, founder names, fragment handles, amounts, footer wordmark.
- **Sans = Inter** — opsz 14–32, wght 300–700. Class: `font-sans` (body default). All metadata, body, buttons, forms, nav.
- Fallbacks: `ui-sans-serif, system-ui…` / `Georgia, Times New Roman, serif`.

### The `editorial-label` utility (used ~60×)
```css
font-family: sans; font-size: .6875rem (11px); font-weight: 500;
letter-spacing: .28em; text-transform: uppercase; line-height: 1;
```
Variants override size: `.6rem` (footer legal, captions), `.58rem` (fragment captions), `.62rem` (donate meta), `.6–.72rem` cursor/menu. Buttons use `.72rem` + tracking `.18–.22em`.

### Actual sizes (clamp = min, preferred vw, max)

| Element | Class | Desktop ≈ | Mobile ≈ | Weight | Line-height | Tracking |
|---|---|---|---|---|---|---|
| **Hero H1** | `text-[clamp(3rem,9.5vw,8.5rem)]` | 137px @1440 | 48px @390 | 400 (serif) | 0.98 | normal |
| Chapter statements (H2) | `text-[clamp(2.6rem,7vw,6.5rem)]` | 101px | 42px | 400 | 1.0–1.02 | normal |
| Impact/Story/Fragments/Talk/Donate H2 | `text-[clamp(2.4rem,5.5vw,5rem)]` | 79px | 38px | 400 | 1.04 | normal |
| Serve H2 | `text-[clamp(2.2rem,4.6vw,4.2rem)]` | 66px | 35px | 400 | 1.06 | normal |
| Film H2 | `text-[clamp(2.6rem,7vw,6.5rem)]` (2 lines) | 101px | 42px | 400 + italic 2nd line | 0.98 | normal |
| Climax title | `text-[clamp(3rem,10vw,9rem)]` | 144px | 48px | 400 | 1.02 | word-gap 0.28em |
| Climax sub | `text-[clamp(1.5rem,3.2vw,2.6rem)] italic` | 42px | 24px | 400 | snug | — |
| Founder name H3 | `text-4xl md:text-5xl` | 48px | 36px | 400 | leading-tight | — |
| Milestone H3 | `text-3xl md:text-4xl` | 36px | 30px | 400 | leading-tight | normal |
| Body paragraphs | `text-[0.95rem]` / `[0.9rem]` / `[0.92rem]` | 15px | 15px | 400 | leading-relaxed (1.625) | normal |
| Story beat body | `text-[0.95rem]` | 15px | — | 400 | relaxed | — |
| Nav links | `text-[0.72rem]` | 11.5px | — | 500 | 1 | 0.22em |
| Buttons | `text-[0.72rem]` | 11.5px | — | 500 | 1 | 0.18–0.22em |
| Section label | `.editorial-label` | 11px | 11px | 500 | 1 | 0.28em |
| Ghost year (Journey) | `text-[7rem] md:text-[10rem]` | 160px | 112px | 400 serif | 1 | — |
| Ghost numerals (Founders) | `text-[6rem] md:text-[8rem] italic` | 128px | 96px | 400 | 1 | — |
| Impact value (empty) | `text-2xl serif tabular-nums` | 24px | — | 400 | — | — |
| Footer wordmark | `text-[clamp(2.8rem,8vw,7rem)]` | 112px | 45px | 400 | 1 | — |
| Footer tagline | `text-xl md:text-2xl italic` | 24px | 20px | 400 | — | — |
| Marquee kinetic words | `text-[clamp(3rem,9vw,8rem)]` | 129px | 48px | 400 | 1 | — |

**Controls:** font families/sizes → `index.html` (fonts) + per-component classes; `editorial-label` + `font-serif/sans` → `src/index.css`.

---

## 3. LAYOUT MEASUREMENTS (exact values)

### Page frame
- **Content max-width:** `max-w-[1600px] mx-auto` — every section without exception
- **Horizontal padding:** `px-6` (24px) mobile → `md:px-12` (48px) desktop (uniform)
- **Grid:** `grid grid-cols-12` with `gap-6`/`gap-8`/`gap-10` per section; content splits 5/7, 4/8, 7/5, 4/6
- **Section vertical padding:** `py-28 md:py-40` (112→160px) for most; Social `py-28 md:py-36`; Climax `py-36 md:py-52`; Footer `pt-24 pb-10`

### Per-section specifics
- **Nav:** `py-5` (20px) rows; height ≈ 71px; gap-8 between links; link py-1
- **Hero:** `h-[100svh]`; content `justify-end pb-24 md:pb-28`; CTA gap-4; scroll cue inset-x-6/12 bottom-6
- **Journey:** statement `mt-14`, intro row `mt-16` (cols 4/3 + 8/5, gap-6); strip container `h-[420vh]`, sticky `h-screen`; cards `w-[82vw] md:w-[46vw] lg:w-[40vw]`, `pl-8 pr-10`, border-l ink/10; image `h-[38vh] mb-10`; ghost year `top-6 right-6`; progress thread `mb-10`
- **Impact:** header/record `mt-10`/`mt-14`; map `aspect-[2/1]`; dot r=0.42 in 200×100 viewBox; record rows `py-4`, `divide-y divide-ink/10` + `border-y`; detail panel `p-6 border-l-2`
- **Film:** title `mt-12`; stage `mt-16 aspect-video`; play button `h-24 w-24` circle, svg 18×20; metadata `mt-5`; quote `mt-20 max-w-3xl`
- **Social:** kinetic row `mt-20`, word `gap-16`, 30s loop; cards `mt-20 w-[19rem] p-7 gap-4`, 46s loop
- **Founders:** statement `mt-14`; portrait `w-56 md:w-72 aspect-[3/4]`, overlap at `md:right-[8%] md:top-1/2 -translate-y-1/2`; chapters `mt-24 space-y-28 md:space-y-40`; portrait cols 5, text cols 6, `gap-8 md:gap-12`
- **Serve:** orbit `max-w-[620px] aspect-square`, rings inset-0 + inset-14%, center stage inset-21%, nodes at `50% + cos/sin×50%`; mobile stage `aspect-[4/3] p-7`; grid `grid-cols-2 sm:grid-cols-3 gap-2`, buttons `px-4 py-3.5`
- **ImpactStories:** rows `space-y-32 md:space-y-44`; image `aspect-[4/5] md:aspect-[5/6]`, parallax inset `[-8%]`; beats `py-5`, label mb-1.5
- **Fragments:** grid `gap-4 md:gap-6 mt-20`; spans tall=col-4 aspect-[3/4], wide=col-8 aspect-[16/10], square=col-4 aspect-square, full=col-12 aspect-[21/9]; offsets `md:mt-16` / `md:mt-6` by index%3; caption plate `p-4 pt-10`
- **TalkToUs/Donate cards:** `p-7 md:p-10 border border-ink/10 bg-ivory`; fields grid `gap-7`, inputs `py-3 border-b`; chips `px-4 py-2.5`; amount buttons `py-3.5` (grid-cols-2 md:grid-cols-5); success min-h 420/480px
- **Footer:** wordmark → rule `my-14`; columns gap-10; rules `my-12`; legal strip `gap-6`
- **Buttons (all):** `px-7 py-4` (hero/CTAs) or `px-5 py-2.5` (nav Donate) or `px-8 py-4` (mobile menu); arrow `→` shifts 1.5 (0.375rem) on hover; MagneticButton magnet factor 0.18x/0.28y, spring stiffness 180 damping 16 mass 0.4
- **Border radius:** default 2px (`--radius` 0.25rem − map); circles for play/cursor/checkmarks only
- **Rules/dividers:** `.rule` = 1px `currentColor` at 14% opacity; hairlines `h-px w-10` beside labels

---

## 4. MOTION SYSTEM (complete inventory)

**Global easing:** `EASE = cubic-bezier(0.22, 1, 0.36, 1)` — every animation site-wide. Linear exception: marquees.

| # | Location | Trigger | Type | Duration | Delay | Notes / how to modify |
|---|---|---|---|---|---|---|
| 1 | ScrollProgress | scroll | scaleX spring | stiffness 120 damping 28 | — | Primitives.tsx |
| 2 | Nav entrance | mount | y −70→0 + fade | 1s | 0.4s | Navigation.tsx |
| 3 | Nav underline | hover/active | scaleX 0→100 | 500ms | — | CSS transition |
| 4 | Nav theme | section enter | bg/colors | 700ms | — | transition-colors |
| 5 | Hamburger | click | rotate ±45° | 400ms | — | motion.span |
| 6 | Mobile menu | open | fade | 500ms | items 0.1+0.06i | AnimatePresence |
| 7 | Hero image exit | scroll | y 0→18%, scale 1→1.12 | scroll-linked | — | useScroll offset start-start/end-start |
| 8 | Hero content exit | scroll | fade+rise by 55% | scroll-linked | — | — |
| 9 | Hero kicker | mount | fade | 1.2s | 0.9s | — |
| 10 | Hero H1 lines | mount | mask y 112%→0 | 1.3s | 0.55 + 0.16i | headline-crop |
| 11 | Hero subline/CTAs | mount | fade + y18 | 1s | 1.25 / 1.45s | — |
| 12 | Scroll cue hairline | loop | scaleY 1→.4→1 | 2.4s ∞ | — | disabled on reduced-motion |
| 13 | Journey statement drift | scroll | x ±4% counter-drift | scroll-linked | — | two blocks |
| 14 | Journey H2 mask reveals | in-view −12% | y 110%→0 | 1.15s | 0/0.15/0.2/0.35 | — |
| 15 | Journey hairline | in-view | scaleX 0→1 | 1.4s | — | — |
| 16 | Strip travel | scroll 8–92% | x 1%→−57% | scroll-linked | — | container 420vh |
| 17 | Milestone image | hover | scale 1.04 | 1400ms | — | — |
| 18 | Journey progress | scroll | scaleX 0→1 | scroll-linked | — | — |
| 19 | Impact rows | in-view | x −16→0 + fade | 0.9s | 0.08i | — |
| 20 | Map pulse rings | loop | scale .6→2.4 fade | 3.2s ∞ | 0.9i | CSS keyframes; off when reduced |
| 21 | Region dot state | click | scale 150% + color | 500ms | — | — |
| 22 | Region detail | selection | y 14→0 fade swap | 0.6s | — | AnimatePresence wait |
| 23 | Film stage | scroll | scale .92→1→.96 | scroll-linked | — | pauses while playing |
| 24 | Play button | hover/tap | scale 1.06 / .97 | 500ms | — | whileHover/Tap |
| 25 | Kinetic words | loop | x 0→−50% | 30s linear ∞ | — | pause on hover (CSS) |
| 26 | Channel marquee | loop | x 0→−50% | 46s linear ∞ | — | pause on hover |
| 27 | Founders H2 lines | in-view | mask reveal | 1.15s | 0.14i | — |
| 28 | Overlap portrait | in-view | y 40→0 fade | 1.3s | 0.4s | — |
| 29 | Founder portrait parallax | scroll | y ±6% | scroll-linked | — | per chapter |
| 30 | Founder fields | in-view | y 22→0 | 0.9s | 0.05/0.15/0.25 | — |
| 31 | Serve stage swap | click | scale .94→1, y 12→0 | 0.55s | lines 0.12+0.08i | mobile: x ±40 0.6s |
| 32 | Node/dot states | hover/click | color + scale | 500ms | — | — |
| 33 | Story image parallax | scroll | y ±8% | scroll-linked | — | container inset −8% |
| 34 | Story beats | in-view | y 18→0 | 0.8s | 0.08i | — |
| 35 | Fragment cards | in-view | y 44→0 | 1s | 0.1×(i%3) | — |
| 36 | Fragment image | hover | scale 1.05 | 1600ms | — | — |
| 37 | Climax glow | scroll | opacity 0→.5, scale .7→1.15 | scroll-linked | — | — |
| 38 | Climax words | in-view −20% | blur 6→0 + y 40→0 | 1.1s | 0.12i | — |
| 39 | Climax subs/CTAs | in-view | fade + rise | 1s | 0.9+0.2i / 1.5s | — |
| 40 | MagneticButton | hover | magnetic follow + arrow 1.5 | spring 180/16 | — | off when reduced-motion |
| 41 | Forms: chips/frequency/amounts | click | color/border | 500ms | — | CSS |
| 42 | Custom amount | open | height 0→auto | 500ms | — | — |
| 43 | Success check (both forms) | success | SVG pathLength draw (circle 1.2s, check +0.8s) | — | — | TalkToUs; Donate uses scale-in circle + ✓ |
| 44 | ChapterCursor | move/hover | spring follow (500/40) + morph 76px | 350ms | — | desktop only |
| 45 | FadeIn wrapper | in-view −10% | y 28→0 | 1s | prop | used ~15× |
| 46 | Footer wordmark/tagline | in-view | y 40→0 / fade | 1.2s / 1s | 0.25s | — |
| 47 | Grain shift | loop | 4-step translate | 1.4s steps(4) ∞ | — | CSS class `.grain` |

**Reduced motion:** `useReducedMotion()` gates parallax/marquee/orbit swaps (Primitives + Hero/Journey/Serve/Climax); CSS `@media (prefers-reduced-motion: reduce)` kills grain, marquees, pulse rings, and collapses all transitions to 0.01ms. Journey switches to the vertical stack entirely.

**Disable any animation:** per-instance → edit duration/delay/ease at the call site; global → edit `EASE` or the CSS keyframes in index.css; complete → wrap section in `usePrefersReducedMotion()` check like Journey does.

---

## 5. RESPONSIVE RULES (actual breakpoints: sm 640 / md 768 / lg 1024)

- **Navigation:** links hidden below `lg` → hamburger + overlay. Donate pill hidden below `lg`.
- **Typography:** everything clamps; only nav/buttons/labels are fixed-size.
- **Journey:** horizontal strip is NOT viewport-gated (see audit #H1) — reduced-motion is the only vertical trigger. Cards widen per breakpoint: 82vw → 46vw (md) → 40vw (lg).
- **Impact/Founders/Serve/Talk/Donate splits:** single-column below `lg` (12-col spans). Founders/ImpactStories flips at `md` only.
- **Serve:** orbit `hidden lg:block`; grid picker `lg:hidden`, 2-col → 3-col at `sm`.
- **Fragments:** tall/square stay 6-col on mobile; wide/full go 12.
- **Forms:** field grid 1-col → 2-col at `md`; amount row 2-col → 5-col at `md`.
- **Footer:** 3 columns each `col-span-12 md:col-span-4`; legal strip stacks below `md`.
- **Hover-dependent features and their touch fallbacks:** journey image zoom (harmless), fragment zoom (harmless), marquee pause (none needed), MagneticButton magnet (pointer-fine only — actually fires on touch-drag, see audit), custom cursor (hidden via `.hog-cursor` + matchMedia pointer:coarse).
