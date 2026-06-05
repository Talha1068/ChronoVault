import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './AuthContext';
import { api } from '../api/client';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const syncedGuestWishlistRef = useRef(false);
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem('watchStoreWishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  useEffect(() => {
    localStorage.setItem('watchStoreWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const normalizeWishlistItem = (item) => ({
    id: item.id ?? item.productId,
    name: item.name,
    brand: item.brand,
    price: item.price,
    image: item.image,
    inStock: item.inStock,
  });

  const fetchServerWishlist = async () => {
    if (!token) {
      return;
    }
    const items = await api.getWishlist(token);
    setWishlist((items || []).map(normalizeWishlistItem));
  };

  useEffect(() => {
    const syncWishlist = async () => {
      if (!token) {
        syncedGuestWishlistRef.current = false;
        return;
      }

      try {
        const guestWishlist = JSON.parse(localStorage.getItem('watchStoreWishlist') || '[]');
        if (!syncedGuestWishlistRef.current && guestWishlist.length > 0) {
          for (const item of guestWishlist) {
            await api.addWishlistItem(Number(item.id), token);
          }
          syncedGuestWishlistRef.current = true;
        }
        await fetchServerWishlist();
      } catch (error) {
        console.error('Failed to sync wishlist with server:', error);
      }
    };

    syncWishlist();
  }, [token]);

  const toggleWishlist = async (product) => {
    if (token) {
      try {
        const exists = wishlist.find((item) => item.id === product.id);
        if (exists) {
          await api.removeWishlistItem(Number(product.id), token);
        } else {
          await api.addWishlistItem(Number(product.id), token);
        }
        await fetchServerWishlist();
        return;
      } catch (error) {
        console.error('Failed to update server wishlist:', error);
      }
    }

    setWishlist((prevWishlist) => {
      const exists = prevWishlist.find((item) => item.id === product.id);
      if (exists) {
        return prevWishlist.filter((item) => item.id !== product.id);
      }
      return [...prevWishlist, product];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
