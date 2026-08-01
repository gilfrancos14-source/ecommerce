import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { subscribeSchema } from '../validators/newsletter.validator.js';
import { z } from 'zod';

export const subscribe = asyncHandler(async (req, res) => {
  const data = subscribeSchema.parse(req.body);

  const existing = await prisma.newsletter.findUnique({ where: { email: data.email } });

  if (existing) {
    if (existing.subscribed) throw new AppError('Déjà abonné', 400);
    await prisma.newsletter.update({
      where: { email: data.email },
      data: { subscribed: true },
    });
    return res.json({ success: true, message: 'Réabonnement réussi' });
  }

  await prisma.newsletter.create({ data: { email: data.email } });
  res.status(201).json({ success: true, message: 'Inscription réussie à la newsletter' });
});

const emailQuerySchema = z.object({
  email: z.string().email('Email invalide'),
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = emailQuerySchema.parse(req.query);

  const entry = await prisma.newsletter.findUnique({ where: { email } });
  if (!entry || !entry.subscribed) throw new AppError('Email non abonné', 404);

  if (!req.user || req.user.email !== email) {
    throw new AppError('Non autorisé à désabonner cet email', 403);
  }

  await prisma.newsletter.update({
    where: { email },
    data: { subscribed: false },
  });

  res.json({ success: true, message: 'Désabonnement réussi' });
});