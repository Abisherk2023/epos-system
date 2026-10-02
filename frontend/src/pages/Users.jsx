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
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =========================
    // FETCH USERS
    // =========================

    const fetchUsers = async () => {

        try {

            const response = await api.get("/users");

            setUsers(response.data);

        } catch (error) {

            console.error(
                "Error fetching users:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load users"
            );
        }
    };

    // =========================
    // LOAD USERS
    // =========================

    useEffect(() => {

        fetchUsers();

    }, []);

    // =========================
    // HANDLE INPUT
    // =========================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // =========================
    // CREATE USER
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {

            await api.post("/users", formData);

            setMessage(
                "User created successfully"
            );

            setFormData({
                name: "",
                email: "",
                password: "",
                role: "cashier"
            });

            fetchUsers();

        } catch (error) {

            console.error(
                "Error creating user:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to create user"
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // DELETE USER
    // =========================

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmed) {
            return;
        }

        setMessage("");
        setError("");

        try {

            await api.delete(`/users/${id}`);

            setMessage(
                "User deleted successfully"
            );

            fetchUsers();

        } catch (error) {

            console.error(
                "Error deleting user:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to delete user"
            );
        }
    };

    return (
        <div className="users-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="users-header">

                <div>
                    <h2>👥 User Management</h2>

                    <p>
                        Manage EPOS system users and their roles.
                    </p>
                </div>

                <div className="user-count">
                    {users.length} Users
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
                CREATE USER FORM
            ========================= */}

            <div className="user-form-card">

                <h3>➕ Create New User</h3>

                <form
                    className="user-form"
                    onSubmit={handleSubmit}
                >

                    <div className="user-form-field">

                        <label htmlFor="name">
                            Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter name"
                            required
                        />

                    </div>


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
                            placeholder="Enter email"
                            required
                        />

                    </div>


                    <div className="user-form-field">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                        />

                    </div>


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
                                Cashier
                            </option>

                            <option value="admin">
                                Admin
                            </option>
                        </select>

                    </div>


                    <div className="user-form-button">

                        <button
                            type="submit"
                            className="create-user-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating..."
                                : "➕ Create User"
                            }
                        </button>

                    </div>

                </form>

            </div>


            {/* =========================
                USER LIST
            ========================= */}

            <div className="users-list-card">

                <div className="users-list-header">

                    <h3>
                        📋 System Users
                    </h3>

                    <span>
                        {users.length} users
                    </span>

                </div>


                {users.length === 0 ? (

                    <div className="empty-state">

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

                                {users.map((user) => (

                                    <tr key={user.id}>

                                        <td>
                                            #{user.id}
                                        </td>

                                        <td>
                                            <strong>
                                                {user.name}
                                            </strong>
                                        </td>

                                        <td>
                                            {user.email}
                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    user.role === "admin"
                                                        ? "role-admin"
                                                        : "role-cashier"
                                                }
                                            >
                                                {user.role}
                                            </span>

                                        </td>

                                        <td>
                                            {new Date(
                                                user.created_at
                                            ).toLocaleString()}
                                        </td>

                                        <td>

                                            <button
                                                className="delete-user-button"
                                                onClick={() =>
                                                    handleDelete(user.id)
                                                }
                                            >
                                                🗑️ Delete
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Users;