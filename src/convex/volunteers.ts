import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import {
  requireUser,
  requireAdmin,
  checkRateLimit,
  validateRequiredString,
  validateOptionalString,
  validateOptionalPhone,
  logAudit,
} from "./lib";

/**
 * Volunteer applications. Owned by the signed-in applicant; admins review,
 * annotate and progress them through the pipeline.
 */

const APPLICATION_STATUSES = [
  "submitted",
  "under_review",
  "approved",
  "declined",
  "completed",
] as const;

/** Authenticated user: submit a volunteer application. */
export const submitApplication = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    availability: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await checkRateLimit(ctx, `volunteer:${userId}`, 3, 10 * 60 * 1000);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("AUTH_REQUIRED: Sign in to continue.");

    const name = validateRequiredString(args.name, "Your name", 2, 120);
    validateRequiredString(args.email, "Your email", 3, 254); // format checked below
    const email = args.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      throw new Error("VALIDATION: Please enter a valid email.");
    }
    const phone = validateOptionalPhone(args.phone);
    const availability = validateOptionalString(args.availability, "Availability", 1000);
    const message = validateOptionalString(args.message, "Message", 5000);

    const now = Date.now();
    const id = await ctx.db.insert("volunteerApplications", {
      userId,
      name: user.name && user.name.trim().length >= 2 ? user.name.trim() : name,
      email: user.email ? user.email : email,
      phone,
      availability,
      message,
      status: "submitted",
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },
});

/** User: read own applications, newest first. */
export const listMyApplications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const rows = await ctx.db
      .query("volunteerApplications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((a) => ({
        _id: a._id,
        name: a.name,
        email: a.email,
        phone: a.phone ?? null,
        availability: a.availability ?? null,
        message: a.message ?? null,
        status: a.status,
        adminResponse: a.adminResponse ?? null,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        // adminNotes are internal — never exposed to the user.
      }));
  },
});

/** Admin: list applications with status filter and text search. */
export const adminListApplications = query({
  args: {
    status: v.optional(v.string()),
    search: v.optional(v.string()),
    includeTest: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let rows = await ctx.db.query("volunteerApplications").collect();
    if (args.status && (APPLICATION_STATUSES as readonly string[]).includes(args.status)) {
      rows = rows.filter((a) => a.status === args.status);
    }
    if (!args.includeTest) rows = rows.filter((a) => !a.isTest);
    const q = (args.search ?? "").trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.message ?? "").toLowerCase().includes(q),
      );
    }
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Admin: change status / notes / response. Audited. */
export const adminUpdateApplication = mutation({
  args: {
    id: v.id("volunteerApplications"),
    status: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    adminResponse: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("NOT_FOUND: Application does not exist.");
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.status !== undefined) {
      if (!(APPLICATION_STATUSES as readonly string[]).includes(args.status)) {
        throw new Error("VALIDATION: Unknown application status.");
      }
      patch.status = args.status;
    }
    if (args.adminNotes !== undefined) {
      patch.adminNotes = args.adminNotes.trim().slice(0, 4000) || undefined;
    }
    if (args.adminResponse !== undefined) {
      const response = args.adminResponse.trim();
      if (response.length > 4000) {
        throw new Error("VALIDATION: Response must be at most 4000 characters.");
      }
      patch.adminResponse = response || undefined;
    }
    await ctx.db.patch(args.id, patch);
    await logAudit(ctx, {
      actorId: admin._id,
      actorEmail: admin.email ?? undefined,
      action: "volunteer.update",
      targetType: "volunteerApplications",
      targetId: args.id,
      detail: { status: patch.status },
    });
    return { ok: true as const };
  },
});
