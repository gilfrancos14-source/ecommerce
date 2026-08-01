import { z } from 'zod';

export const createCategorySchema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  nom: z.string().min(2).optional(),
  description: z.string().optional(),
});
