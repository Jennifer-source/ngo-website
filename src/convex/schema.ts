import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Hands of Grace — schema.
 * Auth tables preserved from the template; plus the two production flows
 * of v1: conversation requests and donation intents/records.
 */
const schema = defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.string()),
  }).index("email", ["email"]),

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
    status: v.string(), // "submitted" until a payment method is configured
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  donations: defineTable({
    conversationReference: v.optional(v.string()),
    donorName: v.string(),
    donorEmail: v.string(),
    frequency: v.union(v.literal("one-time"), v.literal("monthly")),
    amountInr: v.number(),
    currency: v.string(),
    provider: v.string(),
    providerPaymentId: v.optional(v.string()),
    status: v.string(), // created | paid | failed | refunded
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),
});

export default schema;
