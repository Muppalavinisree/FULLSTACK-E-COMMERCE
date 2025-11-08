import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminPage from "./pages/AdminPage";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />
        <main className="container mx-auto p-4">
          <Routes>
            {/* Home / Products */}
            <Route path="/" element={<ProductsPage />} />
            
            {/* Cart Page */}
            <Route path="/cart" element={<CartPage />} />
            
            {/* Checkout Page */}
            <Route path="/checkout" element={<CheckoutPage />} />
            
            {/* Admin Page */}
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

        <footer className="site-footer">
  <div className="footer-container">
    <p>© {new Date().getFullYear()} <strong>Vibe Commerce</strong> — Empowering Modern Shopping Experiences</p>
    <div className="footer-links">
      <a href="https://github.com/MuppalaVinisree" target="_blank" rel="noreferrer">GitHub</a>
      <a href="mailto:vinisreemuppala248@gamil.com">Contact</a>
      <a href="#">Privacy</a>
    </div>
  </div>
</footer>

      </Router>
    </CartProvider>
  );
}

export default App;
