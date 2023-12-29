import { useEffect, useRef, useState } from "react";
import { StarRating } from "star-ratings-react";

export default function App() {
    const [search, setSearch] = useState("");

    const [movies, setMovies] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);

    // get the watched movies stored in the localstorage
    const [watchedMovies, setWatchedMovies] = useState(function () {
        return JSON.parse(localStorage.getItem("watched"));
    });

    function handleSelectMovie(id) {
        setSelected((selected) => (id !== selected ? id : null));
    }

    function handleCloseMovie(id) {
        setSelected(null);
    }

    function handleAddWatchedWmovie(movie) {
        setWatchedMovies((watched) => [...watched, movie]);
    }

    function handleDeleteMovie(id) {
        setWatchedMovies((movies) => movies.filter((movie) => movie.id !== id));
    }

    // store watched movies in local storage
    // we have used useEffect, as watched movies wil be inserted and deleted automatically
    // as it is in sync with watchedMovie (dependency array)
    useEffect(
        function () {
            localStorage.setItem("watched", JSON.stringify(watchedMovies));
        },
        [watchedMovies]
    );

    useEffect(
        function () {
            const controller = new AbortController();
            async function fetchMovies() {
                setError("");
                setLoading(true);
                try {
                    const res = await fetch(
                        "https://omdbapi.com/?apikey=34d0a473&s=" + search,
                        { signal: controller.signal }
                    );
                    if (!res.ok) {
                        throw new Error("😐 Something went wrong");
                    }
                    const data = await res.json();

                    if (data.Response !== "True") {
                        throw new Error("😫 Cannot find any movie !!!");
                    }
                    setMovies(data.Search);
                    setError("");
                } catch (err) {
                    if (err.name !== "AbortError") {
                        setError(err.message);
                    }
                } finally {
                    setLoading(false);
                }
            }
            if (search.length < 3) {
                setMovies([]);
                setError("");
                setSelected(null);
                return;
            }
            setSelected(null);
            setMovies([]);
            fetchMovies();

            // cleanup function to stop the request when the component re-renders so that a lot of request is not fired at once
            return function () {
                controller.abort();
            };
        },
        [search]
    );

    return (
        <>
            <Nav setSearch={setSearch} search={search} movies={movies} />
            <div className="container box-container">
                <Box>
                    {loading && <Loader />}
                    {error && <div className="error">{error}</div>}
                    {!loading && !error && !movies.length && (
                        <p className="error">Search something 🤔</p>
                    )}
                    {!loading && !error && (
                        <MovieList
                            movies={movies}
                            onSelectMovie={handleSelectMovie}
                            selected={selected}
                        />
                    )}
                </Box>
                <Box>
                    {selected ? (
                        <MovieDetail
                            selected={selected}
                            onCloseMovie={handleCloseMovie}
                            onAddWatchMovie={handleAddWatchedWmovie}
                            watchedMovies={watchedMovies}
                            key={selected + "9874"}
                        />
                    ) : (
                        <>
                            <WatchedMoviesStats movies={watchedMovies} />
                            <WatchedMoviesList
                                movies={watchedMovies}
                                onDeleteMovie={handleDeleteMovie}
                            />
                        </>
                    )}
                </Box>
            </div>
            <Footer />
        </>
    );
}

function WatchedMoviesStats({ movies }) {
    const totalMovie = movies.length;
    const totalRuntime = movies.reduce(
        (total, movie) => total + movie.runtime,
        0
    );

    const avgRating =
        movies.reduce((total, movie) => total + movie.rating, 0) / totalMovie;

    const myAvgRating =
        movies.reduce((total, movie) => total + movie.myRating, 0) / totalMovie;

    return (
        <div className="watched-summary">
            <h3>MOVIES YOU WATCHED</h3>
            <div className="stats">
                <span>🎬 {totalMovie || 0}</span>
                <span>⭐ {avgRating ? avgRating.toFixed(1) : 0}</span>
                <span>🌟 {myAvgRating ? myAvgRating.toFixed(1) : 0}</span>
                <span>⏳ {totalRuntime} min</span>
            </div>
        </div>
    );
}

function WatchedMoviesList({ movies, onDeleteMovie }) {
    return (
        <div className="movie-list">
            {movies.map((movie) => (
                <WatchedMovie
                    movie={movie}
                    key={movie.id}
                    onDeleteMovie={onDeleteMovie}
                />
            ))}
        </div>
    );
}

function WatchedMovie({ movie, onDeleteMovie }) {
    const { title, rating, poster, myRating, runtime } = movie;
    return (
        <div className="watched-movie-container">
            <div className="watched-movie movie">
                <img src={`${poster}`} alt="movie" className="movie__image" />
                <div className="movie__detail">
                    <div className="title">{title}</div>
                    <div className="flex stats">
                        <span>⭐ {rating || 0}</span>
                        <span>🌟 {myRating || 0}</span>
                        <span>⏳ {runtime} min</span>
                    </div>
                </div>
            </div>
            <img
                src="/assets/close.svg"
                alt="close"
                className="close movie-close"
                onClick={() => onDeleteMovie(movie.id)}
            />
        </div>
    );
}

function Loader() {
    return <div className="loading">Loading...</div>;
}

