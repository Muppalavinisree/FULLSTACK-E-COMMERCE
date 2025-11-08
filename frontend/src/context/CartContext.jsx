import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });

  // Fetch the cart from backend
  const fetchCart = async () => {
    try {
      const { data } = await API.get("/cart");
      setCart(data);
    } catch (err) {
      console.error(err);
    }
  };

  //  Optimistic Add to Cart
  const addToCart = async (productId) => {
    try {
      // 1. Instantly show change in UI
      setCart((prev) => {
        const existing = prev.items.find((it) => it.productId === productId);
        let newItems;
        if (existing) {
          newItems = prev.items.map((it) =>
            it.productId === productId ? { ...it, qty: it.qty + 1 } : it
          );
        } else {
          newItems = [...prev.items, { productId, name: "Loading...", price: 0, qty: 1 }];
        }
        const total = newItems.reduce((sum, it) => sum + it.price * it.qty, 0);
        return { items: newItems, total };
      });

      // 2. Sync with backend
      await API.post("/cart", { productId, qty: 1 });
      fetchCart(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  // Optimistic Quantity Update
  const updateQty = async (productId, newQty) => {
    setCart((prev) => {
      const newItems = prev.items.map((it) =>
        it.productId === productId ? { ...it, qty: newQty } : it
      );
      const total = newItems.reduce((sum, it) => sum + it.price * it.qty, 0);
      return { items: newItems, total };
    });

    try {
      await API.put("/cart", { productId, qty: newQty });
    } catch (err) {
      console.error(err);
    }
  };

  // Optimistic Remove
  const removeFromCart = async (id) => {
    setCart((prev) => {
      const newItems = prev.items.filter((it) => it._id !== id);
      const total = newItems.reduce((sum, it) => sum + it.price * it.qty, 0);
      return { items: newItems, total };
    });

    try {
      await API.delete(`/cart/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = () => setCart({ items: [], total: 0 });

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
