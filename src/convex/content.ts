import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin, logAudit } from "./lib";

/**
 * CMS — site content management.
 * One row per editable section in `siteContent`. Values are section-shaped
 * JSON validated loosely here (structure is owned by the frontend types).
 * Public reads return only what the website displays; writes are admin-only
 * and audited.
 */

const CONTENT_KEYS = [
  "hero",
  "impact",
  "film",
  "social",
  "founders",
  "serve",
  "fragments",
  "talkToUs",
  "donate",
  "footer",
  "contact",
] as const;

/** Public: all published content values keyed by section key. */
export const getPublicContent = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("siteContent").collect();
    const out: Record<string, unknown> = {};
    for (const row of rows) {
      out[row.key] = row.value;
    }
    return out;
  },
});

/** Admin: content rows with update metadata. */
export const listContentMeta = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("siteContent").collect();
    return rows.map((r) => ({
      key: r.key,
      updatedAt: r.updatedAt,
      updatedBy: r.updatedBy ?? null,
      hasValue: r.value !== undefined && r.value !== null,
    }));
  },
});

/** Admin: read one section's full value for editing. */
export const getContent = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!(CONTENT_KEYS as readonly string[]).includes(args.key)) {
      throw new Error("VALIDATION: Unknown content key.");
    }
    const row = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    return row?.value ?? null;
  },
});

/** Admin: upsert a section's content. Audited. */
export const setContent = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (!(CONTENT_KEYS as readonly string[]).includes(args.key)) {
      throw new Error("VALIDATION: Unknown content key.");
    }
    if (args.value === null || typeof args.value !== "object") {
      throw new Error("VALIDATION: Content value must be an object.");
    }
    const existing = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: now,
        updatedBy: admin._id,
      });
    } else {
      await ctx.db.insert("siteContent", {
        key: args.key,
        value: args.value,
        updatedAt: now,
        updatedBy: admin._id,
      });
    }
    await logAudit(ctx, {
      actorId: admin._id,
      actorEmail: admin.email ?? undefined,
      action: "content.set",
      targetType: "siteContent",
      targetId: args.key,
    });
    return { ok: true as const, key: args.key };
  },
});

/* ------------------------------------------------------------------ */
/* Media library                                                       */
/* ------------------------------------------------------------------ */

/** Admin: short-lived upload URL for a direct browser → Convex upload. */
export const generateMediaUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Admin: register an uploaded file as a media asset. Returns its public URL. */
export const createMediaAsset = mutation({
  args: {
    storageId: v.id("_storage"),
    kind: v.string(), // hero | founder | fragment | film-poster | event | other
    filename: v.string(),
    mimeType: v.optional(v.string()),
    size: v.optional(v.number()),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const allowedKinds = ["hero", "founder", "fragment", "film-poster", "event", "other"];
    if (!allowedKinds.includes(args.kind)) {
      throw new Error("VALIDATION: Unknown media kind.");
    }
    if (!args.filename.trim() || args.filename.length > 200) {
      throw new Error("VALIDATION: Invalid filename.");
    }
    const id = await ctx.db.insert("mediaAssets", {
      storageId: args.storageId,
      kind: args.kind,
      filename: args.filename.trim(),
      mimeType: args.mimeType,
      size: args.size,
      published: args.published,
      createdAt: Date.now(),
      uploadedBy: admin._id,
    });
    await logAudit(ctx, {
      actorId: admin._id,
      actorEmail: admin.email ?? undefined,
      action: "media.create",
      targetType: "mediaAssets",
      targetId: id,
      detail: { filename: args.filename, kind: args.kind },
    });
    const url = await ctx.storage.getUrl(args.storageId);
    return { id, url };
  },
});

/** Admin: all media assets with resolved URLs. */
export const listMedia = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("mediaAssets").collect();
    const out = [];
    for (const r of rows.sort((a, b) => b.createdAt - a.createdAt)) {
      out.push({ ...r, url: await ctx.storage.getUrl(r.storageId) });
    }
    return out;
  },
});

/** Admin: publish/unpublish a media asset. */
export const setMediaPublished = mutation({
  args: { id: v.id("mediaAssets"), published: v.boolean() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const asset = await ctx.db.get(args.id);
    if (!asset) throw new Error("NOT_FOUND: Media asset does not exist.");
    await ctx.db.patch(args.id, { published: args.published });
    await logAudit(ctx, {
      actorId: admin._id,
      actorEmail: admin.email ?? undefined,
      action: "media.publish",
      targetType: "mediaAssets",
      targetId: args.id,
      detail: { published: args.published },
    });
    return { ok: true as const };
  },
});

/** Admin: delete a media asset and its stored file. */
export const deleteMedia = mutation({
  args: { id: v.id("mediaAssets") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const asset = await ctx.db.get(args.id);
    if (!asset) throw new Error("NOT_FOUND: Media asset does not exist.");
    await ctx.db.delete(args.id);
    await ctx.storage.delete(asset.storageId);
    await logAudit(ctx, {
      actorId: admin._id,
      actorEmail: admin.email ?? undefined,
      action: "media.delete",
      targetType: "mediaAssets",
      targetId: args.id,
      detail: { filename: asset.filename },
    });
    return { ok: true as const };
  },
});
