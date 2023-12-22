import { useEffect, useState } from "react";

export default function App() {
    const [search, setSearch] = useState("inception");
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    console.log("Render 1");

    useEffect(
        function () {
            async function fetchMovies() {
                setError("");
                setLoading(true);
                try {
                    const res = await fetch(
                        "https://omdbapi.com/?apikey=34d0a473&s=" + search
                    );
                    const result = await res.json();

                    if (result.Response !== "True") {
                        setMovies([]);
                        throw Error("😫 Cannot find any movie !!!");
                    }

                    const data = result["Search"];
                    setMovies(data);
                } catch (e) {
                    setError(e.message);
                } finally {
                    setLoading(false);
                }
            }
            if (search.length < 3) return;
            fetchMovies();
            console.log("Render 2");
        },
        [search]
    );

    return (
        <>
            <Nav onChange={setSearch} movies={movies} />
            <div className="container box-container">
                <Box>
                    {loading && <Loader />}
                    {error && <div className="error">{error}</div>}
                    {!loading && !error && <MovieList movies={movies} />}
                </Box>
                <Box />
            </div>
        </>
    );
}

function Loader() {
    return <div className="loading">Loading...</div>;
}

function Nav({ onChange, movies }) {
    return (
        <nav className="nav flex container">
            <div className="nav__left brand">🍿 moviePedia</div>
            <div className="nav__center">
                <input
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

function MovieList({ movies }) {
    return (
        <div className="movie-list">
            {movies.map((movie) => (
                <Movie movie={movie} key={movie.imdbID} />
            ))}
        </div>
    );
}

function Movie({ movie }) {
    const { Title, Year, Poster } = movie;
    return (
        <div className="movie">
            <img src={`${Poster}`} alt="movie" className="movie__image" />
            <div className="movie__detail">
                <div className="title">{Title}</div>
                <span>🗓️ {Year}</span>
            </div>
        </div>
    );
}
