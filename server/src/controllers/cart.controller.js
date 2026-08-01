import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parseProductImages, parseImages } from '../utils/images.js';
import { addToCartSchema, updateCartSchema } from '../validators/cart.validator.js';

const parseCartItem = (item) => ({
  ...item,
  product: parseProductImages(item.product),
  variant: item.variant ? { ...item.variant, images: parseImages(item.variant.images) } : null,
});

export const getCart = asyncHandler(async (req, res) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: {
      product: {
        select: { id: true, nom: true, slug: true, prix: true, compareAtPrice: true, images: true, stock: true },
      },
      variant: {
        select: { id: true, nom: true, slug: true, prix: true, compareAtPrice: true, images: true, stock: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const parsed = items.map(parseCartItem);

  const total = parsed.reduce((sum, item) => {
    const price = item.variant ? item.variant.prix : item.product.prix;
    return sum + price * item.quantity;
  }, 0);

  res.json({ success: true, data: { items: parsed, total, count: parsed.length } });
});

export const addToCart = asyncHandler(async (req, res) => {
  const data = addToCartSchema.parse(req.body);

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) throw new AppError('Produit introuvable', 404);

  let variant = null;
  if (data.variantId) {
    variant = await prisma.productVariant.findUnique({ where: { id: data.variantId } });
    if (!variant || variant.productId !== data.productId) throw new AppError('Variante invalide', 400);
    if (variant.stock < 1) throw new AppError('Variante en rupture de stock', 400);
  } else {
    if (product.stock < 1) throw new AppError('Produit en rupture de stock', 400);
  }

  const existing = await prisma.cartItem.findFirst({
    where: {
      userId: req.user.id,
      productId: data.productId,
      variantId: data.variantId || null,
    },
  });

  const maxStock = variant ? variant.stock : product.stock;
  let item;
  if (existing) {
    const newQty = existing.quantity + data.quantity;
    if (newQty > maxStock) throw new AppError('Stock insuffisant', 400);
    item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    if (data.quantity > maxStock) throw new AppError('Stock insuffisant', 400);
    item = await prisma.cartItem.create({
      data: {
        userId: req.user.id,
        productId: data.productId,
        variantId: data.variantId || null,
        quantity: data.quantity,
      },
    });
  }

  res.status(201).json({ success: true, data: item });
});

export const updateQuantity = asyncHandler(async (req, res) => {
  const data = updateCartSchema.parse(req.body);

  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { product: true, variant: true },
  });
  if (!item) throw new AppError('Article panier introuvable', 404);

  const maxStock = item.variant ? item.variant.stock : item.product.stock;
  if (data.quantity > maxStock) throw new AppError('Stock insuffisant', 400);

  const updated = await prisma.cartItem.update({
    where: { id: req.params.id },
    data: { quantity: data.quantity },
  });

  res.json({ success: true, data: updated });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!item) throw new AppError('Article panier introuvable', 404);

  await prisma.cartItem.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Article retiré du panier' });
});

export const clearCart = asyncHandler(async (req, res) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
  res.json({ success: true, message: 'Panier vidé' });
});
