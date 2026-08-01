import { Router } from 'express';
import { getById } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/:id', protect, getById);

export default router;
