import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/content/site";
import { EASE } from "./motion/Primitives";

const SECTIONS = [
  "journey",
  "impact",
  "serve",
  "founders",
  "fragments",
  "talk-to-us",
] as const;

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  /* Track which chapter is in view to light the active link + adapt theme */
  useEffect(() => {
    const darkSections = ["film", "climax", "footer"];
    const observer = new IntersectionObserver(
      (entries) => {
        let isDark = false;
        let current: string | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = e.target.id;
          if (darkSections.includes(id)) isDark = true;
          if ((SECTIONS as readonly string[]).includes(id)) current = id;
        }
        if (isDark !== dark) setDark(isDark);
        if (current) setActive(current);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    ["film", "climax", "footer"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [dark]);

  /* Lock body scroll while the mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    document
      .querySelector(href)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const light = dark && !open;

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 0.4 }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-700",
          scrolled && !open
            ? "backdrop-blur-xl bg-ivory/80 supports-[backdrop-filter]:bg-ivory/70"
            : "bg-transparent",
          light && scrolled && "bg-ink/70 supports-[backdrop-filter]:bg-ink/60",
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-12"
        >
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={cn(
              "editorial-label tracking-[0.34em] transition-colors duration-700",
              light ? "text-mist" : "text-ink",
            )}
          >
            Hands&nbsp;of&nbsp;Grace
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((l) => {
              const id = l.href.replace("#", "");
              const isActive = active === id;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault();
                      go(l.href);
                    }}
                    className={cn(
                      "group relative py-1 text-[0.72rem] font-medium uppercase tracking-[0.22em] transition-colors duration-500",
                      light
                        ? "text-mist/80 hover:text-sunlight"
                        : "text-ink/70 hover:text-rust",
                      isActive && (light ? "text-sunlight" : "text-rust"),
                    )}
                  >
                    {l.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100",
                        light ? "bg-sunlight" : "bg-rust",
                        isActive && "scale-x-100",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-4">
            <a
              href="#donate"
              onClick={(e) => {
                e.preventDefault();
                go("#donate");
              }}
              className={cn(
                "hidden border px-5 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.22em] transition-all duration-500 lg:inline-block",
                light
                  ? "border-sunlight/60 text-sunlight hover:bg-sunlight hover:text-ink"
                  : "border-rust/50 text-rust hover:bg-rust hover:text-ivory",
              )}
            >
              Donate
            </a>

            {/* Mobile toggle */}
            <button
              type="button"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
              className="relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
            >
              <motion.span
                animate={open ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className={cn(
                  "block h-px w-6",
                  open || light ? "bg-mist" : "bg-ink",
                )}
              />
              <motion.span
                animate={open ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className={cn(
                  "block h-px w-6",
                  open || light ? "bg-mist" : "bg-ink",
                )}
              />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu — a quiet, full-screen chapter list */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col bg-ink px-8 pb-10 pt-28"
          >
            <ul className="flex flex-1 flex-col justify-center gap-2">
              {NAV_LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.06 }}
                >
                  <a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault();
                      go(l.href);
                    }}
                    className="group flex items-baseline gap-4 py-2"
                  >
                    <span className="editorial-label text-[0.6rem] text-apricot/60">
                      {String(i + 2).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-4xl text-mist transition-colors group-hover:text-sunlight">
                      {l.label}
                    </span>
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.1 + NAV_LINKS.length * 0.06 }}
                className="mt-6"
              >
                <a
                  href="#donate"
                  onClick={(e) => {
                    e.preventDefault();
                    go("#donate");
                  }}
                  className="inline-block bg-sun px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-ink"
                >
                  Donate
                </a>
              </motion.li>
            </ul>
            <p className="editorial-label text-[0.6rem] text-mist/40">
              Hands of Grace International Ministries Trust
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
