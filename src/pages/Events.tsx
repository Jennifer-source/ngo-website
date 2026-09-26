import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { ArrowLeft, CalendarDays, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { EASE, FilmGrain } from "@/components/motion/Primitives";
import { motion } from "framer-motion";

/**
 * Events — public page. Only published, non-test events appear; the list is
 * a live Convex subscription. Visual language follows the site's editorial
 * system without altering the homepage chapters.
 */
export default function Events() {
  const events = useQuery(api.events.listPublicEvents);

  return (
    <main className="min-h-screen bg-ivory text-charcoal">
      {/* Quiet editorial header */}
      <header className="relative overflow-hidden bg-ink py-24 text-ivory md:py-32">
        <FilmGrain opacity={0.18} />
        <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE }}
          >
            <p className="editorial-label text-apricot">Gatherings &amp; outreaches</p>
            <h1 className="mt-6 font-serif text-[clamp(2.6rem,7vw,6rem)] leading-[1.02]">
              Events
            </h1>
            <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-mist/85">
              Published gatherings of the ministry. Registration links appear when
              an event offers them.
            </p>
          </motion.div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-6 py-16 md:px-12">
        <Link
          to="/"
          className="editorial-label inline-flex items-center gap-2 text-smoke transition-colors hover:text-rust"
        >
          <ArrowLeft className="size-3.5" /> Back to the journey
        </Link>

        {events === undefined ? null : events.length === 0 ? (
          <p className="mt-10 border border-dashed border-ink/15 bg-cream/50 p-10 text-center text-[0.95rem] text-smoke">
            No published events at the moment. The next gathering will appear here.
          </p>
        ) : (
          <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((e, i) => (
              <motion.li
                key={e._id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ duration: 0.9, ease: EASE, delay: (i % 3) * 0.08 }}
                className="group flex flex-col border border-ink/10 bg-ivory"
              >
                {e.imageUrl && (
                  <div className="overflow-hidden">
                    <img
                      src={e.imageUrl}
                      alt={e.title}
                      loading="lazy"
                      decoding="async"
                      className="h-52 w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-7">
                  <p className="editorial-label text-rust">
                    {new Date(`${e.date}T00:00:00`).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h2 className="mt-3 font-serif text-2xl leading-snug text-charcoal">
                    {e.title}
                  </h2>
                  <p className="mt-3 line-clamp-4 text-[0.9rem] leading-relaxed text-smoke">
                    {e.description}
                  </p>
                  <dl className="mt-5 space-y-2 text-[0.85rem] text-charcoal/80">
                    {e.time && (
                      <div className="flex items-center gap-2.5">
                        <Clock className="size-3.5 text-rust" aria-hidden />
                        <dd>{e.time}</dd>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <MapPin className="size-3.5 text-rust" aria-hidden />
                      <dd>{e.location}</dd>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CalendarDays className="size-3.5 text-rust" aria-hidden />
                      <dd className="tabular-nums">{e.date}</dd>
                    </div>
                  </dl>
                  {e.registrationLink && (
                    <a
                      href={e.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="editorial-label mt-6 inline-flex items-center gap-2 text-clay transition-colors hover:text-rust"
                    >
                      Register <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
