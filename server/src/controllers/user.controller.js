import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getById = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
    throw new AppError('Non autorisé', 403);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, nom: true, email: true, role: true, phone: true, adresse: true, createdAt: true },
  });
  if (!user) throw new AppError('Utilisateur introuvable', 404);
  res.json({ success: true, data: user });
});