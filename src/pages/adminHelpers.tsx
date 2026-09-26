import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const fmtDate = (t: number) =>
  new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/10 bg-ivory p-6">
      <p className="editorial-label text-[0.58rem] text-smoke">{label}</p>
      <p className="mt-3 font-serif text-3xl tabular-nums text-charcoal">{value}</p>
    </div>
  );
}

export function fmtInr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtDateShort(t: number) {
  return fmtDate(t);
}

/**
 * Content editor for one website section. Own component so the per-key
 * useQuery subscription follows the selected key cleanly.
 */
export function ContentEditor({ onSaved }: { onSaved: (key: string) => void }) {
  const [contentKey, setContentKey] = useState("hero");
  const current = useQuery(api.content.getContent, { key: contentKey });
  const setContent = useMutation(api.content.setContent);
  const contentMeta = useQuery(api.content.listContentMeta);
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const serverJson = useMemo(() => JSON.stringify(current ?? {}, null, 2), [current]);

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const parsed = JSON.parse(draft ?? serverJson);
      await setContent({ key: contentKey, value: parsed });
      setDraft(null);
      onSaved(contentKey);
    } catch (err) {
      setError(err instanceof Error ? err.message.slice(0, 160) : "Invalid JSON.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {["hero", "impact", "film", "social", "founders", "serve", "fragments", "talkToUs", "donate", "footer", "contact"].map(
          (k) => (
            <button
              key={k}
              onClick={() => {
                setContentKey(k);
                setDraft(null);
              }}
              className={cn(
                "border px-3.5 py-2 text-[0.68rem] font-medium uppercase tracking-[0.16em] transition-colors",
                contentKey === k
                  ? "border-rust bg-rust text-ivory"
                  : "border-ink/15 text-ink/60 hover:border-rust/50 hover:text-rust",
              )}
            >
              {k}
            </button>
          ),
        )}
      </div>
      <div className="mt-5 max-w-3xl">
        <Textarea
          rows={16}
          value={draft ?? serverJson}
          onChange={(e) => setDraft(e.target.value)}
          className="font-mono text-[0.8rem]"
          spellCheck={false}
        />
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button onClick={() => void save()} disabled={busy || draft === null}>
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Save {contentKey}
          </Button>
          {draft !== null && (
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Discard changes
            </Button>
          )}
          {contentMeta && (
            <p className="text-[0.78rem] text-smoke">
              {contentMeta.filter((c) => c.hasValue).length} of 11 sections saved
              {current === undefined ? " · loading…" : ""}
            </p>
          )}
        </div>
        {error && <p role="alert" className="mt-3 text-[0.85rem] text-destructive">{error}</p>}
      </div>
    </>
  );
}

export type AdminMessage = {
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

export function MessageRow({
  m,
  onSave,
}: {
  m: AdminMessage;
  onSave: (patch: { status?: string; adminNotes?: string; adminResponse?: string }) => Promise<void>;
}) {
  return (
    <li className="border border-ink/10 bg-ivory p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-serif text-lg">
            {m.name}
            <span className="ml-2 editorial-label text-[0.55rem] text-rust">{m.type}</span>
          </p>
          <p className="text-[0.8rem] text-smoke">{m.email}</p>
        </div>
        <span className="editorial-label border border-ink/15 px-2.5 py-1 text-[0.58rem] text-ink/70">
          {m.status}
        </span>
      </div>
      <p className="mt-3 text-[0.92rem] leading-relaxed text-charcoal/85">{m.message}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {["new", "read", "in_progress", "responded", "closed"].map((s) => (
          <button
            key={s}
            onClick={() => void onSave({ status: s })}
            className={cn(
              "border px-3 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.14em]",
              m.status === s
                ? "border-rust bg-rust text-ivory"
                : "border-ink/15 text-ink/60 hover:border-rust/50 hover:text-rust",
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
