// Auth routes: login, register, password recovery, 2FA (basis)
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// Password recovery: start
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'Gebruiker niet gevonden' });
  // Genereer reset token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min geldig
  await prisma.twoFactorCode.create({
    data: {
      userId: user.id,
      codeHash: token,
      expiresAt: expires,
    },
  });
  // Hier zou je een mail sturen met de reset-link
  // Bijv: https://jouwdomein/reset-password?token=...&email=...
  res.json({ message: 'Reset-link verstuurd (mock)', token });
});

// Password reset: uitvoeren
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'Gebruiker niet gevonden' });
  const code = await prisma.twoFactorCode.findFirst({
    where: { userId: user.id, codeHash: token, usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!code) return res.status(400).json({ message: 'Ongeldige of verlopen token' });
  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(newPassword, 10) },
  });
  await prisma.twoFactorCode.update({ where: { id: code.id }, data: { usedAt: new Date() } });
  res.json({ message: 'Wachtwoord succesvol aangepast' });
});

export default router;
