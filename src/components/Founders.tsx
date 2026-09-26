import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { FOUNDERS, FOUNDERS_INTRO, CHAPTER_COUNT } from "@/content/site";
import { EASE, SectionHeader, FadeIn } from "./motion/Primitives";
import { cn } from "@/lib/utils";

/**
 * Chapter 05 — The Founders.
 * Editorial portraits interleaved with oversized typography. Portraits
 * overlap the statement; each founder unfolds on their own scroll beat.
 */
export default function Founders() {
  const reduced = useReducedMotion();

  return (
    <section
      id="founders"
      aria-label="The founders"
      className="relative bg-mist py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <SectionHeader label={FOUNDERS_INTRO.label} chapter={5} total={CHAPTER_COUNT} />

        {/* Statement with an overlapping portrait */}
        <div className="relative mt-14">
          <h2 className="font-serif text-[clamp(2.6rem,7vw,6.5rem)] leading-[1.0] text-charcoal">
            {FOUNDERS_INTRO.statementLines.map((line, i) => (
              <span key={i} className="headline-crop block">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  whileInView={{ y: "0%" }}
                  viewport={{ once: true, margin: "-12%" }}
                  transition={{ duration: 1.15, ease: EASE, delay: i * 0.14 }}
                >
                  {i === 2 ? <em className="text-rust">{line}</em> : line}
                </motion.span>
              </span>
            ))}
          </h2>

          {/* Overlapping portrait — floats over the typography edge */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{ duration: 1.3, ease: EASE, delay: 0.4 }}
            className={cn(
              "mt-10 w-56 md:mt-0 md:w-72",
              "md:absolute md:right-[8%] md:top-1/2 md:-translate-y-1/2",
            )}
          >
            <div className="duotone aspect-[3/4] w-full shadow-2xl shadow-clay/20">
              <img
                src={FOUNDERS[0].image.src}
                alt={FOUNDERS[0].image.alt}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="editorial-label mt-3 text-ink/50">
              {FOUNDERS[0].name} — {FOUNDERS[0].role}
            </p>
          </motion.div>
        </div>

        <FadeIn delay={0.2}>
          <p className="mt-10 max-w-md text-[0.95rem] leading-relaxed text-smoke">
            {FOUNDERS_INTRO.intro}
          </p>
        </FadeIn>

        {/* Founder chapters */}
        <div className="mt-24 space-y-28 md:space-y-40">
          {FOUNDERS.map((f, idx) => (
            <FounderChapter key={f.name} founder={f} index={idx} reduced={!!reduced} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderChapter({
  founder,
  index,
  reduced,
}: {
  founder: (typeof FOUNDERS)[number];
  index: number;
  reduced: boolean;
}) {
  const ref = useRef2();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const flip = index % 2 === 1;

  return (
    <article
      ref={ref}
      className="grid grid-cols-12 items-center gap-8 md:gap-12"
      aria-label={founder.name}
    >
      {/* Portrait */}
      <motion.div
        className={cn("col-span-12 md:col-span-5", flip && "md:order-2 md:col-start-8")}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <div className="relative overflow-hidden">
          <motion.div style={reduced ? undefined : { y: imgY }}>
            <div className="duotone aspect-[3/4] w-full">
              <img
                src={founder.image.src}
                alt={founder.image.alt}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-8 left-4 font-serif text-[6rem] italic leading-none text-rust/25 md:text-[8rem]"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </motion.div>

      {/* Story */}
      <div className={cn("col-span-12 md:col-span-6", flip && "md:order-1 md:col-start-1")}>
        <p className="editorial-label mb-5 text-rust">
          {founder.role}
        </p>
        <h3 className="font-serif text-4xl leading-tight text-charcoal md:text-5xl">
          {founder.name}
        </h3>

        {/* Founder fields — render only when content exists */}
        {(founder.story || founder.vision || founder.contribution) && (
          <div className="mt-8 space-y-6">
            {founder.story && <FounderField label="The story" text={founder.story} delay={0.05} />}
            {founder.vision && <FounderField label="The vision" text={founder.vision} delay={0.15} />}
            {founder.contribution && (
              <FounderField label="The contribution" text={founder.contribution} delay={0.25} />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function FounderField({
  label,
  text,
  delay,
}: {
  label: string;
  text: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      className="border-t border-ink/10 pt-4"
    >
      <p className="editorial-label mb-2 text-[0.6rem] text-smoke/80">{label}</p>
      <p className="max-w-xl text-[0.92rem] leading-relaxed text-charcoal/85">{text}</p>
    </motion.div>
  );
}

/* Small helper so FounderChapter can use a ref without prop drilling */
import { useRef, type RefObject } from "react";
function useRef2(): RefObject<HTMLElement | null> {
  return useRef<HTMLElement | null>(null);
}
