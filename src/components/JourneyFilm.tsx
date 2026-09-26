import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useFilmContent } from "@/hooks/use-site-content";
import { CHAPTER_COUNT } from "@/content/site";
import { EASE, FilmGrain, SectionHeader } from "./motion/Primitives";

/**
 * Chapter 03 — Our Journey Film.
 * Cinematic full-width section: the poster breathes with scroll; the play
 * control expands the stage into an immersive viewing mode.
 */
export default function JourneyFilm() {
  const film = useFilmContent();
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.96]);

  const hasVideo = !!film.videoUrl;

  return (
    <section
      ref={ref}
      id="film"
      aria-label="Our journey film"
      className="relative bg-ink py-28 text-ivory md:py-40"
    >
      <FilmGrain opacity={0.22} />

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-12">
        <SectionHeader label={film.label} chapter={3} total={CHAPTER_COUNT} light />

        <h2 className="mt-12 font-serif leading-[0.98]">
          <span className="block text-[clamp(2.6rem,7vw,6.5rem)] text-ivory">
            {film.label}
          </span>
          <span className="block text-[clamp(2.6rem,7vw,6.5rem)] italic text-sunlight">
            {film.title}
          </span>
        </h2>

        {/* Stage */}
        <motion.div
          style={playing ? undefined : { scale }}
          className="relative mt-16 overflow-hidden"
        >
          <div className="relative aspect-video w-full">
            {/* Poster / video */}
            {playing && hasVideo ? (
              <video
                src={film.videoUrl}
                poster={film.poster.src}
                controls
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="duotone absolute inset-0">
                <img
                  src={film.poster.src}
                  alt={film.poster.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="absolute inset-0 z-[1] bg-ink/35" />

            {/* Center play control */}
            {!playing && (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                data-cursor="PLAY"
                aria-label="Play the journey film"
                className="group absolute inset-0 z-10 flex flex-col items-center justify-center gap-6"
              >
                <motion.span
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="relative flex h-24 w-24 items-center justify-center rounded-full border border-mist/40 backdrop-blur-sm transition-colors duration-500 group-hover:border-sunlight"
                >
                  <span className="absolute inset-0 rounded-full bg-sunlight/0 transition-colors duration-500 group-hover:bg-sunlight/10" />
                  <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden className="ml-1 fill-mist transition-colors duration-500 group-hover:fill-sunlight">
                    <path d="M0 0 L18 10 L0 20 Z" />
                  </svg>
                </motion.span>
                <span className="editorial-label text-mist transition-colors duration-500 group-hover:text-sunlight">
                  Play film →
                </span>
              </button>
            )}

            {/* No-video honest state */}
            {!hasVideo && playing && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-ink/80 p-8 text-center">
                <p className="editorial-label text-apricot">The film is being prepared</p>
                <p className="max-w-md text-sm leading-relaxed text-mist/80">
                  The documentary will be hosted here. The ministry's film URL is added
                  in one place — src/content/site.ts.
                </p>
                <button
                  type="button"
                  onClick={() => setPlaying(false)}
                  className="editorial-label mt-2 text-sunlight underline-offset-4 hover:underline"
                >
                  ← Back
                </button>
                <span className="sr-only">Video coming soon</span>
              </div>
            )}
          </div>

          {/* Frame metadata */}
          <div className="mt-5 flex items-center justify-between">
            <p className="editorial-label text-mist/50">{film.label} / {film.title}</p>
            <p className="editorial-label text-mist/50">Documentary · Placeholder poster</p>
          </div>
        </motion.div>

        {/* Closing statement */}
        <blockquote className="mx-auto mt-20 max-w-3xl text-center">
          <p className="font-serif text-[clamp(1.6rem,3.4vw,2.6rem)] leading-snug text-mist/90">
            “{film.closingQuote}”
          </p>
        </blockquote>
      </div>
    </section>
  );
}
