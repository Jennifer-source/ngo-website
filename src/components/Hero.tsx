import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { HERO, CHAPTER_COUNT } from "@/content/site";
import { EASE, FilmGrain } from "./motion/Primitives";

export default function Hero() {
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
            src={HERO.image.src}
            alt={HERO.image.alt}
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

      {/* Content */}
      <motion.div
        style={reduced ? undefined : { opacity: contentOpacity, y: contentY }}
        className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-6 pb-24 md:px-12 md:pb-28"
      >
        <div className="max-w-5xl">
          {/* Site headline hidden per direction — the artwork carries its own.
              Kept for screen readers and document outline. */}
          <h1 className="sr-only">{HERO.titleLines.join(" ")}</h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.9, ease: EASE }}
            className="editorial-label sr-only flex items-center gap-4 text-apricot"
          >
            <span aria-hidden className="h-px w-10 bg-apricot/70" />
            {HERO.kicker}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.25 }}
            className="sr-only mt-8 max-w-md text-[0.95rem] leading-relaxed text-mist/85"
          >
            {HERO.subline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.45 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#journey"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#journey")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group inline-flex items-center gap-3 bg-sun px-7 py-4 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-ink transition-colors duration-500 hover:bg-sunlight"
            >
              Explore our journey
              <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
            </a>
            <a
              href="#talk-to-us"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#talk-to-us")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group inline-flex items-center gap-3 border border-mist/35 px-7 py-4 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-mist transition-all duration-500 hover:border-sunlight hover:text-sunlight"
            >
              Be part of the journey
              <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
            </a>
          </motion.div>
        </div>

        {/* Scroll cue + chapter index */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 2 }}
          className="absolute inset-x-6 bottom-6 flex items-center justify-between md:inset-x-12"
        >
          <p className="editorial-label flex items-center gap-3 text-mist/60">
            <motion.span
              aria-hidden
              animate={reduced ? undefined : { scaleY: [1, 0.4, 1], opacity: [0.9, 0.3, 0.9] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="block h-8 w-px origin-top bg-apricot/80"
            />
            {HERO.scrollLabel}
          </p>
          <p className="editorial-label tabular-nums text-mist/60">01 / {String(CHAPTER_COUNT).padStart(2, "0")}</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
