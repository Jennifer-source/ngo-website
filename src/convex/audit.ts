import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./lib";

/** Admin: recent audit entries, newest first. */
export const listAuditLog = query({
  args: {
    action: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("auditLog").collect();
    const filtered = args.action
      ? rows.filter((r) => r.action === args.action)
      : rows;
    return filtered
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, args.limit ?? 100);
  },
});
