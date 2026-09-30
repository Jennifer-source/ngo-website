import { useLayoutEffect, useState, type FormEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useTalkToUsContent, useContactContent } from "@/hooks/use-site-content";
import { CHAPTER_COUNT } from "@/content/site";
import { EASE, SectionHeader, AnimatedText, FadeIn, MagneticButton } from "./motion/Primitives";
import { cn } from "@/lib/utils";
import AuthModal from "./AuthModal";
import { useAuth } from "@/hooks/use-auth";

type PathwayId = "general" | "volunteer" | "partnership" | "prayer";
type Status = "idle" | "sending" | "success" | "error";

/** Same ids as the form chips; guards the custom-event pre-select. */
const PATHWAY_IDS: PathwayId[] = ["general", "volunteer", "partnership", "prayer"];

/**
 * Chapter 08 — Talk to us.
 * A warm, production-quality conversation form: clear fields, focus
 * states, validation, error states and a success animation. Submissions
 * persist to Convex.
 */
export default function TalkToUs() {
  const talk = useTalkToUsContent();
  const contact = useContactContent();
  const submit = useMutation(api.messages.submitMessage);
  const submitApplication = useMutation(api.volunteers.submitApplication);
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [pathway, setPathway] = useState<PathwayId>("general");
  const [values, setValues] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  // Pre-select the pathway when arriving from a Serve CTA (e.g. "Become a
  // volunteer"). Registered before first paint so a same-tick click's
  // dispatch is never missed.
  useLayoutEffect(() => {
    const preselect = (e: Event) => {
      const detail = (e as CustomEvent<{ pathway?: string }>).detail;
      if (detail?.pathway && PATHWAY_IDS.includes(detail.pathway as PathwayId)) {
        setPathway(detail.pathway as PathwayId);
      }
    };
    window.addEventListener("hog:talk-pathway", preselect);
    return () => window.removeEventListener("hog:talk-pathway", preselect);
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (values.name.trim().length < 2) e.name = "Please share your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      e.email = "Please enter a valid email address.";
    if (values.message.trim().length < 10)
      e.message = "A few more words help us respond well — at least 10 characters.";
    return e;
  };

  const doSubmit = async () => {
    setStatus("sending");
    setServerError("");
    try {
      await submit({
        type: pathway,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        message: values.message.trim(),
      });
      if (pathway === "volunteer") {
        // The volunteer pathway also creates a trackable application so the
        // sender can follow its status under My account → My applications.
        await submitApplication({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim() || undefined,
          message: values.message.trim(),
        });
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setServerError(
        "The message could not be sent just now. Please try again in a moment.",
      );
    }
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (!authLoading && !isAuthenticated) {
      // Action needs identity: show the simple account modal first.
      setPendingSubmit(true);
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
      id="talk-to-us"
      aria-label="Talk to us"
      className="relative bg-mist py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="grid grid-cols-12 gap-4 md:gap-10">
          <div className="col-span-12 lg:col-span-5">
            <SectionHeader label={talk.label} chapter={8} total={CHAPTER_COUNT} />
            <AnimatedText
              as="h2"
              lines={talk.statementLines}
              className="mt-10 font-serif text-[clamp(2.4rem,5.5vw,5rem)] leading-[1.04] text-charcoal"
            />
            <FadeIn delay={0.25}>
              <p className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-smoke">
                {talk.intro}
              </p>
              <div className="mt-10 space-y-2 border-t border-ink/10 pt-6">
                {contact.email && <p className="text-[0.9rem] text-charcoal/80">{contact.email}</p>}
                {contact.phone && <p className="text-[0.9rem] text-charcoal/80">{contact.phone}</p>}
                {contact.hours && (
                  <p className="editorial-label pt-2 text-smoke/70">{contact.hours}</p>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Form */}
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <div className="border border-ink/10 bg-ivory p-7 md:p-10">
              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: EASE }}
                  className="flex min-h-[420px] flex-col items-center justify-center text-center"
                >
                  <motion.svg
                    width="64"
                    height="64"
                    viewBox="0 0 64 64"
                    fill="none"
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="30"
                      stroke="#FB8C00"
                      strokeWidth="1.5"
                      variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
                      transition={{ duration: 1.2, ease: EASE }}
                    />
                    <motion.path
                      d="M20 33 L28.5 41.5 L44 25"
                      stroke="#BF360C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.8 }}
                    />
                  </motion.svg>
                  <h3 className="mt-8 font-serif text-3xl text-charcoal">Message received.</h3>
                  <p className="mt-3 max-w-xs text-[0.9rem] leading-relaxed text-smoke">
                    Thank you for reaching out. Someone from the ministry will respond
                    to you personally.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setValues({ name: "", email: "", phone: "", message: "" });
                    }}
                    className="editorial-label mt-8 text-rust underline-offset-4 hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={onSubmit} noValidate>
                  <fieldset>
                    <legend className="editorial-label mb-4 text-smoke">
                      What is this about?
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {talk.pathways
                        .filter((p) => PATHWAY_IDS.includes(p.id as PathwayId))
                        .map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            aria-pressed={pathway === p.id}
                            onClick={() => setPathway(p.id as PathwayId)}
                            className={cn(
                              "border px-4 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-all duration-500",
                              pathway === p.id
                                ? "border-clay bg-clay text-ivory"
                                : "border-ink/15 text-ink/60 hover:border-rust/50 hover:text-rust",
                            )}
                          >
                            {p.label}
                          </button>
                        ))}
                    </div>
                  </fieldset>

                  <div className="mt-9 grid grid-cols-1 gap-7 md:grid-cols-2">
                    <Field label="Your name" error={errors.name} htmlFor="ttu-name">
                      <input
                        id="ttu-name"
                        type="text"
                        autoComplete="name"
                        value={values.name}
                        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                        className={inputCls(errors.name)}
                        placeholder="Full name"
                        aria-invalid={!!errors.name}
                      />
                    </Field>
                    <Field label="Email" error={errors.email} htmlFor="ttu-email">
                      <input
                        id="ttu-email"
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
                    <Field label="Phone (optional)" htmlFor="ttu-phone">
                      <input
                        id="ttu-phone"
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
                    <Field label="Your message" error={errors.message} htmlFor="ttu-message">
                      <textarea
                        id="ttu-message"
                        rows={5}
                        value={values.message}
                        onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                        className={cn(inputCls(errors.message), "resize-none")}
                        placeholder="Tell us what's on your heart…"
                        aria-invalid={!!errors.message}
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

                  <div className="mt-9 flex flex-wrap items-center gap-5">
                    <MagneticButton type="submit" disabled={status === "sending"}>
                      {status === "sending" ? "Sending…" : talk.cta}
                    </MagneticButton>
                    <p className="editorial-label text-[0.6rem] text-smoke/70">
                      Your message stays private.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Identity gate — only when submitting; browsing never requires it. */}
      <AuthModal
        open={authOpen}
        onOpenChange={(o) => {
          setAuthOpen(o);
          if (!o) setPendingSubmit(false);
        }}
        onSignedIn={() => {
          setPendingSubmit(false);
          void doSubmit();
        }}
        contextLabel="send your message"
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
