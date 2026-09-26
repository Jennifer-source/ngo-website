import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import {
  requireUser,
  requireAdmin,
  checkRateLimit,
  validateEmail,
  validateRequiredString,
  validateOptionalPhone,
  logAudit,
} from "./lib";

/**
 * Messages — talk-to-us submissions (general / partnership / prayer / media /
 * volunteer mirror). Every message is owned by a signed-in user; users can
 * read only their own. Admins manage status, notes and responses.
 */

const MESSAGE_TYPES = ["general", "volunteer", "partnership", "prayer", "media"] as const;
const MESSAGE_STATUSES = ["new", "read", "in_progress", "responded", "closed"] as const;

/** Authenticated user: submit a message. */
export const submitMessage = mutation({
  args: {
    type: v.string(),
    message: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await checkRateLimit(ctx, `message:${userId}`, 5, 10 * 60 * 1000);

    if (!(MESSAGE_TYPES as readonly string[]).includes(args.type)) {
      throw new Error("VALIDATION: Unknown enquiry type.");
    }
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("AUTH_REQUIRED: Sign in to continue.");

    // The account's own email/name are authoritative when present; the form
    // values are used for guests on other providers and cross-checked loosely.
    const name = validateRequiredString(args.name, "Your name", 2, 120);
    const email = validateEmail(args.email);
    const phone = validateOptionalPhone(args.phone);
    const text = validateRequiredString(args.message, "Your message", 10, 5000);

    const now = Date.now();
    const id = await ctx.db.insert("messages", {
      userId,
      name: user.name && user.name.trim().length >= 2 ? user.name.trim() : name,
      email: user.email ? user.email : email,
      phone,
      type: args.type as (typeof MESSAGE_TYPES)[number],
      message: text,
      status: "new",
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },
});

/** User: read own messages, newest first. */
export const listMyMessages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((m) => ({
        _id: m._id,
        type: m.type,
        message: m.message,
        status: m.status,
        adminResponse: m.adminResponse ?? null,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        // adminNotes are internal — never exposed to the user.
      }));
  },
});

/** Admin: list messages with status/type filters and text search. */
export const adminListMessages = query({
  args: {
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    search: v.optional(v.string()),
    includeTest: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let rows = await ctx.db.query("messages").collect();
    if (args.status && (MESSAGE_STATUSES as readonly string[]).includes(args.status)) {
      rows = rows.filter((m) => m.status === args.status);
    }
    if (args.type && (MESSAGE_TYPES as readonly string[]).includes(args.type)) {
      rows = rows.filter((m) => m.type === args.type);
    }
    if (!args.includeTest) rows = rows.filter((m) => !m.isTest);
    const q = (args.search ?? "").trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q),
      );
    }
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Admin: update status / internal notes / public response. Audited. */
export const adminUpdateMessage = mutation({
  args: {
    id: v.id("messages"),
    status: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    adminResponse: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const msg = await ctx.db.get(args.id);
    if (!msg) throw new Error("NOT_FOUND: Message does not exist.");
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.status !== undefined) {
      if (!(MESSAGE_STATUSES as readonly string[]).includes(args.status)) {
        throw new Error("VALIDATION: Unknown message status.");
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
      if (response && patch.status === undefined) {
        patch.status = "responded";
      }
    }
    await ctx.db.patch(args.id, patch);
    await logAudit(ctx, {
      actorId: admin._id,
      actorEmail: admin.email ?? undefined,
      action: "message.update",
      targetType: "messages",
      targetId: args.id,
      detail: { status: patch.status, responded: args.adminResponse !== undefined },
    });
    return { ok: true as const };
  },
});
