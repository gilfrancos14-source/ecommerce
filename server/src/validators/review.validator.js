import { z } from 'zod';

export const createReviewSchema = z.object({
  note: z.number().int().min(1, 'Note minimale 1').max(5, 'Note maximale 5'),
  commentaire: z.string().optional(),
});
