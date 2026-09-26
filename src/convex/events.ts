import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin, validateRequiredString, validateOptionalString, validateEventDate, logAudit } from "./lib";

/**
 * Events. The public website sees only `status: "published"` events;
 * admins manage the full lifecycle. All input is validated server-side.
 */

/** Public: published events, soonest first. */
export const listPublicEvents = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return rows
      .filter((e) => !e.isTest)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => ({
        _id: e._id,
        title: e.title,
        description: e.description,
        date: e.date,
        time: e.time ?? null,
        location: e.location,
        imageUrl: e.imageUrl ?? null,
        registrationLink: e.registrationLink ?? null,
        status: e.status,
      }));
  },
});

/** Admin: every event including drafts and test rows. */
export const listAllEvents = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("events").collect();
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  },
});

/** Admin: create an event. */
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    location: v.string(),
    imageUrl: v.optional(v.string()),
    registrationLink: v.optional(v.string()),
    status: v.string(), // published | draft
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const title = validateRequiredString(args.title, "Event title", 3, 120);
    const description = validateRequiredString(args.description, "Event description", 3, 4000);
    const location = validateRequiredString(args.location, "Event location", 2, 200);
    const time = validateOptionalString(args.time, "Event time", 60);
    const imageUrl = validateOptionalString(args.imageUrl, "Event image URL", 1000);
    const registrationLink = validateOptionalString(args.registrationLink, "Registration link", 1000);
    const date = validateEventDate(args.date);
    const status = args.status === "published" ? "published" : args.status === "draft" ? "draft" : null;
    if (!status) throw new Error("VALIDATION: Event status must be published or draft.");
    if (registrationLink && !/^https?:\/\//i.test(registrationLink)) {
      throw new Error("VALIDATION: Registration link must be an http(s) URL.");
    }
    if (imageUrl && !/^https?:\/\/|^\//.test(imageUrl)) {
      throw new Error("VALIDATION: Image URL must be a URL or a local /asset path.");
    }
    const now = Date.now();
    const id = await ctx.db.insert("events", {
      title,
      description,
      date,
      time,
      location,
      imageUrl,
      registrationLink,
      status,
      createdAt: now,
      updatedAt: now,
    });
    await logAudit(ctx, {
      actorId: admin._id,
      actorEmail: admin.email ?? undefined,
      action: "event.create",
      targetType: "events",
      targetId: id,
      detail: { title },
    });
    return { id };
  },
});

/** Admin: edit an event's fields. */
export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    registrationLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("NOT_FOUND: Event does not exist.");
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = validateRequiredString(args.title, "Event title", 3, 120);
    if (args.description !== undefined) patch.description = validateRequiredString(args.description, "Event description", 3, 4000);
    if (args.location !== undefined) patch.location = validateRequiredString(args.location, "Event location", 2, 200);
    if (args.date !== undefined) patch.date = validateEventDate(args.date);
    if (args.time !== undefined) patch.time = validateOptionalString(args.time, "Event time", 60);
    if (args.imageUrl !== undefined) patch.imageUrl = validateOptionalString(args.imageUrl, "Event image URL", 1000);
    if (args.registrationLink !== undefined) {
      const link = validateOptionalString(args.registrationLink, "Registration link", 1000);
      if (link && !/^https?:\/\//i.test(link)) {
        throw new Error("VALIDATION: Registration link must be an http(s) URL.");
      }
      patch.registrationLink = link;
    }
    await ctx.db.patch(args.id, patch);
    await logAudit(ctx, {
      actorId: admin._id,
      actorEmail: admin.email ?? undefined,
      action: "event.update",
      targetType: "events",
      targetId: args.id,
    });
    return { ok: true as const };
  },
});

/** Admin: publish/unpublish. */
export const setEventStatus = mutation({
  args: { id: v.id("events"), status: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("NOT_FOUND: Event does not exist.");
    if (args.status !== "published" && args.status !== "draft") {
      throw new Error("VALIDATION: Event status must be published or draft.");
    }
    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
    await logAudit(ctx, {
      actorId: admin._id,
      actorEmail: admin.email ?? undefined,
      action: "event.status",
      targetType: "events",
      targetId: args.id,
      detail: { status: args.status },
    });
    return { ok: true as const };
  },
});

/** Admin: delete an event. */
export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("NOT_FOUND: Event does not exist.");
    await ctx.db.delete(args.id);
    await logAudit(ctx, {
      actorId: admin._id,
      actorEmail: admin.email ?? undefined,
      action: "event.delete",
      targetType: "events",
      targetId: args.id,
      detail: { title: event.title },
    });
    return { ok: true as const };
  },
});
