# ISSUES AUDIT

Findings from code inspection. No changes made. Priority: CRITICAL → HIGH → MEDIUM → LOW. A separate design section follows the functional audit. Accessibility and security get their own tables.

---

## A. FUNCTIONAL ISSUES

### CRITICAL
*(none — no data loss, security hole in shipped keys, or broken primary flow was found)*

### HIGH
| ID | Issue | File | Cause | Current behavior | Expected | Recommended change |
|---|---|---|---|---|---|---|
| H1 | Horizontal Journey strip runs on mobile | components/Journey.tsx | `horizontal = !reduced` — viewport never checked | Phones get the 420vh sticky sideways strip; cards at 82vw with ghost year may overflow vertically on short screens | Mobile gets the vertical editorial stack (which already exists as the reduced-motion branch) | Gate on viewport too: `const horizontal = !reduced && !isMobile` (the unused `useIsMobile` hook exists for exactly this) |
| H2 | `verifyDonation` is publicly callable for any session id | convex/donations.ts | public action, no auth/rate limit | An attacker can enumerate/poll session ids (returns only a paid flag; also triggers markPaid writes) | Only the donor's return flow should verify | Move verification to a webhook with signature check, or bind session↔donation check server-side and rate-limit; keep browser return as UX-only |
| H3 | Bank-details block exists in data but has no UI | content/site.ts `DONATE.bankDetails`, Donate.tsx | UI renders only the "will appear here" note | If the ministry adds `bankDetails`, nothing changes on screen | Show official account details when configured | Add conditional render block in Donate.tsx reading `DONATE.bankDetails` |
| H4 | Hero CTA labels duplicated: data not rendered | components/Hero.tsx + site.ts `HERO.primaryCta/secondaryCta` | JSX hard-codes text while data holds copies | Editing `HERO.primaryCta.label` silently does nothing | Single source of truth | Render `HERO.primaryCta.label`/`href` from data in Hero.tsx |
| H5 | No spam/rate protection on public mutations | convex/conversations.ts, convex/donations.ts | public mutations accept any payload | Bots can flood conversations/donationIntents | Basic throttling | Add per-identity rate limit (Convex scheduler or action-side check), honeypot field, or CAPTCHA token on submit |

### MEDIUM
| ID | Issue | File | Cause | Current | Expected | Recommendation |
|---|---|---|---|---|---|---|
| M1 | Oversized images on mobile; no srcset | site.ts URLs + plain `<img>` | Unsplash URLs bake fixed widths (1000–2400) | 390px phone downloads ~2400px hero | Responsive delivery | Append `&w=800` variants per context or implement a small `SmartImage` with `srcset`/`sizes` |
| M2 | Stripe webhook absent | convex/donations.ts + http.ts | Confirmation depends on browser return | User closing tab before return leaves donation `created` forever | `checkout.session.completed` webhook marks paid | Add HTTP route + `STRIPE_WEBHOOK_SECRET` verification; keep verifyDonation as UX fallback |
| M3 | Donation display-currency mismatch risk | convex/donations.ts | INR only, no currency guard | Fine today | — | Note only; keep `amounts` and Stripe currency in sync when editing site.ts |
| M4 | `listConversations` dead code exported as mutation | convex/conversations.ts | placeholder | callable no-op | remove or implement behind auth | Delete or implement admin query with auth check |
| M5 | Donations `markPaid` scans all `created` rows | convex/donations.ts | by_status index + JS find | O(n) per verification | direct lookup | Add `by_providerPaymentId` index |
| M6 | Footer Privacy/Terms are dead links (`href="#"`) | site.ts `FOOTER.legal` | placeholders | Click jumps to top | Real policy pages or removal until real | Create routes/pages or link to PDFs; never ship `#` |
| M7 | Film description key unused | site.ts `FILM.description` | rendered nowhere | — | shown or removed | Render under film title or delete key |
| M8 | `package-lock.json` alongside `bun.lock` | root | npm install ran at some point | confusion/drift | one lockfile | Delete package-lock.json (project uses bun) |
| M9 | Contact email/phone/address are null → footer shows "Contact details coming soon" | site.ts `CONTACT` | honest placeholder | works as designed | — | Fill when ministry provides; component already conditional |
| M10 | Auth pages (/auth, /dashboard) unthemed | pages/Auth.tsx, Dashboard.tsx | template defaults | jarring style break | at minimum brand them | Apply token classes or link-hide entirely |

