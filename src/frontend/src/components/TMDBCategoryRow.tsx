import {
  useTMDBNowPlaying,
  useTMDBPopular,
  useTMDBTopRated,
  useTMDBUpcoming,
} from "../hooks/useTMDB";
import { TMDBMovieRowUI } from "./TMDBMovieRow";

type Category = "popular" | "top_rated" | "upcoming" | "now_playing";

const CATEGORY_LABELS: Record<Category, string> = {
  popular: "POPULAR",
  top_rated: "TOP RATED",
  upcoming: "UPCOMING",
  now_playing: "NEW",
};

interface TMDBCategoryRowProps {
  title: string;
  category: Category;
}

export default function TMDBCategoryRow({
  title,
  category,
}: TMDBCategoryRowProps) {
  const popular = useTMDBPopular();
  const topRated = useTMDBTopRated();
  const upcoming = useTMDBUpcoming();
  const nowPlaying = useTMDBNowPlaying();

  const queryMap = {
    popular,
    top_rated: topRated,
    upcoming,
    now_playing: nowPlaying,
  };

  const { data, isLoading, isError } = queryMap[category];

  return (
    <TMDBMovieRowUI
      title={title}
      label={CATEGORY_LABELS[category]}
      movies={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
