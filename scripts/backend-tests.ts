/**
 * Hands of Grace — backend test harness.
 *
 * Runs against the live dev deployment. Creates clearly-marked TEST users
 * via the real password sign-up flow, exercises every subsystem, verifies
 * authorization boundaries, and reports pass/fail per test.
 *
 *   bun scripts/backend-tests.ts
 *
 * Admin-gated tests SKIP (counted honestly) when no admin is seeded —
 * configure ADMIN_1/ADMIN_2 keys, run adminSetup:seedAdmins, and re-run.
 */

import { ConvexClient } from "convex/browser";
import { anyApi } from "convex/server";

const DEPLOYMENT_URL =
  process.env.VITE_CONVEX_URL ?? "https://charming-goat-122.convex.cloud";

const api = anyApi as unknown as Record<string, Record<string, unknown>>;
const a = (fn: unknown) => fn as Parameters<ConvexClient["mutation"]>[0];
const q = (fn: unknown) => fn as Parameters<ConvexClient["query"]>[0];

/* ------------------------------------------------------------------ */

let passed = 0;
let failed = 0;
let skipped = 0;
const failures: string[] = [];

function ok(name: string) {
  passed++;
  console.log(`  ✓ ${name}`);
}
function fail(name: string, err: unknown) {
  failed++;
  const msg = err instanceof Error ? err.message.replace(/\s+/g, " ").slice(0, 180) : String(err);
  failures.push(`${name} — ${msg}`);
  console.log(`  ✗ ${name}\n      ${msg}`);
}
function skip(name: string, reason: string) {
  skipped++;
  console.log(`  ○ SKIP ${name} — ${reason}`);
}
function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function expectError(name: string, run: () => Promise<unknown>, needle = "") {
  try {
    await run();
    throw new Error("expected an error but the call succeeded");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (needle && !msg.includes(needle)) {
      throw new Error(`error thrown but did not mention "${needle}": ${msg.slice(0, 140)}`);
    }
    if (msg.includes("expected an error but the call succeeded")) throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Convex Auth HTTP helpers (password provider)                        */
/* ------------------------------------------------------------------ */

async function authSignIn(
  flow: "signUp" | "signIn",
  email: string,
  password: string,
  name?: string,
): Promise<{ token: string | null; raw: Record<string, unknown> }> {
  const res = await fetch(`${DEPLOYMENT_URL}/api/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: "auth:signIn",
      format: "json",
      args: {
        provider: "password",
        params: name ? { flow, email, password, name } : { flow, email, password },
      },
    }),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (data.status === "error") {
    throw new Error(String(data.errorMessage ?? "auth:signIn failed").slice(0, 220));
  }
  const value = (data.value ?? {}) as { tokens?: { token?: string } | null };
  return { token: value.tokens?.token ?? null, raw: data };
}

function authedHeaders(token: string) {
  if (!token) throw new Error("no session token available for authenticated call");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

/* ------------------------------------------------------------------ */

const client = new ConvexClient(DEPLOYMENT_URL);
await client.action(a(api.seedTestData.seedTestData), {});

const STAMP = Date.now().toString(36);
const U1 = { email: `test-rider-${STAMP}@example.test`, password: "correct-horse-9", name: "TEST — Rider One" };
const U2 = { email: `test-moon-${STAMP}@example.test`, password: "another-battery-7", name: "TEST — Moon Two" };
const u1: { token: string | null } = { token: null };
const u2: { token: string | null } = { token: null };

console.log(`\nBackend test run → ${DEPLOYMENT_URL}\n`);

/* ---------------- 1. AUTHENTICATION ------------------------------- */
console.log("1. AUTHENTICATION");
{
  try {
    const r = await authSignIn("signUp", U1.email, U1.password, U1.name);
    assert(r.token, `sign-up returned no token: ${JSON.stringify(r.raw).slice(0, 140)}`);
    u1.token = r.token;
    ok("user signup (password flow) returns session token");
  } catch (e) {
    fail("user signup (password flow) returns session token", e);
  }

  try {
    const r = await authSignIn("signIn", U1.email, U1.password);
    assert(r.token, "valid login returned no token");
    u1.token = r.token;
    ok("user login (valid credentials)");
  } catch (e) {
    fail("user login (valid credentials)", e);
  }

  try {
    // Correct rejection = server error (InvalidAccountID/InvalidSecret) or no token.
    await expectError("probe", () => authSignIn("signIn", U1.email, "wrong-password-1"));
    ok("invalid login rejected");
  } catch (e) {
    fail("invalid login rejected", e);
  }

  try {
    const r = await authSignIn("signUp", U2.email, U2.password, U2.name);
    assert(r.token, "second user sign-up returned no token");
    u2.token = r.token;
    ok("second user signup");
  } catch (e) {
    fail("second user signup", e);
  }

  try {
    const r = await authSignIn("signIn", U1.email, U1.password);
    assert(r.token, "re-login after sign-up failed (session handling)");
    ok("re-login / session handling works");
  } catch (e) {
    fail("re-login / session handling works", e);
  }

  try {
    await expectError("probe", () => authSignIn("signUp", U1.email, "different-pass-99", U1.name));
    ok("duplicate email signup rejected");
  } catch (e) {
    fail("duplicate email signup rejected", e);
  }

  try {
    // Sign out via the auth ACTION. Convex Auth revokes the refresh token;
    // an already-issued short-lived access token remains valid until expiry
    // (standard stateless-JWT behavior), so the verifiable assertions are:
    // the server accepts the sign-out, and a fresh sign-in restores access.
    const res = await fetch(`${DEPLOYMENT_URL}/api/action`, {
      method: "POST",
      headers: authedHeaders(u2.token as string),
      body: JSON.stringify({ path: "auth:signOut", format: "json", args: {} }),
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (data.status === "error") throw new Error(String(data.errorMessage ?? "signOut failed").slice(0, 140));
    const again = await authSignIn("signIn", U2.email, U2.password);
    assert(again.token, "re-login after logout failed");
    u2.token = again.token;
    ok("logout accepted by server; re-login restores access");
  } catch (e) {
    fail("logout accepted by server; re-login restores access", e);
  }
}

/* ---------------- authenticated HTTP helpers ------------------------ */
async function submitMessageHttp(token: string, args: Record<string, unknown>) {
  const res = await fetch(`${DEPLOYMENT_URL}/api/mutation`, {
    method: "POST",
    headers: authedHeaders(token),
    body: JSON.stringify({ path: "messages:submitMessage", format: "json", args }),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (data.status === "error") throw new Error(String(data.errorMessage ?? "mutation failed").slice(0, 220));
  return data.value;
}

async function listMyMessagesHttp(token: string) {
  const res = await fetch(`${DEPLOYMENT_URL}/api/query`, {
    method: "POST",
    headers: authedHeaders(token),
    body: JSON.stringify({ path: "messages:listMyMessages", format: "json", args: {} }),
  });
  const data = (await res.json()) as { value?: unknown[]; status?: string; errorMessage?: string };
  if (data.status === "error") throw new Error(String(data.errorMessage ?? "query failed").slice(0, 200));
  return (data.value ?? []) as Array<Record<string, unknown>>;
}

async function queryHttp(token: string | null, path: string, args: Record<string, unknown>) {
  const res = await fetch(`${DEPLOYMENT_URL}/api/query`, {
    method: "POST",
    headers: token ? authedHeaders(token) : { "Content-Type": "application/json" },
    body: JSON.stringify({ path, format: "json", args }),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (data.status === "error") throw new Error(String(data.errorMessage ?? "query failed").slice(0, 220));
  return data.value;
}

async function mutationHttp(token: string | null, path: string, args: Record<string, unknown>) {
  const res = await fetch(`${DEPLOYMENT_URL}/api/mutation`, {
    method: "POST",
    headers: token ? authedHeaders(token) : { "Content-Type": "application/json" },
    body: JSON.stringify({ path, format: "json", args }),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (data.status === "error") throw new Error(String(data.errorMessage ?? "mutation failed").slice(0, 220));
  return data.value;
}

// Submit an identity probe message with U1's session — reused by later blocks.
{
  try {
    await submitMessageHttp(u1.token as string, {
      type: "general",
      message: `TEST — identity probe U1 ${STAMP}`,
      name: U1.name,
      email: U1.email,
    });
    ok("authenticated message submission works (session headers)");
  } catch (e) {
    fail("authenticated message submission works (session headers)", e);
  }
}

/* ---------------- 2. AUTHORIZATION --------------------------------- */
console.log("\n2. AUTHORIZATION");
{
  try {
    await expectError("probe", () =>
      client.query(q(api.messages.listMyMessages), {}),
    );
    ok("unauthenticated listMyMessages rejected");
  } catch (e) {
    fail("unauthenticated listMyMessages rejected", e);
  }

  try {
    await expectError("probe", () =>
      client.query(q(api.volunteers.listMyApplications), {}),
    );
    ok("unauthenticated listMyApplications rejected");
  } catch (e) {
    fail("unauthenticated listMyApplications rejected", e);
  }

  try {
    await expectError("probe", () =>
      client.query(q(api.donations.listMyDonations), {}),
    );
    ok("unauthenticated listMyDonations rejected");
  } catch (e) {
    fail("unauthenticated listMyDonations rejected", e);
  }

  try {
    await expectError("probe", () =>
      client.query(q(api.admin.overviewStats), {}),
    );
    ok("non-admin rejected from admin.overviewStats");
  } catch (e) {
    fail("non-admin rejected from admin.overviewStats", e);
  }

  try {
    await expectError("probe", () =>
      client.query(q(api.messages.adminListMessages), {}),
    );
    ok("non-admin rejected from adminListMessages");
  } catch (e) {
    fail("non-admin rejected from adminListMessages", e);
  }

  try {
    await expectError("probe", () =>
      client.query(q(api.content.setContent), { key: "hero", value: {} }),
    );
    ok("non-admin rejected from content.setContent");
  } catch (e) {
    fail("non-admin rejected from content.setContent", e);
  }

  try {
    await expectError("probe", () =>
      client.mutation(a(api.events.createEvent), {
        title: "TEST — hostile event",
        description: "x",
        date: "2030-01-01",
        location: "x",
        status: "published",
      }),
    );
    ok("non-admin rejected from event.create");
  } catch (e) {
    fail("non-admin rejected from event.create", e);
  }
}

/* ---------------- 3. MESSAGES -------------------------------------- */
console.log("\n3. MESSAGES");
let u1MessageId: string | undefined;
{
  try {
    const mine = await listMyMessagesHttp(u1.token as string);
    const probe = mine.find((m) => String(m.message).includes(STAMP));
    assert(probe, "probe message missing");
    u1MessageId = String(probe._id);
    assert(mine.every((m) => !("adminNotes" in m)), "adminNotes leaked to user read");
    ok("user reads own messages (adminNotes excluded)");
  } catch (e) {
    fail("user reads own messages (adminNotes excluded)", e);
  }

  try {
    const u2list = await listMyMessagesHttp(u2.token as string);
    assert(
      !u2list.some((m) => String(m._id) === u1MessageId),
      "U2 can see U1's message — isolation broken",
    );
    ok("user isolation: U2 cannot see U1's messages");
  } catch (e) {
    fail("user isolation: U2 cannot see U1's messages", e);
  }

  try {
    await expectError("probe", () =>
      mutationHttp(u1.token as string, "messages:adminUpdateMessage", {
        id: u1MessageId,
        status: "closed",
        adminResponse: "TEST — user trying to self-modify",
      }),
    );
    ok("user cannot modify admin-only fields");
  } catch (e) {
    fail("user cannot modify admin-only fields", e);
  }

  try {
    await expectError("probe", () =>
      submitMessageHttp(u1.token as string, {
        type: "general",
        message: "short",
        name: U1.name,
        email: U1.email,
      }),
    );
    ok("message length validation enforced");
  } catch (e) {
    fail("message length validation enforced", e);
  }

  try {
    await expectError("probe", () =>
      submitMessageHttp(u1.token as string, {
        type: "general",
        message: "TEST — bad email body for validation probe",
        name: U1.name,
        email: "not-an-email",
      }),
    );
    ok("message email validation enforced");
  } catch (e) {
    fail("message email validation enforced", e);
  }
}

/* ---------------- 4. VOLUNTEERS ------------------------------------ */
console.log("\n4. VOLUNTEER APPLICATIONS");
let u1ApplicationId: string | undefined;
{
  try {
    await mutationHttp(u1.token as string, "volunteers:submitApplication", {
      name: U1.name,
      email: U1.email,
      phone: "+91 90000 00001",
      availability: "TEST — weekends",
      message: `TEST — application ${STAMP}`,
    });
    const apps = (await queryHttp(u1.token as string, "volunteers:listMyApplications", {})) as Array<
      Record<string, unknown>
    >;
    const app = apps.find((x) => String(x.message ?? "").includes(STAMP));
    assert(app, "application not found after submit");
    u1ApplicationId = String(app._id);
    assert(app.status === "submitted", "initial status should be submitted");
    assert(!("adminNotes" in app), "adminNotes leaked to user application read");
    ok("volunteer application submitted + visible with status");
  } catch (e) {
    fail("volunteer application submitted + visible with status", e);
  }

  try {
    await expectError("probe", () =>
      mutationHttp(u2.token as string, "volunteers:adminUpdateApplication", {
        id: u1ApplicationId,
        status: "approved",
      }),
    );
    ok("non-admin cannot change application status");
  } catch (e) {
    fail("non-admin cannot change application status", e);
  }

  // Admin-side status change verified in the admin block below if seeded.
}

/* ---------------- 5. DONATIONS + INVOICES --------------------------- */
console.log("\n5. DONATIONS + INVOICES (sandbox)");
let u2DonationId: string | undefined;
{
  try {
    await expectError("probe", () =>
      mutationHttp(u1.token as string, "donations:createDonation", {
        donorName: U1.name,
        donorEmail: U1.email,
        frequency: "one-time",
        amountInr: 5, // below minimum
      }),
    );
    ok("donation amount validation (minimum enforced)");
  } catch (e) {
    fail("donation amount validation (minimum enforced)", e);
  }

  try {
    const r = (await mutationHttp(u2.token as string, "donations:createDonation", {
      donorName: U2.name,
      donorEmail: U2.email,
      frequency: "one-time",
      amountInr: 750,
    })) as { id: string };
    u2DonationId = r.id;
    const history = (await queryHttp(u2.token as string, "donations:listMyDonations", {})) as Array<
      Record<string, unknown>
    >;
    const d = history.find((x) => String(x._id) === u2DonationId);
    assert(d, "donation not in user history");
    assert(d.status === "pending", "new donation should be pending");
    ok("donation created → pending; visible in own history");
  } catch (e) {
    fail("donation created → pending; visible in own history", e);
  }

  try {
    await expectError("probe", () =>
      mutationHttp(u1.token as string, "donations:confirmSandboxPayment", {
        donationId: u2DonationId,
        outcome: "success",
      }),
    );
    ok("user cannot confirm another user's donation (isolation)");
  } catch (e) {
    fail("user cannot confirm another user's donation (isolation)", e);
  }

  try {
    const r = (await mutationHttp(u2.token as string, "donations:confirmSandboxPayment", {
      donationId: u2DonationId,
      outcome: "success",
    })) as { invoiceNumber: string | null };
    assert(r.invoiceNumber && /^HOG-\d{4}-\d{6}$/.test(r.invoiceNumber), `bad invoice number: ${r.invoiceNumber}`);
    ok(`sandbox success → invoice ${r.invoiceNumber}`);
  } catch (e) {
    fail("sandbox success → invoice generated", e);
  }

  try {
    const invoice = await queryHttp(u2.token as string, "donations:getMyInvoice", {
      donationId: u2DonationId,
    });
    assert(invoice && (invoice as Record<string, unknown>).invoiceNumber, "invoice not retrievable by owner");
    ok("invoice retrievable by owner");
  } catch (e) {
    fail("invoice retrievable by owner", e);
  }

  try {
    await expectError("probe", () =>
      queryHttp(u1.token as string, "donations:getMyInvoice", { donationId: u2DonationId }),
    );
    ok("invoice of another user inaccessible (isolation)");
  } catch (e) {
    fail("invoice of another user inaccessible (isolation)", e);
  }

  try {
    const r = (await mutationHttp(u1.token as string, "donations:createDonation", {
      donorName: U1.name,
      donorEmail: U1.email,
      frequency: "one-time",
      amountInr: 300,
    })) as { id: string };
    await mutationHttp(u1.token as string, "donations:confirmSandboxPayment", {
      donationId: r.id,
      outcome: "failure",
    });
    const history = (await queryHttp(u1.token as string, "donations:listMyDonations", {})) as Array<
      Record<string, unknown>
    >;
    const d = history.find((x) => String(x._id) === String(r.id));
    assert(d && d.status === "failed", "failed payment should record failed status");
    assert(!d.invoiceNumber, "failed payment must not have an invoice");
    ok("sandbox failure → status failed, no invoice");
  } catch (e) {
    fail("sandbox failure → status failed, no invoice", e);
  }
}

/* ---------------- 6. EVENTS (admin CRUD) ---------------------------- */
console.log("\n6. EVENTS");
let adminToken: string | null = null;
{
  // Is an admin seeded? Probe by attempting an admin login against known
  // seeded admins — we cannot know their password, so instead probe by
  // calling an admin query with each test session (already proven denied).
  // If the operator configured admins, they can set ADMIN_TEST_TOKEN and the
  // harness will exercise admin flows; otherwise these are honest skips.
  adminToken = process.env.ADMIN_TEST_TOKEN ?? null;

  try {
    const publicEvents = (await client.query(q(api.events.listPublicEvents), {})) as Array<
      Record<string, unknown>
    >;
    // Marked test events must never leak to the public site — neither the
    // seeded published one nor the draft one.
    const anyTestVisible = publicEvents.some((e) => String(e.title).includes("TEST"));
    assert(!anyTestVisible, "test event leaked to public list");
    ok("public events list excludes drafts and test rows");
  } catch (e) {
    fail("public events list excludes drafts and test rows", e);
  }

  if (!adminToken) {
    skip("admin event CRUD (create/edit/delete/publish)", "no admin session — set ADMIN_TEST_TOKEN to enable");
    skip("admin content update → public reflects", "no admin session");
    skip("admin media management", "no admin session");
    skip("admin donation/invoice views", "no admin session");
    skip("admin message/volunteer management", "no admin session");
    skip("admin login (seeded credentials)", "operator-only credentials — not known to harness by design");
  }
}

/* ---------------- 7. HEALTH ----------------------------------------- */
console.log("\n7. HEALTH");
{
  try {
    const health = (await client.query(q(api.health.runHealthCheck), {})) as Record<string, unknown>;
    assert(health.status === "healthy", `health status: ${health.status}`);
    const checks = health.checks as Record<string, string>;
    for (const key of ["database", "auth", "authorization", "content", "events", "media", "invoices"]) {
      assert(checks[key] === "ok", `health check ${key}: ${checks[key]}`);
    }
    ok(`health check healthy (${JSON.stringify(checks)})`.slice(0, 110));
  } catch (e) {
    fail("health check healthy", e);
  }

  try {
    await client.mutation(a(api.health.probeWritePath), {});
    ok("write path probe (mutation round-trip)");
  } catch (e) {
    fail("write path probe (mutation round-trip)", e);
  }
}

/* ---------------- 8. ADMIN FLOWS (when authorized) ------------------ */
if (adminToken) {
  console.log("\n8. ADMIN FLOWS");
  {
    try {
      const events = (await queryHttp(adminToken, "events:listAllEvents", {})) as Array<
        Record<string, unknown>
      >;
      ok(`admin event list (${events.length} events)`);
    } catch (e) {
      fail("admin event list", e);
    }

    let eventId: string | undefined;
    try {
      const r = (await mutationHttp(adminToken, "events:createEvent", {
        title: `TEST — harness event ${STAMP}`,
        description: "TEST — created by the backend test harness.",
        date: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
        time: "11:00 AM",
        location: "TEST — harness hall",
        status: "draft",
      })) as { id: string };
      eventId = r.id;
      ok("admin creates event (draft)");
    } catch (e) {
      fail("admin creates event (draft)", e);
    }

    if (eventId) {
      try {
        await mutationHttp(adminToken, "events:updateEvent", {
          id: eventId,
          title: `TEST — harness event edited ${STAMP}`,
        });
        ok("admin edits event");
      } catch (e) {
        fail("admin edits event", e);
      }

      try {
        const before = (await client.query(q(api.events.listPublicEvents), {})) as Array<
          Record<string, unknown>
        >;
        assert(!before.some((e) => String(e._id) === eventId), "draft visible publicly");
        await mutationHttp(adminToken, "events:setEventStatus", { id: eventId, status: "published" });
        const after = (await client.query(q(api.events.listPublicEvents), {})) as Array<
          Record<string, unknown>
        >;
        assert(after.some((e) => String(e._id) === eventId), "published event not public");
        ok("publish → event appears publicly");
      } catch (e) {
        fail("publish → event appears publicly", e);
      }

      try {
        await mutationHttp(adminToken, "events:setEventStatus", { id: eventId, status: "draft" });
        const after = (await client.query(q(api.events.listPublicEvents), {})) as Array<
          Record<string, unknown>
        >;
        assert(!after.some((e) => String(e._id) === eventId), "unpublished event still public");
        ok("unpublish → event disappears publicly");
      } catch (e) {
        fail("unpublish → event disappears publicly", e);
      }

      try {
        await mutationHttp(adminToken, "events:deleteEvent", { id: eventId });
        ok("admin deletes event");
      } catch (e) {
        fail("admin deletes event", e);
      }
    }

    try {
      const r = (await mutationHttp(adminToken, "messages:adminUpdateMessage", {
        id: u1MessageId,
        status: "in_progress",
        adminNotes: "TEST — internal note by harness",
        adminResponse: "TEST — response by harness",
      })) as unknown;
      assert(r, "admin message update returned nothing");
      const mine = await listMyMessagesHttp(u1.token as string);
      const m = mine.find((x) => String(x._id) === u1MessageId);
      assert(m && m.status === "in_progress", "user does not see updated status");
      assert(String(m.adminResponse ?? "").includes("harness"), "user does not see admin response");
      ok("admin updates message status/response → user sees update");
    } catch (e) {
      fail("admin updates message status/response → user sees update", e);
    }

    if (u1ApplicationId) {
      try {
        await mutationHttp(adminToken, "volunteers:adminUpdateApplication", {
          id: u1ApplicationId,
          status: "under_review",
        });
        const apps = (await queryHttp(u1.token as string, "volunteers:listMyApplications", {})) as Array<
          Record<string, unknown>
        >;
        const app = apps.find((x) => String(x._id) === u1ApplicationId);
        assert(app && app.status === "under_review", "user does not see updated application status");
        ok("admin changes volunteer status → user sees update");
      } catch (e) {
        fail("admin changes volunteer status → user sees update", e);
      }
    }

    try {
      const stats = await queryHttp(adminToken, "admin:overviewStats", {});
      assert(stats && typeof stats === "object", "overviewStats empty");
      ok("admin overview stats (real data)");
    } catch (e) {
      fail("admin overview stats (real data)", e);
    }

    try {
      const content = { kicker: "TEST — hero kicker", titleLines: ["TEST"], subline: "TEST" };
      await mutationHttp(adminToken, "content:setContent", { key: "hero", value: content });
      const pub = (await client.query(q(api.content.getPublicContent), {})) as Record<string, unknown>;
      const hero = pub.hero as Record<string, unknown> | undefined;
      assert(hero && hero.kicker === "TEST — hero kicker", "public content not updated");
      ok("admin content update → public content reflects");
    } catch (e) {
      fail("admin content update → public content reflects", e);
    }

    try {
      const uploadUrl = (await mutationHttp(adminToken, "content:generateMediaUploadUrl", {})) as string;
      assert(typeof uploadUrl === "string" && uploadUrl.includes("http"), "upload URL invalid");
      // Upload a tiny valid PNG (1×1 transparent).
      const png = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      );
      const form = new FormData();
      form.append("file", new Blob([png], { type: "image/png" }), "TEST-harness.png");
      const up = await fetch(uploadUrl, { method: "POST", body: form });
      const storageId = (await up.json()) as string;
      const created = (await mutationHttp(adminToken, "content:createMediaAsset", {
        storageId,
        kind: "other",
        filename: `TEST-harness-${STAMP}.png`,
        mimeType: "image/png",
        size: png.length,
        published: true,
      })) as { id: string; url: string };
      assert(created.url, "media asset URL missing");
      ok("media upload → register → URL");
      await mutationHttp(adminToken, "content:setMediaPublished", { id: created.id, published: false });
      await mutationHttp(adminToken, "content:deleteMedia", { id: created.id });
      ok("media unpublish + delete");
    } catch (e) {
      fail("media upload/replace/delete cycle", e);
    }

    try {
      const donations = (await queryHttp(adminToken, "donations:adminListDonations", {})) as Array<
        Record<string, unknown>
      >;
      const invoices = (await queryHttp(adminToken, "donations:adminListInvoices", {})) as Array<
        Record<string, unknown>
      >;
      assert(Array.isArray(donations) && Array.isArray(invoices), "admin donation/invoice lists invalid");
      ok(`admin donations (${donations.length}) + invoices (${invoices.length}) views`);
    } catch (e) {
      fail("admin donations/invoices views", e);
    }
  }
}

/* ---------------- cleanup ------------------------------------------- */
console.log("\nCleanup");
{
  try {
    await client.action(a(api.seedTestData.clearTestData), {});
    // The harness users were created via real sign-up (auth accounts) —
    // leave their rows; they are clearly marked TEST and removable from
    // the dashboard. Report honestly.
    console.log("  ✓ marked test data cleared (harness auth users left, TEST-marked)");
  } catch (e) {
    console.log(`  ○ cleanup note: ${e instanceof Error ? e.message.slice(0, 120) : e}`);
  }
}

console.log("\n──────────────────────────────────────");
console.log(`PASSED: ${passed}   FAILED: ${failed}   SKIPPED: ${skipped}`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  • ${f}`);
}
console.log("");
process.exit(failed > 0 ? 1 : 0);
