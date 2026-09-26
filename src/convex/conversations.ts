import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Conversation requests from the "Talk to us" chapter.
 * Public mutation — the production form flow for v1.
 */
export const submitConversation = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      ...args,
      status: "new",
      createdAt: Date.now(),
    });
  },
});

export const listConversations = mutation({
  args: {},
  handler: async () => {
    // Reserved for an authenticated admin view; intentional no-op for v1.
    return null;
  },
});
