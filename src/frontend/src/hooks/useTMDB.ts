import { useQuery } from "@tanstack/react-query";
import {
  fetchMovieDetail,
  fetchMovieVideos,
  fetchTrendingMovies,
} from "../services/tmdb";
import type { TMDBMovie, TMDBMovieDetail, TMDBVideo } from "../types/tmdb";

export function useTMDBTrending() {
  return useQuery<TMDBMovie[]>({
    queryKey: ["tmdb", "trending"],
    queryFn: async () => {
      const data = await fetchTrendingMovies();
      return data.results;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTMDBMovieDetail(id: number | null) {
  return useQuery<TMDBMovieDetail>({
    queryKey: ["tmdb", "movie", id],
    queryFn: () => fetchMovieDetail(id!),
    enabled: id !== null,
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
  });
}
