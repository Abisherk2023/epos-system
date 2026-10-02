function Navbar({ setPage, user, onLogout }) {
    return (
        <nav className="navbar">

            <h2 className="navbar-logo">
                🛒 EPOS System
            </h2>

            <button
                className="navbar-button"
                onClick={() => setPage("dashboard")}
            >
                📊 Dashboard
            </button>

            <button
                className="navbar-button"
                onClick={() => setPage("categories")}
            >
                📁 Categories
            </button>

            <button
                className="navbar-button"
                onClick={() => setPage("products")}
            >
                📦 Products
            </button>

            <button
                className="navbar-button"
                onClick={() => setPage("pos")}
            >
                🛒 POS Billing
            </button>

            <button
                className="navbar-button"
                onClick={() => setPage("sales")}
            >
                🧾 Sales History
            </button>

            <div className="navbar-user">
                👤 {user.name}
            </div>

            <button
                className="navbar-logout"
                onClick={onLogout}
            >
                🚪 Logout
            </button>

        </nav>
    );
}

export default Navbar;