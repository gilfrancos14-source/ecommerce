import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import useAuth from './useAuth.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(() => {
    if (!isAuthenticated) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get('/cart')
      .then(({ data }) => {
        setItems(data.data.items);
        setTotal(data.data.total);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (productId, quantity = 1, variantId = null) => {
    await api.post('/cart', { productId, quantity, variantId });
    await fetchCart();
  }, [fetchCart]);

  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    await api.put(`/cart/${cartItemId}`, { quantity });
    await fetchCart();
  }, [fetchCart]);

  const removeItem = useCallback(async (cartItemId) => {
    await api.delete(`/cart/${cartItemId}`);
    await fetchCart();
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    await api.delete('/cart');
    await fetchCart();
  }, [fetchCart]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, count, loading, addItem, updateQuantity, removeItem, clearCart, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export default function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
