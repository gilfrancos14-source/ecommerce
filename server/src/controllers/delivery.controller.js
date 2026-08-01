import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { z } from 'zod';

const deliveryMethodSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Prix invalide'),
  freeFrom: z.coerce.number().positive().optional().nullable(),
  estimatedDays: z.string().min(1, 'Délai requis'),
  carrier: z.string().min(1, 'Transporteur requis'),
  active: z.coerce.boolean().optional(),
});

export const getDeliveryMethods = asyncHandler(async (_req, res) => {
  const methods = await prisma.deliveryMethod.findMany({
    where: { active: true },
    orderBy: { price: 'asc' },
  });
  res.json({ success: true, data: methods });
});

export const getAllDeliveryMethods = asyncHandler(async (_req, res) => {
  const methods = await prisma.deliveryMethod.findMany({
    orderBy: { price: 'asc' },
  });
  res.json({ success: true, data: methods });
});

export const createDeliveryMethod = asyncHandler(async (req, res) => {
  const data = deliveryMethodSchema.parse(req.body);
  const method = await prisma.deliveryMethod.create({ data });
  res.status(201).json({ success: true, data: method });
});

export const updateDeliveryMethod = asyncHandler(async (req, res) => {
  const data = deliveryMethodSchema.partial().parse(req.body);
  const existing = await prisma.deliveryMethod.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError('Mode de livraison introuvable', 404);

  const method = await prisma.deliveryMethod.update({
    where: { id: req.params.id },
    data,
  });
  res.json({ success: true, data: method });
});

export const deleteDeliveryMethod = asyncHandler(async (req, res) => {
  const existing = await prisma.deliveryMethod.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError('Mode de livraison introuvable', 404);

  await prisma.deliveryMethod.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Mode de livraison supprimé' });
});
