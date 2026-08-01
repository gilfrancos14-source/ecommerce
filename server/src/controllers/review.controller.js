import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createReviewSchema } from '../validators/review.validator.js';

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { productId: req.params.productId },
    include: { user: { select: { id: true, nom: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.note, 0) / reviews.length
    : null;

  res.json({ success: true, data: { reviews, avgRating, count: reviews.length } });
});

export const createReview = asyncHandler(async (req, res) => {
  const data = createReviewSchema.parse(req.body);

  const product = await prisma.product.findUnique({ where: { id: req.params.productId } });
  if (!product) throw new AppError('Produit introuvable', 404);

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: req.user.id, productId: req.params.productId } },
  });
  if (existing) throw new AppError('Vous avez déjà noté ce produit', 400);

  const review = await prisma.review.create({
    data: {
      userId: req.user.id,
      productId: req.params.productId,
      note: data.note,
      commentaire: data.commentaire,
    },
    include: { user: { select: { id: true, nom: true } } },
  });

  res.status(201).json({ success: true, data: review });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) throw new AppError('Avis introuvable', 404);

  if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('Non autorisé', 403);
  }

  await prisma.review.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Avis supprimé' });
});