import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "./motion/Primitives";
import { cn } from "@/lib/utils";
import type { Fragment } from "@/content/site";

/**
 * Fragments gallery — a fullscreen, landscape-oriented photo journey.
 * One continuous horizontal track (scroll, drag, wheel, arrow keys),
 * snap-to-photo momentum, understated editorial controls and a closing
 * "Just a glimpse." panel after the final photograph. Images render with
 * object-contain inside a fixed stage so no documentary detail is cropped.
 */

type Props = {
  items: Fragment[];
  startIndex: number;
  onClose: () => void;
  onExplore: () => void;
};

export default function FragmentGallery({ items, startIndex, onClose, onExplore }: Props) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const suppressClick = useRef(false);
  /** Children: one per photograph, plus the closing editorial panel. */
  const total = items.length;
  const [index, setIndex] = useState(startIndex);

  /* Lock page scroll; restoring on unmount returns the visitor to the
     exact Fragments position — never the top of the page. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const centerFor = useCallback((i: number) => {
    const el = trackRef.current;
    const child = el?.children[i] as HTMLElement | undefined;
    if (!el || !child) return null;
    return child.offsetLeft - (el.clientWidth - child.clientWidth) / 2;
  }, []);

  const go = useCallback(
    (i: number) => {
      const left = centerFor(i);
      if (left === null) return;
      trackRef.current?.scrollTo({
        left,
        behavior: reduced ? "auto" : "smooth",
      });
    },
    [centerFor, reduced],
  );

  /* Open on the selected fragment, and take focus for keyboard use. */
  useEffect(() => {
    const el = trackRef.current;
    if (el) {
      const left = centerFor(startIndex);
      if (left !== null) el.scrollLeft = left;
    }
    rootRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Keyboard: arrows travel the journey, ESC closes. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(index + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go, onClose]);

  const nearestIndex = useCallback(() => {
    const el = trackRef.current;
    if (!el) return index;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = index;
    let bestD = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const h = c as HTMLElement;
      const d = Math.abs(h.offsetLeft + h.clientWidth / 2 - center);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  }, [index]);

  const onScroll = () => setIndex(nearestIndex());

  /* Vertical wheel drives the horizontal journey (trackpads pass through natively). */
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      trackRef.current?.scrollBy({ left: e.deltaY });
    }
  };

  /* Pointer drag (mouse only — touch uses native momentum scrolling for
     a genuinely native swipe feel) with a settle-to-nearest release. */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startLeft: trackRef.current?.scrollLeft ?? 0,
      moved: false,
    };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = trackRef.current;
    const d = drag.current;
    if (!el || !d.active) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      el.style.scrollSnapType = "none";
    }
    if (d.moved) el.scrollLeft = d.startLeft - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (!d.moved) return;
    const el = trackRef.current;
    if (el) el.style.scrollSnapType = "";
    const best = nearestIndex();
    setIndex(best);
    go(best);
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  /* Click on dead space (not a slide, not a control) closes. */
  const onBackdropClick = (e: React.MouseEvent) => {
    if (suppressClick.current) return;
    const t = e.target as HTMLElement;
    if (t.closest("[data-slide],[data-control]")) return;
    onClose();
  };

  const shown = Math.min(index, total - 1);

  return (
    <motion.div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Fragments — documentary photo gallery"
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.15 : 0.45, ease: EASE }}
      onClick={onBackdropClick}
      className="fixed inset-0 z-[80] cursor-auto bg-ink outline-none"
    >
      {/* Top bar — close / collection label / counter */}
      <header
        data-control
        className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 md:px-12"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="group flex items-center gap-3 text-mist/70 transition-colors duration-500 hover:text-sunlight"
        >
          <span aria-hidden className="relative block h-3 w-3">
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rotate-45 bg-current transition-transform duration-500 group-hover:rotate-[135deg]" />
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 -rotate-45 bg-current transition-transform duration-500 group-hover:rotate-[45deg]" />
          </span>
          <span className="editorial-label">Close</span>
        </button>
        <span className="editorial-label hidden text-apricot/80 sm:block">
          Fragments / Archive
        </span>
        <span className="editorial-label tabular-nums text-mist/60">
          {String(shown + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </header>

      {/* Horizontal journey */}
      <motion.div
        ref={trackRef}
        data-control
        tabIndex={0}
        aria-label="Photographs — scroll, drag or use arrow keys"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduced ? 0.2 : 0.7, ease: EASE, delay: reduced ? 0 : 0.08 }}
        onScroll={onScroll}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className="flex h-full w-full snap-x snap-mandatory items-center gap-6 overflow-x-auto overflow-y-hidden overscroll-contain px-[7vw] md:gap-10 md:px-[12vw]"
      >
        {items.map((f, i) => (
          <figure
            key={f.id}
            data-slide
            className={cn(
              "relative flex h-full w-[88vw] max-w-[1200px] shrink-0 snap-center flex-col justify-center gap-5 pb-20 pt-20 transition-opacity duration-700 md:w-[68vw]",
              i === index ? "opacity-100" : "opacity-35",
            )}
          >
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <img
                src={f.image.src}
                alt={f.image.alt}
                loading="eager"
                decoding="async"
                draggable={false}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <figcaption className="flex items-baseline justify-between gap-4">
              <span className="editorial-label text-[0.58rem] text-mist/90">
                {f.caption}
              </span>
              <span className="editorial-label text-right text-[0.58rem] text-apricot/80">
                {f.detail}
              </span>
            </figcaption>
          </figure>
        ))}

        {/* Closing editorial panel — the end of the short film */}
        <div
          data-slide
          className="flex h-full w-[88vw] max-w-[1200px] shrink-0 snap-center items-center justify-center md:w-[68vw]"
        >
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: reduced ? 0.2 : 1, ease: EASE }}
            className="max-w-xl px-2 text-center"
          >
            <p className="editorial-label text-apricot">Fragments / Archive</p>
            <h2 className="mt-7 font-serif text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.05] text-ivory">
              Just a glimpse.
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[0.95rem] leading-relaxed text-mist/70">
              These are only fragments of a much larger story — of people,
              places, prayers, and moments shaped by the work of Hands of
              Grace.
            </p>
            <p className="editorial-label mt-6 text-[0.6rem] text-mist/50">
              People. Places. Stories.
            </p>
            <button
              type="button"
              onClick={onExplore}
              className="group mt-10 inline-flex items-center gap-3 text-mist transition-colors duration-500 hover:text-sunlight"
              aria-label="Continue to the Impact section"
            >
              <span className="editorial-label">The story continues</span>
              <span
                aria-hidden
                className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5"
              >
                →
              </span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Prev / next — understated, keyboard mirrored */}
      <button
        type="button"
        data-control
        aria-label="Previous photograph"
        disabled={index === 0}
        onClick={() => go(index - 1)}
        className={cn(
          "absolute left-4 top-1/2 z-10 -translate-y-1/2 px-3 py-4 text-mist/60 transition-colors duration-500 hover:text-sunlight md:left-8",
          index === 0 && "pointer-events-none opacity-25",
        )}
      >
        <span aria-hidden className="editorial-label">
          ←
        </span>
      </button>
      <button
        type="button"
        data-control
        aria-label="Next photograph"
        disabled={index >= total}
        onClick={() => go(index + 1)}
        className={cn(
          "absolute right-4 top-1/2 z-10 -translate-y-1/2 px-3 py-4 text-mist/60 transition-colors duration-500 hover:text-sunlight md:right-8",
          index >= total && "pointer-events-none opacity-25",
        )}
      >
        <span aria-hidden className="editorial-label">
          →
        </span>
      </button>

      {/* Thin progress thread */}
      <footer data-control aria-hidden className="absolute inset-x-0 bottom-0 z-10 px-6 pb-6 md:px-12">
        <div className="h-px w-full bg-ivory/10">
          <div
            className="h-px origin-left bg-gradient-to-r from-sun via-ember to-clay transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `scaleX(${(shown + 1) / total})` }}
          />
        </div>
      </footer>
    </motion.div>
  );
}
