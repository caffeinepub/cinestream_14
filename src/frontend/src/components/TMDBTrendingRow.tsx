import { useTMDBTrending } from "../hooks/useTMDB";
import { TMDBMovieRowUI } from "./TMDBMovieRow";

export default function TMDBTrendingRow() {
  const { data, isLoading, isError } = useTMDBTrending();
  return (
    <TMDBMovieRowUI
      title="Trending Now"
      movies={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
