import React from "react";

const IMG_API = "https://image.tmdb.org/t/p/w1280";

interface MovieProps {
  title: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
}

const setVoteClass = (vote: number): string => {
  if (vote >= 8) {
    return "green";
  } else if (vote >= 6) {
    return "orange";
  } else {
    return "red";
  }
};

const Movie: React.FC<MovieProps> = ({
  title,
  poster_path,
  overview,
  vote_average,
}) => (
  <div className="movie">
    <img
      src={
        poster_path
          ? IMG_API + poster_path
          : "https://images.unsplash.com/photo-1538152911114-73f1aa6d6128?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=975&q=80"
      }
      alt={title}
    />
    <div className="movie-info">
      <h3>{title}</h3>
      <span className={`tag ${setVoteClass(vote_average)}`}>
        {vote_average}
      </span>
    </div>

    <div className="movie-over">
      <h2>Overview:</h2>
      <p>{overview}</p>
    </div>
  </div>
);

export default Movie;
