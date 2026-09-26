import { motion } from "framer-motion";
import { useRef } from "react";
import { useScroll, useTransform, useReducedMotion } from "framer-motion";
import { IMPACT_STORIES, IMPACT_STORIES_INTRO, CHAPTER_COUNT } from "@/content/site";
import { EASE, SectionHeader, AnimatedText, FadeIn } from "./motion/Primitives";
import { cn } from "@/lib/utils";

/**
 * Chapter 07 — Impact in action.
 * Individual human stories told with dignity: a person, a moment, a need,
 * a response, a change. No suffering as spectacle — only humanity.
 */
export default function ImpactStories() {
  return (
    <section
      id="impact-stories"
      aria-label="Impact in action — human stories"
      className="relative bg-ivory py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7">
            <SectionHeader label={IMPACT_STORIES_INTRO.label} chapter={7} total={CHAPTER_COUNT} />
            <AnimatedText
              as="h2"
              lines={IMPACT_STORIES_INTRO.statementLines}
              className="mt-10 font-serif text-[clamp(2.4rem,5.5vw,5rem)] leading-[1.04] text-charcoal"
            />
          </div>
          <div className="col-span-12 flex items-end lg:col-span-4 lg:col-start-9">
            <FadeIn delay={0.2}>
              <p className="max-w-sm text-[0.95rem] leading-relaxed text-smoke">
                {IMPACT_STORIES_INTRO.intro}
              </p>
            </FadeIn>
          </div>
        </div>

        <div className="mt-24 space-y-32 md:space-y-44">
          {IMPACT_STORIES.map((s, i) => (
            <StoryChapter key={i} story={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

const STORY_BEATS = [
  { key: "person", label: "A person" },
  { key: "moment", label: "A moment" },
  { key: "need", label: "A need" },
  { key: "response", label: "A response" },
  { key: "change", label: "A change" },
] as const;

function StoryChapter({
  story,
  index,
}: {
  story: (typeof IMPACT_STORIES)[number];
  index: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const flip = index % 2 === 1;

  return (
    <article
      ref={ref}
      className="grid grid-cols-12 gap-8 md:gap-12"
      aria-label={`Story ${index + 1}`}
    >
      {/* Documentary photograph */}
      <motion.div
        className={cn("col-span-12 md:col-span-6", flip && "md:order-2")}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <div className="relative aspect-[4/5] overflow-hidden md:aspect-[5/6]">
          <motion.div className="absolute inset-[-8%]" style={reduced ? undefined : { y: imgY }}>
            <div className="duotone h-full w-full">
              <img
                src={story.image.src}
                alt={story.image.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
          <p className="editorial-label absolute bottom-4 left-4 z-10 bg-ivory/90 px-3 py-2 text-clay">
            {story.location}
          </p>
        </div>
      </motion.div>

      {/* Story beats */}
      <div className={cn("col-span-12 flex flex-col justify-center md:col-span-5", flip && "md:order-1 md:col-start-1")}>
        <ol className="space-y-0">
          {STORY_BEATS.map((beat, bi) => {
            const text = story[beat.key];
            return (
              <motion.li
                key={beat.key}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ duration: 0.8, ease: EASE, delay: bi * 0.08 }}
                className="group border-t border-ink/10 py-5 last:border-b"
              >
                <p className="editorial-label mb-1.5 text-[0.6rem] text-rust">{beat.label}</p>
                <p className="text-[0.95rem] leading-relaxed text-charcoal/85">{text}</p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </article>
  );
}
