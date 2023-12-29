import { useEffect, useState } from "react";

export function useLocalStorage(key, initialState) {
    const [value, setValue] = useState(function () {
        const storedValue = localStorage.getItem("watched");
        return storedValue ? JSON.parse(storedValue) : initialState;
    });
    useEffect(
        function () {
            localStorage.setItem(key, JSON.stringify(value));
        },
        [key, value]
    );

    return [value, setValue];
}
