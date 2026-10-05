import { useEffect, useState } from "react";
import api from "../api/axios";

function Users() {

    const [users, setUsers] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "cashier"
    });

    const [loading, setLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    /* =========================
       FETCH USERS
    ========================= */

    const fetchUsers = async (isRefresh = false) => {

        try {

            setError("");

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setUsersLoading(true);
            }

            const response = await api.get("/users");

            setUsers(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Error fetching users:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load users."
            );

        } finally {

            setUsersLoading(false);
            setRefreshing(false);

        }
    };


    /* =========================
       LOAD USERS
    ========================= */

    useEffect(() => {

        fetchUsers();

    }, []);


    /* =========================
       HANDLE INPUT
    ========================= */

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setMessage("");
        setError("");

    };


    /* =========================
       RESET FORM
    ========================= */

    const resetForm = () => {

        setFormData({
            name: "",
            email: "",
            password: "",
            role: "cashier"
        });

        setShowPassword(false);

    };


    /* =========================
       CREATE USER
    ========================= */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        /* =========================
           FRONTEND VALIDATION
        ========================= */

        const name = formData.name.trim();
        const email = formData.email.trim();
        const password = formData.password;


        if (!name) {

            setError("Please enter the user's name.");

            return;
        }


        if (!email) {

            setError("Please enter the user's email.");

            return;
        }


        if (password.length < 6) {

            setError(
                "Password must be at least 6 characters."
            );

            return;
        }


        setLoading(true);


        try {

            await api.post("/users", {
                name,
                email,
                password,
                role: formData.role
            });


            setMessage(
                "User created successfully."
            );


            resetForm();


            await fetchUsers();


        } catch (error) {

            console.error(
                "Error creating user:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to create user."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =========================
       DELETE USER
    ========================= */

    const handleDelete = async (id) => {

        const user = users.find(
            (item) => item.id === id
        );


        const confirmed = window.confirm(

            `Are you sure you want to delete ${
                user?.name || "this user"
            }?`

        );


        if (!confirmed) {
            return;
        }


        setMessage("");
        setError("");


        try {

            await api.delete(`/users/${id}`);


            setMessage(
                "User deleted successfully."
            );


            await fetchUsers();


        } catch (error) {

            console.error(
                "Error deleting user:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to delete user."
            );

        }

    };


    /* =========================
       USER STATISTICS
    ========================= */

    const adminCount = users.filter(
        (user) =>
            String(user.role).toLowerCase() ===
            "admin"
    ).length;


    const cashierCount = users.filter(
        (user) =>
            String(user.role).toLowerCase() ===
            "cashier"
    ).length;


    /* =========================
       FORMAT DATE
    ========================= */

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "N/A";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        return date.toLocaleString();

    };


    return (

        <div className="users-page">


            {/* =========================
                HEADER
            ========================= */}

            <div className="users-header">

                <div>

                    <h2>
                        👥 User Management
                    </h2>

                    <p>
                        Manage EPOS system users
                        and their roles.
                    </p>

                </div>


                <div className="users-header-actions">

                    <div className="user-count">

                        {users.length} Users

                    </div>


                    <button
                        className="refresh-users-button"
                        onClick={() =>
                            fetchUsers(true)
                        }
                        disabled={refreshing}
                    >

                        {refreshing
                            ? "⏳ Refreshing..."
                            : "🔄 Refresh"}

                    </button>

                </div>

            </div>


            {/* =========================
                MESSAGES
            ========================= */}

            {message && (

                <div className="users-success">

                    ✅ {message}

                </div>

            )}


            {error && (

                <div className="users-error">

                    ❌ {error}

                </div>

            )}


            {/* =========================
                USER STATISTICS
            ========================= */}

            <div className="user-statistics">


                {/* TOTAL */}

                <div className="user-stat-card">

                    <div className="user-stat-icon">
                        👥
                    </div>

                    <div>

                        <p>
                            Total Users
                        </p>

                        <h2>
                            {users.length}
                        </h2>

                    </div>

                </div>


                {/* ADMIN */}

                <div className="user-stat-card">

                    <div className="user-stat-icon">
                        🛡️
                    </div>

                    <div>

                        <p>
                            Administrators
                        </p>

                        <h2>
                            {adminCount}
                        </h2>

                    </div>

                </div>


                {/* CASHIER */}

                <div className="user-stat-card">

                    <div className="user-stat-icon">
                        💼
                    </div>

                    <div>

                        <p>
                            Cashiers
                        </p>

                        <h2>
                            {cashierCount}
                        </h2>

                    </div>

                </div>


            </div>


            {/* =========================
                CREATE USER FORM
            ========================= */}

            <div className="user-form-card">

                <div className="user-form-header">

                    <div>

                        <h3>
                            ➕ Create New User
                        </h3>

                        <p>
                            Add an administrator or cashier
                            to the EPOS system.
                        </p>

                    </div>

                </div>


                <form
                    className="user-form"
                    onSubmit={handleSubmit}
                >


                    {/* NAME */}

                    <div className="user-form-field">

                        <label htmlFor="name">
                            Full Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            autoComplete="name"
                            required
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="user-form-field">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            autoComplete="email"
                            required
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="user-form-field">

                        <label htmlFor="password">
                            Password
                        </label>


                        <div className="password-input-wrapper">

                            <input
                                id="password"
                                name="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Minimum 6 characters"
                                autoComplete="new-password"
                                minLength={6}
                                required
                            />


                            <button
                                type="button"
                                className="password-toggle-button"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >

                                {showPassword
                                    ? "🙈"
                                    : "👁️"}

                            </button>

                        </div>

                    </div>


                    {/* ROLE */}

                    <div className="user-form-field">

                        <label htmlFor="role">
                            Role
                        </label>

                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >

                            <option value="cashier">
                                💼 Cashier
                            </option>

                            <option value="admin">
                                🛡️ Admin
                            </option>

                        </select>

                    </div>


                    {/* BUTTONS */}

                    <div className="user-form-button">

                        <button
                            type="submit"
                            className="create-user-button"
                            disabled={loading}
                        >

                            {loading
                                ? "⏳ Creating..."
                                : "➕ Create User"}

                        </button>

                    </div>

                </form>

            </div>


            {/* =========================
                USER LIST
            ========================= */}

            <div className="users-list-card">

                <div className="users-list-header">

                    <div>

                        <h3>
                            📋 System Users
                        </h3>

                        <p>
                            All registered EPOS users
                        </p>

                    </div>


                    <span>
                        {users.length} users
                    </span>

                </div>


                {usersLoading ? (

                    <div className="loading-message">

                        ⏳ Loading users...

                    </div>

                ) : users.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-state-icon">
                            👥
                        </div>

                        <p>
                            No users found.
                        </p>

                    </div>

                ) : (

                    <div className="table-container">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Created
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {users.map(
                                    (user) => (

                                        <tr
                                            key={user.id}
                                        >

                                            <td>
                                                <strong>
                                                    #{user.id}
                                                </strong>
                                            </td>


                                            <td>

                                                <strong>
                                                    👤{" "}
                                                    {user.name}
                                                </strong>

                                            </td>


                                            <td>
                                                {user.email}
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        String(
                                                            user.role
                                                        ).toLowerCase() ===
                                                        "admin"
                                                            ? "role-admin"
                                                            : "role-cashier"
                                                    }
                                                >

                                                    {String(
                                                        user.role ||
                                                        "cashier"
                                                    ).toLowerCase() ===
                                                    "admin"
                                                        ? "🛡️ Admin"
                                                        : "💼 Cashier"}

                                                </span>

                                            </td>


                                            <td>
                                                {formatDate(
                                                    user.created_at
                                                )}
                                            </td>


                                            <td>

                                                <button
                                                    className="delete-user-button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            user.id
                                                        )
                                                    }
                                                    disabled={
                                                        loading
                                                    }
                                                >

                                                    🗑️ Delete

                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );

}

export default Users;