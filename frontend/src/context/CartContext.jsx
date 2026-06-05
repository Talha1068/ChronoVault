import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './AuthContext';
import { api } from '../api/client';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const syncedGuestCartRef = useRef(false);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('watchStoreCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('watchStoreCart', JSON.stringify(cart));
  }, [cart]);

  const normalizeCartItem = (item) => ({
    id: item.id ?? item.productId,
    name: item.name,
    brand: item.brand,
    price: item.price,
    image: item.image,
    quantity: item.quantity,
    inStock: item.inStock,
  });

  const fetchServerCart = async () => {
    if (!token) {
      return;
    }
    const result = await api.getCart(token);
    setCart((result.items || []).map(normalizeCartItem));
  };

  useEffect(() => {
    const syncCart = async () => {
      if (!token) {
        syncedGuestCartRef.current = false;
        return;
      }

      try {
        const guestCart = JSON.parse(localStorage.getItem('watchStoreCart') || '[]');
        if (!syncedGuestCartRef.current && guestCart.length > 0) {
          for (const item of guestCart) {
            const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
            await api.upsertCartItem(Number(item.id), quantity, token);
          }
          syncedGuestCartRef.current = true;
        }
        await fetchServerCart();
      } catch (error) {
        console.error('Failed to sync cart with server:', error);
      }
    };

    syncCart();
  }, [token]);

  const addToCart = async (product, quantity = 1) => {
    const normalizedQuantity = Number(quantity) > 0 ? Number(quantity) : 1;
    if (token) {
      try {
        const current = cart.find((item) => item.id === product.id);
        const nextQty = (current?.quantity || 0) + normalizedQuantity;
        await api.upsertCartItem(Number(product.id), nextQty, token);
        await fetchServerCart();
        return;
      } catch (error) {
        console.error('Failed to update server cart:', error);
      }
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + normalizedQuantity } : item
        );
      }
      return [...prevCart, { ...product, quantity: normalizedQuantity }];
    });
  };

  const removeFromCart = async (productId) => {
    if (token) {
      try {
        await api.removeCartItem(Number(productId), token);
        await fetchServerCart();
        return;
      } catch (error) {
        console.error('Failed to remove server cart item:', error);
      }
    }

    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    if (token) {
      try {
        await api.upsertCartItem(Number(productId), Number(quantity), token);
        await fetchServerCart();
        return;
      } catch (error) {
        console.error('Failed to update server cart quantity:', error);
      }
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    if (token) {
      try {
        await Promise.all(cart.map((item) => api.removeCartItem(Number(item.id), token)));
      } catch (error) {
        console.error('Failed to clear server cart:', error);
      }
    }
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartItemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};
