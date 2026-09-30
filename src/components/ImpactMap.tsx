import { motion } from "framer-motion";
import { useImpactContent } from "@/hooks/use-site-content";
import { CHAPTER_COUNT } from "@/content/site";
import { EASE, SectionHeader, AnimatedText, FadeIn } from "./motion/Primitives";
import { cn } from "@/lib/utils";

/**
 * Chapter 02 — Impact.
 * An editorial world map with India highlighted — where the journey began.
 * Figures render only when verified — missing values hold an em dash.
 */

/*
 * Editorial world map — equirectangular, hand-tuned silhouettes
 * (recognisable, intentionally simplified). India is its own path so it can
 * carry the terracotta fill. No external map service, no extra dependency.
 */

/** Land-mass silhouettes (warm neutral). India is rendered separately below. */
const COUNTRIES: { d: string }[] = [
  /* North America */
  { d: "M17 45 L25 32 L37 22 L57 15 L83 11 L105 12 L120 20 L129 26 L136 30 L147 30 L156 26 L165 22 L172 26 L169 34 L158 40 L147 45 L139 52 L131 60 L122 64 L116 72 L110 78 L104 86 L99 92 L94 88 L92 79 L87 72 L81 64 L74 58 L63 54 L52 51 L40 49 L29 47 Z" },
  /* Central America */
  { d: "M98 93 L104 87 L110 79 L117 73 L124 70 L131 71 L135 75 L130 79 L123 82 L116 86 L109 90 L104 95 Z" },
  /* South America */
  { d: "M104 95 L112 90 L121 88 L130 92 L137 99 L141 108 L143 118 L139 128 L134 139 L130 150 L126 161 L122 171 L118 178 L114 174 L112 163 L110 151 L107 139 L104 126 L101 113 L100 103 Z" },
  /* Greenland */
  { d: "M150 12 L162 8 L175 9 L184 14 L182 21 L173 26 L162 26 L154 20 Z" },
  /* Iceland */
  { d: "M181 33 L189 31 L193 35 L187 39 L181 38 Z" },
  /* Scandinavia */
  { d: "M240 16 L252 12 L264 14 L270 20 L262 26 L255 34 L249 42 L243 38 L243 28 Z" },
  /* British Isles */
  { d: "M222 38 L230 34 L235 40 L231 47 L224 48 Z" },
  /* Europe (mainland) */
  { d: "M236 44 L248 42 L258 44 L268 42 L278 44 L286 48 L293 54 L300 60 L296 66 L288 70 L280 74 L271 76 L263 74 L255 76 L247 74 L241 70 L237 62 L235 53 Z" },
  /* Iberia + Med coast merge into Europe shape above; Africa next */
  { d: "M221 52 L230 50 L237 53 L240 60 L238 68 L232 74 L226 72 L221 64 Z" },
  /* Africa */
  { d: "M240 82 L252 78 L264 76 L276 80 L286 84 L294 90 L300 98 L303 108 L298 118 L292 128 L286 140 L280 152 L274 164 L267 172 L259 174 L252 170 L248 160 L244 148 L240 136 L236 124 L232 112 L230 100 L233 90 Z" },
  /* Madagascar */
  { d: "M312 138 L318 132 L323 138 L321 148 L314 152 L310 146 Z" },
  /* Middle East + Central Asia */
  { d: "M300 60 L310 56 L320 52 L332 50 L344 48 L356 50 L366 54 L374 60 L380 68 L376 76 L368 82 L358 84 L348 80 L338 82 L330 86 L322 82 L314 76 L306 70 Z" },
  /* Russia / North Asia */
  { d: "M290 40 L310 34 L335 28 L360 24 L390 20 L420 18 L450 16 L480 14 L510 14 L540 16 L570 18 L600 22 L620 26 L632 32 L628 40 L616 46 L600 50 L582 52 L564 50 L546 52 L528 54 L510 52 L492 54 L474 56 L456 54 L440 56 L424 58 L410 56 L396 58 L382 56 L368 54 L356 50 L344 48 L332 50 L320 52 L308 54 L298 52 Z" },
  /* China / East Asia */
  { d: "M424 58 L442 56 L460 58 L478 60 L494 64 L506 70 L512 78 L506 86 L496 92 L486 98 L476 102 L466 100 L456 96 L446 98 L438 92 L432 84 L426 74 L422 66 Z" },
  /* Southeast Asia */
  { d: "M470 100 L478 96 L486 100 L490 108 L486 116 L478 120 L472 114 Z" },
  /* Indonesia / islands */
  { d: "M482 128 L494 124 L506 126 L516 130 L526 134 L518 138 L506 136 L494 136 L486 134 Z" },
  /* Japan */
  { d: "M540 62 L548 58 L554 64 L550 74 L542 80 L538 72 Z" },
  /* Australia */
  { d: "M530 168 L544 160 L560 158 L574 162 L584 170 L588 180 L582 190 L570 196 L556 198 L542 194 L532 186 L528 176 Z" },
  /* New Zealand */
  { d: "M604 196 L610 192 L614 198 L608 206 L602 202 Z" },
];

