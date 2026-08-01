import { z } from 'zod';

export const registerSchema = z.object({
  nom: z.string().min(2, 'Nom requis (min 2 caractères)'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe (min 6 caractères)'),
  phone: z.string().optional(),
  adresse: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const updateProfileSchema = z.object({
  nom: z.string().min(2).optional(),
  phone: z.string().optional(),
  adresse: z.string().optional(),
});
