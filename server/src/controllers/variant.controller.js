import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';
import { parseImages } from '../utils/images.js';
import { createVariantSchema, updateVariantSchema } from '../validators/variant.validator.js';
import { deleteImages } from '../middleware/upload.js';

export const getByProduct = asyncHandler(async (req, res) => {
  const variants = await prisma.productVariant.findMany({
    where: { productId: req.params.productId },
    orderBy: { nom: 'asc' },
  });
  res.json({
    success: true,
    data: variants.map((v) => ({ ...v, images: parseImages(v.images) })),
  });
});

export const create = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.productId } });
  if (!product) throw new AppError('Produit introuvable', 404);

  const data = createVariantSchema.parse(req.body);
  const slug = slugify(data.nom);

  const existing = await prisma.productVariant.findUnique({
    where: { productId_slug: { productId: req.params.productId, slug } },
  });
  if (existing) throw new AppError('Une variante avec ce nom existe déjà', 400);

  const images = req.cloudinaryImages || [];

  const variant = await prisma.productVariant.create({
    data: {
      ...data,
      slug,
      images: JSON.stringify(images),
      productId: req.params.productId,
    },
  });

  res.status(201).json({ success: true, data: { ...variant, images: parseImages(variant.images) } });
});

export const update = asyncHandler(async (req, res) => {
  const variant = await prisma.productVariant.findUnique({ where: { id: req.params.id } });
  if (!variant) throw new AppError('Variante introuvable', 404);

  const data = updateVariantSchema.parse(req.body);
  const updateData = { ...data };

  if (data.nom) {
    updateData.slug = slugify(data.nom);
    if (updateData.slug !== variant.slug) {
      const existing = await prisma.productVariant.findUnique({
        where: { productId_slug: { productId: variant.productId, slug: updateData.slug } },
      });
      if (existing) throw new AppError('Une variante avec ce nom existe déjà', 400);
    }
  }

  let oldImagesToDelete = [];
  if (req.cloudinaryImages?.length) {
    oldImagesToDelete = parseImages(variant.images);
    updateData.images = JSON.stringify(req.cloudinaryImages);
  }

  const updated = await prisma.productVariant.update({
    where: { id: req.params.id },
    data: updateData,
  });

  if (oldImagesToDelete.length) {
    await deleteImages(oldImagesToDelete);
  }

  res.json({ success: true, data: { ...updated, images: parseImages(updated.images) } });
});

export const remove = asyncHandler(async (req, res) => {
  const variant = await prisma.productVariant.findUnique({ where: { id: req.params.id } });
  if (!variant) throw new AppError('Variante introuvable', 404);

  const images = parseImages(variant.images);
  if (images.length) {
    await deleteImages(images);
  }

  await prisma.productVariant.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Variante supprimée' });
});
