import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { IMPACT, CHAPTER_COUNT } from "@/content/site";
import { EASE, SectionHeader, AnimatedText, FadeIn } from "./motion/Primitives";
import { cn } from "@/lib/utils";

/**
 * Chapter 03 — Impact.
 * A quiet cartographic system: illuminated regions pulse on a minimal
 * world map. No invented statistics — only editable, verified-to-come fields.
 */
export default function ImpactMap() {
  const reduced = useReducedMotion();
  const [activeRegion, setActiveRegion] = useState<string | null>("india");

  return (
    <section
      id="impact"
      aria-label="Global impact"
      className="relative overflow-hidden bg-cream py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-5">
            <SectionHeader label={IMPACT.label} chapter={3} total={CHAPTER_COUNT} />
            <AnimatedText
              as="h2"
              lines={IMPACT.statementLines}
              className="mt-10 font-serif text-[clamp(2.4rem,5.5vw,5rem)] leading-[1.04] text-charcoal"
            />
            <FadeIn delay={0.3}>
              <p className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-smoke">
                {IMPACT.intro}
              </p>
            </FadeIn>

            {/* Editable qualitative fields — verified values arrive later */}
            <div className="mt-14">
              <p className="editorial-label mb-5 text-smoke/80">
                The record — to be filled with verified figures
              </p>
              <dl className="divide-y divide-ink/10 border-y border-ink/10">
                {IMPACT.fields.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-8%" }}
                    transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
                    className="group flex items-baseline justify-between gap-6 py-4"
                  >
                    <dt className="editorial-label text-ink/70">{f.label}</dt>
                    <dd className="font-serif text-2xl tabular-nums text-rust/40 transition-colors duration-500 group-focus-within:text-rust group-hover:text-rust">
                      {f.value ? f.value : "—"}
                    </dd>
                  </motion.div>
                ))}
              </dl>
            </div>
          </div>

          {/* Map — dots positioned in percentage space over a minimal projection */}
          <div className="relative col-span-12 lg:col-span-7">
            <div className="relative aspect-[2/1] w-full">
              {/* Dot-grid map silhouette — computed once, positioned by the SVG viewport */}
              <WorldDots />

              {/* Region pulses */}
              {IMPACT.regions.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRegion((cur) => (cur === r.id ? null : r.id))}
                  aria-pressed={activeRegion === r.id}
                  aria-label={`${r.name} — show detail`}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 focus-visible:outline-offset-4"
                  style={{ left: `${r.x}%`, top: `${r.y}%` }}
                >
                  <span className="relative flex items-center justify-center">
                    {!reduced && (
                      <span
                        className="animate-pulse-ring absolute h-4 w-4 rounded-full bg-sun/50"
                        style={{ animationDelay: `${i * 0.9}s` }}
                      />
                    )}
                    <span
                      className={cn(
                        "relative h-2.5 w-2.5 rounded-full transition-all duration-500",
                        activeRegion === r.id ? "scale-150 bg-clay" : "bg-sun group-hover:bg-ember",
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "editorial-label absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap transition-colors duration-500",
                      activeRegion === r.id ? "text-clay" : "text-ink/50 group-hover:text-rust",
                    )}
                  >
                    {r.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Region detail */}
            <AnimatePresence mode="wait">
              {activeRegion && (
                <motion.div
                  key={activeRegion}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="mt-2 border-l-2 border-sunlight bg-mist/60 p-6"
                >
                  <p className="editorial-label mb-2 text-rust">
                    {IMPACT.regions.find((r) => r.id === activeRegion)?.name}
                  </p>
                  <p className="max-w-xl text-[0.9rem] leading-relaxed text-charcoal/85">
                    {IMPACT.regions.find((r) => r.id === activeRegion)?.detail}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorldDots() {
  const dots = useMemo(() => {
    const out: { x: number; y: number }[] = [];
    for (let r = 0; r < 60; r++) {
      for (let c = 0; c < 120; c++) {
        const x = c * 1.66 + 0.8;
        const y = r * 1.66 + 0.8;
        if (dotInLand(x, y)) out.push({ x, y });
      }
    }
    return out;
  }, []);
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 100"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={0.42} fill="#221c16" opacity={0.13} />
      ))}
    </svg>
  );
}

/* Very rough equirectangular land test for the dot silhouette. */
function dotInLand(x: number, y: number): boolean {
  /* Lat band: y 0 (north) to 100 (south) */
  const lat = 90 - y; /* 90 to -10 */
  const lon = x - 100; /* -100 to 100 */

  if (lat > 78) return false;

  /* North America */
  if (lon > -168 && lon < -55 && lat > 15) {
    if (lon > -100 && lat < 25 && lon < -85) return false;
    if (lon > -120 && lat > 55 && lat < 60 && lon < -100) return true;
    return !(lon > -80 && lon < -64 && lat > 46 && lat < 50.5); /* rough */
  }
  /* Greenland-ish */
  if (lon > -60 && lon < -20 && lat > 60) return true;
  /* South America */
  if (lon > -82 && lon < -34 && lat < 14) {
    return !(lon < -75 && lat < -45);
  }
  /* Europe */
  if (lon > -12 && lon < 45 && lat > 35) {
    return !(lon > 15 && lon < 30 && lat > 62);
  }
  /* Africa */
  if (lon > -18 && lon < 52 && lat < 38) {
    return !(lat < -30 && lon > 30);
  }
  /* Asia */
  if (lon >= 45 && lon < 145 && lat > -12) {
    return !(lat > 0 && lat < 8 && lon > 96); /* simplify */
  }
  /* Indonesia / Oceania */
  if (lon > 95 && lat < -8 && lon < 155) return true;
  if (lon > 112 && lat < -10 && lat > -42) return true;
  if (lon > 166 && lat < -34 && lat > -48) return true;
  if (lon > 174 && lat > -50 && lat < -32) return true;

  return false;
}
