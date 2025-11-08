import React, { useEffect, useState } from "react";
import API from "../api";
import { useCart } from "../context/CartContext";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  // Load backend base URL dynamically
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    API.get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Helper to handle both URL types (absolute + relative)
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://cdn-icons-png.flaticon.com/512/679/679720.png";
    }
    return imagePath.startsWith("http")
      ? imagePath
      : `${BACKEND_URL}${imagePath}`;
  };

  return (
    <div>
      <h2>Featured Products</h2>
      <div className="products-grid">
        {products.map((p) => (
          <div key={p._id} className="card">
            <div className="card-image">
              <img
                src={getImageUrl(p.image)}
                alt={p.name}
                style={{
                  maxHeight: "120px",
                  borderRadius: "10px",
                  objectFit: "cover",
                }}
                onError={(e) =>
                  (e.target.src =
                    "https://cdn-icons-png.flaticon.com/512/679/679720.png")
                }
              />
            </div>

            <div className="card-body">
              <h3 className="product-title">{p.name}</h3>
              <p className="product-desc">{p.description}</p>
              <div className="card-footer">
                <span>₹{p.price}</span>
                <button
                  className="btn primary"
                  onClick={() => {
                    addToCart(p._id);
                    alert(`✅ ${p.name} added to cart!`);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
