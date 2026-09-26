import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  HERO,
  IMPACT,
  FILM,
  SOCIAL,
  SOCIAL_HANDLES,
  FOUNDERS_INTRO,
  FOUNDERS,
  SERVE,
  SERVE_PATHWAYS,
  FRAGMENTS,
  FRAGMENTS_ITEMS,
  TALK_TO_US,
  DONATE,
  PARTNERSHIP,
  FOOTER,
  CONTACT,
  type Fragment,
  type Founder,
  type SocialHandle,
} from "@/content/site";

/**
 * Site content — backend-first with static fallback.
 *
 * The admin dashboard writes per-section JSON to the `siteContent` table;
 * the public site reads it here. Until an admin has saved a section, the
 * curated static content from `src/content/site.ts` is used verbatim, so
 * the website looks identical on day zero and changes only when an admin
 * actually saves something.
 *
 * Lazy-keyed: each section subscribes only when requested, so the landing
 * page stays on the static path until a section opts into backend content.
 */

type ContentSnapshot = Record<string, unknown>;

function useContentValue(key: string): unknown {
  const all = useQuery(api.content.getPublicContent) as ContentSnapshot | undefined;
  if (all === undefined) return undefined; // loading
  return all[key] ?? null; // null = not set → static fallback
}

/** Merge helper: DB value overrides static defaults, shallowly per key. */
function withFallback<T>(db: unknown, fallback: T): T {
  if (db === undefined || db === null) return fallback;
  if (typeof fallback === "object" && fallback !== null && !Array.isArray(fallback)) {
    return { ...(fallback as object), ...(db as object) } as T;
  }
  return db as T;
}

function withFallbackArray<T>(db: unknown, fallback: T[]): T[] {
  if (Array.isArray(db)) return db as T[];
  return fallback;
}

/* ------------------------------------------------------------------ */
/* Per-section hooks (each falls back to site.ts)                       */
/* ------------------------------------------------------------------ */

export function useHeroContent() {
  return withFallback(useContentValue("hero"), HERO);
}

export function useImpactContent() {
  const db = useContentValue("impact") as
    | (typeof IMPACT & { fields?: typeof IMPACT.fields })
    | null
    | undefined;
  const merged = withFallback(db, IMPACT);
  return {
    ...merged,
    fields: withFallbackArray(db && (db as { fields?: unknown }).fields, IMPACT.fields),
    regions: withFallbackArray(db && (db as { regions?: unknown }).regions, IMPACT.regions),
  };
}

export function useFilmContent() {
  return withFallback(useContentValue("film"), FILM);
}

export function useSocialContent() {
  const db = useContentValue("social") as
    | (typeof SOCIAL & { handles?: SocialHandle[] })
    | null
    | undefined;
  return {
    ...withFallback(db, SOCIAL),
    handles: withFallbackArray(db && db.handles, SOCIAL_HANDLES),
  };
}

export function useFoundersContent() {
  const db = useContentValue("founders") as
    | (typeof FOUNDERS_INTRO & { founders?: Founder[] })
    | null
    | undefined;
  return {
    ...withFallback(db, FOUNDERS_INTRO),
    founders: withFallbackArray(db && db.founders, FOUNDERS),
  };
}

export function useServeContent() {
  const db = useContentValue("serve") as
    | (typeof SERVE & { pathways?: typeof SERVE_PATHWAYS })
    | null
    | undefined;
  return {
    ...withFallback(db, SERVE),
    pathways: withFallbackArray(db && db.pathways, SERVE_PATHWAYS),
  };
}

export function useFragmentsContent() {
  const db = useContentValue("fragments") as
    | (typeof FRAGMENTS & { items?: Fragment[] })
    | null
    | undefined;
  return {
    ...withFallback(db, FRAGMENTS),
    items: withFallbackArray(db && db.items, FRAGMENTS_ITEMS),
  };
}

export function useTalkToUsContent() {
  return withFallback(useContentValue("talkToUs"), TALK_TO_US);
}

export function useDonateContent() {
  const db = useContentValue("donate") as
    | (typeof DONATE & { partnership?: typeof PARTNERSHIP })
    | null
    | undefined;
  return {
    ...withFallback(db, DONATE),
    partnership: (db && db.partnership) || PARTNERSHIP,
  };
}

export function useFooterContent() {
  return withFallback(useContentValue("footer"), FOOTER);
}

export function useContactContent() {
  return withFallback(useContentValue("contact"), CONTACT);
}

/**
 * Single convenience hook for pages that want everything (admin dashboard).
 * Individual landing-page sections should use the per-section hooks instead
 * to keep subscriptions minimal.
 */
export function useAllSiteContent() {
  const all = useQuery(api.content.getPublicContent) as ContentSnapshot | undefined;
  return {
    isLoading: all === undefined,
    content: all ?? null,
  };
}
