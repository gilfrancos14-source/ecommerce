import { z } from 'zod';

export const createOrderSchema = z.object({
  adresseLivraison: z.string().min(5, 'Adresse de livraison requise'),
  phone: z.string().optional(),
  paymentIntentId: z.string().optional(),
  deliveryMethodId: z.string().uuid().optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export const shipOrderSchema = z.object({
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  carrierUrl: z.string().url().optional().nullable(),
  estimatedDelivery: z.string().optional().nullable(),
});
