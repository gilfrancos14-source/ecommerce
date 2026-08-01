import { z } from 'zod';

export const createProductSchema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  description: z.string().optional(),
  prix: z.number().positive('Prix doit être positif'),
  compareAtPrice: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
  categoryId: z.string().uuid('Catégorie invalide'),
  featured: z.boolean().optional(),
});

export const updateProductSchema = z.object({
  nom: z.string().min(2).optional(),
  description: z.string().optional(),
  prix: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().uuid().optional(),
  featured: z.boolean().optional(),
});