### LOW
| ID | Issue | File | Recommendation |
|---|---|---|---|
| L1 | `RevealImage` primitive exported but unused | motion/Primitives.tsx | use or remove |
| L2 | `SocialHandle.editable` / image `editable` flags not consumed by UI | site.ts | documentation-only convention; fine |
| L3 | `useIsMobile` hook unused by homepage | hooks/use-mobile.ts | candidate for H1 fix |
| L4 | `mode` prop of AnimatedText ("mask"/"fade") accepted but only mask implemented | motion/Primitives.tsx | implement or drop |
| L5 | `@stripe/stripe-js` installed, never imported | package.json | remove or use for Elements |
| L6 | Chapter indices hard-coded per component (`chapter={2}`…) | all chapters | renumbering is manual when reordering |
| L7 | `FILM.label` reused as both label and first heading word ("Our journey / Our journey" in metadata row) | JourneyFilm.tsx | minor copy nit |
| L8 | Impact map: only ~3 pins; globe could mislead scale of work | ImpactMap.tsx | fine for v1; consider "work in N regions" framing |

---

## B. SECURITY AUDIT

| Area | Finding | Severity |
|---|---|---|
| Secrets | No secrets in code (Stripe key read from `process.env` server-side; OTP mail key lives in template auth file — platform-managed). `.env` not in repo. | ✅ |
| Payment data | Card data never touches the app (Stripe-hosted checkout). Amount validated client-side only — **server accepts any `amountInr`** (a crafted client could create ₹1 checkout). | 🟡 MEDIUM — add server-side min/max check in `createDonationCheckout` |
| Public mutations | `submitConversation`, `submitDonationIntent` unauthenticated, no rate limits, no CAPTCHA → spam/flood possible. | 🟡 HIGH (H5) |
| verifyDonation | Public poll of arbitrary session ids (H2). | 🟡 HIGH |
| Injection | Convex validators type-check args; React escapes output; no raw HTML rendering (`dangerouslySetInnerHTML` absent). XSS surface minimal. | ✅ |
| CSRF | Convex uses token-authenticated protocol, not cookies-for-actions; auth routes are Convex-managed. | ✅ |
| Uploads | None exist. | ✅ |
| Dependencies | `axios` used only server-side (auth file). No known-affected versions flagged in this inspection (not a full audit). | ✅/— |
| Admin surface | None exists (no admin routes) — nothing to protect yet; `users.role` field is a plain string, not enforced anywhere. | ✅ (note) |

## C. ACCESSIBILITY AUDIT

**Present (good):** semantic landmarks (`header/nav/main/section[aria-label]/footer/article/figure/figcaption/dl/ol`); one h1; chapter h2s; `sr-only` heading on Climax; `aria-pressed` on chips/regions/amounts; `role="radiogroup"` + `role="radio"`+`aria-checked` on frequency; labels bound via `htmlFor`; `aria-invalid` on errored inputs; errors `role="alert"`; `aria-expanded/label` on hamburger; custom cursor `aria-hidden` + hidden on touch; focus-visible outline token (2px sun); skip-… *(no skip link — see below)*; alt text everywhere; reduced-motion honored globally (JS + CSS); contrast strong (ink/ivory, rust on ivory ≈ 4.6:1, smoke on ivory ≈ 4.8:1).

