import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';
import { deleteImages } from '../middleware/upload.js';

export const getAll = asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { nom: 'asc' },
  });
  res.json({ success: true, data: categories });
});

export const getById = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { products: true },
  });
  if (!category) throw new AppError('Catégorie introuvable', 404);
  res.json({ success: true, data: category });
});

export const getBySlug = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { slug: req.params.slug },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw new AppError('Catégorie introuvable', 404);
  res.json({ success: true, data: category });
});

export const create = asyncHandler(async (req, res) => {
  const data = createCategorySchema.parse(req.body);
  const slug = slugify(data.nom);
  const image = req.cloudinaryImages?.[0] || null;

  const category = await prisma.category.create({ data: { ...data, slug, image } });
  res.status(201).json({ success: true, data: category });
});

export const update = asyncHandler(async (req, res) => {
  const data = updateCategorySchema.parse(req.body);
  const updateData = { ...data };

  if (data.nom) {
    updateData.slug = slugify(data.nom);
  }

  let oldImageToDelete = null;
  if (req.cloudinaryImages?.length) {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (existing?.image) oldImageToDelete = existing.image;
    updateData.image = req.cloudinaryImages[0];
  }

  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: updateData,
  });

  if (oldImageToDelete) {
    await deleteImages([oldImageToDelete]);
  }

  res.json({ success: true, data: category });
});

export const remove = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw new AppError('Catégorie introuvable', 404);

  if (category._count.products > 0) {
    throw new AppError(`Impossible de supprimer : ${category._count.products} produit(s) dans cette catégorie`, 400);
  }

  if (category.image) {
    await deleteImages([category.image]);
  }

  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Catégorie supprimée' });
});