import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/db.js';
import generateToken from '../utils/generateToken.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const REDIRECT_URI = `${SERVER_URL}/api/auth/google/callback`;

export const googleAuth = (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

export const googleCallback = asyncHandler(async (req, res) => {
  const { code, error, state } = req.query;
  if (error) throw new AppError('Autorisation Google refusée', 401);
  if (!code) throw new AppError('Code d\'autorisation manquant', 400);

  const savedState = req.cookies?.oauth_state;
  if (!state || !savedState || state !== savedState) {
    throw new AppError('Session OAuth invalide', 400);
  }
  res.clearCookie('oauth_state');

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) throw new AppError('Échec de l\'échange du code Google', 401);

  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const googleUser = await userInfoRes.json();
  if (!userInfoRes.ok) throw new AppError('Impossible de récupérer les infos Google', 401);

  const { id: googleId, email, name, picture } = googleUser;
  if (!email) throw new AppError('Email Google non disponible', 400);

  let user = await prisma.user.findUnique({ where: { googleId } });

  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    } else {
      const hashed = await bcrypt.hash(crypto.randomUUID(), 12);
      user = await prisma.user.create({
        data: {
          nom: name || email.split('@')[0],
          email,
          password: hashed,
          googleId,
        },
      });
    }
  }

  const token = generateToken(user);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(user.role === 'ADMIN' ? `${process.env.CLIENT_URL}/admin` : process.env.CLIENT_URL);
});
