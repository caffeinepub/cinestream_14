import { useTMDBByGenre } from "../hooks/useTMDB";
import { TMDBMovieRowUI } from "./TMDBMovieRow";

interface TMDBGenreRowProps {
  title: string;
  genreId: number;
}

export default function TMDBGenreRow({ title, genreId }: TMDBGenreRowProps) {
  const { data, isLoading, isError } = useTMDBByGenre(genreId);
  return (
    <TMDBMovieRowUI
      title={title}
      movies={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
