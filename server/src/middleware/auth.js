import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';

export const protect = async (req, _res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppError('Authentification requise', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      throw new AppError('Utilisateur introuvable', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expiré', 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Token invalide', 401));
    } else {
      next(error);
    }
  }
};

export const adminOnly = (req, _res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return next(new AppError('Accès réservé aux administrateurs', 403));
  }
  next();
};
