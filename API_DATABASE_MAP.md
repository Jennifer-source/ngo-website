# API & DATABASE MAP

Backend = Convex. There are **no REST API routes** — the only HTTP endpoints are Convex Auth routes via `src/convex/http.ts`. All app data flows through Convex functions called from React via `api.*` references.

---

## 1. DATABASE (Convex document store)

**File:** `src/convex/schema.ts`. No migrations (schema push), no seeds, no relations (document DB — references are by convention only).

### `conversations` — contact/enquiry submissions
| Field | Type | Notes |
|---|---|---|
| name | string | |
| email | string | |
| phone | optional string | |
| pathway | union literal: `general \| volunteer \| partnership \| prayer \| media` | matches form chips |
| message | string | |
| status | optional string | set to `"new"` on insert |
| createdAt | number | ms epoch |
**Indexes:** `by_createdAt(createdAt)`
**Writers:** `conversations.submitConversation` · **Readers:** none (no admin UI yet)

### `donationIntents` — fallback/manual-giving records
| Field | Type | Notes |
|---|---|---|
| name / email | string | |
| phone | optional string | |
| frequency | `one-time \| monthly` | |
| amountInr | number | |
| message | optional string | |
| status | string | `"submitted"` |
| createdAt | number | |
**Indexes:** `by_createdAt` · **Writers:** `donations.submitDonationIntent` (also called from the checkout action's no-key fallback) · **Readers:** none

### `donations` — Stripe-tracked gifts
| Field | Type | Notes |
|---|---|---|
| conversationReference | optional string | **never populated anywhere** |
| donorName / donorEmail | string | |
| frequency | `one-time \| monthly` | |
| amountInr | number | |
| currency | string | always `"INR"` |
| provider | string | `"stripe"` |
| providerPaymentId | optional string | Stripe Checkout Session id |
| status | string | `created → paid` (failed/refunded reserved, never written) |
| createdAt | number | |
**Indexes:** `by_status(status)`, `by_createdAt` · **Writers:** `donations.recordDonation` (internal), `donations.markPaid` (internal) · **Readers:** `markPaid` (status-scan + JS filter)

### `users` — Convex Auth (template)
name?, image?, email? (+ index `email`), emailVerificationTime?, isAnonymous?, role? (plain string — the template's role validator was simplified). Managed by Convex Auth; only read by `users.currentUser`.

### authTables (spread into schema)
Convex Auth system tables (authSessions, authAccounts, authUsers, authVerifications…). Do not touch.

### Relationship diagram
```
TalkToUs form ──submitConversation──▶ conversations (status "new")
Donate form ──┬─(no STRIPE key)──▶ donationIntents (status "submitted")
              └─(key present)──▶ Stripe Checkout Session
                                   └─recordDonation──▶ donations (status "created")
return ?donation=success&session_id=…
              └─verifyDonation──▶ Stripe retrieve ──markPaid──▶ donations (status "paid")
users ◀── Convex Auth (email OTP / anonymous) — separate world from public forms
```
No foreign keys; the only functional join is `donations.providerPaymentId === Stripe session id`.

---

## 2. FUNCTION (API) INVENTORY

| # | Method | Convex path | Purpose | Request args | Response | DB | Auth | Validation | Used by |
|---|---|---|---|---|---|---|---|---|---|
| 1 | POST (mutation) | `conversations.submitConversation` | Persist enquiry | name, email, phone?, pathway(union), message | insert id | conversations INSERT | public | Convex arg validator (types only) | TalkToUs.tsx |
| 2 | POST (mutation) | `conversations.listConversations` | **Intentional no-op** placeholder for future admin view | {} | null | — | public (harmless) | — | nothing |
| 3 | POST (mutation) | `donations.submitDonationIntent` | Record gift intent (fallback/manual) | name, email, phone?, frequency, amountInr, message? | `{id, reference: "HG-…"}` | donationIntents INSERT | public | arg validator | Donate.tsx indirectly (via #4), convex/donations.ts |
| 4 | POST (action) | `donations.createDonationCheckout` | Create Stripe Checkout OR record intent | donorName, donorEmail, frequency, amountInr, message? | `{mode:"checkout", url, reference}` \| `{mode:"intent", reference}` | donations INSERT (checkout path) / donationIntents INSERT (fallback) | public | arg validator only — **no amount/length re-validation server-side** | Donate.tsx |
| 5 | POST (action) | `donations.verifyDonation` | Verify a returned session | sessionId | `{paid: boolean}` | donations PATCH (status→paid) | public — **any visitor can query any session id** (returns only paid flag) | arg validator | Donate.tsx (on return from Stripe) |
| 6 | internal | `donations.recordDonation` | Insert donation row | donorName, donorEmail, frequency, amountInr, currency, provider, providerPaymentId?, status | id | INSERT | internal (server-only) | — | called by #4 |
| 7 | internal | `donations.markPaid` | Mark donation paid | providerPaymentId | void | UPDATE via by_status scan + filter | internal | — | called by #5 |
| 8 | GET (query) | `users.currentUser` | Current authed user | {} | user doc \| null | users READ | auth-aware | — | useAuth hook (template pages) |
| 9 | HTTP | `https://…convex.cloud/api/*` | Convex protocol + auth routes (via http.ts: `auth.addHttpRoutes`) | — | — | — | per-route | — | Convex client |

No PUT/PATCH/DELETE HTTP routes exist. GET/POST/PUT/PATCH/DELETE as REST verbs: **NOT FOUND IN CURRENT PROJECT** (Convex mutations/actions are the API).

### Stripe integration detail (in #4)
- `mode`: `subscription` (monthly) / `payment` (one-time)
- `payment_method_types: ["card"]` — UPI/netbanking NOT enabled yet (dashboard setting)
- `unit_amount: amountInr * 100` (paise); currency INR; product name "Donation to Hands of Grace"
- `metadata`: donorName, frequency, message
- `success_url`: `{FRONTEND_URL}/?donation=success&session_id={CHECKOUT_SESSION_ID}`; `cancel_url`: `{FRONTEND_URL}/?donation=cancelled#donate`
- `FRONTEND_URL` falls back to `http://localhost:5173` if unset — **set it in production or redirects break**
- No webhook receiver exists — payment confirmation relies on the returning browser calling verifyDonation. If the user never returns, the donation row stays `created`.

---

## 3. ENVIRONMENT VARIABLES (names only — values live in the platform Keys tab)

| Variable | Purpose | Used by | Required | Public/Private |
|---|---|---|---|---|
| `VITE_CONVEX_URL` | Convex deployment URL for the browser client | `src/main.tsx` (ConvexReactClient) | **Yes — app cannot boot without it** | Public (by design, Vite prefix) |
| `STRIPE_SECRET_KEY` | Server-side Stripe API key | `convex/donations.ts` (#4, #5) | Optional — without it, donate falls back to intent mode | **Private** (node runtime only; never import into client) |
| `FRONTEND_URL` | Origin for Stripe redirect URLs | `convex/donations.ts` #4 | Optional in dev; **effectively required in production** (else localhost fallback) | Private |
| `VLY_CONVEX_AUTH_ISSUER` | Federated token issuer override | `convex/auth.config.ts` | No (defaults to freebuff.com) | Private |
| `CONVEX_SITE_URL` | Convex self-issued JWT domain | `convex/auth.config.ts` | Platform-managed | Private |
| `VLY_APP_NAME` | App name in OTP emails | `convex/auth/emailOtp.ts` | No (has default) | Private |

**NOT FOUND IN CURRENT PROJECT:** any public Stripe publishable key usage (the `@stripe/stripe-js` client package is installed but never imported — checkout is full-page redirect, no Elements), any `STRIPE_WEBHOOK_SECRET` receiver (the variable was suggested during setup but no webhook code exists).

---

## 4. DEPLOYMENT

**Platform:** Freebuff managed runtime (Vly) — dev server and Convex dev process run as managed background sessions; file edits are picked up automatically. Do not run `bun run dev` / `vite` / `convex dev` (without `--once`) manually in this environment.

| Task | Command |
|---|---|
| Typecheck (frontend) | `bun tsc -b --noEmit` |
| Push Convex + regenerate types | `bunx convex dev --once` |
| Convex codegen check before frontend work | `bunx convex dev --once && bun tsc -b --noEmit` |
| Production build (as configured) | `bun run build` (= `tsc -b && vite build`) |
| Lint / format | `bun run lint` / `bun run format` |

**Build requirements:** Node ≥20 (Vite 7 engines), bun, Convex deployment bound (`charming-goat-122.convex.cloud` per dev logs), env vars above set in the platform.

**Database requirements:** none beyond the Convex deployment (serverless).

**Common deployment errors (seen in this project's history):**
1. `MissingSchemaExportError: Schema file missing default export` — schema.ts must `export default schema`.
2. Removing `authTables`/`users` from schema breaks the template auth compile (`Id<"users">` errors).
3. Using `useMutation` for a Convex **action** → type error "action is not assignable to mutation" (must use `useAction`).
4. Missing `currency` field on donations insert (schema requires it).
5. Forgetting `--once` on `convex dev` hangs the non-interactive terminal.
6. Stale `_generated` types after schema edits → run codegen before frontend edits.

**Git/version control:** managed by the platform; git commands are blocked in this environment. Repository/branches/remote: **NOT FOUND IN CURRENT PROJECT**.
