import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useDonateContent, useContactContent } from "@/hooks/use-site-content";
import { CHAPTER_COUNT, DONATE_AMOUNT } from "@/content/site";
import { SectionHeader, AnimatedText, FadeIn, MagneticButton } from "./motion/Primitives";
import { cn } from "@/lib/utils";
import AuthModal from "./AuthModal";
import { useAuth } from "@/hooks/use-auth";

type Status = "idle" | "sending" | "error";

/**
 * Chapter 09 — Donate.
 * Trust-first giving: the server creates a pending donation and hands the
 * visitor to the payment provider's checkout. Status only becomes
 * "successful" after the server-side confirmation — never from frontend
 * state. Sandbox mode is a clearly-labelled test checkout.
 */
export default function Donate() {
  const donate = useDonateContent();
  const contact = useContactContent();
  const partnership = donate.partnership;
  const createDonation = useMutation(api.donations.createDonation);
  const getCheckoutUrl = useMutation(api.donations.getSandboxCheckoutUrl);
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  /* Amount UI was removed; this single backend-tracked amount feeds checkout.
     See DONATE_AMOUNT in src/content/site.ts — change it there, not here. */
  const amount = DONATE_AMOUNT;
  const frequency = "one-time" as const;

  const formatInr = useMemo(
    () => (n: number) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(n),
    [],
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (values.name.trim().length < 2) e.name = "Please share your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      e.email = "Please enter a valid email address.";
    return e;
  };

  const doSubmit = async () => {
    setStatus("sending");
    setServerError("");
    try {
      /* Server creates the pending record (validated, rate-limited), then the
         checkout URL. Success is decided server-side on the payment page. */
      const created = await createDonation({
        donorName: values.name.trim(),
        donorEmail: values.email.trim(),
        phone: values.phone.trim() || undefined,
        frequency,
        amountInr: amount,
        message: values.message.trim() || undefined,
      });
      const { url } = await getCheckoutUrl({ donationId: created.id });
      window.location.href = url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setStatus("error");
      setServerError(
        msg.includes("RATE_LIMITED")
          ? "That's a few attempts in a row — please wait a little before trying again."
          : "The gift could not be processed just now. Please try again in a moment — or write to us directly.",
      );
    }
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (!authLoading && !isAuthenticated) {
      // Giving needs an account so the receipt is retrievable later.
      setAuthOpen(true);
      return;
    }
    await doSubmit();
  };

  const inputCls = (err?: string) =>
    cn(
      "w-full border-0 border-b bg-transparent px-0 py-3 text-[0.95rem] text-charcoal placeholder:text-smoke/50 focus:outline-none focus:ring-0",
      err ? "border-destructive" : "border-ink/20 focus:border-rust",
    );

  return (
    <section
      id="donate"
      aria-label="Donate"
      className="relative bg-cream py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-5">
            <SectionHeader label={donate.label} chapter={9} total={CHAPTER_COUNT} />
            <AnimatedText
              as="h2"
              lines={donate.statementLines}
              className="mt-10 font-serif text-[clamp(2.4rem,5.5vw,5rem)] leading-[1.04] text-charcoal"
            />
            <FadeIn delay={0.25}>
              <p className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-smoke">
                {donate.intro}
              </p>
            </FadeIn>

            {/* Trust ledger */}
            <FadeIn delay={0.35}>
              <div className="mt-12 border-l-2 border-sunlight bg-mist/60 p-6">
                <p className="editorial-label mb-3 text-rust">A note on trust</p>
                <p className="text-[0.88rem] leading-relaxed text-charcoal/85">
                  {donate.secureNote} Official bank and payment details will appear
                  here only once verified by the trust.
                </p>
                {!donate.bankDetails && !donate.paymentProvider && (
                  <p className="editorial-label mt-4 text-[0.6rem] text-smoke/80">
                    Payment method: sandbox test checkout — live payments arrive with
                    the next update
                  </p>
                )}
                {contact.email && (
                  <p className="mt-4 text-[0.85rem] text-clay">
                    Questions about giving? {contact.email}
                  </p>
                )}
              </div>
            </FadeIn>

            {/* For organisations — CSR and institutional giving */}
            <FadeIn delay={0.45}>
              <div className="mt-10 border border-ink/10 bg-ivory p-6">
                <p className="editorial-label mb-4 text-rust">{partnership.title}</p>
                <ul className="space-y-3">
                  {partnership.lines.map((l, i) => (
                    <li key={i} className="flex gap-3 text-[0.85rem] leading-relaxed text-charcoal/85">
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sun" />
                      {l}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-ink/10 pt-4 text-[0.8rem] leading-relaxed text-smoke">
                  {partnership.note}
                </p>
                <a
                  href="#talk-to-us"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .querySelector("#talk-to-us")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="editorial-label link-reveal mt-5 inline-block text-clay"
                >
                  Discuss a partnership →
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Form card */}
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <div className="border border-ink/10 bg-ivory p-7 md:p-10">
              <form onSubmit={onSubmit} noValidate>
                {/* Donor details */}
                <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                  <Field label="Your name" error={errors.name} htmlFor="don-name">
                    <input
                      id="don-name"
                      type="text"
                      autoComplete="name"
                      value={values.name}
                      onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                      className={inputCls(errors.name)}
                      placeholder="Full name"
                      aria-invalid={!!errors.name}
                    />
                  </Field>
                  <Field label="Email" error={errors.email} htmlFor="don-email">
                    <input
                      id="don-email"
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                      className={inputCls(errors.email)}
                      placeholder="you@example.com"
                      aria-invalid={!!errors.email}
                    />
                  </Field>
                </div>

                <div className="mt-7">
                  <Field label="Phone (optional)" htmlFor="don-phone">
                    <input
                      id="don-phone"
                      type="tel"
                      autoComplete="tel"
                      value={values.phone}
                      onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                      className={inputCls()}
                      placeholder="+91"
                    />
                  </Field>
                </div>

                <div className="mt-7">
                  <Field label="A note with your gift (optional)" htmlFor="don-message">
                    <textarea
                      id="don-message"
                      rows={3}
                      value={values.message}
                      onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                      className={cn(inputCls(), "resize-none")}
                      placeholder="Dedication, prayer request, or anything you'd like to share…"
                    />
                  </Field>
                </div>

                {status === "error" && (
                  <p
                    role="alert"
                    className="mt-5 border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-[0.85rem] text-destructive"
                  >
                    {serverError}
                  </p>
                )}

                <div className="mt-9">
                  <MagneticButton type="submit" disabled={status === "sending"} className="w-full justify-center sm:w-auto">
                    {status === "sending" ? "Recording…" : `Give ${formatInr(amount)} now`}
                  </MagneticButton>
                  <p className="editorial-label mt-4 text-[0.6rem] text-smoke/70">
                    Payments are processed over an encrypted connection · No card
                    details are stored on this website
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Identity gate — only when giving; browsing never requires it. */}
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSignedIn={() => void doSubmit()}
        contextLabel="give"
      />
    </section>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="editorial-label mb-1 block text-smoke">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-[0.78rem] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
