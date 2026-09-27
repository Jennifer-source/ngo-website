import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useServeContent } from "@/hooks/use-site-content";
import { CHAPTER_COUNT } from "@/content/site";
import { EASE, SectionHeader, AnimatedText, FadeIn, MagneticButton } from "./motion/Primitives";
import { cn } from "@/lib/utils";

/**
 * Chapter 06 — Serve.
 * A spatial composition: pathways orbit a shared stage on desktop and
 * reflow to a touch-friendly grid on mobile. Selecting a pathway
 * transforms the stage.
 */
export default function Serve() {
  const { pathways, label, statementLines } = useServeContent();
  const reduced = useReducedMotion();
  const [activeId, setActiveId] = useState<string>("volunteer");
  const active = pathways.find((p) => p.id === activeId) ?? pathways[0];

  /** Same-tick handoff so the Talk to us form opens with this pathway pre-selected. */
  const announcePathway = () => {
    if (!active) return;
    window.dispatchEvent(
      new CustomEvent("hog:talk-pathway", { detail: { pathway: active.id } }),
    );
  };

  return (
    <section
      id="serve"
      aria-label="Serve — pathways to make a difference"
      className="relative overflow-hidden bg-ivory py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-4">
            <SectionHeader label={label} chapter={6} total={CHAPTER_COUNT} />
            <AnimatedText
              as="h2"
              lines={statementLines}
              className="mt-10 font-serif text-[clamp(2.2rem,4.6vw,4.2rem)] leading-[1.06] text-charcoal"
            />
            <FadeIn delay={0.25}>
              <p className="max-w-sm text-[0.95rem] leading-relaxed text-smoke">
                Choose a pathway — the circle responds. Every way of serving is
                honored here.
              </p>
            </FadeIn>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <ServeOrbit
              activeId={activeId}
              onSelect={setActiveId}
              reduced={!!reduced}
              active={active}
              pathways={pathways}
              onPathwayClick={announcePathway}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ServeOrbit({
  activeId,
  onSelect,
  reduced,
  active,
  pathways,
  onPathwayClick,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  reduced: boolean;
  active: ReturnType<typeof useServeContent>["pathways"][number];
  pathways: ReturnType<typeof useServeContent>["pathways"];
  onPathwayClick: () => void;
}) {
  return (
    <div className="lg:flex lg:items-center lg:gap-10">
      {/* Radial stage — desktop only */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[620px] lg:block">
        <div aria-hidden className="absolute inset-0 rounded-full border border-ink/10" />
        <div aria-hidden className="absolute inset-[14%] rounded-full border border-ink/[0.07]" />

        {/* Selected pathway — center */}
        <div className="absolute inset-[21%] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="flex h-full w-full flex-col items-center justify-center px-4 text-center"
            >
              <p className="editorial-label mb-3 text-rust">
                Pathway{" "}
                {String(pathways.findIndex((p) => p.id === active.id) + 1).padStart(2, "0")}
              </p>
              <h3 className="font-serif text-3xl text-charcoal md:text-4xl">{active.title}</h3>
              <div className="mt-4 space-y-1">
                {active.lines.map((l, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.12 + i * 0.08 }}
                    className="text-[0.9rem] text-smoke"
                  >
                    {l}
                  </motion.p>
                ))}
              </div>
              <div className="mt-6">
                <MagneticButton
                  href={active.href}
                  onClick={onPathwayClick}
                  variant="ghost"
                  className="px-0 py-0"
                >
                  {active.cta}
                </MagneticButton>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pathway nodes on the orbit. The list overlays the whole orbit
            stage, so it must be click-transparent — otherwise it swallows
            clicks meant for the center-stage CTA. Node buttons opt back in. */}
        <ul aria-label="Serve pathways" className="pointer-events-none absolute inset-0">
          {pathways.map((p, i) => {
            const angle = (i / pathways.length) * 2 * Math.PI - Math.PI / 2;
            const px = 50 + Math.cos(angle) * 50;
            const py = 50 + Math.sin(angle) * 50;
            const isActive = p.id === activeId;
            return (
              <li
                key={p.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${px}%`, top: `${py}%` }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "group pointer-events-auto flex flex-col items-center gap-1.5 whitespace-nowrap px-1 transition-colors duration-500",
                    isActive ? "text-clay" : "text-ink/55 hover:text-rust",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "inline-block h-1.5 w-1.5 rounded-full transition-all duration-500",
                      isActive ? "scale-150 bg-clay" : "bg-sun/70 group-hover:bg-ember",
                    )}
                  />
                  <span className="editorial-label">{p.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Touch-friendly composition — mobile / tablet */}
      <div className="lg:hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream/70">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -40 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="flex h-full flex-col justify-end p-7"
            >
              <p className="editorial-label mb-2 text-rust">
                Pathway{" "}
                {String(pathways.findIndex((p) => p.id === active.id) + 1).padStart(2, "0")}
              </p>
              <h3 className="font-serif text-3xl text-charcoal">{active.title}</h3>
              <div className="mt-3 space-y-1">
                {active.lines.map((l, i) => (
                  <p key={i} className="text-[0.9rem] text-smoke">
                    {l}
                  </p>
                ))}
              </div>
              <div className="mt-5">
                <MagneticButton
                  href={active.href}
                  onClick={onPathwayClick}
                  variant="ghost"
                  className="px-0 py-0"
                >
                  {active.cta}
                </MagneticButton>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <ul
          aria-label="Serve pathways"
          className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden"
        >
          {pathways.map((p) => {
            const isActive = p.id === activeId;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "w-full border px-4 py-3.5 text-left transition-colors duration-500",
                    isActive
                      ? "border-clay/60 bg-mist text-clay"
                      : "border-ink/10 bg-ivory text-ink/60 hover:border-rust/40 hover:text-rust",
                  )}
                >
                  <span className="editorial-label">{p.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
