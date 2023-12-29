import { useEffect } from "react";

export function useKeyPress(key, action) {
    useEffect(
        function () {
            function callback(e) {
                if (e.key.toLowerCase() === key.toLowerCase()) {
                    action();
                }
            }

            document.addEventListener("keydown", callback);
            return () => document.removeEventListener("keydown", callback);
        },
        [key, action]
    );
}
