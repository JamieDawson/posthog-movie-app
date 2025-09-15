import React, { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import Movie from "./components/Movie";
import "./App.css";

const FEATURED_API = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${
  import.meta.env.VITE_API_SECRET
}`;
const SEARCH_API = `https://api.themoviedb.org/3/search/movie?api_key=${
  import.meta.env.VITE_API_SECRET
}&query=`;

interface MovieType {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
}

function App() {
  const posthog = usePostHog();
  const [movies, setMovies] = useState<MovieType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getMovies(FEATURED_API);
  }, []);

  const getMovies = (API: string) => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.results || []);
      })
      .catch((err) => console.error("Error fetching movies:", err));
  };

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm) {
      fetch(SEARCH_API + searchTerm)
        .then((res) => res.json())
        .then((data) => {
          const results = data.results || [];
          setMovies(results);

          if (posthog) {
            posthog.capture("movie_search", {
              search_term: searchTerm,
              results_count: results.length,
            });
          }
        })
        .catch((err) => console.error("Error fetching search results:", err));
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    getMovies(FEATURED_API); // reload featured movies
  };

  //Pulls from the Posthog Query API!
  const handleFetchFavorite = async () => {
    try {
      const res = await fetch(
        "https://posthog-backend-movie-app.netlify.app/.netlify/functions/sheet"
      );
      const data: string[][] = await res.json();

      if (data.length > 0) {
        const favoriteMovies: MovieType[] = data.map(
          ([title, overview, poster, rating], index) => ({
            id: Date.now() + index, // unique id for each movie
            title,
            overview,
            poster_path: poster,
            vote_average: Number(rating),
          })
        );

        setMovies(favoriteMovies);
      }
    } catch (err) {
      console.error("Error fetching favorite movies:", err);
    }
  };

  return (
    <>
      <header>
        <div className="header-text">Movie search website built in React</div>
        <button type="button" className="button" onClick={handleClearSearch}>
          HOME
        </button>
        <button type="button" className="button" onClick={handleFetchFavorite}>
          Posthog Query API
        </button>
        <form onSubmit={handleOnSubmit}>
          <input
            className="search"
            type="search"
            placeholder="Search movie title"
            value={searchTerm}
            onChange={handleOnChange}
          />
        </form>
      </header>

      <div className="movie-container">
        {movies.length > 0 &&
          movies.map((movie) => <Movie key={movie.id} {...movie} />)}
      </div>
    </>
  );
}

export default App;
