import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import useAuth from './useAuth.jsx';
import { WishlistContext } from './useWishlist.jsx';

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistItems, setWishlistItems] = useState([]);
  const idsRef = useRef(wishlistIds);

  useEffect(() => {
    idsRef.current = wishlistIds;
  }, [wishlistIds]);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      setWishlistItems([]);
      return;
    }
    api.get('/wishlist')
      .then(({ data }) => {
        setWishlistItems(data.data);
        setWishlistIds(new Set(data.data.map((item) => item.productId)));
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const toggleWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) return false;
    const isFav = idsRef.current.has(productId);
    if (isFav) {
      await api.delete(`/wishlist/${productId}`);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      setWishlistItems((prev) => prev.filter((item) => item.productId !== productId));
      return false;
    } else {
      const { data } = await api.post('/wishlist', { productId });
      setWishlistIds((prev) => new Set([...prev, productId]));
      setWishlistItems((prev) => [...prev, data.data]);
      return true;
    }
  }, [isAuthenticated]);

  const isInWishlist = useCallback((productId) => wishlistIds.has(productId), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, wishlistItems, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
