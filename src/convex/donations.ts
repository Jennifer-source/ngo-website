import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Donation intent records for the Donate chapter.
 * v1 records the intent; a payment provider (e.g. Razorpay) can be added
 * later to convert intents into completed donations.
 */
export const submitDonationIntent = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    frequency: v.union(v.literal("one-time"), v.literal("monthly")),
    amountInr: v.number(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("donationIntents", {
      ...args,
      status: "submitted",
      createdAt: Date.now(),
    });
    return { id, reference: `HG-${Date.now().toString(36).toUpperCase()}` };
  },
});
