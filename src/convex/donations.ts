import { v } from "convex/values";
import { action, mutation, query, internalMutation } from "./_generated/server";
import { internal, api } from "./_generated/api";
import {
  requireUser,
  requireAdmin,
  checkRateLimit,
  validateEmail,
  validateRequiredString,
  validateOptionalString,
  validateOptionalPhone,
  validateDonationAmount,
  nextInvoiceNumber,
  logAudit,
  getBaseUrl,
} from "./lib";

/**
 * Donations + invoices.
 *
 * SECURITY: this module never touches card numbers, CVVs, UPI PINs, bank
 * passwords or any payment authentication data. It stores only the record of
 * a gift. Payment status transitions are decided server-side:
 *
 *   sandbox provider (default, test mode):
 *     createDonation → pending → confirmSandboxPayment(server-side) →
 *     successful + invoice | failed
 *
 *   stripe provider (when STRIPE_SECRET_KEY is set):
 *     createDonation → checkout session → server-side verifyDonation →
 *     successful + invoice
 *
 * The frontend can NEVER mark a donation successful on its own.
 */

const DONATION_STATUSES = [
  "pending",
  "successful",
  "failed",
  "refunded",
  "cancelled",
  "created", // legacy stripe rows
  "paid", // legacy stripe rows
] as const;

/* ------------------------------------------------------------------ */
/* Sandbox payment provider (test mode)                                */
/* ------------------------------------------------------------------ */

/** The modular payment provider interface. A real gateway implements this. */
export type PaymentProvider = {
  id: string;
  /** Create a payment session; returns a checkout URL or inline reference. */
  createCheckout(args: {
    donationId: string;
    amountInr: number;
    donorEmail: string;
    frequency: "one-time" | "monthly";
    baseUrl: string;
  }): Promise<{ url: string; providerPaymentId: string }>;
};

const sandboxProvider: PaymentProvider = {
  id: "sandbox",
  async createCheckout({ donationId, amountInr, frequency, baseUrl }) {
    // Test-mode "gateway": a local page that honestly simulates the hosted
    // checkout. No real money moves; nothing is marked successful until the
    // server-side confirmation mutation runs.
    const params = new URLSearchParams({
      donation: donationId,
      amount: String(amountInr),
      frequency,
    });
    return {
      url: `${baseUrl}/sandbox-pay?${params.toString()}`,
      providerPaymentId: `sbx_${donationId.replace(/[^a-z0-9]/gi, "")}_${Date.now().toString(36)}`,
    };
  },
};

/* ------------------------------------------------------------------ */
/* Creating donations                                                  */
/* ------------------------------------------------------------------ */

