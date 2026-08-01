import { Router } from 'express';
import { getAll, getById, getBySlug, create, update, remove } from '../controllers/category.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload, uploadImages } from '../middleware/upload.js';

const router = Router();

router.get('/', getAll);
router.get('/slug/:slug', getBySlug);
router.get('/:id', getById);
router.post('/', protect, adminOnly, upload.single('image'), uploadImages, create);
router.put('/:id', protect, adminOnly, upload.single('image'), uploadImages, update);
router.delete('/:id', protect, adminOnly, remove);

export default router;
