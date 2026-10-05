function Navbar({ setPage, user, onLogout, currentPage }) {

    const role = String(user?.role || "").toLowerCase();

    const isAdmin = role === "admin";

    const handleNavigation = (page) => {
        setPage(page);
    };

    const isActive = (page) => {
        return currentPage === page
            ? "navbar-button active"
            : "navbar-button";
    };

    return (
        <nav className="navbar">

            <h2 className="navbar-logo">
                🛒 EPOS System
            </h2>

            {/* ADMIN ONLY */}

            {isAdmin && (
                <button
                    className={isActive("dashboard")}
                    onClick={() => handleNavigation("dashboard")}
                >
                    📊 Dashboard
                </button>
            )}

            {isAdmin && (
                <button
                    className={isActive("categories")}
                    onClick={() => handleNavigation("categories")}
                >
                    📁 Categories
                </button>
            )}

            {isAdmin && (
                <button
                    className={isActive("products")}
                    onClick={() => handleNavigation("products")}
                >
                    📦 Products
                </button>
            )}

            {/* ADMIN + CASHIER */}

            <button
                className={isActive("pos")}
                onClick={() => handleNavigation("pos")}
            >
                🛒 POS Billing
            </button>

            <button
                className={isActive("sales")}
                onClick={() => handleNavigation("sales")}
            >
                🧾 Sales History
            </button>

            {/* ADMIN ONLY */}

            {isAdmin && (
                <button
                    className={isActive("reports")}
                    onClick={() => handleNavigation("reports")}
                >
                    📊 Reports
                </button>
            )}

            {isAdmin && (
                <button
                    className={isActive("users")}
                    onClick={() => handleNavigation("users")}
                >
                    👥 Users
                </button>
            )}

            <div className="navbar-user">
                👤 {user.name}

                <span className="navbar-role">
                    {isAdmin ? "Admin" : "Cashier"}
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