import { ScrollProgress, ChapterCursor } from "@/components/motion/Primitives";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ImpactMap from "@/components/ImpactMap";
import JourneyFilm from "@/components/JourneyFilm";
import SocialHandles from "@/components/SocialHandles";
import Founders from "@/components/Founders";
import Serve from "@/components/Serve";
import Fragments from "@/components/Fragments";
import TalkToUs from "@/components/TalkToUs";
import Donate from "@/components/Donate";
import StoryClimax from "@/components/StoryClimax";
import Footer from "@/components/Footer";

/**
 * HANDS OF GRACE — one continuous cinematic experience in 11 chapters.
 * The chapters flow: HERO → IMPACT → FILM → SOCIAL → FOUNDERS
 * → SERVE → FRAGMENTS → TALK TO US → DONATE → CLIMAX → FOOTER.
 */
export default function Landing() {
  return (
    <div className="relative min-h-screen bg-ivory">
      <ScrollProgress />
      <ChapterCursor />
      <Navigation />

      <main>
        {/* 01 — Hero */}
        <Hero />

        {/* #journey — anchor kept for the nav's Journey link; the old
            "Our Journey" chapter was removed. Zero-height, no empty section. */}
        <span id="journey" aria-hidden className="absolute" />

        {/* 02 — Global Impact */}
        <ImpactMap />

        {/* 03 — Our Journey Film */}
        <JourneyFilm />

        {/* 04 — Social handles */}
        <SocialHandles />

        {/* 05 — The Founders */}
        <Founders />

        {/* 06 — Serve */}
        <Serve />

        {/* 07 — Fragments */}
        <Fragments />

        {/* 08 — Talk to us */}
        <TalkToUs />

        {/* 09 — Donate */}
        <Donate />

        {/* 10 — The story isn't over */}
        <StoryClimax />
      </main>

      {/* 11 — Footer */}
      <Footer />
    </div>
  );
}
