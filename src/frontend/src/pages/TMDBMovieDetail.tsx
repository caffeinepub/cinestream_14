import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, BookmarkPlus, Check, Play, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTMDBMovieDetail, useTMDBVideos } from "../hooks/useTMDB";
import { getReleaseYear, tmdbImage } from "../services/tmdb";

const WATCHLIST_KEY = "tmdb_watchlist";

function getWatchlist(): number[] {
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY) ?? "[]") as number[];
  } catch {
    return [];
  }
}

function setWatchlist(ids: number[]) {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(ids));
}

export default function TMDBMovieDetailPage() {
  const { id } = useParams({ from: "/tmdb/$id" });
  const movieId = Number(id);
  const navigate = useNavigate();

  const { data: movie, isLoading } = useTMDBMovieDetail(movieId);
  const { data: trailer } = useTMDBVideos(movieId);

  const [trailerOpen, setTrailerOpen] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    const wl = getWatchlist();
    setInWatchlist(wl.includes(movieId));
  }, [movieId]);

  const handleWatchlistToggle = () => {
    const wl = getWatchlist();
    if (inWatchlist) {
      setWatchlist(wl.filter((i) => i !== movieId));
      setInWatchlist(false);
      toast.success("Removed from watchlist");
    } else {
      setWatchlist([...wl, movieId]);
      setInWatchlist(true);
      toast.success("Added to watchlist");
    }
  };

  const handlePlayTrailer = () => {
    if (!trailer) {
      toast.error("No trailer available");
      return;
    }
    setTrailerOpen(true);
  };

  const backdropUrl = tmdbImage(movie?.backdrop_path ?? null, "w1280");
  const posterUrl = tmdbImage(movie?.poster_path ?? null, "w500");

  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Backdrop */}
      <div
        className="relative w-full"
        style={{ height: "55vh", minHeight: 320 }}
      >
        {isLoading ? (
          <Skeleton
            className="absolute inset-0 skeleton-shimmer bg-transparent"
            data-ocid="tmdb_detail.loading_state"
          />
        ) : backdropUrl ? (
          <img
            src={backdropUrl}
            alt={movie?.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary" />
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        {/* Back button */}
        <button
          type="button"
          data-ocid="tmdb_detail.button"
          onClick={() => navigate({ to: "/" })}
          className="absolute top-4 left-4 sm:top-6 sm:left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors group z-10"
        >
          <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium hidden sm:block">Back</span>
        </button>

        {/* Title over backdrop */}
        <div className="absolute bottom-8 left-4 sm:left-8 right-4 sm:right-8 z-10">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-64 mb-2 skeleton-shimmer bg-transparent" />
              <Skeleton className="h-4 w-48 skeleton-shimmer bg-transparent" />
            </>
          ) : (
            <>
              <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-1">
                {movie?.title}
              </h1>
              {movie?.tagline && (
                <p className="text-white/60 italic text-sm sm:text-base">
                  {movie.tagline}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content below backdrop */}
      <div className="px-4 sm:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0 w-full md:w-52">
              {isLoading ? (
                <Skeleton className="aspect-[2/3] rounded-lg skeleton-shimmer bg-transparent" />
              ) : posterUrl ? (
                <img
                  src={posterUrl}
                  alt={movie?.title}
                  className="w-full md:w-52 aspect-[2/3] object-cover rounded-lg shadow-2xl"
                />
              ) : (
                <div className="w-full md:w-52 aspect-[2/3] rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-sm text-muted-foreground text-center px-4">
                    {movie?.title}
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4 skeleton-shimmer bg-transparent" />
                  <Skeleton className="h-4 w-1/3 skeleton-shimmer bg-transparent" />
                  <Skeleton className="h-4 w-1/2 skeleton-shimmer bg-transparent" />
                  <Skeleton className="h-20 w-full skeleton-shimmer bg-transparent" />
                </div>
              ) : (
                <>
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-3">
                    {movie?.title}
                  </h2>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {movie?.release_date && (
                      <span className="text-sm font-semibold text-foreground bg-secondary px-2 py-0.5 rounded">
                        {getReleaseYear(movie.release_date)}
                      </span>
                    )}
                    {movie?.runtime && (
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      <Star className="w-4 h-4 fill-[#e50914] text-[#e50914]" />
                      <span className="text-foreground">
                        {movie?.vote_average.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        / 10
                      </span>
                    </span>
                  </div>

                  {/* Genres */}
                  {movie?.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movie.genres.map((g) => (
                        <Badge
                          key={g.id}
                          className="bg-[#e50914]/20 text-[#e50914] border border-[#e50914]/30 hover:bg-[#e50914]/30"
                        >
                          {g.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Overview */}
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base mb-6">
                    {movie?.overview}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      data-ocid="tmdb_detail.primary_button"
                      onClick={handlePlayTrailer}
                      className="bg-white text-black hover:bg-white/90 font-bold gap-2"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      Play Trailer
                    </Button>
                    <Button
                      data-ocid="tmdb_detail.secondary_button"
                      variant="outline"
                      onClick={handleWatchlistToggle}
                      className={`gap-2 border-border hover:border-white ${
                        inWatchlist ? "text-[#e50914] border-[#e50914]/50" : ""
                      }`}
                    >
                      {inWatchlist ? (
                        <>
                          <Check className="w-4 h-4" /> In Watchlist
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-4 h-4" /> Add to Watchlist
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
        <DialogContent
          className="max-w-3xl w-full p-0 overflow-hidden bg-black border-border"
          data-ocid="tmdb_detail.dialog"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Movie Trailer</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <button
              type="button"
              data-ocid="tmdb_detail.close_button"
              onClick={() => setTrailerOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            {trailer && (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                  title="Movie Trailer"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
