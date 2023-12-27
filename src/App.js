import { useEffect, useState } from "react";
import { StarRating } from "star-ratings-react";

export default function App() {
    const [search, setSearch] = useState("inception");
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);

    function handleSelectMovie(id) {
        setSelected((selected) => (id !== selected ? id : null));
    }

    function handleCloseMovie(id) {
        setSelected(null);
    }

    useEffect(
        function () {
            async function fetchMovies() {
                setError("");
                setLoading(true);
                try {
                    const res = await fetch(
                        "https://omdbapi.com/?apikey=34d0a473&s=" + search
                    );
                    if (!res.ok) {
                        throw new Error("😐 Something went wrong");
                    }
                    const data = await res.json();

                    if (data.Response !== "True") {
                        setSelected(null);
                        throw new Error("😫 Cannot find any movie !!!");
                    }
                    setMovies(data.Search);
                } catch (e) {
                    setError(e.message);
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
            fetchMovies();
        },
        [search]
    );

    return (
        <>
            <Nav onChange={setSearch} search={search} movies={movies} />
            <div className="container box-container">
                <Box>
                    {loading && <Loader />}
                    {error && <div className="error">{error}</div>}
                    {!loading && !error && (
                        <MovieList
                            movies={movies}
                            onSelectMovie={handleSelectMovie}
                        />
                    )}
                </Box>
                <Box>
                    {selected && (
                        <MovieDetail
                            selected={selected}
                            onCloseMovie={handleCloseMovie}
                        />
                    )}
                </Box>
            </div>
        </>
    );
}

function Loader() {
    return <div className="loading">Loading...</div>;
}

function Nav({ onChange, movies, search }) {
    return (
        <nav className="nav flex container">
            <div className="nav__left brand">
                🍿 <span className="brand">moviePedia</span>
            </div>
            <div className="nav__center">
                <input
                    value={search}
                    placeholder="Search movie"
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
            <div className="nav__right">Found {movies.length} results</div>
        </nav>
    );
}

function Box({ children }) {
    return <div className="box">{children}</div>;
}

function MovieList({ movies, onSelectMovie }) {
    return (
        <div className="movie-list">
            {movies.map((movie) => (
                <Movie
                    movie={movie}
                    key={movie.imdbID}
                    onSelectMovie={onSelectMovie}
                />
            ))}
        </div>
    );
}

function Movie({ movie, onSelectMovie }) {
    const { Title, Year, Poster } = movie;
    return (
        <div className="movie" onClick={() => onSelectMovie(movie.imdbID)}>
            <img src={`${Poster}`} alt="movie" className="movie__image" />
            <div className="movie__detail">
                <div className="title">{Title}</div>
                <span>🗓️ {Year}</span>
            </div>
        </div>
    );
}

function MovieDetail({ selected, onCloseMovie }) {
    const [movie, setMovie] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

    console.log("movie = ", movie);

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
                    setError("");
                }
            }
            fetchMovieDetails();
        },
        [selected]
    );

    return (
        <div className="movie-detail">
            {loading ? (
                <Loader />
            ) : (
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
                            <StarRating size={25} />
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
