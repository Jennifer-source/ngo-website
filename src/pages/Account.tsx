import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, HandHeart, MailCheck, UserRound } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

/**
 * My Account — the signed-in visitor's own records only: profile, messages,
 * volunteer applications and donation history with invoices. Ownership is
 * enforced server-side; this page simply renders what the user owns.
 */

const MESSAGE_STATUS_LABEL: Record<string, string> = {
  new: "New",
  read: "Read",
  in_progress: "In progress",
  responded: "Responded",
  closed: "Closed",
};

const APP_STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  declined: "Declined",
  completed: "Completed",
};

const DONATION_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  successful: "Successful",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
  created: "Pending",
  paid: "Successful",
};

const fmtDate = (t: number) =>
  new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtInr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function Account() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<"messages" | "applications" | "donations">("messages");

  const messages = useQuery(api.messages.listMyMessages);
  const applications = useQuery(api.volunteers.listMyApplications);
  const donations = useQuery(api.donations.listMyDonations);

  return (
    <main className="min-h-screen bg-ivory text-charcoal">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-ink/10 pb-8">
          <div>
            <p className="editorial-label text-rust">My account</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
              {user?.name || "Welcome"}
            </h1>
            <p className="mt-2 text-[0.9rem] text-smoke">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild className="gap-2">
              <Link to="/">
                <ArrowLeft className="size-4" /> Home
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={() => void signOut()}
              className="text-smoke hover:text-charcoal"
            >
              Sign out
            </Button>
          </div>
        </header>

        {/* Profile card */}
        <Card className="mt-8 border-ink/10 shadow-none">
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="flex size-10 items-center justify-center rounded-lg bg-mist text-rust">
              <UserRound className="size-5" />
            </div>
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-smoke sm:grid-cols-2">
            <p>
              <span className="editorial-label mb-1 block text-[0.6rem]">Name</span>
              {user?.name || "—"}
            </p>
            <p>
              <span className="editorial-label mb-1 block text-[0.6rem]">Email</span>
              {user?.email || "—"}
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div role="tablist" aria-label="My records" className="mt-10 flex flex-wrap gap-2">
          {(
            [
              { id: "messages", label: "My messages", icon: MailCheck },
              { id: "applications", label: "My applications", icon: HandHeart },
              { id: "donations", label: "My donations", icon: FileText },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 border px-4 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-colors duration-300",
                tab === t.id
                  ? "border-clay bg-clay text-ivory"
                  : "border-ink/15 text-ink/60 hover:border-rust/50 hover:text-rust",
              )}
            >
              <t.icon className="size-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <section className="mt-6 space-y-4">
          {tab === "messages" &&
            (messages === undefined ? null : messages.length === 0 ? (
              <EmptyState text="No messages yet. Send one from the Talk to us chapter." />
            ) : (
              messages.map((m) => (
                <article key={m._id} className="border border-ink/10 bg-ivory p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="editorial-label text-rust">{m.type}</p>
                    <StatusPill label={MESSAGE_STATUS_LABEL[m.status] ?? m.status} />
                  </div>
                  <p className="mt-3 text-[0.92rem] leading-relaxed text-charcoal/85">{m.message}</p>
                  {m.adminResponse && (
                    <div className="mt-4 border-l-2 border-sunlight bg-mist/60 p-4">
                      <p className="editorial-label mb-1.5 text-[0.6rem] text-smoke/80">Response from the ministry</p>
                      <p className="text-[0.88rem] leading-relaxed text-charcoal/85">{m.adminResponse}</p>
                    </div>
                  )}
                  <p className="editorial-label mt-4 text-[0.6rem] text-smoke/60">{fmtDate(m.createdAt)}</p>
                </article>
              ))
            ))}

          {tab === "applications" &&
            (applications === undefined ? null : applications.length === 0 ? (
              <EmptyState text="No volunteer applications yet. Apply through the Serve chapter." />
            ) : (
              applications.map((a) => (
                <article key={a._id} className="border border-ink/10 bg-ivory p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="editorial-label text-rust">Volunteer application</p>
                    <StatusPill label={APP_STATUS_LABEL[a.status] ?? a.status} />
                  </div>
                  {a.availability && (
                    <p className="mt-3 text-[0.88rem] text-smoke">Availability: {a.availability}</p>
                  )}
                  {a.message && (
                    <p className="mt-2 text-[0.92rem] leading-relaxed text-charcoal/85">{a.message}</p>
                  )}
                  {a.adminResponse && (
                    <div className="mt-4 border-l-2 border-sunlight bg-mist/60 p-4">
                      <p className="editorial-label mb-1.5 text-[0.6rem] text-smoke/80">Response from the ministry</p>
                      <p className="text-[0.88rem] leading-relaxed text-charcoal/85">{a.adminResponse}</p>
                    </div>
                  )}
                  <p className="editorial-label mt-4 text-[0.6rem] text-smoke/60">
                    Submitted {fmtDate(a.createdAt)} · Updated {fmtDate(a.updatedAt)}
                  </p>
                </article>
              ))
            ))}

          {tab === "donations" &&
            (donations === undefined ? null : donations.length === 0 ? (
              <EmptyState text="No donations yet. Every gift is recorded here with its receipt." />
            ) : (
              donations.map((d) => (
                <article key={d._id} className="border border-ink/10 bg-ivory p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="font-serif text-2xl text-charcoal">
                      {fmtInr(d.amountInr)}{" "}
                      <span className="text-sm text-smoke">· {d.frequency === "monthly" ? "monthly" : "one-time"}</span>
                    </p>
                    <StatusPill label={DONATION_STATUS_LABEL[d.status] ?? d.status} />
                  </div>
                  <dl className="mt-4 grid gap-x-8 gap-y-2 text-[0.85rem] text-smoke sm:grid-cols-2">
                    <div>
                      <dt className="editorial-label text-[0.58rem]">Invoice</dt>
                      <dd className="tabular-nums text-charcoal/85">{d.invoiceNumber ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="editorial-label text-[0.58rem]">Transaction / reference</dt>
                      <dd className="break-all tabular-nums text-charcoal/85">{d.providerPaymentId ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="editorial-label text-[0.58rem]">Date</dt>
                      <dd className="text-charcoal/85">{fmtDate(d.completedAt ?? d.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="editorial-label text-[0.58rem]">Payment method</dt>
                      <dd className="text-charcoal/85">
                        {d.sandbox ? "Sandbox (test) checkout" : d.provider}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))
            ))}
        </section>
      </div>
    </main>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="editorial-label border border-ink/15 px-2.5 py-1 text-[0.58rem] text-ink/70">
      {label}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="border border-dashed border-ink/15 bg-cream/50 p-8 text-center text-[0.9rem] text-smoke">
      {text}
    </p>
  );
}
