import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().uuid('Produit invalide'),
  variantId: z.string().uuid().nullable().optional().default(null),
  quantity: z.number().int().min(1).default(1),
});

export const updateCartSchema = z.object({
  quantity: z.number().int().min(1),
});
