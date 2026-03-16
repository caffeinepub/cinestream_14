import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { TMDBMovie } from "../types/tmdb";
import SectionHeader from "./SectionHeader";
import TMDBMovieCard from "./TMDBMovieCard";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

function SkeletonCard() {
  return (
    <div
      className="flex-shrink-0 w-36 sm:w-40 md:w-44"
      data-ocid="tmdb_card.loading_state"
    >
      <Skeleton className="aspect-[2/3] rounded-md skeleton-shimmer bg-transparent" />
      <Skeleton className="mt-2 h-3 w-3/4 rounded skeleton-shimmer bg-transparent" />
      <Skeleton className="mt-1 h-3 w-1/2 rounded skeleton-shimmer bg-transparent" />
    </div>
  );
}

interface TMDBMovieRowUIProps {
  title: string;
  label?: string;
  movies: TMDBMovie[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function TMDBMovieRowUI({
  title,
  label,
  movies,
  isLoading,
  isError,
}: TMDBMovieRowUIProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-10 group/row" data-ocid="tmdb_row.section">
      <SectionHeader title={title} label={label} />

      {isError && (
        <p
          className="px-4 sm:px-8 text-sm text-red-500 mb-4"
          data-ocid="tmdb_row.error_state"
        >
          Unable to load movies. Please try again later.
        </p>
      )}

      {!isError && (
        <div className="relative">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-4 z-10 w-12 bg-gradient-to-r from-background to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-white" />
            </div>
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-8 pb-4"
            style={{ overflowY: "visible", WebkitOverflowScrolling: "touch" }}
          >
            {isLoading
              ? SKELETON_KEYS.map((k) => <SkeletonCard key={k} />)
              : (movies ?? []).map((movie, i) => (
                  <TMDBMovieCard key={movie.id} movie={movie} index={i + 1} />
                ))}
          </div>

          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-4 z-10 w-12 bg-gradient-to-l from-background to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      )}
    </section>
  );
}
