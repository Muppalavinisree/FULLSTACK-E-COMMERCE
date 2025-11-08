import React, { useState, useEffect } from "react";
import API from "../api";

export default function AdminPage() {
  const [logged, setLogged] = useState(false);
  const [pass, setPass] = useState("");
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    imageFile: null,
    imagePreview: "",
  });
  const [editId, setEditId] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Load products from DB
  const loadProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Failed to load products:", err);
    }
  };

  useEffect(() => {
    if (logged) loadProducts();
  }, [logged]);

  //  Handle form inputs
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  //Login
  const login = () => {
    if (!pass.trim()) return alert("Enter admin password");
    setLogged(true);
  };

  // Add or update product
 const saveProduct = async () => {
  if (!form.name || !form.price) return alert("Name and price are required");
  try {
    const data = new FormData();
    data.append("name", form.name);
    data.append("price", Number(form.price)); // ensure number
    data.append("description", form.description);
    data.append("category", form.category);
    if (form.imageFile) data.append("image", form.imageFile);

    const res = editId
      ? await API.put(`/products/${editId}`, data, {
          headers: { "x-admin-pass": pass },
        })
      : await API.post("/products", data, {
          headers: { "x-admin-pass": pass },
        });

    alert(editId ? "✅ Product updated!" : "✅ Product added!");
    setEditId(null);
    setForm({
      name: "",
      price: "",
      description: "",
      category: "",
      imageFile: null,
      imagePreview: "",
    });
    loadProducts();
  } catch (err) {
    alert(
      `❌ ${err.response?.data?.error || "Failed to save product"}`
    );
  }
};

  //  Edit product
  const handleEdit = (p) => {
    setForm({
      name: p.name,
      price: p.price,
      description: p.description,
      category: p.category,
      imageFile: null,
      imagePreview: p.image?.startsWith("http") ? p.image : `${BACKEND_URL}${p.image}`,
    });
    setEditId(p._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //  Delete product
  const handleDelete = async (id) => {
  if (!window.confirm("Delete this product?")) return;
  try {
    await API.delete(`/products/${id}`, {
      headers: { "x-admin-pass": pass },
    });
    alert("✅ Product deleted!");
    loadProducts();
  } catch (err) {
    console.error("❌ Delete failed:", err.response?.data || err.message);
    alert("❌ Failed to delete product.");
  }
};


  const logout = () => {
    setLogged(false);
    setPass("");
    setProducts([]);
  };

  if (!logged) {
    return (
      <div className="admin-page">
        <h2>Admin Login</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <button className="btn primary" onClick={login}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h2>Admin Panel</h2>

      {/* Form */}
      <div className="form-grid">
        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} />
        <input name="price" placeholder="Price" type="number" value={form.price} onChange={handleChange} />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
      </div>

      <label>Product Image</label>
      <input type="file" accept="image/*" onChange={handleImageChange} />

      {form.imagePreview && (
        <img
          src={form.imagePreview}
          alt="Preview"
          className="preview"
          style={{ marginTop: "8px", borderRadius: "10px" }}
        />
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button className="btn" onClick={logout}>
          Logout
        </button>
        <button className="btn primary" onClick={saveProduct}>
          {editId ? "Update Product" : "Add Product"}
        </button>
      </div>

      {/* Product List */}
      <h3 style={{ marginTop: 30, textAlign: "center" }}>📦 All Products</h3>
      <div className="product-list">
        {products.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888" }}>No products found yet.</p>
        ) : (
          products.map((p) => (
            <div key={p._id} className="product-card">
              <img
                src={p.image?.startsWith("http") ? p.image : `${BACKEND_URL}${p.image}`}
                alt={p.name}
              />
              <h4>{p.name}</h4>
              <p>₹{p.price}</p>
              <small>{p.category}</small>

              <div className="product-actions">
                <button className="btn primary" onClick={() => handleEdit(p)}>
                  Edit
                </button>
                <button className="btn danger" onClick={() => handleDelete(p._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