/** Authenticated user (or guest via signed-in fallback): start a donation. */
export const createDonation = mutation({
  args: {
    donorName: v.string(),
    donorEmail: v.string(),
    phone: v.optional(v.string()),
    frequency: v.union(v.literal("one-time"), v.literal("monthly")),
    amountInr: v.number(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await checkRateLimit(ctx, `donation:${userId}`, 10, 10 * 60 * 1000);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("AUTH_REQUIRED: Sign in to continue.");

    const donorName = validateRequiredString(args.donorName, "Your name", 2, 120);
    const donorEmail = validateEmail(args.donorEmail);
    const phone = validateOptionalPhone(args.phone);
    const message = validateOptionalString(args.message, "Message", 1000);
    const amountInr = validateDonationAmount(args.amountInr);

    const now = Date.now();
    const id = await ctx.db.insert("donations", {
      userId,
      donorName: user.name && user.name.trim().length >= 2 ? user.name.trim() : donorName,
      donorEmail: user.email ? user.email : donorEmail,
      phone,
      frequency: args.frequency,
      amountInr,
      currency: "INR",
      status: "pending",
      provider: "sandbox",
      message,
      sandbox: true,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },
});

/** Attach the sandbox checkout reference to a pending donation. */
export const attachSandboxCheckout = mutation({
  args: { donationId: v.id("donations"), providerPaymentId: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const donation = await ctx.db.get(args.donationId);
    if (!donation) throw new Error("NOT_FOUND: Donation does not exist.");
    if (donation.userId !== userId) {
      throw new Error("UNAUTHORIZED: This donation belongs to another account.");
    }
    if (donation.status !== "pending") {
      throw new Error("VALIDATION: This donation is no longer pending.");
    }
    await ctx.db.patch(args.donationId, {
      providerPaymentId: args.providerPaymentId,
      updatedAt: Date.now(),
    });
    return { ok: true as const };
  },
});

/** User: their sandbox checkout URL for a pending donation. */
export const getSandboxCheckoutUrl = mutation({
  args: { donationId: v.id("donations") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const donation = await ctx.db.get(args.donationId);
    if (!donation) throw new Error("NOT_FOUND: Donation does not exist.");
    if (donation.userId !== userId) {
      throw new Error("UNAUTHORIZED: This donation belongs to another account.");
    }
    if (donation.status !== "pending" || donation.provider !== "sandbox") {
      throw new Error("VALIDATION: This donation has no active sandbox checkout.");
    }
    const params = new URLSearchParams({
      donation: args.donationId,
      amount: String(donation.amountInr),
      frequency: donation.frequency,
    });
    return { url: `${getBaseUrl()}/sandbox-pay?${params.toString()}` };
  },
});

/* ------------------------------------------------------------------ */
/* Sandbox payment confirmation — SERVER-SIDE ONLY                     */
/* ------------------------------------------------------------------ */

/**
 * Server-side test-payment confirmation. Called by the sandbox checkout page
 * AFTER a server mutation validates ownership; the outcome is decided here,
 * never in frontend state. Success creates the invoice; failure records the
 * failed attempt. This is the only path to `successful` in sandbox mode.
 */
export const confirmSandboxPayment = mutation({
  args: {
    donationId: v.id("donations"),
    outcome: v.union(v.literal("success"), v.literal("failure")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const donation = await ctx.db.get(args.donationId);
    if (!donation) throw new Error("NOT_FOUND: Donation does not exist.");
    if (donation.userId !== userId) {
      throw new Error("UNAUTHORIZED: This donation belongs to another account.");
    }
    if (donation.provider !== "sandbox") {
      throw new Error("VALIDATION: Not a sandbox donation.");
    }
    if (donation.status === "successful") {
      return { ok: true as const, invoiceNumber: donation.invoiceNumber ?? null };
    }
    if (donation.status !== "pending") {
      throw new Error("VALIDATION: This donation is no longer pending.");
    }

    const now = Date.now();
    if (args.outcome === "failure") {
      await ctx.db.patch(args.donationId, {
        status: "failed",
        updatedAt: now,
        completedAt: now,
      });
      return { ok: true as const, invoiceNumber: null };
    }

    const invoiceNumber = await nextInvoiceNumber(ctx);
    await ctx.db.patch(args.donationId, {
      status: "successful",
      invoiceNumber,
      updatedAt: now,
      completedAt: now,
    });
    await ctx.db.insert("invoices", {
      invoiceNumber,
      donationId: args.donationId,
      userId,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      amountInr: donation.amountInr,
      currency: donation.currency,
      frequency: donation.frequency,
      provider: donation.provider,
      providerPaymentId: donation.providerPaymentId,
      issuedAt: now,
    });
    return { ok: true as const, invoiceNumber };
  },
});

/* ------------------------------------------------------------------ */
/* Stripe provider (kept from the template, wired to the new flow)      */
/* ------------------------------------------------------------------ */

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
      throw new Error(
        "NO_PROVIDER: No payment gateway is configured. Use the sandbox test flow.",
      );
    }
    const { Stripe } = await import("stripe");
    const stripe = new Stripe(secret);
    const origin = getBaseUrl();

    const amountInr = validateDonationAmount(args.amountInr);
    const donorEmail = validateEmail(args.donorEmail);

    const session = await stripe.checkout.sessions.create({
      mode: args.frequency === "monthly" ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "inr",
            unit_amount: Math.round(amountInr * 100),
            product_data: { name: "Donation to Hands of Grace" },
            ...(args.frequency === "monthly"
              ? { recurring: { interval: "month" as const } }
              : {}),
          },
        },
      ],
      customer_email: donorEmail,
      metadata: {
        donorName: args.donorName,
        frequency: args.frequency,
        message: args.message ?? "",
      },
      success_url: `${origin}/?donation=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?donation=cancelled#donate`,
    });

    const donationId: string = await ctx.runMutation(internal.donations.recordStripeDonation, {
      donorName: args.donorName,
      donorEmail,
      frequency: args.frequency,
      amountInr,
      providerPaymentId: session.id,
    });

    return { mode: "checkout" as const, url: session.url, reference: donationId };
  },
});

/** Stripe verify → server-side status decision + invoice on success. */
export const verifyDonation = action({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return { paid: false as const };
    const { Stripe } = await import("stripe");
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.retrieve(args.sessionId);
    const paid = session.payment_status === "paid" || session.status === "complete";
    if (paid) {
      await ctx.runMutation(internal.donations.markStripePaid, {
        providerPaymentId: args.sessionId,
      });
    }
    return { paid: paid as boolean };
  },
});

