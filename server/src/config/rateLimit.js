import rateLimit from 'express-rate-limit';

const limiterOptions = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Trop de requêtes, réessayez plus tard' },
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Trop de demandes de réinitialisation, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});

export default limiterOptions;