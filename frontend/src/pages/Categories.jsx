import { useEffect, useState } from "react";
import api from "../api/axios";

function Categories() {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("");

    // =========================
    // FETCH CATEGORIES
    // =========================
    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    // =========================
    // INITIAL LOAD
    // =========================
    useEffect(() => {
        fetchCategories();
    }, []);

    // =========================
    // ADD CATEGORY
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("Please enter a category name");
            return;
        }

        try {
            await api.post("/categories", {
                name: name.trim()
            });

            alert("Category added successfully!");
            setName("");
            fetchCategories();
        } catch (error) {
            console.error("Error adding category:", error);
            alert(
                error.response?.data?.message || "Failed to add category"
            );
        }
    };

    return (
        <div className="categories-page">
            {/* =========================
                PAGE HEADER
            ========================= */}
            <div className="categories-header">
                <div>
                    <h2>📁 Category Management</h2>
                    <p>Create and manage product categories.</p>
                </div>
                <div className="category-count">
                    {categories.length} Categories
                </div>
            </div>

            {/* =========================
                ADD CATEGORY
            ========================= */}
            <div className="category-form-card">
                <h3>➕ Add Category</h3>
                <form onSubmit={handleSubmit} className="category-form">
                    <div className="category-input">
                        <label htmlFor="categoryName">Category Name</label>
                        <input
                            id="categoryName"
                            type="text"
                            name="categoryName"
                            placeholder="Enter category name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="category-add-button">
                        Add Category
                    </button>
                </form>
            </div>

            {/* =========================
                CATEGORY LIST
            ========================= */}
            <div className="category-list-card">
                <div className="category-list-header">
                    <h3>📋 Categories</h3>
                    <span>{categories.length} categories</span>
                </div>

                {categories.length === 0 ? (
                    <div className="empty-state">
                        <p>No categories found.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.id}>
                                        <td>{category.id}</td>
                                        <td>
                                            <strong>{category.name}</strong>
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

export default Categories;