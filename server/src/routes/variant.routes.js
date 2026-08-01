import { Router } from 'express';
import { getByProduct, create, update, remove } from '../controllers/variant.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload, uploadImages } from '../middleware/upload.js';

const router = Router();

router.get('/product/:productId', getByProduct);
router.post('/product/:productId', protect, adminOnly, upload.array('images', 5), uploadImages, create);
router.put('/:id', protect, adminOnly, upload.array('images', 5), uploadImages, update);
router.delete('/:id', protect, adminOnly, remove);

export default router;
