export default function App() {
    return (
        <>
            <Nav />
        </>
    );
}

function Nav() {
    return (
        <nav className="nav flex container">
            <div className="nav__left brand">🍿 moviePedia</div>
            <div className="nav__center">
                <input placeholder="Search movie" />
            </div>
            <div className="nav__right">Found 10 results</div>
        </nav>
    );
}
