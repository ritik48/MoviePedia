import { useEffect, useState } from "react";

export function useMovies(search, callback) {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [movies, setMovies] = useState([]);

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
                return;
            }

            callback(null);
            setMovies([]);
            fetchMovies();

            // cleanup function to stop the request when the component re-renders so that a lot of request is not fired at once
            return function () {
                controller.abort();
            };
        },
        [search, callback]
    );

    return {error, movies, loading}
}