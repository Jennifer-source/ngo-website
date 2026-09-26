import { motion } from "framer-motion";
import { SOCIAL, SOCIAL_HANDLES, CHAPTER_COUNT } from "@/content/site";
import { EASE, SectionHeader, FadeIn } from "./motion/Primitives";

/**
 * Chapter 04 — Social handles.
 * Kinetic typography + horizontally drifting channels. Honest state: a
 * channel without a real URL is presented as "opening soon", never a
 * dead link.
 */
export default function SocialHandles() {
  const marquee = [...SOCIAL_HANDLES, ...SOCIAL_HANDLES];

  return (
    <section
      id="social"
      aria-label="Follow the journey"
      className="relative overflow-hidden border-y border-ink/10 bg-ivory py-28 md:py-36"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <SectionHeader label={SOCIAL.label} chapter={4} total={CHAPTER_COUNT} />
            <FadeIn>
              <p className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-smoke">
                {SOCIAL.intro}
              </p>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Kinetic words */}
      <div className="mt-20 overflow-hidden">
        <motion.div
          className="marquee-track flex w-max items-baseline gap-16 whitespace-nowrap will-change-transform"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...SOCIAL.kinetic, ...SOCIAL.kinetic, ...SOCIAL.kinetic].map(
            (word, i) => (
              <span
                key={i}
                className={
                  "font-serif text-[clamp(3rem,9vw,8rem)] leading-none " +
                  (i % 2 === 0 ? "text-charcoal" : "italic text-rust/80")
                }
              >
                {word}
              </span>
            ),
          )}
        </motion.div>
      </div>

      {/* Channels */}
      <div className="mt-20 overflow-hidden">
        <motion.ul
          className="marquee-track flex w-max gap-4 will-change-transform"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
        >
          {marquee.map((s, i) => {
            const inner = (
              <>
                <span className="editorial-label text-rust">{s.platform}</span>
                <span className="font-serif text-2xl text-charcoal md:text-3xl">
                  {s.handle}
                </span>
                <span className="mt-1 block text-[0.8rem] text-smoke">{s.note}</span>
                <span className="editorial-label mt-5 inline-flex items-center gap-2 text-ink/60 transition-colors duration-500 group-hover:text-rust">
                  {s.href ? (
                    <>
                      {s.action} <span aria-hidden>→</span>
                    </>
                  ) : (
                    "Opening soon"
                  )}
                </span>
              </>
            );
            const cls =
              "group flex w-[19rem] shrink-0 flex-col border border-ink/10 bg-cream/60 p-7 transition-colors duration-500 hover:border-rust/40 hover:bg-mist/70";
            return (
              <li key={`${s.id}-${i}`}>
                {s.href ? (
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {inner}
                  </a>
                ) : (
                  <div className={cls} aria-label={`${s.platform} — opening soon`}>
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
