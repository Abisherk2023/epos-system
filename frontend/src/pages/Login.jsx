import { useState } from "react";
import api from "../api/axios";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Please enter your email.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email: trimmedEmail,
                password
            });

            const token = response.data?.token;
            const loggedInUser = response.data?.user;

            if (!token || !loggedInUser) {
                setError("Invalid login response from server.");
                return;
            }

            // Save authentication information
            localStorage.setItem("token", token);
            localStorage.setItem(
                "user",
                JSON.stringify(loggedInUser)
            );

            // Continue to the application
            onLogin(loggedInUser);

        } catch (error) {
            console.error("Login error:", error);

            if (error.response?.status === 401) {
                setError(
                    error.response?.data?.message ||
                    "Invalid email or password."
                );
            } else if (error.response?.status === 403) {
                setError(
                    error.response?.data?.message ||
                    "You are not allowed to access the system."
                );
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError(
                    "Unable to connect to the server. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-logo">
                    🛒
                </div>

                <h2>EPOS System</h2>

                <p className="login-subtitle">
                    Sign in to continue
                </p>

                {error && (
                    <div className="login-error">
                        ❌ {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>

                    <div className="login-field">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            placeholder="Enter your email"
                            autoComplete="email"
                            disabled={loading}
                            required
                        />

                    </div>

                    <div className="login-field">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            disabled={loading}
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "⏳ Signing in..."
                            : "🔐 Login"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;