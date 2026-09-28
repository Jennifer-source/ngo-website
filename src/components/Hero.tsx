import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useHeroContent } from "@/hooks/use-site-content";
import { EASE, FilmGrain } from "./motion/Primitives";

export default function Hero() {
  const hero = useHeroContent();
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const [artworkReady, setArtworkReady] = useState(true);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  /* The image slowly scales and sinks as you leave — a quiet exit */
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.55], ["0%", "-30%"]);

  return (
    <section
      ref={ref}
      id="top"
      aria-label="Hands of Grace — where faith becomes action"
      className="relative h-[100svh] overflow-hidden bg-ink"
    >
      {/* Ministry hero artwork — used exactly as provided (no duotone, no darkening).
          object-position keeps the artwork's own headline (left side) in frame on
          narrow screens where 16:9 must crop. */}
      <motion.div className="absolute inset-0" style={reduced ? undefined : { y: imgY, scale: imgScale }}>
        {artworkReady ? (
          <img
            src={hero.image.src}
            alt={hero.image.alt}
            fetchPriority="high"
            decoding="async"
            onError={() => setArtworkReady(false)}
            className="h-full w-full object-cover object-[32%_center]"
          />
        ) : (
          /* Neutral dark stage while the artwork file is not yet present —
             deliberately NOT a stand-in for the artwork. The section's own
             ink background shows; no substitute visual is rendered. */
          <div className="h-full w-full bg-ink" />
        )}
      </motion.div>

      {/* Film grain only — no color-altering overlays on the supplied artwork */}
      <FilmGrain opacity={0.12} />

      {/* Mobile-only readability scrim — anchors the art-directed mobile text.
          Desktop keeps the artwork exactly as supplied (no overlay). */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-[1] h-1/2 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent lg:hidden"
      />

      {/* Content */}
      <motion.div
        style={reduced ? undefined : { opacity: contentOpacity, y: contentY }}
        className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-6 pb-24 md:px-12 md:pb-28"
      >
        <div className="max-w-5xl">
          {/* Site headline hidden per direction — the artwork carries its own.
              Kept for screen readers and document outline. */}
          <h1 className="sr-only">{hero.titleLines.join(" ")}</h1>

          {/* Mobile art direction — the 16:9 artwork's baked-in headline cannot
              survive a tall phone crop, so narrow screens get real, animated
              HTML text over a scrim. Hidden at lg+ so desktop is untouched.
              aria-hidden: the sr-only h1 already carries the words. */}
          <motion.p
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.9, ease: EASE }}
            className="editorial-label flex items-center gap-3 text-apricot lg:hidden"
          >
            <span aria-hidden className="h-px w-8 bg-apricot/70" />
            {hero.kicker}
          </motion.p>
          <motion.div
            aria-hidden
            className="mt-4 lg:hidden"
            initial={reduced ? { opacity: 0 } : undefined}
            animate={reduced ? { opacity: 1 } : undefined}
          >
            {hero.titleLines.map((line, i) => (
              <span key={i} className="headline-crop block">
                <motion.span
                  className="block font-serif text-[clamp(2.6rem,11vw,3.75rem)] leading-[1.02] text-ivory will-change-transform"
                  initial={reduced ? { opacity: 0 } : { y: "112%" }}
                  animate={reduced ? { opacity: 1 } : { y: "0%" }}
                  transition={
                    reduced
                      ? { duration: 0.2 }
                      : { duration: 1.1, ease: EASE, delay: 0.55 + i * 0.16 }
                  }
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.div>
          <motion.p
            aria-hidden
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.25 }}
            className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-mist/85 lg:hidden"
          >
            {hero.subline}
          </motion.p>
          <motion.div
            aria-hidden
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.45 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:hidden"
          >
            <a
              href={hero.primaryCta.href}
              className="editorial-label inline-flex items-center justify-center border border-sunlight/60 bg-ink/30 px-6 py-4 text-ivory backdrop-blur-sm transition-colors duration-500 hover:bg-sunlight/15"
            >
              {hero.primaryCta.label} →
            </a>
            <a
              href={hero.secondaryCta.href}
              className="editorial-label link-reveal inline-flex items-center justify-center py-4 text-mist/85 transition-colors duration-500 hover:text-sunlight"
            >
              {hero.secondaryCta.label}
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.9, ease: EASE }}
            className="editorial-label sr-only flex items-center gap-4 text-apricot"
          >
            <span aria-hidden className="h-px w-10 bg-apricot/70" />
            {hero.kicker}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.25 }}
            className="sr-only mt-8 max-w-md text-[0.95rem] leading-relaxed text-mist/85"
          >
            {hero.subline}
          </motion.p>

          <div className="sr-only flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a href={hero.primaryCta.href}>{hero.primaryCta.label}</a>
            <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
