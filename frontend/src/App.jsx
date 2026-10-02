import { useState } from "react";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import POS from "./pages/POS";
import SalesHistory from "./pages/SalesHistory";

function App() {

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    const [page, setPage] = useState("dashboard");

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);
        setPage("dashboard");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setPage("dashboard");
    };

    if (!user) {
        return (
            <Login onLogin={handleLogin} />
        );
    }

    return (
        <div>

            <Navbar
                setPage={setPage}
                user={user}
                onLogout={handleLogout}
            />

            <div className="page-container">

                {page === "dashboard" && (
                    <Dashboard />
                )}

                {page === "categories" && (
                    <Categories />
                )}

                {page === "products" && (
                    <Products />
                )}

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