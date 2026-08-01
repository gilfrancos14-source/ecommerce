import { createContext, useContext } from 'react';

export const CartContext = createContext(null);

export default function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
