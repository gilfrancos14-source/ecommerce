import { Router } from 'express';
import {
  getDeliveryMethods,
  getAllDeliveryMethods,
  createDeliveryMethod,
  updateDeliveryMethod,
  deleteDeliveryMethod,
} from '../controllers/delivery.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', getDeliveryMethods);
router.get('/admin/all', protect, adminOnly, getAllDeliveryMethods);
router.post('/', protect, adminOnly, createDeliveryMethod);
router.put('/:id', protect, adminOnly, updateDeliveryMethod);
router.delete('/:id', protect, adminOnly, deleteDeliveryMethod);

export default router;
