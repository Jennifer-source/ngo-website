import { useRef } from "react";
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
      {/* Hero photograph — supplied by the ministry (placeholder until then) */}
      <motion.div className="absolute inset-0" style={reduced ? undefined : { y: imgY, scale: imgScale }}>
        <div className="duotone absolute inset-0">
          <img
            src={HERO.image.src}
            alt={HERO.image.alt}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      </motion.div>

      {/* Cinematic darkening for legibility + a warm edge light */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-ink/50 via-ink/20 to-ink/80" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-ink/45 via-transparent to-transparent" />
      <FilmGrain opacity={0.3} />

      {/* Content */}
      <motion.div
        style={reduced ? undefined : { opacity: contentOpacity, y: contentY }}
        className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-6 pb-24 md:px-12 md:pb-28"
      >
        <div className="max-w-5xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.9, ease: EASE }}
            className="editorial-label mb-8 flex items-center gap-4 text-apricot"
          >
            <span aria-hidden className="h-px w-10 bg-apricot/70" />
            {HERO.kicker}
          </motion.p>

          <h1 className="font-serif text-[clamp(3rem,9.5vw,8.5rem)] leading-[0.98] text-ivory">
            {HERO.titleLines.map((line, i) => (
              <span key={i} className="headline-crop block">
                <motion.span
                  className="block"
                  initial={{ y: "112%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.3, ease: EASE, delay: 0.55 + i * 0.16 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.25 }}
            className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-mist/85"
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
