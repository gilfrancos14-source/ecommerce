import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parseProductImages } from '../utils/images.js';
import { addToWishlistSchema } from '../validators/wishlist.validator.js';

export const getWishlist = asyncHandler(async (req, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user.id },
    include: {
      product: {
        select: { id: true, nom: true, slug: true, prix: true, compareAtPrice: true, images: true, stock: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const parsed = items.map((item) => ({
    ...item,
    product: parseProductImages(item.product),
  }));

  res.json({ success: true, data: parsed });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = addToWishlistSchema.parse(req.body);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Produit introuvable', 404);

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: req.user.id, productId } },
  });
  if (existing) throw new AppError('Déjà dans votre wishlist', 400);

  const item = await prisma.wishlistItem.create({
    data: { userId: req.user.id, productId },
  });

  res.status(201).json({ success: true, data: item });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const item = await prisma.wishlistItem.findFirst({
    where: { userId: req.user.id, productId: req.params.productId },
  });
  if (!item) throw new AppError('Article introuvable dans la wishlist', 404);

  await prisma.wishlistItem.delete({ where: { id: item.id } });
  res.json({ success: true, message: 'Retiré de la wishlist' });
});