import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'supergeheim';

const router = express.Router();
const prisma = new PrismaClient();

// Nodemailer transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Wachtwoord wijzigen: stap 1 (verzoek)
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'Gebruiker niet gevonden.' });
  const resetToken = crypto.randomBytes(32).toString('hex');
  await prisma.twoFactorCode.create({
    data: {
      userId: user.id,
      codeHash: resetToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 min geldig
    }
  });
  // Stuur e-mail
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Wachtwoord wijzigen LottoLoJo',
      html: `<p>Je hebt een verzoek gedaan om je wachtwoord te wijzigen. Klik op de onderstaande link om een nieuw wachtwoord in te stellen:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
    });
    res.json({ message: 'E-mail met reset-link verstuurd.' });
  } catch (err) {
    res.status(500).json({ error: 'Kon geen e-mail sturen. Neem contact op.' });
  }
});

// Wachtwoord wijzigen: stap 2 (uitvoeren)
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'Gebruiker niet gevonden.' });
  const code = await prisma.twoFactorCode.findFirst({
    where: { userId: user.id, codeHash: token, usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!code) return res.status(400).json({ error: 'Ongeldige of verlopen token.' });
  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(newPassword, 10) },
  });
  await prisma.twoFactorCode.update({ where: { id: code.id }, data: { usedAt: new Date() } });
  res.json({ message: 'Wachtwoord succesvol aangepast' });
});
// Auth routes: login, register, password recovery, 2FA (basis)
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'supergeheim';

const router = express.Router();
const prisma = new PrismaClient();

// Nodemailer transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Registratie met e-mailverificatie
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Vul alle velden in.' });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Gebruiker bestaat al.' });
  const hash = await bcrypt.hash(password, 10);
  // Genereer verificatiecode
  const verifyToken = crypto.randomBytes(32).toString('hex');
  const user = await prisma.user.create({
    data: { name, email, password: hash, role: 'participant', approved: false }
  });
  // Sla verificatiecode op (in TwoFactorCode, type 'email')
  await prisma.twoFactorCode.create({
    data: {
      userId: user.id,
      codeHash: verifyToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 uur geldig
    }
  });
  // Verificatie-link
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;
  // Stuur e-mail
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Bevestig je LottoLoJo account',
      html: `<p>Welkom bij LottoLoJo! Klik op de onderstaande link om je account te activeren:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
    });
    res.json({ message: 'Registratie gelukt, check je e-mail voor verificatie.' });
  } catch (err) {
    res.status(500).json({ error: 'Kon geen e-mail sturen. Neem contact op.' });
  }
});

// E-mailverificatie endpoint
router.get('/verify-email', async (req, res) => {
  const { token, email } = req.query;
  if (!token || !email) return res.status(400).json({ error: 'Ongeldige link.' });
  const user = await prisma.user.findUnique({ where: { email: String(email) } });
  if (!user) return res.status(400).json({ error: 'Gebruiker niet gevonden.' });
  const code = await prisma.twoFactorCode.findFirst({
    where: { userId: user.id, codeHash: String(token), usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!code) return res.status(400).json({ error: 'Ongeldige of verlopen token.' });
  await prisma.user.update({ where: { id: user.id }, data: { approved: true } });
  await prisma.twoFactorCode.update({ where: { id: code.id }, data: { usedAt: new Date() } });
  res.json({ message: 'E-mail succesvol geverifieerd. Je kunt nu inloggen.' });
});

// Login alleen als e-mail geverifieerd is
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Gebruiker niet gevonden.' });
  if (!user.approved) return res.status(400).json({ error: 'E-mail nog niet geverifieerd.' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Ongeldige combinatie.' });
  // JWT-token genereren
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ message: 'Login gelukt', token, user: { id: user.id, name: user.name, email: user.email } });
});

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
