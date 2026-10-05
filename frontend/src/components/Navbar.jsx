function Navbar({ setPage, user, onLogout }) {

    const role = String(user?.role || "").toLowerCase();

    const isAdmin = role === "admin";
    const isCashier = role === "cashier";

    return (
        <nav className="navbar">

            <h2 className="navbar-logo">
                🛒 EPOS System
            </h2>

            {/* ADMIN ONLY */}

            {isAdmin && (
                <button
                    className="navbar-button"
                    onClick={() => setPage("dashboard")}
                >
                    📊 Dashboard
                </button>
            )}

            {isAdmin && (
                <button
                    className="navbar-button"
                    onClick={() => setPage("categories")}
                >
                    📁 Categories
                </button>
            )}

            {isAdmin && (
                <button
                    className="navbar-button"
                    onClick={() => setPage("products")}
                >
                    📦 Products
                </button>
            )}

            {/* ADMIN + CASHIER */}

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

            {/* ADMIN ONLY */}

            {isAdmin && (
                <button
                    className="navbar-button"
                    onClick={() => setPage("reports")}
                >
                    📊 Reports
                </button>
            )}

            {isAdmin && (
                <button
                    className="navbar-button"
                    onClick={() => setPage("users")}
                >
                    👥 Users
                </button>
            )}

            <div className="navbar-user">
                👤 {user.name}
                <span className="navbar-role">
                    {isAdmin ? "Admin" : isCashier ? "Cashier" : "User"}
                </span>
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