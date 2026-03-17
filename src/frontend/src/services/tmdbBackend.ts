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
      if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
        return entry.data;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function readStaleCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`tmdb_backend_cache:${key}`);
    if (raw) {
      const entry: CacheEntry<T> = JSON.parse(raw);
      return entry.data;
    }
  } catch {
    // ignore
  }
  return null;
}

function writeCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(`tmdb_backend_cache:${key}`, JSON.stringify(entry));
  } catch {
    // quota exceeded — skip
  }
}

async function backendFetch(
  actor: backendInterface,
  method: "getTrending" | "getPopular" | "getTopRated" | "getNowPlaying",
  cacheKey: string,
): Promise<TMDBMovie[]> {
  const cached = readCache<TMDBMovie[]>(cacheKey);
  if (cached) {
    console.log(`[TMDB Backend] Cache hit: ${cacheKey}`);
    return cached;
  }

  console.log(`[TMDB Backend] Request started: ${cacheKey}`);
  const start = performance.now();

  try {
    const jsonText = await actor[method]();
    const elapsed = Math.round(performance.now() - start);
    console.log(`[TMDB Backend] Response received: ${cacheKey} | ${elapsed}ms`);

    const parsed = JSON.parse(jsonText) as TMDBTrendingResponse;
    const results = parsed.results ?? [];
    console.log(
      `[TMDB Backend] Data parsed: ${cacheKey} — ${results.length} movies`,
    );
    writeCache(cacheKey, results);
    return results;
  } catch (err) {
    const elapsed = Math.round(performance.now() - start);
    console.error(`[TMDB Backend] Failed: ${cacheKey} after ${elapsed}ms`, err);

    // Fall back to stale cache on error
    const stale = readStaleCache<TMDBMovie[]>(cacheKey);
    if (stale) {
      console.log(`[TMDB Backend] Using stale cache: ${cacheKey}`);
      return stale;
    }
    throw err;
  }
}

export async function fetchTrendingViaBackend(
  actor: backendInterface,
): Promise<TMDBMovie[]> {
  return backendFetch(actor, "getTrending", "trending");
}

export async function fetchPopularViaBackend(
  actor: backendInterface,
): Promise<TMDBMovie[]> {
  return backendFetch(actor, "getPopular", "popular");
}

export async function fetchTopRatedViaBackend(
  actor: backendInterface,
): Promise<TMDBMovie[]> {
  return backendFetch(actor, "getTopRated", "top_rated");
}

export async function fetchNowPlayingViaBackend(
  actor: backendInterface,
): Promise<TMDBMovie[]> {
  return backendFetch(actor, "getNowPlaying", "now_playing");
}
