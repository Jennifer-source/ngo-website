import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useFilmContent } from "@/hooks/use-site-content";
import { CHAPTER_COUNT } from "@/content/site";
import { EASE, FilmGrain, SectionHeader } from "./motion/Primitives";
import { cn } from "@/lib/utils";

/**
 * Chapter 03 — Our Journey Film.
 * Cinematic full-width section: the poster breathes with scroll; the play
 * control expands the stage into an immersive viewing mode.
 */
export default function JourneyFilm() {
  const film = useFilmContent();
  type FilmStage = "poster" | "playing" | "paused";
  const [stage, setStage] = useState<FilmStage>("poster");
  const ref = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /* Playback is user-initiated (a click) — never autoplay with sound.
     Stage flow: poster → playing ⇄ paused → poster (on end). */
  useEffect(() => {
    if (stage === "playing") {
      videoRef.current?.play().catch(() => {
        /* Browser refused; the centered control remains for the user. */
      });
    }
  }, [stage]);

  /** Centered cinematic control — the primary play/pause interaction. */
  const togglePlayback = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (stage === "poster") {
      setStage("playing");
      return;
    }
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => {});
    else v.pause();
  };
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
      className="relative overflow-hidden bg-ink py-28 text-ivory md:py-40"
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
          style={stage === "poster" ? { scale } : undefined}
          className="relative mt-16 overflow-hidden"
        >
          <div className="relative aspect-video w-full">
            {/* Poster / video */}
            {stage !== "poster" && hasVideo ? (
              <video
                ref={videoRef}
                src={film.videoUrl}
                poster={film.poster.src}
                playsInline
                preload="metadata"
                onPlay={() => setStage("playing")}
                onPause={() => setStage("paused")}
                onEnded={() => {
                  /* Ended: reset to the beginning so replay starts fresh. */
                  if (videoRef.current) videoRef.current.currentTime = 0;
                  setStage("poster");
                }}
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

            {/* Center play control — poster state */}
            {stage === "poster" && (
              <button
                type="button"
                onClick={() => setStage("playing")}
                data-cursor="PLAY"
                aria-label="Play the journey film"
                className="group absolute inset-0 z-10 flex flex-col items-center justify-center gap-6"
              >
                <motion.span
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="relative flex h-24 w-24 items-center justify-center rounded-full border border-mist/40 bg-ink/30 backdrop-blur-sm transition-colors duration-500 group-hover:border-sunlight"
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

            {/* Bottom-center mini control — during playback only. Playing:
                subtle pause bars; paused: play triangle, slightly more
                present; hover lifts visibility on both. */}
            {stage !== "poster" && hasVideo && (
              <motion.button
                type="button"
                onClick={togglePlayback}
                data-cursor={stage === "playing" ? "PAUSE" : "PLAY"}
                aria-label={stage === "playing" ? "Pause film" : "Play film"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "group absolute inset-x-0 bottom-8 z-20 mx-auto flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-sm transition-colors duration-500",
                  stage === "playing"
                    ? "border-mist/30 bg-ink/30 group-hover:border-mist/60 group-hover:bg-ink/50"
                    : "border-mist/50 bg-ink/45 group-hover:border-mist/75 group-hover:bg-ink/65",
                )}
              >
                {stage === "playing" ? (
                  <svg
                    width="12"
                    height="14"
                    viewBox="0 0 16 18"
                    aria-hidden
                    className="fill-mist transition-colors duration-500 group-hover:fill-ivory"
                  >
                    <rect x="2" y="1" width="4.5" height="16" rx="1" />
                    <rect x="9.5" y="1" width="4.5" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg
                    width="13"
                    height="14"
                    viewBox="0 0 18 20"
                    aria-hidden
                    className="ml-0.5 fill-mist transition-colors duration-500 group-hover:fill-ivory"
                  >
                    <path d="M0 0 L18 10 L0 20 Z" />
                  </svg>
                )}
              </motion.button>
            )}

            {/* No-video honest state */}
            {!hasVideo && stage !== "poster" && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-ink/80 p-8 text-center">
                <p className="editorial-label text-apricot">The film is being prepared</p>
                <p className="max-w-md text-sm leading-relaxed text-mist/80">
                  The documentary will be hosted here. The ministry's film URL is added
                  in one place — src/content/site.ts.
                </p>
                <button
                  type="button"
                  onClick={() => setStage("poster")}
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
