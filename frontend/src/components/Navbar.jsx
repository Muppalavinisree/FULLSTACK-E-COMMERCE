import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cart } = useCart();
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          🛍️ Vibe <span>Commerce</span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
          <Link to="/cart" className={location.pathname === "/cart" ? "active" : ""}>
            Cart <span>({cart.items.length})</span>
          </Link>
          <Link to="/checkout" className={location.pathname === "/checkout" ? "active" : ""}>
            Checkout
          </Link>
          <Link to="/admin" className={location.pathname === "/admin" ? "active" : ""}>
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
