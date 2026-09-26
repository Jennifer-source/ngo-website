import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FOOTER, NAV_LINKS, SOCIAL_HANDLES, CONTACT } from "@/content/site";
import { EASE } from "./motion/Primitives";

/**
 * Chapter 13 — Footer.
 * A quiet, spacious close to the journey. Local time ticks softly —
 * the story continues beyond the website.
 */
export default function Footer() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  const socials = SOCIAL_HANDLES.filter((s) => s.href);

  return (
    <footer
      id="footer"
      aria-label="Footer"
      className="relative bg-ink pb-10 pt-24 text-ivory"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        {/* Wordmark */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE }}
          className="font-serif text-[clamp(2.8rem,8vw,7rem)] leading-none text-ivory"
        >
          {FOOTER.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE, delay: 0.25 }}
          className="mt-5 font-serif text-xl italic text-apricot/90 md:text-2xl"
        >
          {FOOTER.words.join("  ")}
        </motion.p>

        <div className="rule my-14 text-ivory" />

        {/* Columns */}
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-4">
            <p className="editorial-label mb-5 text-apricot/70">Navigate</p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="link-reveal text-[0.9rem] text-mist/80 hover:text-sunlight"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#donate"
                  className="link-reveal text-[0.9rem] text-mist/80 hover:text-sunlight"
                >
                  Donate
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-12 md:col-span-4">
            <p className="editorial-label mb-5 text-apricot/70">Follow the journey</p>
            <ul className="space-y-2.5">
              {socials.length > 0 ? (
                socials.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.href as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-reveal text-[0.9rem] text-mist/80 hover:text-sunlight"
                    >
                      {s.platform} — {s.handle}
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-[0.9rem] text-mist/50">
                  Official channels opening soon
                </li>
              )}
            </ul>
          </div>

          <div className="col-span-12 md:col-span-4">
            <p className="editorial-label mb-5 text-apricot/70">Contact</p>
            <div className="space-y-2.5 text-[0.9rem] text-mist/80">
              {CONTACT.email ? (
                <p>{CONTACT.email}</p>
              ) : (
                <p className="text-mist/50">Contact details coming soon</p>
              )}
              {CONTACT.phone && <p>{CONTACT.phone}</p>}
              {CONTACT.address && <p className="text-mist/60">{CONTACT.address}</p>}
              <p className="editorial-label pt-2 text-[0.6rem] text-mist/40">
                {CONTACT.hours}
              </p>
              <p className="editorial-label pt-2 tabular-nums text-[0.6rem] text-mist/40">
                Local time — {time || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="rule my-12 text-ivory" />

        {/* Legal strip */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <p className="editorial-label text-[0.6rem] text-mist/50">
            © {new Date().getFullYear()} {FOOTER.copyright}
          </p>
          <ul className="flex flex-wrap gap-6">
            {FOOTER.legal.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="link-reveal text-[0.75rem] uppercase tracking-[0.18em] text-mist/60 hover:text-sunlight"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="editorial-label text-[0.6rem] text-apricot/80">
            {FOOTER.closing}
          </p>
        </div>
      </div>
    </footer>
  );
}
