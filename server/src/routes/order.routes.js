import { Router } from 'express';
import { createOrder, getMyOrders, getById, getAllOrders, updateStatus, shipOrder, deliverOrder } from '../controllers/order.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/', protect, getMyOrders);
router.post('/', protect, createOrder);
router.get('/:id', protect, getById);
router.put('/:id/status', protect, adminOnly, updateStatus);
router.put('/:id/ship', protect, adminOnly, shipOrder);
router.put('/:id/deliver', protect, adminOnly, deliverOrder);

export default router;