/** India — the highlighted country shape (terracotta accent). */
const INDIA_PATH =
  "M386 66 L396 60 L406 58 L414 62 L420 68 L418 76 L412 82 L406 90 L400 100 L394 110 L388 116 L382 112 L378 102 L376 90 L376 78 L380 70 Z";

export default function ImpactMap() {
  const impact = useImpactContent();

  return (
    <section
      id="impact"
      aria-label="Global impact"
      className="relative overflow-hidden bg-cream py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="grid grid-cols-12 gap-4 md:gap-10">
          <div className="col-span-12 lg:col-span-5">
            <SectionHeader label={impact.label} chapter={2} total={CHAPTER_COUNT} />
            <AnimatedText
              as="h2"
              lines={impact.statementLines}
              className="mt-10 font-serif text-[clamp(2.4rem,5.5vw,5rem)] leading-[1.04] text-charcoal"
            />
            <FadeIn delay={0.3}>
              <p className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-smoke">
                {impact.intro}
              </p>
            </FadeIn>

            {/* Verified metrics — numbers lead, labels follow. */}
            <div className="mt-14">
              <dl className="divide-y divide-ink/10 border-y border-ink/10">
                {impact.fields.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-8%" }}
                    transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
                    className="group flex items-baseline justify-between gap-6 py-4"
                  >
                    <dt className="editorial-label text-ink/70">{f.label}</dt>
                    <dd
                      className={cn(
                        "font-serif tabular-nums leading-none transition-colors duration-500",
                        f.value
                          ? "text-[clamp(2.2rem,4vw,3.2rem)] text-rust"
                          : "text-2xl text-rust/40 group-focus-within:text-rust group-hover:text-rust",
                      )}
                    >
                      {f.value ? f.value : "—"}
                    </dd>
                  </motion.div>
                ))}
              </dl>
            </div>
          </div>

          {/* World map — India highlighted */}
          <div className="col-span-12 lg:col-span-7">
            <FadeIn delay={0.2}>
              <div className="relative aspect-[2/1] w-full">
                <svg
                  viewBox="0 0 660 240"
                  role="img"
                  aria-label="World map highlighting India"
                  className="h-full w-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <title>World map — India highlighted</title>
                  {COUNTRIES.map((c) => (
                    <path key={c.d} d={c.d} className="fill-sand" />
                  ))}
                  {/* India — highlighted; subtle deepen on hover. */}
                  <path
                    d={INDIA_PATH}
                    className="peer/india fill-rust transition-colors duration-500 hover:fill-clay"
                  />
                  <text
                    x="446"
                    y="72"
                    className="editorial-label fill-clay opacity-0 transition-opacity duration-500 peer-hover/india:opacity-100"
                  >
                    INDIA
                  </text>
                </svg>

              </div>
              <div className="mt-2 border-l-2 border-sunlight bg-mist/60 p-6">
                <p className="editorial-label mb-2 text-rust">India</p>
                <p className="max-w-xl text-[0.9rem] leading-relaxed text-charcoal/85">
                  Where the journey began.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
