import { Router } from 'express';
import { getProductReviews, createReview, deleteReview } from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/products/:productId/reviews', getProductReviews);
router.post('/products/:productId/reviews', protect, createReview);
router.delete('/reviews/:id', protect, deleteReview);

export default router;
