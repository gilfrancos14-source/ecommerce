import { Router } from 'express';
import { googleAuth, googleCallback } from '../controllers/google.controller.js';

const router = Router();

router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleCallback);

export default router;
