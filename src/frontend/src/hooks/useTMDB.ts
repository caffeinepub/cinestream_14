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
import type { TMDBMovie, TMDBMovieDetail, TMDBVideo } from "../types/tmdb";

const STALE = 5 * 60 * 1000;

export function useTMDBTrending() {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "trending"],
    queryFn: async () => {
      const data = await fetchTrendingMovies();
      return data.results;
    },
    staleTime: STALE,
  });
}

export function useTMDBPopular() {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "popular"],
    queryFn: async () => {
      const data = await fetchPopularMovies();
      return data.results;
    },
    staleTime: STALE,
  });
}

export function useTMDBTopRated() {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "top_rated"],
    queryFn: async () => {
      const data = await fetchTopRatedMovies();
      return data.results;
    },
    staleTime: STALE,
  });
}

export function useTMDBUpcoming() {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "upcoming"],
    queryFn: async () => {
      const data = await fetchUpcomingMovies();
      return data.results;
    },
    staleTime: STALE,
  });
}

export function useTMDBNowPlaying() {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "now_playing"],
    queryFn: async () => {
      const data = await fetchNowPlayingMovies();
      return data.results;
    },
    staleTime: STALE,
  });
}

export function useTMDBByGenre(genreId: number) {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "genre", genreId],
    queryFn: async () => {
      const data = await fetchMoviesByGenre(genreId);
      return data.results;
    },
    staleTime: STALE,
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
