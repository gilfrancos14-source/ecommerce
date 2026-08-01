import { Router } from 'express';
import { getStats, getUsers, updateUserRole, getDetailedStats, getStockAlerts } from '../controllers/admin.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/stats', protect, adminOnly, getStats);
router.get('/stats/detailed', protect, adminOnly, getDetailedStats);
router.get('/stock-alerts', protect, adminOnly, getStockAlerts);
router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);

export default router;