**Issues:**
| ID | Issue | File | Recommendation |
|---|---|---|---|
| A1 | No "skip to content" link | Landing.tsx/main.tsx | Add visually-hidden skip anchor to `main` |
| A2 | Form errors not linked by `aria-describedby` | TalkToUs/Donate Field | Add id to error `<p>` + reference |
| A3 | Map region buttons: label lacks context of interactivity beyond name — show detail | ImpactMap.tsx | aria-label already has "show detail" ✅ — but panel isn't announced (no `aria-live`) | add `aria-live="polite"` to detail panel |
| A4 | Serve orbit nodes rely on 11px uppercase labels — small hit targets (~24px) | Serve.tsx | enlarge tap area (p-3) |
| A5 | Marquee content is decorative but focusable? — cards are divs/anchors inside infinite scroll; keyboard users get focus on moving cards | SocialHandles.tsx | acceptable v1; consider `prefers-reduced-motion` static grid |
| A6 | Journey horizontal section: scroll-jacked 420vh — screen-reader/keyboard flow still reaches all content (DOM order fine) | — | ok; H1 fix improves mobile further |
| A7 | Custom cursor does not replace native cursor (native still visible) — acceptable | Primitives | fine |
| A8 | Video has no captions track (none exists yet) | JourneyFilm | add `<track kind="captions">` when video ships |
| A9 | Donate custom-amount input: `inputMode="numeric"` but no `aria-describedby` for min/max hint | Donate.tsx | pair with A2 fix |
| A10 | `lang="en"` set ✅; page title unique ✅; heading order h1→h2→h3 ✅ | — | — |

---

## D. DESIGN ISSUES (visual audit — documentation only)

| ID | Issue | Where | Detail | Recommendation |
|---|---|---|---|---|
| D1 | Journey mobile strip crowding | Journey.tsx <768px | Ghost year (7rem) + 38vh image + text can exceed viewport height inside the sticky screen; text may clip on short phones | H1 fix resolves; also consider h-[32vh] image on mobile |
| D2 | Impact record em-dash ambiguity | ImpactMap.tsx | Empty values show "—" at rust/40 — reads as real data mark rather than "awaiting" | fine by design; consider "pending" label chip |
| D3 | Film metadata says "Placeholder poster" | JourneyFilm.tsx | Visitor-facing string admits placeholder status — intentional honesty, but reads unfinished once real poster lands | tie string to `poster.editable` flag |
| D4 | Section background rhythm: ivory→cream→ink→ivory→mist→ivory→ivory→cream→mist→cream→ink→ink | Landing order | Two consecutive ivory sections (Serve → ImpactStories) lack separation vs. other transitions | give ImpactStories a cream/ivory variation or hairline top border |
| D5 | Button sizing variance | Nav pill px-5 py-2.5 vs hero px-7 py-4 vs chips px-4 py-2.5 vs amounts py-3.5 | Intentional hierarchy but three different paddings for similar-looking outline styles | acceptable; document as scale |
| D6 | Founder overlap portrait may collide with statement at ~1024–1280px widths | Founders.tsx `md:right-[8%]` | Statement max width not constrained; long localized lines could run under portrait | add `md:max-w-[60%]` to statement block |
| D7 | Marquee speed: 30s kinetic loop is fast for 8rem text; 46s cards fine | SocialHandles.tsx | subjective | optional 40s |
| D8 | Duotone uniformity: hero duotone + heavy ink wash reads darker than other duotone images | Hero vs elsewhere | tonal consistency ok, but hero is the darkest surface on light nav scroll | acceptable |
| D9 | Donate success panel min-h 480 vs TalkToUs 420 | Donate.tsx/TalkToUs.tsx | inconsistent vertical rhythm between sibling success states | unify at 460 |
| D10 | Footer "Local time —" ticks with visitor's clock, not ministry location | Footer.tsx | label ambiguous | label as "Your local time" or pin to IST |
| D11 | Serve orbit labels can overlap at narrow-desktop (lg 1024) with 7 nodes | Serve.tsx | node text 11px at ±50% positions; whitespace-nowrap helps but tight | bump orbit max-w to 680 or shrink to 6 nodes at that width |
| D12 | Fragments `detail` caption hidden <sm — mobile loses descriptive layer | Fragments.tsx `hidden sm:block` | fine, but captions then carry only "Fragment / 00X" | consider stacking on mobile |

### Visual-rhythm verdict
Palette discipline is high (orange strictly as accent; neutrals carry layout). Typography scale is consistent (one clamp family per role). The main consistency gaps are D1/D4/D9/D11 — all local, none structural.

---

## PRIORITY SUMMARY

1. **Do first:** H1 (mobile Journey), H5 (form spam), H2 (verify endpoint), M6 (dead legal links)
2. **Before launch:** H3/H4, M1 (responsive images), M2 (webhook), server-side amount check (Security), A1/A2 (a11y)
3. **Polish:** D-series, M-series cleanups (L5, M7, M8), auth-page theming (M10)
