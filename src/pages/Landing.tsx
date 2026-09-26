import { ScrollProgress, ChapterCursor } from "@/components/motion/Primitives";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Journey from "@/components/Journey";
import ImpactMap from "@/components/ImpactMap";
import JourneyFilm from "@/components/JourneyFilm";
import SocialHandles from "@/components/SocialHandles";
import Founders from "@/components/Founders";
import Serve from "@/components/Serve";
import ImpactStories from "@/components/ImpactStories";
import Fragments from "@/components/Fragments";
import TalkToUs from "@/components/TalkToUs";
import Donate from "@/components/Donate";
import StoryClimax from "@/components/StoryClimax";
import Footer from "@/components/Footer";

/**
 * HANDS OF GRACE — one continuous cinematic experience in 13 chapters.
 * The chapters flow: HERO → JOURNEY → IMPACT → FILM → SOCIAL → FOUNDERS
 * → SERVE → IMPACT IN ACTION → FRAGMENTS → TALK TO US → DONATE → CLIMAX
 * → FOOTER.
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

        {/* 02 — Our Journey */}
        <Journey />

        {/* 03 — Global Impact */}
        <ImpactMap />

        {/* 04 — Our Journey Film */}
        <JourneyFilm />

        {/* 05 — Social handles */}
        <SocialHandles />

        {/* 06 — The Founders */}
        <Founders />

        {/* 07 — Serve */}
        <Serve />

        {/* 08 — Impact in action */}
        <ImpactStories />

        {/* 09 — Fragments */}
        <Fragments />

        {/* 10 — Talk to us */}
        <TalkToUs />

        {/* 11 — Donate */}
        <Donate />

        {/* 12 — The story isn't over */}
        <StoryClimax />
      </main>

      {/* 13 — Footer */}
      <Footer />
    </div>
  );
}
