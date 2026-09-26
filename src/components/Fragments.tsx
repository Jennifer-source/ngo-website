import { motion } from "framer-motion";
import { useFragmentsContent } from "@/hooks/use-site-content";
import { CHAPTER_COUNT } from "@/content/site";
import { EASE, SectionHeader, AnimatedText, FadeIn } from "./motion/Primitives";
import { cn } from "@/lib/utils";

/**
 * Chapter 07 — Fragments.
 * An asymmetric documentary archive: different scales, offsets and
 * rhythms. Captions read like field notes.
 */
export default function Fragments() {
  const fragments = useFragmentsContent();
  return (
    <section
      id="fragments"
      aria-label="Fragments — documentary archive"
      className="relative bg-cream py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <SectionHeader label={fragments.label} chapter={7} total={CHAPTER_COUNT} />
            <AnimatedText
              as="h2"
              lines={fragments.statementLines}
              className="mt-10 font-serif text-[clamp(2.4rem,5.5vw,5rem)] leading-[1.04] text-charcoal"
            />
          </div>
          <FadeIn delay={0.2}>
            <p className="max-w-sm text-[0.95rem] leading-relaxed text-smoke">
              {fragments.intro}
            </p>
          </FadeIn>
        </div>

        {/* Asymmetric editorial grid */}
        <div className="mt-20 grid grid-cols-12 gap-4 md:gap-6">
          {fragments.items.map((f, i) => (
            <FragmentCard key={f.id} fragment={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FragmentCard({
  fragment,
  index,
}: {
  fragment: ReturnType<typeof useFragmentsContent>["items"][number];
  index: number;
}) {
  /* Editorial spans — each fragment earns its own shape */
  const spanMap: Record<string, string> = {
    tall: "col-span-6 md:col-span-4 aspect-[3/4]",
    wide: "col-span-12 md:col-span-8 aspect-[16/10]",
    square: "col-span-6 md:col-span-4 aspect-square",
    full: "col-span-12 aspect-[21/9]",
  };
  const span = spanMap[fragment.span] ?? spanMap.square;
  const offset = index % 3 === 1 ? "md:mt-16" : index % 3 === 2 ? "md:mt-6" : "";

  return (
    <motion.figure
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 1, ease: EASE, delay: (index % 3) * 0.1 }}
      className={cn("group", span, offset)}
      data-cursor="VIEW"
    >
      <div className="relative h-full w-full overflow-hidden bg-sand/40">
        <div className="duotone h-full w-full transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]">
          <img
            src={fragment.image.src}
            alt={fragment.image.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
        <figcaption className="absolute inset-x-0 bottom-0 z-10 flex items-baseline justify-between gap-4 bg-gradient-to-t from-ink/75 to-transparent p-4 pt-10">
          <span className="editorial-label text-[0.58rem] text-mist/90">
            {fragment.caption}
          </span>
          <span className="editorial-label hidden text-[0.58rem] text-apricot sm:block">
            {fragment.detail}
          </span>
        </figcaption>
      </div>
    </motion.figure>
  );
}
