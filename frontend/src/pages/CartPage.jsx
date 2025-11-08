import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaCreditCard } from "react-icons/fa";

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [selectedItems, setSelectedItems] = useState([]);

  // Use backend URL dynamically
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const res = await API.get("/cart");
    setCart(res.data);
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleQty = async (item, delta) => {
    const newQty = item.qty + delta;
    if (newQty < 1) return;
    await API.put("/cart", { productId: item.productId, qty: newQty });
    loadCart();
  };

  const removeItem = async (id) => {
    await API.delete(`/cart/${id}`);
    loadCart();
  };

  const handleCheckout = () => {
    const selected = cart.items.filter((it) => selectedItems.includes(it._id));
    if (!selected.length) return alert("Please select at least one item!");
    const total = selected.reduce((sum, it) => sum + it.price * it.qty, 0);
    navigate("/checkout", { state: { selected, total } });
  };

  // Handle both absolute and relative image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://cdn-icons-png.flaticon.com/512/679/679720.png";
    }
    return imagePath.startsWith("http")
      ? imagePath
      : `${BACKEND_URL}${imagePath}`;
  };

  return (
    <div className="cart-page">
      <h2 className="cart-title">
        <FaShoppingCart style={{ marginRight: "8px", color: "#0ea5a4" }} />
        Your Cart
      </h2>

      {cart.items.length === 0 ? (
        <p className="empty">🛒 Your cart is empty.</p>
      ) : (
        <div className="cart-list">
          {cart.items.map((item) => (
            <div className="cart-item" key={item._id}>
              <input
                type="checkbox"
                checked={selectedItems.includes(item._id)}
                onChange={() => toggleSelect(item._id)}
              />

              <img
                src={getImageUrl(item.image)}
                alt={item.name}
                className="cart-thumb"
                onError={(e) =>
                  (e.target.src =
                    "https://cdn-icons-png.flaticon.com/512/679/679720.png")
                }
              />

              <div className="cart-info">
                <h3>{item.name}</h3>
                <p>₹{item.price} each</p>
              </div>

              <div className="cart-controls">
                <button onClick={() => handleQty(item, -1)}>
                  <FaMinus />
                </button>
                <span>{item.qty}</span>
                <button onClick={() => handleQty(item, +1)}>
                  <FaPlus />
                </button>
              </div>

              <button className="btn danger" onClick={() => removeItem(item._id)}>
                <FaTrash /> Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="cart-footer">
        <h3>
          Total (selected): ₹
          {cart.items
            .filter((it) => selectedItems.includes(it._id))
            .reduce((sum, it) => sum + it.price * it.qty, 0)
            .toLocaleString()}
        </h3>
        <button
          className="btn primary"
          onClick={handleCheckout}
          disabled={selectedItems.length === 0}
        >
          Proceed to Checkout <FaCreditCard style={{ marginLeft: "6px" }} />
        </button>
      </div>
    </div>
  );
}
