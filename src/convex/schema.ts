import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Hands of Grace — schema.
 *
 * Auth tables from the template are preserved. Legacy v1 tables
 * (conversations, donationIntents, donations) are preserved for backward
 * compatibility with existing code paths. The production backend adds:
 * siteContent (CMS), mediaAssets, events, messages, volunteerApplications,
 * donations v2 (with invoices), counters, rateLimits and an auditLog.
 */
const schema = defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.string()), // "admin" for administrators; absent for normal users
  })
    .index("email", ["email"])
    .index("role", ["role"]),

  /* ---------------- Legacy v1 (kept; TalkToUs/Donate v2 replaced these) --- */

  conversations: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    pathway: v.union(
      v.literal("general"),
      v.literal("volunteer"),
      v.literal("partnership"),
      v.literal("prayer"),
      v.literal("media"),
    ),
    message: v.string(),
    status: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  donationIntents: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    frequency: v.union(v.literal("one-time"), v.literal("monthly")),
    amountInr: v.number(),
    message: v.optional(v.string()),
    status: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  /* ---------------- CMS -------------------------------------------------- */

  /** One row per editable website section; value is section-shaped JSON. */
  siteContent: defineTable({
    key: v.string(), // "hero" | "impact" | "film" | "social" | "founders" | "serve" | "fragments" | "talkToUs" | "donate" | "footer" | "contact"
    value: v.any(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_key", ["key"])
    .index("by_updatedAt", ["updatedAt"]),

  /** Uploaded media; public visibility via published + section assignment. */
  mediaAssets: defineTable({
    storageId: v.id("_storage"),
    kind: v.string(), // "hero" | "founder" | "fragment" | "film-poster" | "event" | "other"
    filename: v.string(),
    mimeType: v.optional(v.string()),
    size: v.optional(v.number()),
    published: v.boolean(),
    createdAt: v.number(),
    uploadedBy: v.optional(v.id("users")),
  })
    .index("by_kind", ["kind"])
    .index("by_storage", ["storageId"])
    .index("by_createdAt", ["createdAt"]),

  /* ---------------- Events ---------------------------------------------- */

  events: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.string(), // ISO date "YYYY-MM-DD"
    time: v.optional(v.string()), // e.g. "10:00 AM IST"
    location: v.string(),
    imageUrl: v.optional(v.string()),
    registrationLink: v.optional(v.string()),
    status: v.string(), // "published" | "draft"
    isTest: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_date", ["date"])
    .index("by_createdAt", ["createdAt"]),

  /* ---------------- User-owned records ---------------------------------- */

  /** Talk-to-us messages: general / partnership / prayer / media (+volunteer mirror). */
  messages: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    type: v.union(
      v.literal("general"),
      v.literal("volunteer"),
      v.literal("partnership"),
      v.literal("prayer"),
      v.literal("media"),
    ),
    message: v.string(),
    status: v.string(), // new | read | in_progress | responded | closed
    adminNotes: v.optional(v.string()),
    adminResponse: v.optional(v.string()),
    isTest: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_createdAt", ["createdAt"]),

  /** Volunteer applications. */
  volunteerApplications: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    availability: v.optional(v.string()),
    message: v.optional(v.string()),
    status: v.string(), // submitted | under_review | approved | declined | completed
    adminNotes: v.optional(v.string()),
    adminResponse: v.optional(v.string()),
    isTest: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  /**
   * Donations. NEVER stores card numbers, CVVs, UPI PINs or any payment
   * authentication data — only the record of a gift. Legacy rows from the
   * template's Stripe flow (status created/paid) live here too.
   */
  donations: defineTable({
    conversationReference: v.optional(v.string()), // legacy Stripe flow
    userId: v.optional(v.id("users")),
    donorName: v.string(),
    donorEmail: v.string(),
    phone: v.optional(v.string()),
    frequency: v.union(v.literal("one-time"), v.literal("monthly")),
    amountInr: v.number(),
    currency: v.string(), // "INR"
    // pending | successful | failed | refunded | cancelled | created | paid (legacy)
    status: v.optional(v.string()),
    provider: v.string(), // "sandbox" | "stripe" | ...
    providerPaymentId: v.optional(v.string()),
    invoiceNumber: v.optional(v.string()),
    message: v.optional(v.string()),
    sandbox: v.optional(v.boolean()),
    isTest: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"])
    .index("by_providerPaymentId", ["providerPaymentId"])
    .index("by_invoiceNumber", ["invoiceNumber"]),

  /** One invoice per successful donation. Human-issued numbers, never raw IDs. */
  invoices: defineTable({
    invoiceNumber: v.string(), // HOG-2026-000001
    donationId: v.id("donations"),
    userId: v.optional(v.id("users")),
    donorName: v.string(),
    donorEmail: v.string(),
    amountInr: v.number(),
    currency: v.string(),
    frequency: v.union(v.literal("one-time"), v.literal("monthly")),
    provider: v.string(),
    providerPaymentId: v.optional(v.string()),
    isTest: v.optional(v.boolean()),
    issuedAt: v.number(),
  })
    .index("by_invoiceNumber", ["invoiceNumber"])
    .index("by_donationId", ["donationId"])
    .index("by_user", ["userId"]),

  /** Sequence counters (invoice numbers per year). */
  counters: defineTable({
    name: v.string(), // "invoice-2026"
    value: v.number(),
  }).index("by_name", ["name"]),

  /** Fixed-window rate limiting (per action key, e.g. "message:<userId>"). */
  rateLimits: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
  }).index("by_key", ["key"]),

  /** Admin audit trail. */
  auditLog: defineTable({
    actorId: v.optional(v.id("users")),
    actorEmail: v.optional(v.string()),
    action: v.string(), // "content.set", "event.create", "donation.refund", ...
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    detail: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});

export default schema;
