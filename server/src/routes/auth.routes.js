import { Router } from 'express';
import { register, login, getMe, updateProfile, logout, forgotPassword, verifyResetCode, resetPassword, changePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { authLimiter, resetLimiter } from '../config/rateLimit.js';

const router = Router();

router.post('/register', register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);
router.post('/forgot-password', resetLimiter, forgotPassword);
router.post('/verify-reset-code', resetLimiter, verifyResetCode);
router.post('/reset-password', resetLimiter, resetPassword);
router.post('/change-password', protect, changePassword);

export default router;
