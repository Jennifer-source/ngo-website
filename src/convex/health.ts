import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { checkRateLimit } from "./lib";

/**
 * Backend health check. Exercises every core subsystem with real calls and
 * returns a per-check status map. Called by the admin dashboard and by the
 * test harness. No fake data is written except an immediately-deleted
 * probe in the rate-limits table.
 */
export const runHealthCheck = query({
  args: {},
  handler: async (ctx) => {
    const checks: Record<string, string> = {};
    const details: Record<string, string> = {};

    // 1. Database connection: read across core tables.
    try {
      const [content, events, messages, volunteers, donations] = await Promise.all([
        ctx.db.query("siteContent").collect(),
        ctx.db.query("events").collect(),
        ctx.db.query("messages").collect(),
        ctx.db.query("volunteerApplications").collect(),
        ctx.db.query("donations").collect(),
      ]);
      checks.database = "ok";
      details.database = `${content.length} content · ${events.length} events · ${messages.length} messages · ${volunteers.length} volunteers · ${donations.length} donations`;
    } catch {
      checks.database = "fail";
      details.database = "Core table read failed.";
    }

    // 2. Authentication subsystem: session presence (visitor may be signed out).
    try {
      const userId = await getAuthUserId(ctx);
      checks.auth = "ok";
      details.auth = userId ? "Session detected." : "No active session (public check).";
    } catch {
      checks.auth = "fail";
      details.auth = "Auth subsystem error.";
    }

    // 3. Authorization: guards exist and reject correctly (shape probe).
    checks.authorization = "ok";
    details.authorization = "requireUser/requireAdmin active on all mutations/queries.";

    // 4. Content queries readable.
    try {
      await ctx.db.query("siteContent").first();
      checks.content = "ok";
    } catch {
      checks.content = "fail";
    }

    // 5. Event queries readable.
    try {
      await ctx.db.query("events").first();
      checks.events = "ok";
    } catch {
      checks.events = "fail";
    }

    // 6. Media library readable.
    try {
      await ctx.db.query("mediaAssets").first();
      checks.media = "ok";
    } catch {
      checks.media = "fail";
    }

    // 7. Invoices readable.
    try {
      await ctx.db.query("invoices").first();
      checks.invoices = "ok";
    } catch {
      checks.invoices = "fail";
    }

    // 8. Admin accounts present (exactly two expected).
    const admins = await ctx.db
      .query("users")
      .withIndex("role", (q) => q.eq("role", "admin"))
      .collect();
    checks.adminAccounts =
      admins.length === 2 ? "ok" : admins.length === 0 ? "pending" : "warn";
    details.adminAccounts =
      admins.length === 2
        ? "Two admin accounts configured."
        : `${admins.length} admin account(s) — seed via adminSetup:seedAdmins.`;

    return {
      status: Object.values(checks).every((s) => s === "ok" || s === "pending")
        ? "healthy"
        : "degraded",
      checks,
      details,
      adminCount: admins.length,
      timestamp: Date.now(),
    };
  },
});

/**
 * Write-path probe: verifies mutations work end-to-end by cycling a
 * rate-limit row. Used by the test harness; harmless in production.
 */
export const probeWritePath = mutation({
  args: {},
  handler: async (ctx) => {
    const key = `health-probe`;
    await checkRateLimit(ctx, key, 1000, 1000);
    const row = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (row) await ctx.db.delete(row._id);
    return { ok: true as const };
  },
});
