import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Check, Play, Plus, Star } from "lucide-react";
import { useState } from "react";
import type { Movie } from "../backend";

interface MovieCardProps {
  movie: Movie;
  index: number;
  progress?: number;
  isInWatchlist?: boolean;
  onWatchlistToggle?: (movie: Movie) => void;
  isLoggedIn?: boolean;
}

export default function MovieCard({
  movie,
  index,
  progress,
  isInWatchlist = false,
  onWatchlistToggle,
  isLoggedIn = false,
}: MovieCardProps) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const thumbnailUrl =
    movie.thumbnailUrl && !imgError
      ? movie.thumbnailUrl
      : `https://picsum.photos/seed/${movie.id}/300/450`;

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWatchlistToggle?.(movie);
  };

  return (
    <div
      data-ocid={`movie_card.item.${index}`}
      className="group relative flex-shrink-0 w-40 sm:w-44 md:w-48 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to="/movie/$id" params={{ id: movie.id.toString() }}>
        {/* Thumbnail */}
        <div className="relative overflow-hidden rounded-md bg-secondary aspect-[2/3] transition-transform duration-300 ease-out group-hover:scale-105 card-glow-hover">
          <img
            src={thumbnailUrl}
            alt={movie.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Progress bar overlay */}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-[#e50914] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {/* Center play icon on hover */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center backdrop-blur-sm">
              <Play className="w-5 h-5 fill-white text-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Title below card */}
        <p className="mt-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate px-0.5">
          {movie.title}
        </p>
      </Link>

      {/* Expanded hover panel - Netflix style, appears below */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] z-50 w-60 bg-card border border-border rounded-lg shadow-2xl overflow-hidden transition-all duration-200 origin-top ${
          hovered
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{
          boxShadow: "0 24px 80px rgba(0,0,0,0.9), 0 0 40px rgba(229,9,20,0.2)",
        }}
      >
        {/* Thumbnail strip */}
        <div className="relative h-28 overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        </div>
        <div className="p-3">
          <p className="font-display font-bold text-foreground text-sm leading-tight mb-2 line-clamp-1">
            {movie.title}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <span className="flex items-center gap-0.5 text-xs">
              <Star className="w-3 h-3 fill-[#e50914] text-[#e50914]" />
              <span className="font-semibold text-foreground">
                {movie.rating.toFixed(1)}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              {Number(movie.year)}
            </span>
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-[#e50914]/20 text-[#e50914] border-[#e50914]/30 border">
              {movie.genre}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {movie.description}
          </p>
          <div className="flex items-center gap-2">
            <Link
              to="/movie/$id"
              params={{ id: movie.id.toString() }}
              className="flex-1"
            >
              <button
                type="button"
                className="w-full flex items-center justify-center gap-1.5 bg-white text-black text-xs font-bold rounded h-7 hover:bg-white/90 transition-colors"
              >
                <Play className="w-3 h-3 fill-black" /> Play
              </button>
            </Link>
            {isLoggedIn && (
              <button
                type="button"
                onClick={handleWatchlistClick}
                data-ocid={`movie_card.toggle.${index}`}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                  isInWatchlist
                    ? "border-[#e50914] bg-[#e50914]/20 text-[#e50914]"
                    : "border-border text-muted-foreground hover:border-white hover:text-white"
                }`}
              >
                {isInWatchlist ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
