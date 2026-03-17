import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchSearchMovies, fetchUpcomingMovies } from "../services/tmdb";
import {
  fetchMoviesByGenreViaBackend,
  fetchNowPlayingViaBackend,
  fetchPopularViaBackend,
  fetchTopRatedViaBackend,
  fetchTrendingViaBackend,
} from "../services/tmdbBackend";
import { DEBUG_PLACEHOLDER_MOVIES } from "../services/tmdbDebugMovies";
import type { TMDBMovie, TMDBMovieDetail, TMDBVideo } from "../types/tmdb";
import { useActor } from "./useActor";

const STALE = 5 * 60 * 1000;

/**
 * The 4 main row hooks now route through the Motoko backend (HTTP outcalls)
 * so the browser never calls TMDB directly.
 * This fixes loading failures on Indian ISP networks.
 */

export function useTMDBTrending() {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "trending"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      console.log("[TMDB] Request started: trending/week (via backend)");
      const results = await fetchTrendingViaBackend(actor);
      console.log(
        `[TMDB] State updated: trending — ${results.length} movies loaded`,
      );
      return results;
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 2,
    placeholderData: DEBUG_PLACEHOLDER_MOVIES,
  });
}

export function useTMDBPopular() {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "popular"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      console.log("[TMDB] Request started: movie/popular (via backend)");
      const results = await fetchPopularViaBackend(actor);
      console.log(
        `[TMDB] State updated: popular — ${results.length} movies loaded`,
      );
      return results;
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 2,
    placeholderData: DEBUG_PLACEHOLDER_MOVIES,
  });
}

export function useTMDBTopRated() {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "top_rated"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      console.log("[TMDB] Request started: movie/top_rated (via backend)");
      const results = await fetchTopRatedViaBackend(actor);
      console.log(
        `[TMDB] State updated: top_rated — ${results.length} movies loaded`,
      );
      return results;
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 2,
    placeholderData: DEBUG_PLACEHOLDER_MOVIES,
  });
}

export function useTMDBUpcoming() {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "upcoming"],
    queryFn: async () => {
      console.log("[TMDB] Request started: movie/upcoming");
      const data = await fetchUpcomingMovies();
      console.log(
        `[TMDB] State updated: upcoming — ${data.results.length} movies loaded`,
      );
      return data.results;
    },
    staleTime: STALE,
    retry: 2,
    placeholderData: DEBUG_PLACEHOLDER_MOVIES,
  });
}

export function useTMDBNowPlaying() {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "now_playing"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      console.log("[TMDB] Request started: movie/now_playing (via backend)");
      const results = await fetchNowPlayingViaBackend(actor);
      console.log(
        `[TMDB] State updated: now_playing — ${results.length} movies loaded`,
      );
      return results;
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 2,
    placeholderData: DEBUG_PLACEHOLDER_MOVIES,
  });
}

export function useTMDBByGenre(genreId: number) {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "genre", genreId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      console.log(`[TMDB] Request started: genre/${genreId} (via backend)`);
      const results = await fetchMoviesByGenreViaBackend(actor, genreId);
      console.log(
        `[TMDB] State updated: genre/${genreId} — ${results.length} movies loaded`,
      );
      return results;
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 2,
    placeholderData: DEBUG_PLACEHOLDER_MOVIES,
  });
}

export function useTMDBMovieDetail(id: number | null) {
  const { actor } = useActor();
  return useQuery<TMDBMovieDetail>({
    queryKey: ["tmdb", "movie", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const raw = await (actor as any).getMovieDetails(BigInt(id!));
      console.log("[Frontend] Raw movie details:", raw);
      const data = JSON.parse(
        typeof raw === "string" ? raw || "{}" : "{}",
      ) as TMDBMovieDetail;
      return data;
    },
    enabled: id !== null && !!actor,
    staleTime: STALE,
  });
}

export function useTMDBVideos(id: number | null) {
  const { actor } = useActor();
  return useQuery<TMDBVideo | null>({
    queryKey: ["tmdb", "videos", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const raw = await (actor as any).getMovieVideos(BigInt(id!));
      console.log("[Frontend] Raw movie videos:", raw);
      const parsed = JSON.parse(
        typeof raw === "string" ? raw || "{}" : "{}",
      ) as { results?: TMDBVideo[] };
      const youtubeVideos = (
        Array.isArray(parsed.results) ? parsed.results : []
      ).filter((v) => v.site === "YouTube");
      const trailer =
        youtubeVideos.find((v) => v.type === "Trailer" && v.official) ??
        youtubeVideos.find((v) => v.type === "Trailer") ??
        youtubeVideos.find((v) => v.type === "Teaser" && v.official) ??
        youtubeVideos.find((v) => v.type === "Teaser") ??
        null;
      return trailer;
    },
    enabled: id !== null && !!actor,
    staleTime: STALE,
  });
}

export function useTMDBSimilar(id: number | null) {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "similar", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const raw = await (actor as any).getSimilarMovies(BigInt(id!));
      console.log("[Frontend] Raw similar movies:", raw);
      const data = JSON.parse(typeof raw === "string" ? raw || "{}" : "{}");
      return Array.isArray(data.results) ? data.results : [];
    },
    enabled: id !== null && !!actor,
    staleTime: STALE,
  });
}

export function useTMDBSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "search", debouncedQuery],
    queryFn: async () => {
      const data = await fetchSearchMovies(debouncedQuery);
      return data.results;
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: STALE,
  });
}
