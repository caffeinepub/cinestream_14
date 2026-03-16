import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useState } from "react";
import { getReleaseYear, tmdbImage } from "../services/tmdb";
import type { TMDBMovie } from "../types/tmdb";

interface TMDBMovieCardProps {
  movie: TMDBMovie;
  index: number;
}

export default function TMDBMovieCard({ movie, index }: TMDBMovieCardProps) {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const posterUrl = tmdbImage(movie.poster_path, "w185");

  const handleClick = () => {
    navigate({ to: "/tmdb/$id", params: { id: movie.id.toString() } });
  };

  return (
    <button
      type="button"
      data-ocid={`tmdb_card.item.${index}`}
      className="group relative flex-shrink-0 w-36 sm:w-40 md:w-44 cursor-pointer text-left bg-transparent border-0 p-0"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden rounded-md bg-secondary aspect-[2/3] transition-transform duration-300 ease-out group-hover:scale-105 card-glow-hover">
        {!imgLoaded && !imgError && (
          <Skeleton className="absolute inset-0 skeleton-shimmer bg-transparent" />
        )}

        {posterUrl && !imgError ? (
          <img
            src={posterUrl}
            alt={movie.title}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              setImgLoaded(true);
            }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/80 p-4">
            <span className="text-xs text-center font-semibold text-foreground/70 leading-tight">
              {movie.title}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white/20 border-2 border-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg
              className="w-4 h-4 fill-white text-white ml-0.5"
              viewBox="0 0 24 24"
            >
              <title>Play</title>
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
      </div>

      <p className="mt-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate px-0.5">
        {movie.title}
      </p>
      <div className="flex items-center gap-2 mt-0.5 px-0.5">
        <span className="flex items-center gap-0.5 text-xs">
          <Star className="w-3 h-3 fill-[#e50914] text-[#e50914]" />
          <span className="font-semibold text-foreground text-xs">
            {movie.vote_average.toFixed(1)}
          </span>
        </span>
        {movie.release_date && (
          <span className="text-xs text-muted-foreground">
            {getReleaseYear(movie.release_date)}
          </span>
        )}
      </div>
    </button>
  );
}
