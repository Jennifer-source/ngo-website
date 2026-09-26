import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Test data — clearly marked, safe, and removable. Every row carries
 * isTest: true and "TEST —" prefixed text so no record can be mistaken
 * for a real person, message, application, donation or event.
 *
 *   bunx convex run seedTestData:seedTestData     # insert
 *   bunx convex run seedTestData:clearTestData    # remove
 */

/** Test user emails are @example.test — a reserved-looking, non-routable domain. */
const TEST_USER_A = "test-seema@example.test";
const TEST_USER_B = "test-arjun@example.test";

const now = () => Date.now();

/** Insert (or reuse) a clearly-marked test user. */
export const ensureTestUser = internalMutation({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: undefined,
    });
  },
});

export const seedInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const summary: Record<string, number> = {};

    // --- Test users -------------------------------------------------------
    const userA = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", TEST_USER_A))
      .unique();
    const userB = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", TEST_USER_B))
      .unique();
    const a =
      userA?._id ??
      (await ctx.db.insert("users", { email: TEST_USER_A, name: "TEST — Seema" }));
    const b =
      userB?._id ??
      (await ctx.db.insert("users", { email: TEST_USER_B, name: "TEST — Arjun" }));
    summary.users = 2;

    // --- Test messages ----------------------------------------------------
    const existingMessages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("isTest"), true))
      .collect();
    if (existingMessages.length === 0) {
      await ctx.db.insert("messages", {
        userId: a,
        name: "TEST — Seema",
        email: TEST_USER_A,
        type: "prayer",
        message: "TEST — prayer request seeded by the backend test harness. Safe to delete.",
        status: "new",
        isTest: true,
        createdAt: now(),
        updatedAt: now(),
      });
      await ctx.db.insert("messages", {
        userId: b,
        name: "TEST — Arjun",
        email: TEST_USER_B,
        type: "partnership",
        message: "TEST — partnership enquiry seeded by the backend test harness. Safe to delete.",
        status: "read",
        isTest: true,
        createdAt: now() - 1000,
        updatedAt: now() - 1000,
      });
      summary.messages = 2;
    }

    // --- Test volunteer applications ---------------------------------------
    const existingApps = await ctx.db
      .query("volunteerApplications")
      .filter((q) => q.eq(q.field("isTest"), true))
      .collect();
    if (existingApps.length === 0) {
      await ctx.db.insert("volunteerApplications", {
        userId: a,
        name: "TEST — Seema",
        email: TEST_USER_A,
        phone: "+91 90000 00000",
        availability: "TEST — weekends",
        message: "TEST — application seeded by the backend test harness. Safe to delete.",
        status: "submitted",
        isTest: true,
        createdAt: now(),
        updatedAt: now(),
      });
      summary.volunteers = 1;
    }

    // --- Test donations + invoice ------------------------------------------
    const existingDonations = await ctx.db
      .query("donations")
      .filter((q) => q.eq(q.field("isTest"), true))
      .collect();
    if (existingDonations.length === 0) {
      // Pending sandbox donation.
      await ctx.db.insert("donations", {
        userId: a,
        donorName: "TEST — Seema",
        donorEmail: TEST_USER_A,
        frequency: "one-time",
        amountInr: 500,
        currency: "INR",
        status: "pending",
        provider: "sandbox",
        sandbox: true,
        isTest: true,
        createdAt: now(),
        updatedAt: now(),
      });

      // Successful donation with invoice (uses the real counter so invoice
      // numbers stay sequential; marked TEST in donor name).
      const year = new Date().getUTCFullYear();
      const counterName = `invoice-${year}`;
      const counter = await ctx.db
        .query("counters")
        .withIndex("by_name", (q) => q.eq("name", counterName))
        .unique();
      const next = (counter?.value ?? 0) + 1;
      if (counter) await ctx.db.patch(counter._id, { value: next });
      else await ctx.db.insert("counters", { name: counterName, value: next });
      const invoiceNumber = `HOG-${year}-${String(next).padStart(6, "0")}`;

      const donationId = await ctx.db.insert("donations", {
        userId: b,
        donorName: "TEST — Arjun",
        donorEmail: TEST_USER_B,
        frequency: "monthly",
        amountInr: 1000,
        currency: "INR",
        status: "successful",
        provider: "sandbox",
        sandbox: true,
        isTest: true,
        invoiceNumber,
        createdAt: now() - 2000,
        updatedAt: now() - 2000,
        completedAt: now() - 2000,
      });
      await ctx.db.insert("invoices", {
        invoiceNumber,
        donationId,
        userId: b,
        donorName: "TEST — Arjun",
        donorEmail: TEST_USER_B,
        amountInr: 1000,
        currency: "INR",
        frequency: "monthly",
        provider: "sandbox",
        isTest: true,
        issuedAt: now() - 2000,
      });
      summary.donations = 2;
      summary.invoices = 1;
    }

    // --- Test events --------------------------------------------------------
    const existingEvents = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("isTest"), true))
      .collect();
    if (existingEvents.length === 0) {
      const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      await ctx.db.insert("events", {
        title: "TEST — Community outreach (sandbox)",
        description:
          "TEST — seeded event for verifying the public events page. Safe to delete.",
        date: future,
        time: "10:00 AM",
        location: "TEST — Community hall, Hyderabad",
        registrationLink: "https://example.test/register",
        status: "published",
        isTest: true,
        createdAt: now(),
        updatedAt: now(),
      });
      await ctx.db.insert("events", {
        title: "TEST — Draft event (sandbox)",
        description: "TEST — draft event that must NOT appear publicly.",
        date: future,
        location: "TEST — nowhere",
        status: "draft",
        isTest: true,
        createdAt: now(),
        updatedAt: now(),
      });
      summary.events = 2;
    }

    return { seeded: summary };
  },
});

/** Seed all test data (idempotent — skips categories that already exist). */
export const seedTestData = action({
  args: {},
  handler: async (ctx): Promise<{ seeded: Record<string, number> }> => {
    return await ctx.runMutation(internal.seedTestData.seedInternal, {});
  },
});

/** Remove every clearly-marked test record. */
export const clearTestData = action({
  args: {},
  handler: async (ctx): Promise<{ removed: Record<string, number> }> => {
    return await ctx.runMutation(internal.seedTestData.clearInternal, {});
  },
});

export const clearInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const removed: Record<string, number> = {};
    for (const table of ["messages", "volunteerApplications", "donations", "events"] as const) {
      const rows = await ctx.db
        .query(table)
        .filter((q) => q.eq(q.field("isTest"), true))
        .collect();
      for (const row of rows) await ctx.db.delete(row._id);
      removed[table] = rows.length;
    }
    const invoices = await ctx.db
      .query("invoices")
      .filter((q) => q.eq(q.field("isTest"), true))
      .collect();
    for (const inv of invoices) await ctx.db.delete(inv._id);
    removed.invoices = invoices.length;

    // Test users (no auth accounts — nothing else references them).
    for (const email of [TEST_USER_A, TEST_USER_B]) {
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", email))
        .unique();
      if (user) await ctx.db.delete(user._id);
    }
    removed.users = 2;
    return { removed };
  },
});

/** Internal list of published test events (for harness assertions). */
export const testEventsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("events").collect();
    return rows.filter((e) => e.isTest).map((e) => ({ title: e.title, status: e.status }));
  },
});
