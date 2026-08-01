import { z } from 'zod';

export const createVariantSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prix: z.number().positive('Prix doit être positif'),
  compareAtPrice: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
});

export const updateVariantSchema = z.object({
  nom: z.string().min(1).optional(),
  prix: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
});
