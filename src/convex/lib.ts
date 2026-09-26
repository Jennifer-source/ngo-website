import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * Shared backend library: auth guards, validation, rate limiting,
 * invoice numbering and audit logging. All authorization happens here,
 * server-side — the frontend never gates access by itself.
 */

/* ------------------------------------------------------------------ */
/* Auth guards                                                         */
/* ------------------------------------------------------------------ */

export type AnyCtx = QueryCtx | MutationCtx | ActionCtx;

/** Returns the signed-in user's id, or null for anonymous visitors. */
export async function getOptionalUserId(ctx: AnyCtx): Promise<Id<"users"> | null> {
  return await getAuthUserId(ctx);
}

/** Throws unless a user is signed in. Returns the userId. */
export async function requireUser(ctx: AnyCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("AUTH_REQUIRED: Sign in to continue.");
  return userId;
}

/** Throws unless a signed-in user has the admin role. Returns the user doc. */
export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("UNAUTHORIZED: Admin access required.");
  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin") {
    throw new Error("UNAUTHORIZED: Admin access required.");
  }
  return user;
}

/** True if the given user doc is an administrator. */
export function isAdminUser(user: Doc<"users"> | null): boolean {
  return !!user && user.role === "admin";
}

/* ------------------------------------------------------------------ */
/* Rate limiting — fixed window per key                                */
/* ------------------------------------------------------------------ */

/**
 * Counts one call against `key` inside a `windowMs` window. Throws when the
 * caller exceeds `limit`. Cheap, atomic-enough for abuse protection.
 */
export async function checkRateLimit(
  ctx: MutationCtx,
  key: string,
  limit: number,
  windowMs: number,
): Promise<void> {
  const now = Date.now();
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  if (!existing || now - existing.windowStart >= windowMs) {
    if (existing) {
      await ctx.db.patch(existing._id, { windowStart: now, count: 1 });
    } else {
      await ctx.db.insert("rateLimits", { key, windowStart: now, count: 1 });
    }
    return;
  }
  if (existing.count >= limit) {
    throw new Error("RATE_LIMITED: Too many attempts. Please try again later.");
  }
  await ctx.db.patch(existing._id, { count: existing.count + 1 });
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_RE = /^[+()\-\s\d]{6,20}$/;

/** Throws unless the value is a plausible email. Returns trimmed value. */
export function validateEmail(email: string, field = "email"): string {
  const v = String(email ?? "").trim();
  if (!v || v.length > 254 || !EMAIL_RE.test(v)) {
    throw new Error(`VALIDATION: Please enter a valid ${field}.`);
  }
  return v.toLowerCase();
}

/** Trims and length-checks a required string field. */
export function validateRequiredString(
  value: string,
  field: string,
  min: number,
  max: number,
): string {
  const v = String(value ?? "").trim();
  if (v.length < min) {
    throw new Error(`VALIDATION: ${field} must be at least ${min} characters.`);
  }
  if (v.length > max) {
    throw new Error(`VALIDATION: ${field} must be at most ${max} characters.`);
  }
  return v;
}

/** Trims and length-checks an optional string field ("" → undefined). */
export function validateOptionalString(
  value: string | undefined,
  field: string,
  max: number,
): string | undefined {
  const v = String(value ?? "").trim();
  if (!v) return undefined;
  if (v.length > max) {
    throw new Error(`VALIDATION: ${field} must be at most ${max} characters.`);
  }
  return v;
}

/** Optional phone: allows digits and + ( ) - space only. */
export function validateOptionalPhone(value: string | undefined): string | undefined {
  const v = String(value ?? "").trim();
  if (!v) return undefined;
  if (!PHONE_RE.test(v)) {
    throw new Error("VALIDATION: Please enter a valid phone number.");
  }
  return v;
}

/** Donation amount: integer rupees inside [min, max]. */
export function validateDonationAmount(
  amountInr: number,
  min = 10,
  max = 500_000,
): number {
  const n = Number(amountInr);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error("VALIDATION: Please enter a whole-rupee amount.");
  }
  if (n < min) throw new Error(`VALIDATION: Minimum donation is ₹${min}.`);
  if (n > max) throw new Error(`VALIDATION: Maximum donation is ₹${max}.`);
  return n;
}

/** Event date: strict ISO YYYY-MM-DD, and must be a real calendar date. */
export function validateEventDate(date: string): string {
  const v = String(date ?? "").trim();
  if (!ISO_DATE_RE.test(v)) {
    throw new Error("VALIDATION: Event date must be in YYYY-MM-DD format.");
  }
  const d = new Date(`${v}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) {
    throw new Error("VALIDATION: Event date is not a real calendar date.");
  }
  return v;
}

/* ------------------------------------------------------------------ */
/* Invoice numbering — atomic, human-issued, never a database id        */
/* ------------------------------------------------------------------ */

/**
 * Returns the next invoice number for the year, e.g. "HOG-2026-000001".
 * Uses a counters row so ids are sequential and human-issued.
 */
export async function nextInvoiceNumber(ctx: MutationCtx): Promise<string> {
  const year = new Date().getUTCFullYear();
  const name = `invoice-${year}`;
  const counter = await ctx.db
    .query("counters")
    .withIndex("by_name", (q) => q.eq("name", name))
    .unique();
  const next = (counter?.value ?? 0) + 1;
  if (counter) {
    await ctx.db.patch(counter._id, { value: next });
  } else {
    await ctx.db.insert("counters", { name, value: next });
  }
  return `HOG-${year}-${String(next).padStart(6, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Audit log                                                           */
/* ------------------------------------------------------------------ */

export async function logAudit(
  ctx: MutationCtx,
  entry: {
    actorId?: Id<"users">;
    actorEmail?: string;
    action: string;
    targetType?: string;
    targetId?: string;
    detail?: unknown;
  },
): Promise<void> {
  await ctx.db.insert("auditLog", {
    actorId: entry.actorId,
    actorEmail: entry.actorEmail,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    detail: entry.detail === undefined ? undefined : (entry.detail as object),
    createdAt: Date.now(),
  });
}

/* ------------------------------------------------------------------ */
/* Misc helpers                                                        */
/* ------------------------------------------------------------------ */

/** Frontend origin for sandbox checkout redirects. */
export function getBaseUrl(): string {
  return process.env.FRONTEND_URL ?? "http://localhost:5173";
}

/** Sanitises a user doc for exposure to its owner (never leaks auth secrets). */
export function publicUser(user: Doc<"users">) {
  return {
    _id: user._id,
    name: user.name ?? null,
    email: user.email ?? null,
    role: user.role ?? null,
  };
}
