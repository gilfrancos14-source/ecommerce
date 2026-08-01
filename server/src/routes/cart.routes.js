import { Router } from 'express';
import { getCart, addToCart, updateQuantity, removeFromCart, clearCart } from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.put('/:id', protect, updateQuantity);
router.delete('/:id', protect, removeFromCart);
router.delete('/', protect, clearCart);

export default router;