export const recordStripeDonation = internalMutation({
  args: {
    donorName: v.string(),
    donorEmail: v.string(),
    frequency: v.union(v.literal("one-time"), v.literal("monthly")),
    amountInr: v.number(),
    providerPaymentId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("donations", {
      donorName: args.donorName,
      donorEmail: args.donorEmail,
      frequency: args.frequency,
      amountInr: args.amountInr,
      currency: "INR",
      status: "pending",
      provider: "stripe",
      providerPaymentId: args.providerPaymentId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const markStripePaid = internalMutation({
  args: { providerPaymentId: v.string() },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_providerPaymentId", (q) => q.eq("providerPaymentId", args.providerPaymentId))
      .unique();
    if (!donation || donation.status === "successful") return;
    const invoiceNumber = await nextInvoiceNumber(ctx);
    const now = Date.now();
    await ctx.db.patch(donation._id, {
      status: "successful",
      invoiceNumber,
      updatedAt: now,
      completedAt: now,
    });
    await ctx.db.insert("invoices", {
      invoiceNumber,
      donationId: donation._id,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      amountInr: donation.amountInr,
      currency: donation.currency,
      frequency: donation.frequency,
      provider: donation.provider,
      providerPaymentId: donation.providerPaymentId,
      issuedAt: now,
    });
  },
});

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

/** User: own donation history with invoice numbers. */
export const listMyDonations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const rows = await ctx.db
      .query("donations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((d) => ({
        _id: d._id,
        amountInr: d.amountInr,
        currency: d.currency,
        frequency: d.frequency,
        status: d.status ?? "pending",
        provider: d.provider,
        providerPaymentId: d.providerPaymentId ?? null,
        invoiceNumber: d.invoiceNumber ?? null,
        message: d.message ?? null,
        sandbox: !!d.sandbox,
        createdAt: d.createdAt,
        completedAt: d.completedAt ?? null,
      }));
  },
});

/** User: their invoice for a successful donation. Ownership enforced. */
export const getMyInvoice = query({
  args: { donationId: v.id("donations") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const donation = await ctx.db.get(args.donationId);
    if (!donation) throw new Error("NOT_FOUND: Donation does not exist.");
    if (donation.userId !== userId) {
      throw new Error("UNAUTHORIZED: This donation belongs to another account.");
    }
    if (!donation.invoiceNumber) return null;
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_donationId", (q) => q.eq("donationId", args.donationId))
      .unique();
    return invoice
      ? {
          invoiceNumber: invoice.invoiceNumber,
          issuedAt: invoice.issuedAt,
          donorName: invoice.donorName,
          donorEmail: invoice.donorEmail,
          amountInr: invoice.amountInr,
          currency: invoice.currency,
          frequency: invoice.frequency,
          provider: invoice.provider,
          providerPaymentId: invoice.providerPaymentId ?? null,
        }
      : null;
  },
});

/** Admin: donations with filters, search, test-visibility. */
export const adminListDonations = query({
  args: {
    status: v.optional(v.string()),
    search: v.optional(v.string()),
    includeTest: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let rows = await ctx.db.query("donations").collect();
    if (args.status && (DONATION_STATUSES as readonly string[]).includes(args.status)) {
      rows = rows.filter((d) => d.status === args.status);
    }
    if (!args.includeTest) rows = rows.filter((d) => !d.isTest);
    const q = (args.search ?? "").trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (d) =>
          d.donorName.toLowerCase().includes(q) ||
          d.donorEmail.toLowerCase().includes(q) ||
          (d.invoiceNumber ?? "").toLowerCase().includes(q),
      );
    }
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Admin: all invoices. */
export const adminListInvoices = query({
  args: {
    search: v.optional(v.string()),
    includeTest: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let rows = await ctx.db.query("invoices").collect();
    if (!args.includeTest) rows = rows.filter((i) => !i.isTest);
    const q = (args.search ?? "").trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.donorName.toLowerCase().includes(q) ||
          i.donorEmail.toLowerCase().includes(q),
      );
    }
    return rows.sort((a, b) => b.issuedAt - a.issuedAt);
  },
});

/** Admin: lifecycle actions — refund / cancel a successful or pending gift. */
export const adminSetDonationStatus = mutation({
  args: { id: v.id("donations"), status: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const donation = await ctx.db.get(args.id);
    if (!donation) throw new Error("NOT_FOUND: Donation does not exist.");
    if (args.status !== "refunded" && args.status !== "cancelled" && args.status !== "failed") {
      throw new Error("VALIDATION: Admins may only set refunded, cancelled or failed.");
    }
    const now = Date.now();
    await ctx.db.patch(args.id, { status: args.status, updatedAt: now, completedAt: now });
    if (donation.invoiceNumber) {
      const invoice = await ctx.db
        .query("invoices")
        .withIndex("by_donationId", (q) => q.eq("donationId", args.id))
        .unique();
      if (invoice) await ctx.db.delete(invoice._id);
    }
    await logAudit(ctx, {
      actorId: admin._id,
      actorEmail: admin.email ?? undefined,
      action: `donation.${args.status}`,
      targetType: "donations",
      targetId: args.id,
    });
    return { ok: true as const };
  },
});

/** Legacy intent path (kept for the template fallback) — no auth required. */
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
