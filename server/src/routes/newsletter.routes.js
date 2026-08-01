import { Router } from 'express';
import { subscribe, unsubscribe } from '../controllers/newsletter.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/subscribe', subscribe);
router.delete('/unsubscribe', protect, unsubscribe);

export default router;
