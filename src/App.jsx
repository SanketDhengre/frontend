// src/App.jsx
import React, { useState } from "react";

function App() {
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profile, setProfile] = useState(null);
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            const res = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) throw new Error("Login failed");
            const data = await res.json();
            setToken(data.token);
            localStorage.setItem("token", data.token);
            alert("Login successful!");
        } catch (err) {
            alert(err.message);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await fetch("http://localhost:5000/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setProfile(data);
        } catch (err) {
            alert("Failed to fetch profile");
        }
    };

    const fetchProducts = async (page = 1, category = "") => {
        try {
            setLoading(true);
            let url = `http://localhost:5000/products?page=${page}&limit=5`;
            if (category) url += `&category=${category}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            setProducts(data.data || []);
            setCurrentPage(data.page);
            setTotalPages(Math.ceil(data.total / data.limit));

            // Update category state to reflect current filter
            if (category !== selectedCategory) {
                setSelectedCategory(category);
            }
        } catch (err) {
            alert("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchProducts(newPage, selectedCategory);
        }
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        // Reset to page 1 when category changes
        fetchProducts(1, category);
    };

    const clearFilters = () => {
        setSelectedCategory("");
        fetchProducts(1, "");
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginRight: "10px", padding: "5px" }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ marginRight: "10px", padding: "5px" }}
            />
            <button onClick={handleLogin} style={{ padding: "5px 10px" }}>
                Login
            </button>

            {token && (
                <>
                    <h3>Logged in</h3>
                    <button
                        onClick={fetchProfile}
                        style={{ marginBottom: "20px", padding: "5px 10px" }}
                    >
                        Fetch Profile
                    </button>
                    {profile && (
                        <div style={{ marginBottom: "20px" }}>
                            <p>Email: {profile.email}</p>
                            <p>Role: {profile.role}</p>
                        </div>
                    )}

                    <h3>Products</h3>

                    {/* Filtering Controls */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ marginRight: "10px" }}>
                            Filter by Category:{" "}
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            style={{ marginRight: "10px", padding: "5px" }}
                        >
                            <option value="">All Categories</option>
                            <option value="electronics">Electronics</option>
                            <option value="fashion">Fashion</option>
                            <option value="furniture">Furniture</option>
                            <option value="books">Books</option>
                        </select>

                        <button
                            onClick={clearFilters}
                            style={{ marginRight: "10px", padding: "5px 10px" }}
                        >
                            Clear Filters
                        </button>

                        <button
                            onClick={() => fetchProducts(1, selectedCategory)}
                            style={{ padding: "5px 10px" }}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Refresh Products"}
                        </button>
                    </div>

                    {/* Products Table */}
                    <table
                        border="1"
                        cellPadding="5"
                        style={{
                            marginTop: "10px",
                            width: "100%",
                            borderCollapse: "collapse",
                        }}
                    >
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>{p.name}</td>
                                    <td>{p.category}</td>
                                    <td>${p.price}</td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="4"
                                        style={{ textAlign: "center" }}
                                    >
                                        No products found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {products.length > 0 && (
                        <div style={{ marginTop: "20px", textAlign: "center" }}>
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 1 || loading}
                                style={{ margin: "0 5px", padding: "5px 10px" }}
                            >
                                Previous
                            </button>

                            <span style={{ margin: "0 15px" }}>
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage === totalPages || loading}
                                style={{ margin: "0 5px", padding: "5px 10px" }}
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Products Summary */}
                    {products.length > 0 && (
                        <div style={{ marginTop: "10px", color: "#666" }}>
                            Showing {products.length} products
                            {selectedCategory &&
                                ` in category: ${selectedCategory}`}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default App;
