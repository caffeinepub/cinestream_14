import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  fetchMovieDetail,
  fetchMovieVideos,
  fetchMoviesByGenre,
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchSearchMovies,
  fetchSimilarMovies,
  fetchTopRatedMovies,
  fetchTrendingMovies,
  fetchUpcomingMovies,
} from "../services/tmdb";
import { DEBUG_PLACEHOLDER_MOVIES } from "../services/tmdbDebugMovies";
import type { TMDBMovie, TMDBMovieDetail, TMDBVideo } from "../types/tmdb";

const STALE = 5 * 60 * 1000;

/**
 * placeholderData: DEBUG_PLACEHOLDER_MOVIES
 *
 * How this works:
 * 1. On first render, React Query instantly returns the 5 hardcoded debug movies
 *    so the UI renders immediately (isLoading = false, data = debug movies).
 * 2. In the background, the real TMDB API fetch fires.
 * 3. If the API succeeds → real movies replace the debug placeholders automatically.
 * 4. If the API fails → isError = true, error UI + Retry button shown per row.
 *
 * This proves: if the debug cards render → UI is fine → issue is API connectivity.
 */

export function useTMDBTrending() {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "trending"],
    queryFn: async () => {
      console.log("[TMDB] Request started: trending/week");
      const data = await fetchTrendingMovies();
      console.log(
        `[TMDB] State updated: trending — ${data.results.length} movies loaded`,
      );
      return data.results;
    },
    staleTime: STALE,
    retry: 2,
    placeholderData: DEBUG_PLACEHOLDER_MOVIES,
  });
}

export function useTMDBPopular() {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "popular"],
    queryFn: async () => {
      console.log("[TMDB] Request started: movie/popular");
      const data = await fetchPopularMovies();
      console.log(
        `[TMDB] State updated: popular — ${data.results.length} movies loaded`,
      );
      return data.results;
    },
    staleTime: STALE,
    retry: 2,
    placeholderData: DEBUG_PLACEHOLDER_MOVIES,
  });
}

export function useTMDBTopRated() {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "top_rated"],
    queryFn: async () => {
      console.log("[TMDB] Request started: movie/top_rated");
      const data = await fetchTopRatedMovies();
      console.log(
        `[TMDB] State updated: top_rated — ${data.results.length} movies loaded`,
      );
      return data.results;
    },
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
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "now_playing"],
    queryFn: async () => {
      console.log("[TMDB] Request started: movie/now_playing");
      const data = await fetchNowPlayingMovies();
      console.log(
        `[TMDB] State updated: now_playing — ${data.results.length} movies loaded`,
      );
      return data.results;
    },
    staleTime: STALE,
    retry: 2,
    placeholderData: DEBUG_PLACEHOLDER_MOVIES,
  });
}

export function useTMDBByGenre(genreId: number) {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "genre", genreId],
    queryFn: async () => {
      console.log(`[TMDB] Request started: discover/genre/${genreId}`);
      const data = await fetchMoviesByGenre(genreId);
      console.log(
        `[TMDB] State updated: genre/${genreId} — ${data.results.length} movies loaded`,
      );
      return data.results;
    },
    staleTime: STALE,
    retry: 2,
    placeholderData: DEBUG_PLACEHOLDER_MOVIES,
  });
}

export function useTMDBMovieDetail(id: number | null) {
  return useQuery<TMDBMovieDetail>({
    queryKey: ["tmdb", "movie", id],
    queryFn: () => fetchMovieDetail(id!),
    enabled: id !== null,
    staleTime: STALE,
  });
}

export function useTMDBVideos(id: number | null) {
  return useQuery<TMDBVideo | null>({
    queryKey: ["tmdb", "videos", id],
    queryFn: async () => {
      const data = await fetchMovieVideos(id!);
      const youtubeVideos = data.results.filter((v) => v.site === "YouTube");
      const trailer =
        youtubeVideos.find((v) => v.type === "Trailer" && v.official) ??
        youtubeVideos.find((v) => v.type === "Trailer") ??
        youtubeVideos.find((v) => v.type === "Teaser" && v.official) ??
        youtubeVideos.find((v) => v.type === "Teaser") ??
        null;
      return trailer;
    },
    enabled: id !== null,
    staleTime: STALE,
  });
}

export function useTMDBSimilar(id: number | null) {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "similar", id],
    queryFn: async () => {
      const data = await fetchSimilarMovies(id!);
      return data.results;
    },
    enabled: id !== null,
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
