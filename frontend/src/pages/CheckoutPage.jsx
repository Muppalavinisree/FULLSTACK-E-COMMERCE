import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api";
import {
  FaCheckCircle,
  FaArrowLeft,
  FaCreditCard,
  FaBoxOpen,
  FaHome,
} from "react-icons/fa";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selected = [], total = 0 } = location.state || {};

  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);

  //  Get backend URL dynamically from .env
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  //  Helper to resolve image URLs (works for both seeded & uploaded)
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://cdn-icons-png.flaticon.com/512/679/679720.png";
    }
    return imagePath.startsWith("http")
      ? imagePath
      : `${BACKEND_URL}${imagePath}`;
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCheckout = async () => {
    if (!form.name || !form.email)
      return alert("Please enter your name and email.");
    if (!selected.length) return alert("No items selected for checkout!");

    setLoading(true);
    try {
      const selectedIds = selected.map((it) => it._id);
      const res = await API.post("/checkout", { ...form, selectedIds });
      setReceipt(res.data.receipt);
    } catch (err) {
      alert("❌ Checkout failed!");
    } finally {
      setLoading(false);
    }
  };

  //  Payment success view
  if (receipt) {
    return (
      <div className="checkout-container">
        <div className="checkout-card success-card">
          <h2>
            <FaCheckCircle style={{ color: "green", marginRight: "8px" }} />
            Payment Successful
          </h2>
          <p><b>Order ID:</b> {receipt.id}</p>
          <p><b>Name:</b> {receipt.name}</p>
          <p><b>Email:</b> {receipt.email}</p>
          <p><b>Total Paid:</b> ₹{receipt.total.toLocaleString()}</p>
          <p><b>Order Date:</b> {new Date(receipt.timestamp).toLocaleString()}</p>

          <h3 style={{ marginTop: "20px" }}>
            <FaBoxOpen style={{ marginRight: "8px", color: "#0ea5a4" }} />
            Purchased Items
          </h3>

          <div className="summary-list">
            {receipt.items.map((it) => (
              <div key={it._id} className="summary-item">
                <img
                  src={getImageUrl(it.image)}
                  alt={it.name}
                  onError={(e) =>
                    (e.target.src =
                      "https://cdn-icons-png.flaticon.com/512/679/679720.png")
                  }
                />
                <div className="summary-details">
                  <h4>{it.name}</h4>
                  <p>
                    Qty: {it.qty} × ₹{it.price.toLocaleString()} = ₹
                    {(it.price * it.qty).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-buttons" style={{ marginTop: "20px" }}>
            <button className="btn primary" onClick={() => navigate("/")}>
              <FaHome style={{ marginRight: "6px" }} />
              Return Home
            </button>
            <button className="btn secondary" onClick={() => navigate("/cart")}>
              <FaArrowLeft style={{ marginRight: "6px" }} />
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  //  Default checkout form view
  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h2 className="checkout-title">
          <FaCreditCard style={{ marginRight: "8px", color: "#0ea5a4" }} />
          Checkout
        </h2>

        {selected.length === 0 ? (
          <p>No items selected. Please go back to cart.</p>
        ) : (
          <>
            <div className="summary-section">
              <h3 className="summary-title">
                <FaBoxOpen style={{ marginRight: "8px", color: "#0ea5a4" }} />
                Order Summary
              </h3>
              <div className="summary-list">
                {selected.map((it) => (
                  <div className="summary-item" key={it._id}>
                    <img
                      src={getImageUrl(it.image)}
                      alt={it.name}
                      onError={(e) =>
                        (e.target.src =
                          "https://cdn-icons-png.flaticon.com/512/679/679720.png")
                      }
                    />
                    <div className="summary-details">
                      <h4>{it.name}</h4>
                      <p>
                        Qty: {it.qty} × ₹{it.price} ={" "}
                        <strong>₹{it.price * it.qty}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <hr />
              <h3 className="summary-total">
                Total: ₹{total.toLocaleString()}
              </h3>
            </div>
          </>
        )}

        <div className="checkout-form">
          <label>
            Full Name
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </label>

          <div className="checkout-buttons">
            <button
              className="btn primary"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Payment"}
              <FaCheckCircle style={{ marginLeft: "6px" }} />
            </button>
            <button className="btn secondary" onClick={() => navigate("/cart")}>
              <FaArrowLeft style={{ marginRight: "6px" }} />
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

