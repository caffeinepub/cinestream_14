/**
 * tmdbBackend.ts
 *
 * Fetches TMDB movie data via the Motoko backend actor (HTTP outcalls).
 * The browser NEVER calls TMDB directly — all requests go through the canister.
 * This bypasses Indian ISP blocks and CORS restrictions.
 */

import type { backendInterface } from "../backend";
import type { TMDBMovie, TMDBTrendingResponse } from "../types/tmdb";

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`tmdb_backend_cache:${key}`);
    if (raw) {
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - entry.timestamp < CACHE_TTL_MS) return entry.data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function readStaleCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`tmdb_backend_cache:${key}`);
    if (raw) return (JSON.parse(raw) as CacheEntry<T>).data;
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(
      `tmdb_backend_cache:${key}`,
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  } catch {
    /* quota exceeded */
  }
}

/**
 * Safely parses a backend response that may be a JSON string or already an object.
 */
function safeParseResponse(raw: unknown): Partial<TMDBTrendingResponse> {
  try {
    if (typeof raw === "string") {
      return JSON.parse(raw || "{}") as TMDBTrendingResponse;
    }
    if (raw && typeof raw === "object") {
      return raw as TMDBTrendingResponse;
    }
    return {};
  } catch {
    return {};
  }
}

function safeParseAny(raw: unknown): Record<string, unknown> {
  try {
    if (typeof raw === "string") {
      return JSON.parse(raw || "{}") as Record<string, unknown>;
    }
    if (raw && typeof raw === "object") {
      return raw as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

// ── List endpoints ────────────────────────────────────────────────────────────

type ListMethod =
  | "getTrending"
  | "getPopular"
  | "getTopRated"
  | "getNowPlaying"
  | "getUpcoming";

async function backendFetchList(
  actor: backendInterface,
  method: ListMethod,
  cacheKey: string,
): Promise<TMDBMovie[]> {
  const cached = readCache<TMDBMovie[]>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await (actor as any)[method]();
    const data = safeParseResponse(raw);
    const results: TMDBMovie[] = Array.isArray(data.results)
      ? data.results
      : [];
    if (results.length > 0) {
      writeCache(cacheKey, results);
    }
    return results;
  } catch (err) {
    const stale = readStaleCache<TMDBMovie[]>(cacheKey);
    if (stale) return stale;
    throw err;
  }
}

export async function fetchTrendingViaBackend(
  actor: backendInterface,
): Promise<TMDBMovie[]> {
  return backendFetchList(actor, "getTrending", "trending");
}

export async function fetchPopularViaBackend(
  actor: backendInterface,
): Promise<TMDBMovie[]> {
  return backendFetchList(actor, "getPopular", "popular");
}

export async function fetchTopRatedViaBackend(
  actor: backendInterface,
): Promise<TMDBMovie[]> {
  return backendFetchList(actor, "getTopRated", "top_rated");
}

export async function fetchNowPlayingViaBackend(
  actor: backendInterface,
): Promise<TMDBMovie[]> {
  return backendFetchList(actor, "getNowPlaying", "now_playing");
}

export async function fetchUpcomingViaBackend(
  actor: backendInterface,
): Promise<TMDBMovie[]> {
  // Falls back to getNowPlaying if getUpcoming isn't available on this backend build
  try {
    return await backendFetchList(actor, "getUpcoming", "upcoming");
  } catch {
    return backendFetchList(actor, "getNowPlaying", "upcoming_fallback");
  }
}

// ── Genre discovery endpoint ──────────────────────────────────────────────────

export async function fetchMoviesByGenreViaBackend(
  actor: backendInterface,
  genreId: number,
): Promise<TMDBMovie[]> {
  const cacheKey = `genre_${genreId}`;
  const cached = readCache<TMDBMovie[]>(cacheKey);
  if (cached) return cached;

  try {
    const raw = await (actor as any).getMoviesByGenre(BigInt(genreId));
    const data = safeParseResponse(raw);
    const results: TMDBMovie[] = Array.isArray(data.results)
      ? data.results
      : [];
    if (results.length > 0) {
      writeCache(cacheKey, results);
    }
    return results;
  } catch {
    const stale = readStaleCache<TMDBMovie[]>(cacheKey);
    if (stale) return stale;
    return [];
  }
}

// ── Per-movie endpoints ───────────────────────────────────────────────────────

async function backendFetchMovie<T>(
  actor: backendInterface,
  method: "getMovieDetails" | "getMovieVideos" | "getSimilarMovies",
  id: number,
  cacheKey: string,
): Promise<T> {
  const cached = readCache<T>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await (actor as any)[method](BigInt(id));
    const parsed = safeParseAny(raw) as T;
    writeCache(cacheKey, parsed);
    return parsed;
  } catch (err) {
    const stale = readStaleCache<T>(cacheKey);
    if (stale) return stale;
    throw err;
  }
}

export async function fetchMovieDetailsViaBackend(
  actor: backendInterface,
  id: number,
): Promise<Record<string, unknown>> {
  return backendFetchMovie<Record<string, unknown>>(
    actor,
    "getMovieDetails",
    id,
    `movie_details_${id}`,
  );
}

export async function fetchMovieVideosViaBackend(
  actor: backendInterface,
  id: number,
): Promise<Record<string, unknown>> {
  return backendFetchMovie<Record<string, unknown>>(
    actor,
    "getMovieVideos",
    id,
    `movie_videos_${id}`,
  );
}

export async function fetchSimilarMoviesViaBackend(
  actor: backendInterface,
  id: number,
): Promise<TMDBMovie[]> {
  const result = await backendFetchMovie<TMDBTrendingResponse>(
    actor,
    "getSimilarMovies",
    id,
    `movie_similar_${id}`,
  );
  return Array.isArray(result.results) ? result.results : [];
}
