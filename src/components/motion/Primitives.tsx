import { useRef, useState, useEffect, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValue,
  useInView,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Shared motion values                                                */
/* ------------------------------------------------------------------ */

export const EASE = [0.22, 1, 0.36, 1] as const;

export function usePrefersReducedMotion(): boolean {
  const r = useReducedMotion();
  return !!r;
}

/* ------------------------------------------------------------------ */
/* ChapterIndex — chapter meta like "02 / 13"                          */
/* ------------------------------------------------------------------ */

export function ChapterIndex({
  index,
  total,
  className,
}: {
  index: number;
  total: number;
  className?: string;
}) {
  return (
    <span className={cn("editorial-label tabular-nums opacity-60", className)}>
      {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* SectionHeader — label + optional chapter meta                       */
/* ------------------------------------------------------------------ */

export function SectionHeader({
  label,
  chapter,
  total,
  className,
  light = false,
}: {
  label: string;
  chapter?: number;
  total?: number;
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span
        aria-hidden
        className={cn("h-px w-10 shrink-0", light ? "bg-apricot/70" : "bg-rust/50")}
      />
      <span
        className={cn(
          "editorial-label",
          light ? "text-apricot" : "text-rust",
        )}
      >
        {label}
      </span>
      {chapter !== undefined && total !== undefined && (
        <>
          <span
            aria-hidden
            className={cn("h-px w-10 shrink-0", light ? "bg-apricot/70" : "bg-rust/50")}
          />
          <ChapterIndex
            index={chapter}
            total={total}
            className={light ? "text-apricot/60" : undefined}
          />
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AnimatedText — word/line reveals with overflow masks                */
/* ------------------------------------------------------------------ */

type AnimatedTextProps = {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  /** "mask" slides lines up from behind an overflow-hidden mask */
  mode?: "mask" | "fade";
  children?: ReactNode;
};

export function AnimatedText({
  lines,
  as: Tag = "h2",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.14,
  once = true,
  mode = "mask",
}: AnimatedTextProps) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const inView = useInView(ref, { once, margin: "-12% 0px -12% 0px" });
  const reduced = usePrefersReducedMotion();

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="headline-crop block">
          <motion.span
            className={cn("block will-change-transform", lineClassName)}
            initial={reduced ? { opacity: 0 } : { y: "110%" }}
            animate={inView ? (reduced ? { opacity: 1 } : { y: "0%" }) : undefined}
            transition={{
              duration: reduced ? 0.2 : 1.1,
              ease: EASE,
              delay: delay + i * stagger,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* RevealImage — clip-path mask reveal + optional parallax + slow zoom */
/* ------------------------------------------------------------------ */

export function RevealImage({
  src,
  alt,
  className,
  imgClassName,
  aspect,
  parallax = 0,
  zoom = true,
  priority = false,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  aspect?: string;
  parallax?: number;
  zoom?: boolean;
  priority?: boolean;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${parallax * 100}%`, `${-parallax * 100}%`],
  );

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={aspect ? { aspectRatio: aspect } : undefined}
    >
      <motion.div
        className="absolute inset-0"
        style={parallax ? { y } : undefined}
      >
        <motion.div
          className="absolute inset-0"
          initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          animate={
            inView
              ? reduced
                ? { opacity: 1 }
                : { clipPath: "inset(0 0 0% 0)" }
              : undefined
          }
          transition={{ duration: 1.2, ease: EASE }}
        >
          <motion.img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={cn("h-full w-full object-cover", imgClassName)}
            initial={zoom && !reduced ? { scale: 1.14 } : undefined}
            animate={zoom && !reduced && inView ? { scale: 1 } : undefined}
            transition={{ duration: 1.6, ease: EASE }}
          />
        </motion.div>
      </motion.div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MagneticButton — the site's primary CTA voice                       */
/* ------------------------------------------------------------------ */

export function MagneticButton({
  href,
  onClick,
  children,
  variant = "solid",
  light = false,
  className,
  external = false,
  type = "button",
  disabled = false,
  ariaLabel,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost";
  light?: boolean;
  className?: string;
  external?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 16, mass: 0.4 });
  const y = useSpring(my, { stiffness: 180, damping: 16, mass: 0.4 });
  const reduced = usePrefersReducedMotion();

  const handleMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.18);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.28);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const base = cn(
    "group relative inline-flex items-center gap-3 px-7 py-4 editorial-label transition-colors duration-500",
    variant === "solid" &&
      (light
        ? "bg-sunlight text-ink hover:bg-mist"
        : "bg-rust text-ivory hover:bg-clay"),
    variant === "outline" &&
      (light
        ? "border border-apricot/50 text-mist hover:border-sunlight hover:text-sunlight"
        : "border border-ink/25 text-ink hover:border-rust hover:text-rust"),
    variant === "ghost" &&
      (light ? "text-mist hover:text-sunlight" : "text-ink hover:text-rust"),
    className,
  );

  const inner = (
    <>
      <span>{children}</span>
      <span
        aria-hidden
        className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5"
      >
        →
      </span>
    </>
  );

  if (href) {
    const isHash = href.startsWith("#");
    return (
      <motion.a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        aria-label={ariaLabel}
        className={base}
        style={reduced ? undefined : { x, y }}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        onClick={(e) => {
          // Optional extra behavior (e.g. pre-filling a form pathway) runs
          // before the hash scroll; the scroll itself is unchanged.
          onClick?.();
          if (isHash) {
            e.preventDefault();
            document
              .querySelector(href)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(base, disabled && "opacity-40 pointer-events-none")}
      style={reduced ? undefined : { x, y }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={onClick}
    >
      {inner}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* FilmGrain — subtle film-grain overlay (decorative)                  */
/* ------------------------------------------------------------------ */

export function FilmGrain({ opacity = 0.35 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="grain pointer-events-none absolute inset-0 z-[2]"
      style={{ opacity }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* ScrollProgress — thin thread of light at the top                    */
/* ------------------------------------------------------------------ */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-sun via-ember to-clay"
      style={{ scaleX }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* ChapterCursor — custom desktop cursor (VIEW / PLAY / OPEN / DRAG)   */
/* ------------------------------------------------------------------ */

type CursorLabel = "VIEW" | "PLAY" | "OPEN" | "DRAG" | null;

export function ChapterCursor() {
  const [label, setLabel] = useState<CursorLabel>(null);
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest?.("[data-cursor]");
      setLabel((t?.getAttribute("data-cursor") as CursorLabel) ?? null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="hog-cursor pointer-events-none fixed z-[70] flex items-center justify-center"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
    >
      <motion.div
        animate={{
          width: label ? 76 : 10,
          height: label ? 76 : 10,
          backgroundColor: label ? "rgba(191,54,12,0.92)" : "rgba(251,140,0,0.9)",
        }}
        transition={{ duration: 0.35, ease: EASE }}
        className="flex items-center justify-center rounded-full"
      >
        <AnimatePresence>
          {label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="editorial-label text-[0.6rem] text-ivory"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <span className="sr-only">Cursor</span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* FadeIn — generic soft entrance for blocks                           */
/* ------------------------------------------------------------------ */

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-10% 0px" }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export type { MotionValue };
