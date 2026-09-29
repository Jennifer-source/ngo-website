import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useHeroContent } from "@/hooks/use-site-content";
import {
  AnimatedText,
  EASE,
  FilmGrain,
  MagneticButton,
} from "./motion/Primitives";

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
          object-position is per-breakpoint, measured from the artwork itself:
          its baked-in typography occupies the left 8–47% column, the imagery
          band the right 58–82%. Phones/tablets crop to the imagery side so the
          baked words stay outside the frame and the site's own HTML headline
          is the only readable headline; desktop (lg+) keeps 32% unchanged. */}
      <motion.div className="absolute inset-0" style={reduced ? undefined : { y: imgY, scale: imgScale }}>
        {artworkReady ? (
          <img
            src={hero.image.src}
            alt={hero.image.alt}
            fetchPriority="high"
            decoding="async"
            onError={() => setArtworkReady(false)}
            className="h-full w-full object-cover object-[90%_center] md:object-[96%_center] lg:object-[32%_center]"
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

      {/* Mobile/tablet legibility scrim — the hero's own ink-gradient family,
          needed below lg where the crop shifts to the imagery side. Desktop
          (lg+) is untouched. */}
      <div
        aria-hidden
        className="absolute inset-0 z-[3] bg-gradient-to-b from-ink/60 via-ink/15 to-ink/85 lg:hidden"
      />

      {/* Content */}
      <motion.div
        style={reduced ? undefined : { opacity: contentOpacity, y: contentY }}
        className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-6 pb-24 md:px-12 md:pb-28"
      >
        <div className="max-w-5xl">
          {/* Site headline: on desktop the artwork carries its own words, so
              this stays sr-only there. Below lg the same content stack renders
              visually — kicker, masked-line serif headline, subline — and the
              CTAs appear beneath. One element stack, no duplicate layer. */}
          <h1 className="sr-only">{hero.titleLines.join(" ")}</h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.9, ease: EASE }}
            className="editorial-label flex items-center gap-4 text-apricot lg:sr-only"
          >
            <span aria-hidden className="h-px w-10 bg-apricot/70" />
            {hero.kicker}
          </motion.p>

          <AnimatedText
            lines={hero.titleLines}
            as="p"
            delay={0.55}
            className="mt-6 font-serif text-[clamp(2.4rem,11.5vw,4.25rem)] leading-[0.98] text-ivory lg:hidden"
          />

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.25 }}
            className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-mist/85 lg:sr-only"
          >
            {hero.subline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.45 }}
            className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:hidden"
          >
            <MagneticButton href={hero.primaryCta.href} light>
              {hero.primaryCta.label}
            </MagneticButton>
            <MagneticButton href={hero.secondaryCta.href} variant="outline" light>
              {hero.secondaryCta.label}
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
