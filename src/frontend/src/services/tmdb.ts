import type {
  TMDBMovie,
  TMDBMovieDetail,
  TMDBTrendingResponse,
  TMDBVideo,
} from "../types/tmdb";

export const TMDB_API_KEY = "fadb0b01b6573c9e09695a7b0498aa71";
export const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/";

export function tmdbImage(path: string | null, size: string): string {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE}${size}${path}`;
}

async function tmdbFetch<T>(endpoint: string): Promise<T> {
  const url = `${TMDB_BASE}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function fetchTrendingMovies(): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>("/trending/movie/week");
}

export async function fetchPopularMovies(): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>("/movie/popular");
}

export async function fetchTopRatedMovies(): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>("/movie/top_rated");
}

export async function fetchUpcomingMovies(): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>("/movie/upcoming");
}

export async function fetchMoviesByGenre(
  genreId: number,
): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>(
    `/discover/movie?with_genres=${genreId}&sort_by=popularity.desc`,
  );
}

export async function fetchMovieDetail(id: number): Promise<TMDBMovieDetail> {
  return tmdbFetch<TMDBMovieDetail>(`/movie/${id}`);
}

export async function fetchMovieVideos(
  id: number,
): Promise<{ results: TMDBVideo[] }> {
  return tmdbFetch<{ results: TMDBVideo[] }>(`/movie/${id}/videos`);
}

export async function fetchSimilarMovies(
  id: number,
): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>(`/movie/${id}/similar`);
}

export async function fetchSearchMovies(
  query: string,
): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>(
    `/search/movie?query=${encodeURIComponent(query)}`,
  );
}

export function getReleaseYear(releaseDate: string): string {
  if (!releaseDate) return "";
  return releaseDate.split("-")[0];
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
