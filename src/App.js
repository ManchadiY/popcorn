import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useKey } from "./useKey";
import { useLocalStorageState } from "./useLocalStorageState";
import { useMovies } from "./useMovies";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "f84fc31d";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query);

  const [watched, setWatched] = useLocalStorageState([], "watched");

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔️</span> {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar grid grid-cols-1 lg:grid-cols-3 gap-1 items-center px-5 lg:px-10 bg-[#6741d9] rounded-md lg:h-[7.2rem]">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo flex items-center gap-0.5">
      <span role="img" className="text-6xl">🍿</span>
      <h1 className="text-4xl text-[#fff] font-semibold">usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search justify-self-center lg:max-w-3xl w-full border-none p-5 text-2xl rounded-xl text-[#dee2e6] bg-[#7950f2] transition-all duration-300"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results text-2xl justify-self-end">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main my-10 flex flex-col-reverse lg:flex-row justify-center gap-20 px-5 lg:px-20 lg:h-[calc(100vh-12.2rem)]">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box flex-1 bg-[#2b3035] rounded-xl relative h-full min-h-20">
      <button className="btn-toggle absolute top-4 right-4 h-10 aspect-square text-[#dee2e6] text-xl font-bold cursor-pointer z-50 rounded-full border-none bg-[#212529]" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

/*
function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>

      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </>
      )}
    </div>
  );
}
*/

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies list-none py-3 relative h-full overflow-y-auto custom-scrollbar">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)} className="grid grid-cols-[4rem_1fr] grid-rows-[auto_auto] gap-x-6 text-[1.6rem] items-center p-5 cursor-pointer border-b border-[#343a40] hover:bg-[#343a40]">
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <div>
        <h3>{movie.Title}</h3>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  // if (imdbRating > 8) return <p>Greatest ever!</p>;
  // if (imdbRating > 8) [isTop, setIsTop] = useState(true);

  // const [isTop, setIsTop] = useState(imdbRating > 8);
  // console.log(isTop);
  // useEffect(
  //   function () {
  //     setIsTop(imdbRating > 8);
  //   },
  //   [imdbRating]
  // );

  const isTop = imdbRating > 8;
  console.log(isTop);

  // const [avgRating, setAvgRating] = useState(0);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();

    // setAvgRating(Number(imdbRating));
    // setAvgRating((avgRating) => (avgRating + userRating) / 2);
  }

  useKey("Escape", onCloseMovie);

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "usePopcorn";
        // console.log(`Clean up effect for movie ${title}`);
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="px-5">
          <header>
            <button className="btn-back absolute left-2 top-2 bg-[#fff] h-14 w-14 rounded-full text-[#2b3035] text-4xl font-bold" onClick={onCloseMovie}>
              &larr;
            </button>
            <div className="details-overview flex gap-3 bg-[#343a40]">
              <img src={poster} alt={`Poster of ${movie} movie`} className="max-w-64" />
              <div className="space-y-5">
                <h2 className="text-4xl font-bold">{title}</h2>
                <p className="text-2xl">
                  {released} &bull; {runtime}
                </p>
                <p className="text-2xl">{genre}</p>
                <p className="text-2xl">
                  <span>⭐️</span>
                  {imdbRating} IMDb rating
                </p>
              </div>
            </div>
          </header>

          {/* <p>{avgRating}</p> */}

          <section>
            <div className="rating p-5 my-5 bg-[#343a40] max-w-fit mx-auto rounded-lg">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add w-full bg-[#6741d9] text-[#dee2e6] font-bold text-xl py-3 mt-5 rounded-3xl hover:bg-[#7950f2]" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p className="text-xl bg-[#343a40] rounded-lg font-semibold">
                  You rated with movie {watchedUserRating} <span>⭐️</span>
                </p>
              )}
            </div>
            <p className="text-xl my-3">
              <em>{plot}</em>
            </p>
            <p className="text-xl my-3">Starring {actors}</p>
            <p className="text-xl">Directed by {director}</p>
          </section>
        </div >
      )
      }
    </div >
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary p-10 bg-[#343a40] rounded-xl">
      <h2 className="text-3xl uppercase font-bold mb-5">Movies you watched</h2>
      <div className="flex justify-between font-semibold text-2xl">
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li className="flex items-center gap-5 p-5 border-b border-[#343a40]">
      <img src={movie.poster} alt={`${movie.title} poster`} className="w-20" />
      <div className="flex-1">
        <h3 className="text-3xl font-bold mb-2">{movie.title}</h3>
        <div className="flex text-2xl gap-10">
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>

        </div>
      </div>
      {/* <div className="flex-1"> */}
      <button
        className="btn-delete h-8 w-8 rounded-full border-none bg-[#fa5252] hover:bg-[#e03131]"
        onClick={() => onDeleteWatched(movie.imdbID)}
      >
        X
      </button>
      {/* </div> */}
    </li>
  );
}
