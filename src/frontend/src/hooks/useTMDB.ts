import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchSearchMovies } from "../services/tmdb";
import {
  fetchMoviesByGenreViaBackend,
  fetchNowPlayingViaBackend,
  fetchPopularViaBackend,
  fetchTopRatedViaBackend,
  fetchTrendingViaBackend,
  fetchUpcomingViaBackend,
} from "../services/tmdbBackend";
import type { TMDBMovie, TMDBMovieDetail, TMDBVideo } from "../types/tmdb";
import { useActor } from "./useActor";

const STALE = 5 * 60 * 1000;

// All TMDB list endpoints route through the Motoko backend (HTTP outcalls)
// so the browser never calls TMDB directly. This fixes ISP blocks.

export function useTMDBTrending() {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "trending"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return fetchTrendingViaBackend(actor);
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 1,
  });
}

export function useTMDBPopular() {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "popular"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return fetchPopularViaBackend(actor);
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 1,
  });
}

export function useTMDBTopRated() {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "top_rated"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return fetchTopRatedViaBackend(actor);
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 1,
  });
}

export function useTMDBUpcoming() {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "upcoming"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return fetchUpcomingViaBackend(actor);
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 1,
  });
}

export function useTMDBNowPlaying() {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "now_playing"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return fetchNowPlayingViaBackend(actor);
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 1,
  });
}

export function useTMDBByGenre(genreId: number) {
  const { actor } = useActor();
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "genre", genreId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return fetchMoviesByGenreViaBackend(actor, genreId);
    },
    enabled: !!actor,
    staleTime: STALE,
    retry: 1,
  });
}

export function useTMDBMovieDetail(id: number | null) {
  const { actor } = useActor();
  const validId = id !== null && !Number.isNaN(id) && id > 0;
  return useQuery<TMDBMovieDetail>({
    queryKey: ["tmdb", "movie", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (!validId) throw new Error("Invalid movie ID");
      const raw = await (actor as any).getMovieDetails(BigInt(id!));
      const data = JSON.parse(
        typeof raw === "string" ? raw || "{}" : "{}",
      ) as TMDBMovieDetail;
      if (!data.id) throw new Error("Movie not found");
      return data;
    },
    enabled: validId && !!actor,
    staleTime: STALE,
    retry: 1,
  });
}

export function useTMDBVideos(id: number | null) {
  const { actor } = useActor();
  const validId = id !== null && !Number.isNaN(id) && id > 0;
  return useQuery<TMDBVideo | null>({
    queryKey: ["tmdb", "videos", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const raw = await (actor as any).getMovieVideos(BigInt(id!));
      const parsed = JSON.parse(
        typeof raw === "string" ? raw || "{}" : "{}",
      ) as { results?: TMDBVideo[] };
      const youtubeVideos = (
        Array.isArray(parsed.results) ? parsed.results : []
      ).filter((v) => v.site === "YouTube");
      return (
        youtubeVideos.find((v) => v.type === "Trailer" && v.official) ??
        youtubeVideos.find((v) => v.type === "Trailer") ??
        youtubeVideos.find((v) => v.type === "Teaser" && v.official) ??
        youtubeVideos.find((v) => v.type === "Teaser") ??
        null
      );
    },
    enabled: validId && !!actor,
    staleTime: STALE,
    retry: 1,
  });
}

export function useTMDBSimilar(id: number | null) {
  const { actor } = useActor();
  const validId = id !== null && !Number.isNaN(id) && id > 0;
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "similar", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const raw = await (actor as any).getSimilarMovies(BigInt(id!));
      const data = JSON.parse(typeof raw === "string" ? raw || "{}" : "{}");
      return Array.isArray(data.results) ? data.results : [];
    },
    enabled: validId && !!actor,
    staleTime: STALE,
    retry: 1,
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
      return Array.isArray(data.results) ? data.results : [];
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: STALE,
    retry: 1,
  });
}
