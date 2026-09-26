import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { CLIMAX, CHAPTER_COUNT } from "@/content/site";
import { EASE, FilmGrain, MagneticButton } from "./motion/Primitives";

/**
 * Chapter 11 — The story isn't over.
 * The emotional climax: near-black, slow reveals, an invitation rather
 * than a sales pitch.
 */
export default function StoryClimax() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /* A faint sunrise blooming behind the words */
  const glowOpacity = useTransform(scrollYProgress, [0.2, 0.6], [0, 0.5]);
  const glowScale = useTransform(scrollYProgress, [0.2, 0.8], [0.7, 1.15]);

  const words = CLIMAX.titleLines.join(" ").split(" ");

  return (
    <section
      ref={ref}
      id="climax"
      aria-label="The story isn't over"
      className="relative overflow-hidden bg-ink py-36 text-ivory md:py-52"
    >
      {/* The sunrise that the whole journey promised */}
      <motion.div
        aria-hidden
        style={reduced ? undefined : { opacity: glowOpacity, scale: glowScale }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-t from-clay via-ember/60 to-sunlight/30 blur-3xl"
      />
      <FilmGrain opacity={0.25} />

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 text-center md:px-12">
        <p className="editorial-label text-apricot/80">{CLIMAX.label}</p>

        <h2 className="mt-10 font-serif leading-[1.02]">
          <span className="sr-only">{CLIMAX.titleLines.join(" ")}</span>
          <span aria-hidden className="block text-[clamp(3rem,10vw,9rem)]">
            {words.map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 1.1, ease: EASE, delay: i * 0.12 }}
                className="mr-[0.28em] inline-block last:mr-0"
              >
                {w}
              </motion.span>
            ))}
          </span>
        </h2>

        <div className="mt-12">
          {CLIMAX.subLines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 1, ease: EASE, delay: 0.9 + i * 0.2 }}
              className="font-serif text-[clamp(1.5rem,3.2vw,2.6rem)] italic leading-snug text-mist/85"
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1, ease: EASE, delay: 1.5 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-4"
        >
          <MagneticButton href={CLIMAX.primaryCta.href} light>
            {CLIMAX.primaryCta.label}
          </MagneticButton>
          {CLIMAX.secondaryCtas.map((c) => (
            <MagneticButton key={c.label} href={c.href} variant="outline" light>
              {c.label}
            </MagneticButton>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
