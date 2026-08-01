import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { paginate, paginatedResponse } from '../utils/pagination.js';
import { slugify } from '../utils/slugify.js';
import { parseProductImages, parseImages } from '../utils/images.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';
import { deleteImages } from '../middleware/upload.js';

export const getAll = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const { nom, categoryId, minPrix, maxPrix, featured, sort } = req.query;

  const where = {};

  if (nom) where.nom = { contains: nom, mode: 'insensitive' };
  if (categoryId) where.categoryId = categoryId;
  if (featured) where.featured = featured === 'true';
  if (minPrix || maxPrix) {
    where.prix = {};
    if (minPrix) where.prix.gte = parseFloat(minPrix);
    if (maxPrix) where.prix.lte = parseFloat(maxPrix);
  }

  let orderBy = { createdAt: 'desc' };
  if (sort === 'prix_asc') orderBy = { prix: 'asc' };
  else if (sort === 'prix_desc') orderBy = { prix: 'desc' };
  else if (sort === 'nom_asc') orderBy = { nom: 'asc' };
  else if (sort === 'nom_desc') orderBy = { nom: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: { category: { select: { id: true, nom: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ success: true, ...paginatedResponse(products.map(parseProductImages), total, page, limit) });
});

export const getBySlug = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: {
      category: { select: { id: true, nom: true, slug: true } },
      variants: {
        orderBy: { nom: 'asc' },
      },
      reviews: {
        include: { user: { select: { id: true, nom: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!product) throw new AppError('Produit introuvable', 404);

  const avgRating = product.reviews.length
    ? product.reviews.reduce((sum, r) => sum + r.note, 0) / product.reviews.length
    : null;

  const parsed = parseProductImages(product);
  parsed.variants = parsed.variants.map((v) => ({
    ...v,
    images: parseImages(v.images),
  }));

  res.json({ success: true, data: { ...parsed, avgRating } });
});

export const create = asyncHandler(async (req, res) => {
  const data = createProductSchema.parse(req.body);
  const slug = slugify(data.nom);

  const images = req.cloudinaryImages || [];

  const product = await prisma.product.create({ data: { ...data, slug, images: JSON.stringify(images) } });
  res.status(201).json({ success: true, data: parseProductImages(product) });
});

export const update = asyncHandler(async (req, res) => {
  const data = updateProductSchema.parse(req.body);
  const updateData = { ...data };

  if (data.nom) {
    updateData.slug = slugify(data.nom);
  }

  let oldImagesToDelete = [];
  if (req.cloudinaryImages?.length) {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (existing) {
      oldImagesToDelete = parseProductImages(existing).images;
    }
    updateData.images = JSON.stringify(req.cloudinaryImages);
  }

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: updateData,
  });

  if (oldImagesToDelete.length) {
    await deleteImages(oldImagesToDelete);
  }

  res.json({ success: true, data: parseProductImages(product) });
});

export const remove = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) throw new AppError('Produit introuvable', 404);

  const images = parseProductImages(product).images;
  await deleteImages(images);

  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Produit supprimé' });
});

export const getFeatured = asyncHandler(async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { featured: true },
    take: 8,
    include: { category: { select: { id: true, nom: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: products.map(parseProductImages) });
});
