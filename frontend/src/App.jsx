import { useState } from "react";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import POS from "./pages/POS";
import SalesHistory from "./pages/SalesHistory";
import Users from "./pages/Users";
import Reports from "./pages/Reports";

function App() {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("Invalid saved user:", error);
            localStorage.removeItem("user");
            return null;
        }
    });

    const [page, setPage] = useState(() => {
        return localStorage.getItem("currentPage") || "dashboard";
    });

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);

        const role = String(loggedInUser.role || "").toLowerCase();

        // Admin starts at Dashboard
        // Cashier starts at POS
        const defaultPage = role === "admin" ? "dashboard" : "pos";

        setPage(defaultPage);
        localStorage.setItem("currentPage", defaultPage);
    };

    const handlePageChange = (newPage) => {
        const role = String(user?.role || "").toLowerCase();

        const adminPages = [
            "dashboard",
            "categories",
            "products",
            "reports",
            "users"
        ];

        const cashierPages = [
            "pos",
            "sales"
        ];

        // Admin can access all pages
        if (role === "admin") {
            setPage(newPage);
            localStorage.setItem("currentPage", newPage);
            return;
        }

        // Cashier can only access POS and Sales History
        if (role === "cashier" && cashierPages.includes(newPage)) {
            setPage(newPage);
            localStorage.setItem("currentPage", newPage);
            return;
        }

        // If unauthorized page is requested
        if (
            role === "cashier" &&
            !cashierPages.includes(newPage)
        ) {
            setPage("pos");
            localStorage.setItem("currentPage", "pos");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("currentPage");

        setUser(null);
        setPage("dashboard");
    };

    // User is not logged in
    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    const role = String(user.role || "").toLowerCase();

    /*
     * Extra protection:
     * If a cashier somehow has "dashboard" saved
     * as the current page, send them to POS.
     */
    if (
        role === "cashier" &&
        !["pos", "sales"].includes(page)
    ) {
        return (
            <div>
                <Navbar
                    setPage={handlePageChange}
                    user={user}
                    onLogout={handleLogout}
                />

                <div className="page-container">
                    <POS />
                </div>
            </div>
        );
    }

    return (
        <div>

            <Navbar
                setPage={handlePageChange}
                user={user}
                onLogout={handleLogout}
            />

            <div className="page-container">

                {/* ADMIN PAGES */}

                {page === "dashboard" &&
                    role === "admin" && (
                        <Dashboard />
                    )}

                {page === "categories" &&
                    role === "admin" && (
                        <Categories />
                    )}

                {page === "products" &&
                    role === "admin" && (
                        <Products />
                    )}

                {page === "reports" &&
                    role === "admin" && (
                        <Reports />
                    )}

                {page === "users" &&
                    role === "admin" && (
                        <Users />
                    )}

                {/* ADMIN + CASHIER */}

                {page === "pos" && (
                    <POS />
                )}

                {page === "sales" && (
                    <SalesHistory />
                )}

            </div>

        </div>
    );
}

export default App;