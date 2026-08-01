import { Router } from 'express';
import { getAll, getBySlug, create, update, remove, getFeatured } from '../controllers/product.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload, uploadImages } from '../middleware/upload.js';

const router = Router();

router.get('/featured', getFeatured);
router.get('/', getAll);
router.get('/:slug', getBySlug);
router.post('/', protect, adminOnly, upload.array('images', 5), uploadImages, create);
router.put('/:id', protect, adminOnly, upload.array('images', 5), uploadImages, update);
router.delete('/:id', protect, adminOnly, remove);

export default router;
