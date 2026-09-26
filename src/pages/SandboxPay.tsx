import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useSearchParams, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Id } from "../convex/_generated/dataModel";

/**
 * Sandbox test checkout — TEST MODE ONLY.
 * Simulates the hosted payment page of a gateway. Nothing real is charged;
 * the outcome is sent to a server-side mutation that (after ownership
 * checks) transitions the donation pending → successful (+invoice) or →
 * failed. The frontend can never mark a payment successful on its own.
 */
export default function SandboxPay() {
  const [params] = useSearchParams();
  const donationId = params.get("donation") ?? "";
  const amount = params.get("amount") ?? "";
  const frequency = params.get("frequency") ?? "one-time";
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const confirm = useMutation(api.donations.confirmSandboxPayment);
  const [state, setState] = useState<"idle" | "processing">("idle");
  const [result, setResult] = useState<{ ok: boolean; invoiceNumber: string | null; message: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setError("Your session has expired. Sign in again from the Donate section to complete this test payment.");
    }
  }, [authLoading, isAuthenticated]);

  const pay = async (outcome: "success" | "failure") => {
    setState("processing");
    setError("");
    try {
      const r = await confirm({ donationId: donationId as unknown as Id<"donations">, outcome });
      setResult({
        ok: outcome === "success",
        invoiceNumber: r.invoiceNumber ?? null,
        message:
          outcome === "success"
            ? "Test payment confirmed by the server. The donation is recorded as successful."
            : "Test payment declined by the server. The donation is recorded as failed.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message.replace(/^[A-Z_]+: /, "") : "Confirmation failed.");
    } finally {
      setState("idle");
    }
  };

  const fmt = (n: string) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
      Number(n || 0),
    );

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory p-6 text-charcoal">
      <div className="w-full max-w-md border border-ink/10 bg-ivory p-8 md:p-10">
        <p className="editorial-label text-rust">Sandbox checkout — test mode</p>
        <h1 className="mt-4 font-serif text-3xl">Test payment</h1>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-smoke">
          This page simulates an encrypted hosted checkout for testing. No real
          money moves and no card details are involved.
        </p>

        <dl className="mt-7 space-y-2 border-y border-ink/10 py-5 text-[0.9rem]">
          <div className="flex justify-between">
            <dt className="text-smoke">Amount</dt>
            <dd className="font-serif text-lg tabular-nums">{fmt(amount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-smoke">Frequency</dt>
            <dd>{frequency === "monthly" ? "Monthly" : "One time"}</dd>
          </div>
          {donationId && (
            <div className="flex justify-between gap-6">
              <dt className="shrink-0 text-smoke">Reference</dt>
              <dd className="break-all text-right font-mono text-[0.7rem] text-charcoal/70">{donationId}</dd>
            </div>
          )}
        </dl>

        {result ? (
          <div className="mt-7">
            <div className="flex items-start gap-3">
              {result.ok ? (
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-rust" aria-hidden />
              ) : (
                <TriangleAlert className="mt-0.5 size-5 shrink-0 text-smoke" aria-hidden />
              )}
              <p className="text-[0.9rem] leading-relaxed text-charcoal/85">{result.message}</p>
            </div>
            {result.invoiceNumber && (
              <p className="mt-4 border-l-2 border-sunlight bg-mist/60 p-4 text-[0.88rem]">
                Invoice issued: <strong className="tabular-nums">{result.invoiceNumber}</strong>
                <span className="mt-1 block text-[0.8rem] text-smoke">
                  Visible under My account → My donations.
                </span>
              </p>
            )}
            <div className="mt-7 flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link to="/account">Go to My account</Link>
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-7 flex flex-col gap-3">
            <Button
              className="w-full"
              disabled={state === "processing" || !!error || !donationId}
              onClick={() => void pay("success")}
            >
              {state === "processing" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Confirming…
                </>
              ) : (
                "Complete test payment"
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={state === "processing" || !!error}
              onClick={() => void pay("failure")}
            >
              Simulate failed payment
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link to="/">Cancel and return</Link>
            </Button>
            {error && (
              <p role="alert" className="rounded border border-destructive/30 bg-destructive/5 px-3 py-2 text-[0.85rem] text-destructive">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
