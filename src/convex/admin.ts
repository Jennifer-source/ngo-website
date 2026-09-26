import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin, logAudit, publicUser } from "./lib";

/**
 * Admin module — real-database overview statistics, user management and
 * admin self-service (health visibility). No hard-coded numbers.
 */

/** Admin: live overview stats across every subsystem. */
export const overviewStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [users, messages, volunteers, donations, invoices, events] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("messages").collect(),
      ctx.db.query("volunteerApplications").collect(),
      ctx.db.query("donations").collect(),
      ctx.db.query("invoices").collect(),
      ctx.db.query("events").collect(),
    ]);

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const realDonations = donations.filter((d) => !d.isTest);
    const successful = realDonations.filter((d) => d.status === "successful" || d.status === "paid");
    const totalSuccessfulInr = successful.reduce((sum, d) => sum + d.amountInr, 0);

    return {
      users: {
        total: users.filter((u) => !u.isAnonymous).length,
        admins: users.filter((u) => u.role === "admin").length,
      },
      messages: {
        total: messages.filter((m) => !m.isTest).length,
        new: messages.filter((m) => !m.isTest && m.status === "new").length,
        open: messages.filter((m) => !m.isTest && m.status !== "closed").length,
      },
      volunteers: {
        total: volunteers.filter((v) => !v.isTest).length,
        pending: volunteers.filter(
          (v) => !v.isTest && (v.status === "submitted" || v.status === "under_review"),
        ).length,
      },
      donations: {
        records: realDonations.length,
        successful: successful.length,
        pending: realDonations.filter((d) => d.status === "pending").length,
        totalSuccessfulInr,
        invoices: invoices.filter((i) => !i.isTest).length,
      },
      events: {
        total: events.length,
        published: events.filter((e) => e.status === "published" && !e.isTest).length,
        upcoming: events.filter(
          (e) => e.status === "published" && !e.isTest && new Date(`${e.date}T23:59:59Z`).getTime() >= now - dayMs,
        ).length,
      },
      generatedAt: now,
    };
  },
});

/** Admin: all non-anonymous users (profile view, no secrets). */
export const listUsers = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let rows = await ctx.db.query("users").collect();
    rows = rows.filter((u) => !u.isAnonymous);
    const q = (args.search ?? "").trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (u) =>
          (u.name ?? "").toLowerCase().includes(q) ||
          (u.email ?? "").toLowerCase().includes(q),
      );
    }
    const out = [];
    for (const u of rows.sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0))) {
      const [msgCount, appCount, donationCount] = await Promise.all([
        ctx.db.query("messages").withIndex("by_user", (qq) => qq.eq("userId", u._id)).collect(),
        ctx.db
          .query("volunteerApplications")
          .withIndex("by_user", (qq) => qq.eq("userId", u._id))
          .collect(),
        ctx.db.query("donations").withIndex("by_user", (qq) => qq.eq("userId", u._id)).collect(),
      ]);
      out.push({
        ...publicUser(u),
        messageCount: msgCount.length,
        applicationCount: appCount.length,
        donationCount: donationCount.length,
      });
    }
    return out;
  },
});

/**
 * Admin: grant or revoke the admin role. Guard rails:
 * - exactly one admin always remains;
 * - the seed target count (2) is not enforced here (admins may add more),
 *   but demotion of the last admin is impossible.
 */
export const setUserRole = mutation({
  args: { userId: v.id("users"), role: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("NOT_FOUND: User does not exist.");
    if (args.role !== undefined && args.role !== "admin" && args.role !== "") {
      throw new Error("VALIDATION: Role must be 'admin' or empty.");
    }
    if (args.role !== "admin") {
      const admins = await ctx.db
        .query("users")
        .withIndex("role", (q) => q.eq("role", "admin"))
        .collect();
      if (admins.length <= 1 && admins.some((a) => a._id === args.userId)) {
        throw new Error("VALIDATION: At least one admin must remain.");
      }
    }
    await ctx.db.patch(args.userId, { role: args.role === "admin" ? "admin" : undefined });
    await logAudit(ctx, {
      actorId: admin._id,
      actorEmail: admin.email ?? undefined,
      action: "user.role",
      targetType: "users",
      targetId: args.userId,
      detail: { role: args.role ?? "(none)" },
    });
    return { ok: true as const };
  },
});
