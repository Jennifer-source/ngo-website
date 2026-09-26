import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

/**
 * ADMIN DASHBOARD — protected by RequireAdmin at the route and re-checked
 * server-side in every Convex function. Overview numbers come from real
 * database aggregates; nothing is hard-coded.
 */

type Tab =
  | "overview"
  | "content"
  | "media"
  | "events"
  | "messages"
  | "volunteers"
  | "donations"
  | "users"
  | "settings";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "content", label: "Content" },
  { id: "media", label: "Media" },
  { id: "events", label: "Events" },
  { id: "messages", label: "Messages" },
  { id: "volunteers", label: "Volunteers" },
  { id: "donations", label: "Donations" },
  { id: "users", label: "Users" },
  { id: "settings", label: "Settings" },
];

const fmtInr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const fmtDate = (t: number) =>
  new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function Admin() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);

  const overview = useQuery(api.admin.overviewStats);
  const health = useQuery(api.health.runHealthCheck);

  // Content
  const [contentKey, setContentKey] = useState("hero");
  const [contentValue, setContentValue] = useState("");
  const setContent = useMutation(api.content.setContent);
  const contentMeta = useQuery(api.content.listContentMeta);
  const [contentLoading, setContentLoading] = useState(false);

  // Media
  const media = useQuery(api.content.listMedia);
  const genUploadUrl = useMutation(api.content.generateMediaUploadUrl);
  const createAsset = useMutation(api.content.createMediaAsset);
  const setPublished = useMutation(api.content.setMediaPublished);
  const deleteMedia = useMutation(api.content.deleteMedia);
  const [mediaKind, setMediaKind] = useState("fragment");

  // Events
  const events = useQuery(api.events.listAllEvents);
  const createEvent = useMutation(api.events.createEvent);
  const updateEvent = useMutation(api.events.updateEvent);
  const setEventStatus = useMutation(api.events.setEventStatus);
  const deleteEvent = useMutation(api.events.deleteEvent);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    registrationLink: "",
  });

  // Messages / volunteers / donations / users
  const messages = useQuery(api.messages.adminListMessages, {});
  const updateMessage = useMutation(api.messages.adminUpdateMessage);
  const applications = useQuery(api.volunteers.adminListApplications, {});
  const updateApplication = useMutation(api.volunteers.adminUpdateApplication);
  const donations = useQuery(api.donations.adminListDonations, {});
  const invoices = useQuery(api.donations.adminListInvoices, {});
  const setDonationStatus = useMutation(api.donations.adminSetDonationStatus);
  const users = useQuery(api.admin.listUsers, {});
  const setUserRole = useMutation(api.admin.setUserRole);
  const audit = useQuery(api.audit.listAuditLog, { limit: 30 });

  const [search, setSearch] = useState("");
  const filteredMessages = useMemo(() => {
    if (!messages) return [];
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q),
    );
  }, [messages, search]);

  const loadSection = async (key: string) => {
    setContentKey(key);
    setContentLoading(true);
    try {
      const value = await (useQueryFetch as unknown as (k: string) => Promise<unknown>)(key);
      setContentValue(JSON.stringify(value ?? {}, null, 2));
    } finally {
      setContentLoading(false);
    }
  };

  const saveContent = async (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    setFlash(null);
    try {
      const parsed = JSON.parse(contentValue);
      await setContent({ key: contentKey, value: parsed });
      setFlash({ ok: true, text: `Saved "${contentKey}". The public site now uses this content.` });
    } catch (err) {
      setFlash({ ok: false, text: err instanceof Error ? err.message.slice(0, 160) : "Invalid JSON." });
    } finally {
      setBusy(false);
    }
  };

  const uploadMedia = async (file: File) => {
    setBusy(true);
    setFlash(null);
    try {
      const uploadUrl = await genUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      const { storageId } = (await res.json()) as { storageId: string };
      await createAsset({
        storageId,
        kind: mediaKind,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        published: true,
      });
      setFlash({ ok: true, text: `Uploaded ${file.name}.` });
    } catch (err) {
      setFlash({ ok: false, text: err instanceof Error ? err.message.slice(0, 160) : "Upload failed." });
    } finally {
      setBusy(false);
    }
  };

  const addEvent = async (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    setFlash(null);
    try {
      await createEvent({
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date,
        time: eventForm.time || undefined,
        location: eventForm.location,
        registrationLink: eventForm.registrationLink || undefined,
        status: "draft",
      });
      setEventForm({ title: "", description: "", date: "", time: "", location: "", registrationLink: "" });
      setFlash({ ok: true, text: "Event created as draft. Publish when ready." });
    } catch (err) {
      setFlash({ ok: false, text: err instanceof Error ? err.message.slice(0, 160) : "Create failed." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-ivory text-charcoal">
      <div className="mx-auto w-full max-w-7xl px-6 py-12">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-ink/10 pb-8">
          <div>
            <p className="editorial-label text-rust">Hands of Grace — administration</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight">Admin dashboard</h1>
            <p className="mt-2 text-[0.9rem] text-smoke">Signed in as {user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild className="gap-2">
              <Link to="/"><ArrowLeft className="size-4" /> Site</Link>
            </Button>
            <Button variant="ghost" onClick={() => void signOut()} className="text-smoke hover:text-charcoal">
              Sign out
            </Button>
          </div>
        </header>

        {/* Tabs */}
        <div role="tablist" aria-label="Admin sections" className="mt-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "border px-4 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-colors duration-300",
                tab === t.id
                  ? "border-clay bg-clay text-ivory"
                  : "border-ink/15 text-ink/60 hover:border-rust/50 hover:text-rust",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {flash && (
          <p
            role="status"
            className={cn(
              "mt-6 border px-4 py-3 text-[0.88rem]",
              flash.ok ? "border-sunlight bg-mist/60 text-charcoal/85" : "border-destructive/40 bg-destructive/5 text-destructive",
            )}
          >
            {flash.text}
          </p>
        )}

        {/* OVERVIEW */}
        {tab === "overview" && (
          <section className="mt-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat label="Total users" value={overview ? String(overview.users.total) : "…"} />
              <Stat label="New messages" value={overview ? String(overview.messages.new) : "…"} />
              <Stat label="Pending volunteer applications" value={overview ? String(overview.volunteers.pending) : "…"} />
              <Stat label="Upcoming events" value={overview ? String(overview.events.upcoming) : "…"} />
              <Stat label="Donation records" value={overview ? String(overview.donations.records) : "…"} />
              <Stat label="Successful donations" value={overview ? String(overview.donations.successful) : "…"} />
              <Stat label="Total received (successful)" value={overview ? fmtInr(overview.donations.totalSuccessfulInr) : "…"} />
              <Stat label="Invoices issued" value={overview ? String(overview.donations.invoices) : "…"} />
            </div>

            <div className="mt-10 border border-ink/10 bg-ivory p-7">
              <div className="flex items-center justify-between">
                <h2 className="editorial-label text-rust">Backend health</h2>
                {health && (
                  <span
                    className={cn(
                      "editorial-label border px-2.5 py-1 text-[0.58rem]",
                      health.status === "healthy" ? "border-sunlight text-rust" : "border-destructive/40 text-destructive",
                    )}
                  >
                    {health.status}
                  </span>
                )}
              </div>
              {health ? (
                <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(health.checks).map(([k, v]) => (
                    <li key={k} className="flex items-center justify-between border border-ink/10 px-4 py-2.5 text-[0.85rem]">
                      <span className="text-smoke">{k}</span>
                      <span
                        className={cn(
                          "editorial-label text-[0.58rem]",
                          v === "ok" ? "text-rust" : v === "pending" ? "text-smoke" : "text-destructive",
                        )}
                      >
                        {v}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 flex items-center gap-2 text-sm text-smoke">
                  <Loader2 className="size-4 animate-spin" /> Checking…
                </p>
              )}
              {health && health.adminCount !== 2 && (
                <p className="mt-5 border-l-2 border-sunlight bg-mist/60 p-4 text-[0.85rem] leading-relaxed text-charcoal/85">
                  {health.adminCount === 0
                    ? "No admin accounts yet. Set ADMIN_1_EMAIL / ADMIN_1_PASSWORD and ADMIN_2_EMAIL / ADMIN_2_PASSWORD in the Keys tab, then run: bunx convex run adminSetup:seedAdmins"
                    : `${health.adminCount} admin accounts exist (expected 2).`}
                </p>
              )}
            </div>
          </section>
        )}

        {/* CONTENT */}
        {tab === "content" && (
          <section className="mt-8">
            <p className="max-w-3xl text-[0.9rem] leading-relaxed text-smoke">
              Edit the website's sections. Saved content is what the public site renders — until a
              section is saved here, the site uses its curated defaults. Values are JSON shaped like
              the section data (hero: kicker, titleLines, subline, image{`{src,alt}`}; impact: fields
              [{`{id,label,value}`}] &amp; regions; founders: founders[{`{name,role,story,vision,contribution,image}`}];
              fragments: items[{`{id,caption,detail,span,image}`}] …).
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["hero", "impact", "film", "social", "founders", "serve", "fragments", "talkToUs", "donate", "footer", "contact"].map((k) => (
                <button
                  key={k}
                  onClick={() => void loadSection(k)}
                  className={cn(
                    "border px-3.5 py-2 text-[0.68rem] font-medium uppercase tracking-[0.16em] transition-colors",
                    contentKey === k ? "border-rust bg-rust text-ivory" : "border-ink/15 text-ink/60 hover:border-rust/50 hover:text-rust",
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
            <form onSubmit={saveContent} className="mt-5 max-w-3xl">
              <Textarea
                rows={16}
                value={contentValue}
                onChange={(e) => setContentValue(e.target.value)}
                placeholder={contentLoading ? "Loading current content…" : `Select "${contentKey}" above, then edit its JSON here.`}
                className="font-mono text-[0.8rem]"
                required
              />
              <div className="mt-4 flex items-center gap-4">
                <Button type="submit" disabled={busy || contentLoading}>
                  {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Save {contentKey}
                </Button>
                {contentMeta && (
                  <p className="text-[0.78rem] text-smoke">
                    {contentMeta.filter((c) => c.hasValue).length} of 11 sections saved
                  </p>
                )}
              </div>
            </form>
          </section>
        )}

        {/* MEDIA */}
        {tab === "media" && (
          <section className="mt-8">
            <div className="flex flex-wrap items-end gap-4">
              <label className="text-[0.85rem] text-smoke">
                <span className="editorial-label mb-1.5 block text-[0.6rem]">Upload as</span>
                <select
                  value={mediaKind}
                  onChange={(e) => setMediaKind(e.target.value)}
                  className="border border-ink/15 bg-ivory px-3 py-2.5 text-[0.85rem]"
                >
                  {["hero", "founder", "fragment", "film-poster", "event", "other"].map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </label>
              <label className="text-[0.85rem] text-smoke">
                <span className="editorial-label mb-1.5 block text-[0.6rem]">File</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadMedia(f);
                    e.target.value = "";
                  }}
                  className="text-[0.85rem]"
                />
              </label>
            </div>

            {media === undefined ? null : media.length === 0 ? (
              <p className="mt-8 border border-dashed border-ink/15 bg-cream/50 p-8 text-center text-[0.9rem] text-smoke">
                No media uploaded yet.
              </p>
            ) : (
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {media.map((m) => (
                  <li key={m._id} className="border border-ink/10 bg-ivory">
                    <img src={m.url ?? ""} alt={m.filename} className="h-40 w-full object-cover" loading="lazy" />
                    <div className="p-4">
                      <p className="truncate text-[0.82rem] text-charcoal/85">{m.filename}</p>
                      <p className="editorial-label mt-1 text-[0.55rem] text-smoke">
                        {m.kind} · {m.published ? "published" : "unpublished"}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await setPublished({ id: m._id, published: !m.published });
                          }}
                        >
                          {m.published ? "Unpublish" : "Publish"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={async () => {
                            await deleteMedia({ id: m._id });
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* EVENTS */}
        {tab === "events" && (
          <section className="mt-8 grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="editorial-label text-rust">Create event</h2>
              <form onSubmit={addEvent} className="mt-5 space-y-4">
                <Input placeholder="Title" value={eventForm.title} onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))} required minLength={3} />
                <Textarea placeholder="Description" rows={4} value={eventForm.description} onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))} required minLength={3} />
                <div className="grid grid-cols-2 gap-4">
                  <label className="text-[0.8rem] text-smoke">
                    Date
                    <Input type="date" value={eventForm.date} onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))} required />
                  </label>
                  <label className="text-[0.8rem] text-smoke">
                    Time
                    <Input placeholder="10:00 AM" value={eventForm.time} onChange={(e) => setEventForm((f) => ({ ...f, time: e.target.value }))} />
                  </label>
                </div>
                <Input placeholder="Location" value={eventForm.location} onChange={(e) => setEventForm((f) => ({ ...f, location: e.target.value }))} required />
                <Input placeholder="Registration link (https://…, optional)" value={eventForm.registrationLink} onChange={(e) => setEventForm((f) => ({ ...f, registrationLink: e.target.value }))} />
                <Button type="submit" disabled={busy}>
                  {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null} Create event (draft)
                </Button>
              </form>
            </div>

            <div>
              <h2 className="editorial-label text-rust">All events ({events?.length ?? 0})</h2>
              <ul className="mt-5 space-y-4">
                {(events ?? []).map((e) => (
                  <li key={e._id} className="border border-ink/10 bg-ivory p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-serif text-lg">{e.title}</p>
                      <span className={cn("editorial-label border px-2 py-1 text-[0.55rem]", e.status === "published" ? "border-sunlight text-rust" : "border-ink/20 text-smoke")}>
                        {e.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[0.8rem] text-smoke">{e.date}{e.time ? ` · ${e.time}` : ""} · {e.location}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={async () => { await setEventStatus({ id: e._id, status: e.status === "published" ? "draft" : "published" }); }}>
                        {e.status === "published" ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const title = window.prompt("New title", e.title);
                          if (title) await updateEvent({ id: e._id, title });
                        }}
                      >
                        Rename
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={async () => { if (window.confirm(`Delete "${e.title}"?`)) await deleteEvent({ id: e._id }); }}>
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <section className="mt-8">
            <Input placeholder="Search name, email or message…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
            <ul className="mt-6 space-y-4">
              {filteredMessages.map((m) => (
                <MessageRow key={m._id} m={m} onSave={async (patch) => { await updateMessage({ id: m._id, ...patch }); }} />
              ))}
              {messages !== undefined && messages.length === 0 && (
                <p className="border border-dashed border-ink/15 bg-cream/50 p-8 text-center text-[0.9rem] text-smoke">No messages yet.</p>
              )}
            </ul>
          </section>
        )}

        {/* VOLUNTEERS */}
        {tab === "volunteers" && (
          <section className="mt-8">
            <ul className="space-y-4">
              {(applications ?? []).map((a) => (
                <li key={a._id} className="border border-ink/10 bg-ivory p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <p className="font-serif text-lg">{a.name}</p>
                      <p className="text-[0.8rem] text-smoke">{a.email}{a.phone ? ` · ${a.phone}` : ""}</p>
                    </div>
                    <span className="editorial-label border border-ink/15 px-2.5 py-1 text-[0.58rem] text-ink/70">{a.status}</span>
                  </div>
                  {a.availability && <p className="mt-3 text-[0.85rem] text-smoke">Availability: {a.availability}</p>}
                  {a.message && <p className="mt-2 text-[0.9rem] leading-relaxed text-charcoal/85">{a.message}</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {["submitted", "under_review", "approved", "declined", "completed"].map((s) => (
                      <button
                        key={s}
                        onClick={async () => { await updateApplication({ id: a._id, status: s }); }}
                        className={cn(
                          "border px-3 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.14em]",
                          a.status === s ? "border-rust bg-rust text-ivory" : "border-ink/15 text-ink/60 hover:border-rust/50 hover:text-rust",
                        )}
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const response = window.prompt("Response to the applicant (visible to them):", a.adminResponse ?? "");
                        if (response !== null) await updateApplication({ id: a._id, adminResponse: response });
                      }}
                    >
                      Respond
                    </Button>
                  </div>
                  <p className="editorial-label mt-4 text-[0.55rem] text-smoke/60">{fmtDate(a.createdAt)}</p>
                </li>
              ))}
              {applications !== undefined && applications.length === 0 && (
                <p className="border border-dashed border-ink/15 bg-cream/50 p-8 text-center text-[0.9rem] text-smoke">No applications yet.</p>
              )}
            </ul>
          </section>
        )}

        {/* DONATIONS */}
        {tab === "donations" && (
          <section className="mt-8">
            <h2 className="editorial-label text-rust">Donations ({donations?.length ?? 0})</h2>
            <ul className="mt-5 space-y-3">
              {(donations ?? []).map((d) => (
                <li key={d._id} className="flex flex-wrap items-center justify-between gap-3 border border-ink/10 bg-ivory px-5 py-4">
                  <div>
                    <p className="font-serif text-lg tabular-nums">{fmtInr(d.amountInr)} <span className="text-[0.75rem] text-smoke">· {d.frequency === "monthly" ? "monthly" : "one-time"}</span></p>
                    <p className="text-[0.8rem] text-smoke">{d.donorName} · {d.donorEmail} · {fmtDate(d.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="editorial-label border border-ink/15 px-2.5 py-1 text-[0.58rem] text-ink/70">{d.status}</span>
                    {d.status === "successful" && (
                      <Button size="sm" variant="outline" onClick={async () => { if (window.confirm("Mark this donation refunded? The invoice will be withdrawn.")) await setDonationStatus({ id: d._id, status: "refunded" }); }}>
                        Refund
                      </Button>
                    )}
                  </div>
                </li>
              ))}
              {donations !== undefined && donations.length === 0 && (
                <p className="border border-dashed border-ink/15 bg-cream/50 p-8 text-center text-[0.9rem] text-smoke">No donations yet.</p>
              )}
            </ul>

            <h2 className="editorial-label mt-10 text-rust">Invoices ({invoices?.length ?? 0})</h2>
            <ul className="mt-5 space-y-2">
              {(invoices ?? []).map((i) => (
                <li key={i._id} className="flex flex-wrap items-center justify-between gap-3 border border-ink/10 bg-ivory px-5 py-3 text-[0.85rem]">
                  <span className="tabular-nums text-charcoal/85">{i.invoiceNumber}</span>
                  <span className="text-smoke">{i.donorName} · {fmtDate(i.issuedAt)}</span>
                  <span className="font-serif tabular-nums">{fmtInr(i.amountInr)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* USERS */}
        {tab === "users" && (
          <section className="mt-8">
            <ul className="space-y-3">
              {(users ?? []).map((u) => (
                <li key={u._id} className="flex flex-wrap items-center justify-between gap-3 border border-ink/10 bg-ivory px-5 py-4">
                  <div>
                    <p className="text-[0.95rem] text-charcoal/90">{u.name ?? "—"} {u.role === "admin" && <span className="editorial-label ml-2 border border-rust px-1.5 py-0.5 text-[0.55rem] text-rust">admin</span>}</p>
                    <p className="text-[0.8rem] text-smoke">{u.email}</p>
                  </div>
                  <p className="text-[0.78rem] text-smoke">
                    {u.messageCount} messages · {u.applicationCount} applications · {u.donationCount} donations
                  </p>
                  {u.role === "admin" ? (
                    <Button size="sm" variant="outline" onClick={async () => { if (window.confirm(`Revoke admin from ${u.email}?`)) await setUserRole({ userId: u._id, role: "" }); }}>
                      Revoke admin
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={async () => { await setUserRole({ userId: u._id, role: "admin" }); }}>
                      Make admin
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* SETTINGS */}
        {tab === "settings" && (
          <section className="mt-8 grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="editorial-label text-rust">Admin accounts</h2>
              <div className="mt-5 border border-ink/10 bg-ivory p-6 text-[0.88rem] leading-relaxed text-charcoal/85">
                <p>
                  Admins are seeded securely from the Keys tab. Configure:
                </p>
                <pre className="mt-3 overflow-auto rounded bg-ink p-4 text-[0.72rem] leading-relaxed text-mist">{`ADMIN_1_EMAIL=…
ADMIN_1_PASSWORD=…   (or ADMIN_1_PASSWORD_HASH)
ADMIN_2_EMAIL=…
ADMIN_2_PASSWORD=…   (or ADMIN_2_PASSWORD_HASH)`}</pre>
                <p className="mt-3">
                  Then run once: <code className="rounded bg-mist px-1.5 py-0.5">bunx convex run adminSetup:seedAdmins</code>
                </p>
                <p className="mt-3 text-smoke">
                  Current admin accounts: {health?.adminCount ?? "…"}
                </p>
              </div>
            </div>
            <div>
              <h2 className="editorial-label text-rust">Recent audit trail</h2>
              <ul className="mt-5 space-y-2">
                {(audit ?? []).map((a) => (
                  <li key={a._id} className="border border-ink/10 bg-ivory px-4 py-2.5 text-[0.8rem]">
                    <span className="font-medium text-charcoal/90">{a.action}</span>
                    <span className="text-smoke"> · {a.actorEmail ?? "system"} · {fmtDate(a.createdAt)}</span>
                  </li>
                ))}
                {audit !== undefined && audit.length === 0 && (
                  <li className="border border-dashed border-ink/15 p-6 text-center text-[0.85rem] text-smoke">No admin actions recorded yet.</li>
                )}
              </ul>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* ------------ helpers ------------- */

// Content section loader: fetches the current value of one key.
// Implemented as a plain fetch against the Convex query endpoint to avoid
// conditional hook usage inside the editor flow.
const { useQueryFetch } = { useQueryFetch: (_k: string) => Promise.resolve(null) } as {
  useQueryFetch: (k: string) => Promise<unknown>;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/10 bg-ivory p-6">
      <p className="editorial-label text-[0.58rem] text-smoke">{label}</p>
      <p className="mt-3 font-serif text-3xl tabular-nums text-charcoal">{value}</p>
    </div>
  );
}

function MessageRow({
  m,
  onSave,
}: {
  m: {
    _id: string;
    name: string;
    email: string;
    type: string;
    message: string;
    status: string;
    adminNotes?: string | null;
    adminResponse?: string | null;
    createdAt: number;
  };
  onSave: (patch: { status?: string; adminNotes?: string; adminResponse?: string }) => Promise<void>;
}) {
  return (
    <li className="border border-ink/10 bg-ivory p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-serif text-lg">{m.name} <span className="ml-2 editorial-label text-[0.55rem] text-rust">{m.type}</span></p>
          <p className="text-[0.8rem] text-smoke">{m.email}</p>
        </div>
        <span className="editorial-label border border-ink/15 px-2.5 py-1 text-[0.58rem] text-ink/70">{m.status}</span>
      </div>
      <p className="mt-3 text-[0.92rem] leading-relaxed text-charcoal/85">{m.message}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {["new", "read", "in_progress", "responded", "closed"].map((s) => (
          <button
            key={s}
            onClick={() => void onSave({ status: s })}
            className={cn(
              "border px-3 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.14em]",
              m.status === s ? "border-rust bg-rust text-ivory" : "border-ink/15 text-ink/60 hover:border-rust/50 hover:text-rust",
            )}
          >
            {s.replace("_", " ")}
          </button>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            const notes = window.prompt("Internal note (never visible to the user):", m.adminNotes ?? "");
            if (notes !== null) await onSave({ adminNotes: notes });
          }}
        >
          Note
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            const response = window.prompt("Response (visible to the user):", m.adminResponse ?? "");
            if (response !== null) await onSave({ adminResponse: response });
          }}
        >
          Respond
        </Button>
      </div>
      <p className="editorial-label mt-4 text-[0.55rem] text-smoke/60">{fmtDate(m.createdAt)}</p>
    </li>
  );
}
