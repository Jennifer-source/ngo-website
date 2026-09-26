import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { JOURNEY_OPENING, JOURNEY_MILESTONES, CHAPTER_COUNT } from "@/content/site";
import { EASE, SectionHeader, AnimatedText, FadeIn } from "./motion/Primitives";
import { cn } from "@/lib/utils";

/**
 * Chapter 02 — Our Journey.
 * A sticky horizontal filmstrip: vertical scroll drives horizontal travel
 * through the milestones. Falls back to a vertical editorial stack when
 * motion is reduced or on small screens.
 */
export default function Journey() {
  const reduced = useReducedMotion();
  const horizontal = !reduced;

  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const x = useTransform(scrollYProgress, [0.08, 0.92], ["1%", "-57%"]);
  const lineScale = useTransform(scrollYProgress, [0.08, 0.92], [0, 1]);

  /* The opening statement breathes as you arrive */
  const introRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: introP } = useScroll({
    target: introRef,
    offset: ["start end", "end start"],
  });
  const introX1 = useTransform(introP, [0, 1], ["4%", "-4%"]);
  const introX2 = useTransform(introP, [0, 1], ["-4%", "4%"]);

  return (
    <section id="journey" aria-label="Our journey" className="relative bg-ivory">
      {/* Opening statement — slow horizontal drift, staggered type */}
      <div
        ref={introRef as React.RefObject<HTMLDivElement | null>}
        className="mx-auto max-w-[1600px] px-6 pb-24 pt-28 md:px-12 md:pt-40"
      >
        <SectionHeader label={JOURNEY_OPENING.label} chapter={2} total={CHAPTER_COUNT} />
        <motion.h2
          style={reduced ? undefined : { x: introX1 }}
          className="mt-14 font-serif text-[clamp(2.6rem,7vw,6.5rem)] leading-[1.02] text-charcoal"
        >
          {JOURNEY_OPENING.statementLines.slice(0, 2).map((line, i) => (
            <span key={i} className="headline-crop block">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, margin: "-12%" }}
                transition={{ duration: 1.15, ease: EASE, delay: i * 0.15 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </motion.h2>
        <motion.h2
          style={reduced ? undefined : { x: introX2 }}
          className="mt-2 font-serif text-[clamp(2.6rem,7vw,6.5rem)] leading-[1.02] text-rust"
        >
          {JOURNEY_OPENING.statementLines.slice(2).map((line, i) => (
            <span key={i} className="headline-crop block">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, margin: "-12%" }}
                transition={{ duration: 1.15, ease: EASE, delay: 0.2 + i * 0.15 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </motion.h2>

        <div className="mt-16 grid grid-cols-12 gap-6">
          <motion.p
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: EASE }}
            className="col-span-4 h-px origin-left bg-rust/50 md:col-span-3"
          />
          <FadeIn className="col-span-8 md:col-span-5" delay={0.2}>
            <p className="text-[0.95rem] leading-relaxed text-smoke">
              {JOURNEY_OPENING.intro}
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Horizontal filmstrip — desktop, full motion */}
      {horizontal ? (
        <div ref={ref as React.RefObject<HTMLDivElement | null>} className="relative h-[420vh]">
          <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 pt-8 md:px-12">
              <span className="editorial-label text-smoke/70">
                The journey so far — scroll on
              </span>
              <span className="editorial-label tabular-nums text-smoke/70">02 / {String(CHAPTER_COUNT).padStart(2, "0")}</span>
            </div>

            <motion.div style={{ x }} className="mt-auto flex items-stretch gap-0 pl-6 md:pl-12">
              {JOURNEY_MILESTONES.map((m, i) => (
                <article
                  key={i}
                  className="group relative flex w-[82vw] shrink-0 flex-col justify-end border-l border-ink/10 pl-8 pr-10 md:w-[46vw] lg:w-[40vw]"
                  aria-label={`${m.year} — ${m.moment}`}
                >
                  {/* Oversized ghost year behind content */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-6 top-6 font-serif text-[7rem] leading-none text-sand/70 md:text-[10rem]"
                  >
                    {m.year}
                  </span>

                  <div className="relative z-10 mb-10 h-[38vh] overflow-hidden">
                    <div className="duotone h-full w-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
                      <img src={m.image.src} alt={m.image.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    </div>
                  </div>

                  <p className="editorial-label mb-4 text-rust">{m.year} · {m.location}</p>
                  <h3 className="font-serif text-3xl leading-tight text-charcoal md:text-4xl">
                    {m.moment}
                  </h3>
                  <p className="mt-4 max-w-md text-[0.9rem] leading-relaxed text-smoke">
                    {m.whatHappened}
                  </p>
                  <p className="mt-3 max-w-md border-l-2 border-sunlight pl-4 text-[0.85rem] italic leading-relaxed text-clay/90">
                    {m.whyItMattered}
                  </p>
                </article>
              ))}

              {/* End plate — the journey continues */}
              <div className="flex w-[60vw] shrink-0 items-center md:w-[30vw]">
                <p className="pl-8 font-serif text-4xl leading-tight text-charcoal/80 md:text-5xl">
                  And the road
                  <br />
                  keeps <span className="text-rust">opening.</span>
                </p>
              </div>
            </motion.div>

            {/* Progress thread */}
            <div className="mx-auto mt-auto mb-10 w-full max-w-[1600px] px-6 md:px-12">
              <div className="h-px w-full bg-ink/10">
                <motion.div style={{ scaleX: lineScale }} className="h-px origin-left bg-gradient-to-r from-sun to-clay" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Reduced motion / small screens: vertical editorial stack */
        <div className="mx-auto max-w-[1600px] px-6 pb-28 md:px-12">
          <ol className="space-y-20">
            {JOURNEY_MILESTONES.map((m, i) => (
              <li key={i} className={cn("grid grid-cols-12 gap-6", i % 2 === 1 && "md:[direction:rtl]")}>
                <FadeIn className="col-span-12 md:col-span-6 [direction:ltr]">
                  <div className="duotone aspect-[4/3] w-full">
                    <img src={m.image.src} alt={m.image.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  </div>
                </FadeIn>
                <div className="col-span-12 flex flex-col justify-center md:col-span-5 [direction:ltr]">
                  <p className="editorial-label mb-4 text-rust">{m.year} · {m.location}</p>
                  <h3 className="font-serif text-3xl text-charcoal md:text-4xl">{m.moment}</h3>
                  <p className="mt-4 text-[0.9rem] leading-relaxed text-smoke">{m.whatHappened}</p>
                  <p className="mt-3 border-l-2 border-sunlight pl-4 text-[0.85rem] italic text-clay/90">{m.whyItMattered}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
