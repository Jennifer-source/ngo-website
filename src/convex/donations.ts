import Stripe from "stripe";
import { action, internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { internal } from "./_generated/api";

/**
 * Gift intent record — used as the honest fallback when Stripe keys are
 * not yet configured, and available for manual/offline giving follow-up.
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

/**
 * Stripe-powered donations for Hands of Grace.
 * Keys are read from the environment (set via the project's Keys / API keys
 * tab). Until keys are present, the Donate chapter transparently falls back
 * to recording a gift intent for the ministry to follow up on.
 */

export const createDonationCheckout = action({
  args: {
    donorName: v.string(),
    donorEmail: v.string(),
    frequency: v.union(v.literal("one-time"), v.literal("monthly")),
    amountInr: v.number(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      /* Honest fallback: record the intent so the ministry can follow up. */
      const intentId: { id: string; reference: string } = await ctx.runMutation(
        api.donations.submitDonationIntent,
        {
        name: args.donorName,
        email: args.donorEmail,
          frequency: args.frequency,
          amountInr: args.amountInr,
          message: args.message,
        },
      );
      return { mode: "intent" as const, reference: intentId.reference };
    }

    const stripe = new Stripe(secret);
    const origin = process.env.FRONTEND_URL ?? "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: args.frequency === "monthly" ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "inr",
            unit_amount: Math.round(args.amountInr * 100),
            product_data: { name: "Donation to Hands of Grace" },
            ...(args.frequency === "monthly"
              ? { recurring: { interval: "month" as const } }
              : {}),
          },
        },
      ],
      customer_email: args.donorEmail,
      metadata: {
        donorName: args.donorName,
        frequency: args.frequency,
        message: args.message ?? "",
      },
      success_url: `${origin}/?donation=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?donation=cancelled#donate`,
    });

    const donationId: string = await ctx.runMutation(internal.donations.recordDonation, {
      donorName: args.donorName,
      donorEmail: args.donorEmail,
      frequency: args.frequency,
      amountInr: args.amountInr,
      currency: "INR",
      provider: "stripe",
      providerPaymentId: session.id,
      status: "created",
    });

    return {
      mode: "checkout" as const,
      url: session.url,
      reference: donationId.slice(-8).toUpperCase(),
    };
  },
});

export const verifyDonation = action({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return { paid: false as const };

    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.retrieve(args.sessionId);

    const paid = session.payment_status === "paid" || session.status === "complete";
    if (paid) {
      await ctx.runMutation(internal.donations.markPaid, {
        providerPaymentId: args.sessionId,
      });
    }
    return { paid: paid as boolean };
  },
});

export const recordDonation = internalMutation({
  args: {
    donorName: v.string(),
    donorEmail: v.string(),
    frequency: v.union(v.literal("one-time"), v.literal("monthly")),
    amountInr: v.number(),
    currency: v.string(),
    provider: v.string(),
    providerPaymentId: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("donations", { ...args, createdAt: Date.now() });
  },
});

export const markPaid = internalMutation({
  args: { providerPaymentId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("donations")
      .withIndex("by_status", (q) => q.eq("status", "created"))
      .collect();
    const match = existing.find((d) => d.providerPaymentId === args.providerPaymentId);
    if (match) {
      await ctx.db.patch(match._id, { status: "paid" });
    }
  },
});