function Nav({ setSearch, movies, search }) {
    const searchElement = useRef(null);

    // focus search input when enter is pressed
    useEffect(
        function () {
            function callback(e) {
                if (e.key === "Enter") {
                    if (document.activeElement === searchElement.current)
                        return;
                    console.log(e.key);
                    searchElement.current.focus();
                    setSearch("");
                }
            }

            document.addEventListener("keydown", callback);
            return () => document.removeEventListener("keydown", callback);
        },
        [setSearch]
    );

    return (
        <nav className="nav flex container">
            <div className="nav__left brand">
                🍿 <span className="brand">moviePedia</span>
            </div>
            <div className="nav__center">
                <input
                    value={search}
                    placeholder="Search movie"
                    onChange={(e) => setSearch(e.target.value)}
                    ref={searchElement}
                />
            </div>
            <div className="nav__right">Found {movies.length} results</div>
        </nav>
    );
}

function Box({ children }) {
    return <div className="box">{children}</div>;
}

function MovieList({ movies, onSelectMovie, selected }) {
    return (
        <div className="movie-list">
            {movies.map((movie) => (
                <Movie
                    movie={movie}
                    key={movie.imdbID}
                    onSelectMovie={onSelectMovie}
                    selected={selected}
                />
            ))}
        </div>
    );
}

function Movie({ movie, onSelectMovie, selected }) {
    const { Title, Year, Poster } = movie;
    return (
        <div
            className={`movie ${selected === movie.imdbID ? "selected" : ""}`}
            onClick={() => onSelectMovie(movie.imdbID)}
        >
            <img src={`${Poster}`} alt="movie" className="movie__image" />
            <div className="movie__detail">
                <div className="title">{Title}</div>
                <span>🗓️ {Year}</span>
            </div>
        </div>
    );
}

function MovieDetail({
    selected,
    onCloseMovie,
    onAddWatchMovie,
    watchedMovies,
}) {
    const [movie, setMovie] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [myRating, setMyRating] = useState(0);

    const {
        Title: title,
        Released: released,
        Runtime: runtime,
        Genre: genre,
        imdbRating: rating,
        Poster: poster,
        Plot: plot,
        Actors: actors,
        Director: director,
    } = movie;

    const isWatched = watchedMovies.map((m) => m.id).includes(selected);
    const watchedUserRating = watchedMovies.find(
        (movie) => movie.id === selected
    )?.myRating;

    function addToWatchedList() {
        onAddWatchMovie({
            id: selected,
            runtime: Number(runtime.split(" ")[0]),
            rating: Number(rating),
            myRating,
            poster,
            title,
        });
        onCloseMovie();
    }

    // close the movie details when esc is pressed
    useEffect(
        function () {
            function callback(e) {
                if (e.key === "Escape") {
                    console.log(e.key);
                    onCloseMovie();
                }
            }
            document.addEventListener("keydown", callback);

            return function () {
                document.removeEventListener("keydown", callback);
            };
        },
        [onCloseMovie]
    );

    useEffect(
        function () {
            async function fetchMovieDetails() {
                setError("");
                setLoading(true);
                try {
                    const res = await fetch(
                        "https://omdbapi.com/?apikey=34d0a473&i=" + selected
                    );

                    if (!res.ok) {
                        throw new Error("😐 Something went wrong.");
                    }
                    const data = await res.json();
                    setMovie(data);
                } catch (e) {
                    setError(e.message);
                } finally {
                    setLoading(false);
                }
            }
            fetchMovieDetails();
        },
        [selected]
    );

    // setting the title of the page to the selected movie
    useEffect(
        function () {
            if (!title) return;
            document.title = `Movie | ${title}`;

            return function () {
                document.title = "MoviePedia";
            };
        },
        [title]
    );

    return (
        <div className="movie-detail">
            {error && <div className="error">😐 {error}</div>}
            {loading && <Loader />}
            {!loading && !error && (
                <>
                    <div className="movie-detail__head flex">
                        <img
                            src={`${poster}`}
                            className="movie-detail__image"
                            alt="movie"
                        />
                        <div className="movie-detail__right flex">
                            <h2>{title}</h2>
                            <span>
                                {released} &#183; {runtime}
                            </span>
                            <span>{genre}</span>
                            <span>⭐ {rating} IMDb rating </span>
                        </div>
                        <img
                            src="/assets/close.svg"
                            alt="close"
                            className="close"
                            onClick={onCloseMovie}
                        />
                    </div>

                    <section>
                        <div className="star-cont">
                            {!isWatched ? (
                                <>
                                    <StarRating
                                        size={25}
                                        rating={myRating}
                                        textColor="white"
                                        onSetRating={setMyRating}
                                    />
                                    {myRating > 0 && (
                                        <button
                                            className="add-btn"
                                            onClick={addToWatchedList}
                                        >
                                            Add to watch list +
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p>
                                    You rated this movie {watchedUserRating} 🌟
                                </p>
                            )}
                        </div>
                        <div className="movie_about">
                            <div className="plot">{plot}</div>
                            <div className="actors">Starring {actors}</div>
                            <div>Directed by {director}</div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}

function Footer() {
    const style = {
        color: "rgb(224, 224, 224)",
        textAlign: "center",
        backgroundColor: "rgb(40, 40, 40)",
        textDecoration: "none",
    };
    return (
        <div style={style} className="footer">
            Made with ❤️ by{" "}
            <a href="https://github.com/ritik48" target="blank_">
                Ritik
            </a>
        </div>
    );
}
