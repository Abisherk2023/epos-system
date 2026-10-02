import { useEffect, useState } from "react";
import api from "../api/axios";

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const [formData, setFormData] = useState({
        id: null,
        name: "",
        sku: "",
        price: "",
        cost_price: "",
        stock_quantity: "",
        category_id: "",
        image_url: ""
    });

    // =========================
    // FETCH DATA
    // =========================

    const fetchProducts = async () => {
        try {
            const response = await api.get("/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // =========================
    // FORM HANDLERS
    // =========================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({
            id: null,
            name: "",
            sku: "",
            price: "",
            cost_price: "",
            stock_quantity: "",
            category_id: "",
            image_url: ""
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (formData.id) {
                // UPDATE PRODUCT
                await api.put(`/products/${formData.id}`, {
                    name: formData.name,
                    sku: formData.sku,
                    price: formData.price,
                    cost_price: formData.cost_price,
                    stock_quantity: formData.stock_quantity,
                    category_id: formData.category_id,
                    image_url: formData.image_url
                });

                alert("Product updated successfully!");
            } else {
                // ADD PRODUCT
                await api.post("/products", {
                    name: formData.name,
                    sku: formData.sku,
                    price: formData.price,
                    cost_price: formData.cost_price,
                    stock_quantity: formData.stock_quantity,
                    category_id: formData.category_id,
                    image_url: formData.image_url
                });

                alert("Product added successfully!");
            }

            resetForm();
            fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            alert(error.response?.data?.message || "Failed to save product");
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this product?");
        if (!confirmed) return;

        try {
            await api.delete(`/products/${id}`);
            alert("Product deleted successfully!");
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            alert(error.response?.data?.message || "Failed to delete product");
        }
    };

    const handleEdit = (product) => {
        setFormData({
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            cost_price: product.cost_price,
            stock_quantity: product.stock_quantity,
            category_id: product.category_id || "",
            image_url: product.image_url || ""
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // =========================
    // FILTER LOGIC
    // =========================

    const filteredProducts = products.filter((product) => {
        const name = product.name ? product.name.toLowerCase() : "";
        const sku = product.sku ? product.sku.toLowerCase() : "";
        const search = searchTerm.toLowerCase();

        const matchesSearch = name.includes(search) || sku.includes(search);
        const matchesCategory =
            selectedCategory === "" ||
            String(product.category_id) === String(selectedCategory);

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="products-page">
            {/* Header */}
            <div className="products-header">
                <div>
                    <h2>📦 Product Management</h2>
                    <p>Add, update and manage your products.</p>
                </div>
                <div className="product-count">{filteredProducts.length} Products</div>
            </div>

            {/* Form */}
            <div className="product-form-card">
                <h3>{formData.id ? "✏️ Edit Product" : "➕ Add Product"}</h3>

                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-field">
                        <label htmlFor="name">Product Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Enter product name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="sku">SKU</label>
                        <input
                            id="sku"
                            type="text"
                            name="sku"
                            placeholder="Enter SKU"
                            value={formData.sku}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="image_url">Product Image URL</label>
                        <input
                            id="image_url"
                            type="text"
                            name="image_url"
                            placeholder="Enter image URL"
                            value={formData.image_url}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="category_id">Category</label>
                        <select
                            id="category_id"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="price">Selling Price</label>
                        <input
                            id="price"
                            type="number"
                            name="price"
                            placeholder="Selling price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="cost_price">Cost Price</label>
                        <input
                            id="cost_price"
                            type="number"
                            name="cost_price"
                            placeholder="Cost price"
                            value={formData.cost_price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="stock_quantity">Stock Quantity</label>
                        <input
                            id="stock_quantity"
                            type="number"
                            name="stock_quantity"
                            placeholder="Stock quantity"
                            value={formData.stock_quantity}
                            onChange={handleChange}
                            min="0"
                            required
                        />
                    </div>

                    <div className="product-form-buttons">
                        <button type="submit" className="primary-button">
                            {formData.id ? "Update Product" : "Add Product"}
                        </button>

                        {formData.id && (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={resetForm}
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Filters */}
            <div className="product-filter-card">
                <h3>🔍 Find Products</h3>
                <div className="product-filters">
                    <div className="filter-field">
                        <label htmlFor="productSearch">Search</label>
                        <input
                            type="text"
                            name="productSearch"
                            id="productSearch"
                            placeholder="Search product or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-field">
                        <label htmlFor="categoryFilter">Category</label>
                        <select
                            name="categoryFilter"
                            id="categoryFilter"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="product-list-card">
                <div className="product-list-header">
                    <h3>📋 Products</h3>
                    <span>{filteredProducts.length} results</span>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <p>No products found.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>SKU</th>
                                    <th>Image</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Cost Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>
                                            <strong>{product.name}</strong>
                                        </td>
                                        <td>{product.sku}</td>
                                        <td>
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="product-table-image"
                                                />
                                            ) : (
                                                <span className="no-image">No Image</span>
                                            )}
                                        </td>
                                        <td>{product.category_name || "No Category"}</td>
                                        <td>Rs. {Number(product.price).toFixed(2)}</td>
                                        <td>Rs. {Number(product.cost_price).toFixed(2)}</td>
                                        <td>{product.stock_quantity}</td>
                                        <td>
                                            {Number(product.stock_quantity) === 0 ? (
                                                <span className="stock-danger">Out of Stock</span>
                                            ) : Number(product.stock_quantity) <= 5 ? (
                                                <span className="stock-warning">Low Stock</span>
                                            ) : (
                                                <span className="stock-success">In Stock</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="product-action-buttons">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
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

export default Products;