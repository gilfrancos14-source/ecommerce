import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/db.js';
import generateToken from '../utils/generateToken.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator.js';
import { sendPasswordResetCode } from '../utils/email.js';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: COOKIE_MAX_AGE,
};

export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);

  const hashed = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: { ...data, password: hashed },
    select: { id: true, nom: true, email: true, role: true, phone: true, adresse: true, createdAt: true },
  });

  const token = generateToken(user);
  res.cookie('token', token, cookieOptions);

  res.status(201).json({ success: true, user });
});

export const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new AppError('Email ou mot de passe incorrect', 401);

  if (!user.password) throw new AppError('Connectez-vous avec Google', 401);

  const match = await bcrypt.compare(data.password, user.password);
  if (!match) throw new AppError('Email ou mot de passe incorrect', 401);

  const token = generateToken(user);
  res.cookie('token', token, cookieOptions);

  const { password: _, ...userData } = user;
  res.json({ success: true, user: userData });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, nom: true, email: true, role: true, phone: true, adresse: true, createdAt: true },
  });
  if (!user) throw new AppError('Utilisateur introuvable', 404);
  res.json({ success: true, user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = updateProfileSchema.parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: { id: true, nom: true, email: true, role: true, phone: true, adresse: true, createdAt: true },
  });

  res.json({ success: true, user });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.json({ success: true, message: 'Déconnexion réussie' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email requis', 400);

  const user = await prisma.user.findUnique({ where: { email } });

  const message = 'Si cet email existe, un code a été envoyé';

  if (!user) {
    res.json({ success: true, message });
    return;
  }

  const code = String(crypto.randomInt(100000, 999999));
  const codeHash = await bcrypt.hash(code, 10);
  const resetId = crypto.randomUUID();

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      codeHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  await sendPasswordResetCode(user, code);

  res.json({ success: true, message, resetId });
});

export const verifyResetCode = asyncHandler(async (req, res) => {
  const { resetId, code } = req.body;
  if (!resetId || !code) throw new AppError('Token et code requis', 400);

  const resetRecord = await prisma.passwordResetToken.findFirst({
    where: {
      id: resetId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!resetRecord) {
    throw new AppError('Token invalide ou expiré', 400);
  }

  const valid = await bcrypt.compare(code, resetRecord.codeHash);
  if (!valid) {
    throw new AppError('Code incorrect', 400);
  }

  const resetToken = jwt.sign(
    { id: resetRecord.userId, purpose: 'password-reset-confirmed' },
    process.env.JWT_SECRET + '-reset',
    { expiresIn: '10m' }
  );

  await prisma.passwordResetToken.update({
    where: { id: resetRecord.id },
    data: { usedAt: new Date() },
  });

  res.json({ success: true, message: 'Code vérifié', resetToken });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, password } = req.body;
  if (!resetToken || !password) throw new AppError('Token et mot de passe requis', 400);

  if (password.length < 6) throw new AppError('Le mot de passe doit contenir au moins 6 caractères', 400);

  let payload;
  try {
    payload = jwt.verify(resetToken, process.env.JWT_SECRET + '-reset');
  } catch {
    throw new AppError('Token invalide ou expiré', 400);
  }

  if (payload.purpose !== 'password-reset-confirmed') {
    throw new AppError('Token invalide', 400);
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: payload.id },
    data: { password: hashed },
  });

  res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new AppError('Mot de passe actuel et nouveau mot de passe requis', 400);

  if (newPassword.length < 6) throw new AppError('Le nouveau mot de passe doit contenir au moins 6 caractères', 400);

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new AppError('Utilisateur introuvable', 404);

  if (!user.password) throw new AppError('Connectez-vous avec Google pour changer votre mot de passe', 400);

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new AppError('Mot de passe actuel incorrect', 401);

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashed },
  });

  res.json({ success: true, message: 'Mot de passe modifié avec succès' });
});