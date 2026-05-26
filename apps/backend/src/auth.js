
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import * as cheerio from 'cheerio';
import cron from 'node-cron';

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
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 8000,
});

// Middleware: authenticatie met JWT
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Geen token' });
  try {
    const token = auth.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Ongeldige token' });
  }
}

// GET /me: haal profiel op van ingelogde gebruiker (inclusief credits)
router.get('/me', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  });
  if (!user) return res.status(404).json({ error: 'Gebruiker niet gevonden' });
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    credits: user.profile?.creditsBalance ?? 0
  });
});

// GET /draw/latest: meest recente trekking (voor deelnemers)
router.get('/draw/latest', requireAuth, async (req, res) => {
  const draw = await prisma.draw.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  res.json(draw || null);
});

// GET /draw/cumulative: alle ooit-getrokken unieke nummers (over alle trekkingen heen)
router.get('/draw/cumulative', requireAuth, async (req, res) => {
  const draws = await prisma.draw.findMany({ orderBy: { drawDate: 'asc' } });
  const allNumbers = draws.flatMap(d => Array.isArray(d.winningNumbers) ? d.winningNumbers : []);
  const unique = [...new Set(allNumbers)].sort((a, b) => a - b);
  res.json({ numbers: unique, drawCount: draws.length });
});

// GET /numbers: haal laatst opgeslagen nummers van ingelogde gebruiker
router.get('/numbers', requireAuth, async (req, res) => {
  console.log("[GET /numbers] Ingelogde gebruiker:", req.user);
  const userId = req.user.id;
  const selection = await prisma.numberSelection.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
  if (!selection) return res.json({ numbers: null });
  res.json({ numbers: selection.numbers });
});

// POST /numbers: sla nummers op voor ingelogde gebruiker
router.post('/numbers', requireAuth, async (req, res) => {
  console.log("[POST /numbers] Ingelogde gebruiker:", req.user);
  const userId = req.user.id;
  const { numbers } = req.body;
  console.log("POST /numbers aangeroepen", { userId, numbers });
  if (!Array.isArray(numbers) || numbers.length !== 10) {
    console.log("FOUT: Geen 10 nummers", numbers);
    return res.status(400).json({ error: 'Geef precies 10 nummers op.' });
  }
  try {
    const selection = await prisma.numberSelection.create({
      data: {
        userId,
        numbers,
        validFromDrawId: 1 // evt. aanpassen naar juiste draw
      }
    });
    console.log("Nummerselectie opgeslagen", selection);
    res.json({ numbers: selection.numbers });
  } catch (e) {
    console.error("FOUT bij opslaan nummerselectie", e);
    res.status(500).json({ error: 'Opslaan in database mislukt.' });
  }
});

// Middleware: check admin
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Geen token' });
  try {
    const token = auth.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Geen admin-rechten' });
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Ongeldige token' });
  }
}

// Admin: alle users ophalen (inclusief credits)
router.get('/admin/users', requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    include: { profile: true }
  });
  res.json(users);
});

// Admin: pot totaal berekenen
router.get('/admin/pot', requireAdmin, async (req, res) => {
  const transactions = await prisma.potTransaction.findMany();
  const potTotal = transactions.reduce((sum, t) => sum + t.amount, 0);
  res.json({ potTotal });
});

// Admin: winnaar(s) bepalen op basis van CUMULATIEVE getrokken nummers (alle trekkingen samen)
router.get('/admin/winner', requireAdmin, async (req, res) => {
  const draws = await prisma.draw.findMany({ orderBy: { drawDate: 'asc' } });
  if (!draws.length) return res.json({ winners: [], cumulativeNumbers: [] });
  // Verzamel alle unieke ooit-getrokken nummers
  const allDrawn = draws.flatMap(d => Array.isArray(d.winningNumbers) ? d.winningNumbers : []);
  const cumulativeNumbers = [...new Set(allDrawn)];
  // Haal alle nummerselecties op — dedupleer per userId (neem de meest recente)
  const selections = await prisma.numberSelection.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });
  const seenUsers = new Set();
  const uniqueSelections = selections.filter(s => {
    if (seenUsers.has(s.userId)) return false;
    seenUsers.add(s.userId);
    return true;
  });
  // Winnaar = iemand wiens 10 nummers allemaal in de cumulatieve set zitten
  const winners = uniqueSelections.filter(s => {
    const nums = Array.isArray(s.numbers) ? s.numbers : [];
    return nums.length === 10 && nums.every(n => cumulativeNumbers.includes(n));
  }).map(s => ({
    userId: s.userId,
    userName: s.user.name,
    userEmail: s.user.email,
    numbers: s.numbers
  }));
  res.json({ winners, cumulativeNumbers, drawCount: draws.length });
});

// Admin: lotto resetten (wis pot transacties + trekkingen)
router.post('/admin/reset-lotto', requireAdmin, async (req, res) => {
  await prisma.potTransaction.deleteMany();
  await prisma.draw.deleteMany();
  res.json({ message: 'Lotto gereset — pot is €0, trekkingen gewist.' });
});

// Admin: alles resetten naar nulstand (trekkingen + pot + alle credits)
router.post('/admin/reset-all', requireAdmin, async (req, res) => {
  await prisma.potTransaction.deleteMany();
  await prisma.draw.deleteMany();
  await prisma.participantProfile.updateMany({ data: { creditsBalance: 0 } });
  res.json({ message: 'Alles gereset: trekkingen, pot en credits zijn op nul gezet.' });
});

// Admin: gebruiker goedkeuren
router.post('/admin/approve-user/:userId', requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: 'Ongeldig userId' });
  const user = await prisma.user.update({ where: { id: userId }, data: { approved: true } });
  res.json(user);
});

// Admin: blokkeren/deblokkeren toggle
router.post('/admin/toggle-block/:userId', requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: 'Ongeldig userId' });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Gebruiker niet gevonden' });
  const updated = await prisma.user.update({ where: { id: userId }, data: { blocked: !user.blocked } });
  res.json(updated);
});

// Admin: gebruiker verwijderen (inclusief alle gerelateerde records)
router.delete('/admin/delete-user/:userId', requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: 'Ongeldig userId' });
  try {
    await prisma.twoFactorCode.deleteMany({ where: { userId } });
    await prisma.numberSelection.deleteMany({ where: { userId } });
    await prisma.drawEntry.deleteMany({ where: { userId } });
    await prisma.payout.deleteMany({ where: { userId } });
    await prisma.participantProfile.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'Gebruiker verwijderd' });
  } catch (e) {
    console.error('Verwijderen mislukt:', e.message);
    res.status(500).json({ error: 'Verwijderen mislukt: ' + e.message });
  }
});

// Admin: role aanpassen (max 2 extra admins naast LottoLoJo)
router.post('/admin/set-role', requireAdmin, async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) return res.status(400).json({ error: 'userId en role verplicht' });
  if (role === 'admin') {
    // Tel huidige admins (behalve LottoLoJo)
    const admins = await prisma.user.findMany({ where: { role: 'admin', email: { not: 'lottolojo@gmail.com' } } });
    if (admins.length >= 2) return res.status(400).json({ error: 'Maximaal 2 extra admins toegestaan' });
  }
  const user = await prisma.user.update({ where: { id: userId }, data: { role } });
  res.json(user);
});

// Admin: instellingen ophalen
router.get('/admin/settings', requireAdmin, async (req, res) => {
  let s = await prisma.setting.findFirst();
  if (!s) {
    s = await prisma.setting.create({ data: { entryFee: 2.50, organizerPercentage: 0.15 } });
  }
  res.json({ creditPrice: s.entryFee, orgPercentage: s.organizerPercentage });
});

// Admin: instellingen opslaan
router.post('/admin/settings', requireAdmin, async (req, res) => {
  const { creditPrice, orgPercentage } = req.body;
  if (typeof creditPrice !== 'number' || creditPrice <= 0) return res.status(400).json({ error: 'Ongeldige creditprijs' });
  if (typeof orgPercentage !== 'number' || orgPercentage < 0 || orgPercentage > 1) return res.status(400).json({ error: 'Ongeldig percentage (0–1)' });
  let s = await prisma.setting.findFirst();
  if (!s) {
    s = await prisma.setting.create({ data: { entryFee: creditPrice, organizerPercentage: orgPercentage } });
  } else {
    s = await prisma.setting.update({ where: { id: s.id }, data: { entryFee: creditPrice, organizerPercentage: orgPercentage } });
  }
  res.json({ creditPrice: s.entryFee, orgPercentage: s.organizerPercentage });
});

// Admin: credits toevoegen op basis van een betaald bedrag (bedrag ÷ creditprijs = credits)
router.post('/admin/add-credits', requireAdmin, async (req, res) => {
  const { userId, amount } = req.body;
  if (typeof userId !== 'number' || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'userId en bedrag (> 0) verplicht' });
  }
  const s = await prisma.setting.findFirst();
  const creditPrice = s?.entryFee ?? 2.50;
  const creditsToAdd = Math.floor(amount / creditPrice);
  if (creditsToAdd <= 0) return res.status(400).json({ error: `Bedrag te laag — minimaal ${creditPrice} voor 1 credit` });
  let profile = await prisma.participantProfile.findUnique({ where: { userId } });
  if (!profile) {
    profile = await prisma.participantProfile.create({ data: { userId, creditsBalance: creditsToAdd } });
  } else {
    profile = await prisma.participantProfile.update({ where: { userId }, data: { creditsBalance: { increment: creditsToAdd } } });
  }
  res.json({ ...profile, creditsAdded: creditsToAdd, creditPrice });
});

// Admin: wekelijkse trekking invoeren + 1 credit aftrekken bij alle actieve deelnemers
router.post('/admin/draw', requireAdmin, async (req, res) => {
  const { drawDate, winningNumbers } = req.body;
  if (!Array.isArray(winningNumbers) || winningNumbers.length !== 6) {
    return res.status(400).json({ error: 'Geef precies 6 winnende nummers op (1-45).' });
  }
  if (winningNumbers.some(n => typeof n !== 'number' || n < 1 || n > 45)) {
    return res.status(400).json({ error: 'Nummers moeten tussen 1 en 45 liggen.' });
  }
  try {
    // Datumstring "YYYY-MM-DD" als lokale noon opslaan — voorkomt UTC-grens/tijdzone problemen
    const dateStr = drawDate ? drawDate.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const targetDate = new Date(dateStr + 'T12:00:00');
    // Voorkom dubbele trekking op dezelfde datum
    const dayStart = new Date(dateStr + 'T00:00:00');
    const dayEnd   = new Date(dateStr + 'T23:59:59');
    const existing = await prisma.draw.findFirst({ where: { drawDate: { gte: dayStart, lte: dayEnd } } });
    if (existing) return res.status(409).json({ error: `Er bestaat al een trekking voor ${dateStr}` });

    // Haal creditprijs op uit instellingen
    const s = await prisma.setting.findFirst();
    const creditPrice = s?.entryFee ?? 2.50;

    const draw = await prisma.draw.create({
      data: { drawDate: targetDate, winningNumbers, published: true }
    });

    // Trek 1 credit af bij alle actieve deelnemers (creditsBalance > 0)
    const activeProfiles = await prisma.participantProfile.findMany({
      where: { active: true, creditsBalance: { gt: 0 } }
    });
    await Promise.all(
      activeProfiles.map(p =>
        prisma.participantProfile.update({ where: { id: p.id }, data: { creditsBalance: { decrement: 1 } } })
      )
    );

    // Registreer de potbijdrage voor deze trekking
    const potAmount = activeProfiles.length * creditPrice;
    if (potAmount > 0) {
      await prisma.potTransaction.create({
        data: {
          drawId: draw.id, type: 'draw', amount: potAmount,
          description: `Trekking ${draw.drawDate.toISOString().slice(0,10)}: ${activeProfiles.length} deelnemers × ${creditPrice}`
        }
      });
    }

    res.json({ ...draw, creditsDeducted: activeProfiles.length, potAmount });
  } catch (e) {
    console.error('Fout bij aanmaken trekking:', e);
    res.status(500).json({ error: 'Trekking aanmaken mislukt.' });
  }
});

// Admin: trekking ophalen (alle trekkingen)
router.get('/admin/draws', requireAdmin, async (req, res) => {
  const draws = await prisma.draw.findMany({ orderBy: { drawDate: 'desc' }, take: 10 });
  res.json(draws);
});

// Admin: nummerselectie resetten voor een deelnemer
router.delete('/admin/reset-numbers/:userId', requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: 'Ongeldig userId' });
  try {
    await prisma.numberSelection.deleteMany({ where: { userId } });
    res.json({ message: 'Nummers gereset' });
  } catch (e) {
    res.status(500).json({ error: 'Reset mislukt.' });
  }
});

// Admin: credits aanpassen
router.post('/admin/set-credits', requireAdmin, async (req, res) => {
  const { userId, credits } = req.body;
  if (typeof userId !== 'number' || typeof credits !== 'number') return res.status(400).json({ error: 'userId en credits verplicht' });
  let profile = await prisma.participantProfile.findUnique({ where: { userId } });
  if (!profile) {
    profile = await prisma.participantProfile.create({ data: { userId, creditsBalance: credits } });
  } else {
    profile = await prisma.participantProfile.update({ where: { userId }, data: { creditsBalance: credits } });
  }
  res.json(profile);
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


// Registratie met 6-cijferige verificatiecode per e-mail
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Vul alle velden in.' });
  const existing = await prisma.user.findUnique({ where: { email } });
  // Als gebruiker al bestaat maar nog niet geverifieerd → stuur nieuwe code
  if (existing && !existing.approved) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await prisma.twoFactorCode.create({ data: { userId: existing.id, codeHash: code, expiresAt } });
    let emailOk2 = false;
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER, to: email,
        subject: 'LottoLoJo — Nieuwe verificatiecode',
        text: `Jouw verificatiecode is: ${code}\n\nDeze code is 30 minuten geldig.`,
        html: `<div style="font-family:sans-serif;max-width:420px;margin:auto;padding:24px;border-radius:12px;border:1px solid #e5e7eb;">
          <h2 style="color:#166534;">🎱 LottoLoJo</h2>
          <p>Nieuwe verificatiecode aangevraagd:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;color:#166534;padding:16px 0;">${code}</div>
          <p style="color:#6b7280;font-size:13px;">Deze code is 30 minuten geldig.</p></div>`
      });
      emailOk2 = true;
    } catch (err) { console.error('Mailfout herregistratie:', err.message); }
    return res.json({
      message: emailOk2 ? 'Nieuwe verificatiecode verstuurd.' : 'Account gevonden. E-mail kon niet worden verstuurd.',
      emailSent: emailOk2,
      ...(!emailOk2 && { devCode: code })
    });
  }
  if (existing && existing.approved) return res.status(400).json({ error: 'Gebruiker bestaat al.' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hash, role: 'participant', approved: false }
  });
  // Genereer 6-cijferige code (100000–999999)
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minuten geldig
  await prisma.twoFactorCode.create({
    data: { userId: user.id, codeHash: code, expiresAt }
  });
  let emailOk = false;
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'LottoLoJo — Verificatiecode',
      text: `Jouw verificatiecode is: ${code}\n\nDeze code is 30 minuten geldig.`,
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:auto;padding:24px;border-radius:12px;border:1px solid #e5e7eb;">
          <h2 style="color:#166534;">🎱 LottoLoJo</h2>
          <p>Hallo ${name},</p>
          <p>Gebruik de onderstaande code om je registratie te bevestigen:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;color:#166534;padding:16px 0;">${code}</div>
          <p style="color:#6b7280;font-size:13px;">Deze code is 30 minuten geldig. Deel deze code niet met anderen.</p>
        </div>`
    });
    emailOk = true;
  } catch (err) {
    console.error('Mailfout bij registratie:', err.message);
  }
  res.json({
    message: emailOk
      ? 'Registratie gelukt! Voer de verificatiecode in die je per e-mail hebt ontvangen.'
      : 'Account aangemaakt. E-mail kon niet worden verstuurd.',
    emailSent: emailOk,
    // Stuur code altijd mee als mail mislukt (kleine privé-app, veilig genoeg)
    ...(!emailOk && { devCode: code })
  });
});

// Nieuwe verificatiecode sturen (alleen e-mail nodig)
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail verplicht.' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'Gebruiker niet gevonden.' });
  if (user.approved) return res.status(400).json({ error: 'Account is al geverifieerd. Je kunt inloggen.' });
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await prisma.twoFactorCode.create({ data: { userId: user.id, codeHash: code, expiresAt } });
  let emailOk = false;
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER, to: email,
      subject: 'LottoLoJo — Nieuwe verificatiecode',
      text: `Jouw nieuwe verificatiecode is: ${code}\n\nDeze code is 30 minuten geldig.`,
      html: `<div style="font-family:sans-serif;max-width:420px;margin:auto;padding:24px;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="color:#166534;">🎱 LottoLoJo</h2>
        <p>Nieuwe verificatiecode:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;color:#166534;padding:16px 0;">${code}</div>
        <p style="color:#6b7280;font-size:13px;">Geldig voor 30 minuten.</p></div>`
    });
    emailOk = true;
  } catch (err) { console.error('Mailfout resend:', err.message); }
  res.json({ message: emailOk ? 'Nieuwe code verstuurd!' : 'Code aangemaakt, mail mislukt.', emailSent: emailOk, ...(!emailOk && { devCode: code }) });
});

// Verificatiecode invoeren na registratie
router.post('/verify-email-code', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'E-mail en code zijn verplicht.' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Gebruiker niet gevonden.' });
  if (user.approved) return res.status(400).json({ error: 'Account is al geverifieerd.' });
  const record = await prisma.twoFactorCode.findFirst({
    where: { userId: user.id, codeHash: String(code), usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }
  });
  if (!record) return res.status(400).json({ error: 'Ongeldige of verlopen code. Probeer opnieuw.' });
  await prisma.user.update({ where: { id: user.id }, data: { approved: true } });
  await prisma.twoFactorCode.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  // Maak meteen een profiel aan
  await prisma.participantProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, creditsBalance: 0, active: true }
  });
  res.json({ message: 'E-mail geverifieerd! Je kunt nu inloggen.' });
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
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ message: 'Login gelukt', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
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

// ─── Lotto.nl automatisch ophalen ───────────────────────────────────────────

// Helper: haalt de trekking op van lotto.nederlandseloterij.nl
// Geeft { date, numbers: [n1..n6] gesorteerd laag→hoog } of gooit een Error
async function fetchLottoResults() {
  const res = await fetch('https://lotto.nederlandseloterij.nl/trekkingsuitslag', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept-Language': 'nl-NL,nl;q=0.9'
    }
  });
  if (!res.ok) throw new Error(`Lotto.nl antwoordde met status ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Datum uit de koptekst: "Winnende getallen van 23 mei 2026"
  let drawDate = null;
  $('h1, h2, h3').each((_, el) => {
    const txt = $(el).text();
    const m = txt.match(/(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\s+(\d{4})/i);
    if (m && !drawDate) {
      const maanden = { januari:1,februari:2,maart:3,april:4,mei:5,juni:6,juli:7,augustus:8,september:9,oktober:10,november:11,december:12 };
      const d = parseInt(m[1]), mo = maanden[m[2].toLowerCase()], y = parseInt(m[3]);
      drawDate = `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    }
  });

  // Strategie 1 (meest betrouwbaar):
  // Zoek de ul-container met aria-label="Winnende getallen Trekking"
  // en lees de [data-test="ticket-viewer-number-primary"] elementen erin
  let nums = [];
  const trekContainer = $('[aria-label*="Winnende getallen Trekking"]:not([aria-label*="XL"])');
  if (trekContainer.length > 0) {
    trekContainer.find('[data-test="ticket-viewer-number-primary"]').each((_, el) => {
      const n = parseInt($(el).text().trim());
      if (!isNaN(n) && n >= 1 && n <= 45) nums.push(n);
    });
  }

  // Strategie 2: alle ticket-viewer-number-primary in de pagina, vóór de XL-container
  if (nums.length < 6) {
    nums = [];
    const xlContainer = $('[aria-label*="XL"]');
    let foundXl = false;
    $('[data-test="ticket-viewer-number-primary"]').each((_, el) => {
      if (foundXl) return;
      // Stop zodra we de XL-container bereiken
      if (xlContainer.length > 0 && $.contains(xlContainer[0], el)) { foundXl = true; return; }
      const n = parseInt($(el).text().trim());
      if (!isNaN(n) && n >= 1 && n <= 45) nums.push(n);
    });
  }

  // Strategie 3: winning-numbers-ball-container met Trekking label
  if (nums.length < 6) {
    nums = [];
    $('[data-test="winning-numbers-ball-container"]').first().find('[data-test="ticket-viewer-number-primary"]').each((_, el) => {
      const n = parseInt($(el).text().trim());
      if (!isNaN(n) && n >= 1 && n <= 45) nums.push(n);
    });
  }

  // Neem precies de eerste 6 (reservegetal = 7e, laten we weg), sorteer laag→hoog
  const mainNums = nums.slice(0, 6).sort((a, b) => a - b);
  if (mainNums.length !== 6) throw new Error(`Slechts ${mainNums.length} nummers gevonden (verwacht 6). Mogelijk is de Lotto-pagina gewijzigd.`);

  return { date: drawDate || new Date().toISOString().slice(0, 10), numbers: mainNums };
}

// Admin: haal de actuele trekking op van lotto.nederlandseloterij.nl
router.get('/admin/fetch-lotto-draw', requireAdmin, async (req, res) => {
  try {
    const result = await fetchLottoResults();
    res.json(result);
  } catch (e) {
    console.error('Fout bij ophalen Lotto resultaten:', e.message);
    res.status(500).json({ error: e.message || 'Ophalen mislukt' });
  }
});

// Admin: concept-trekking publiceren
router.post('/admin/publish-draw/:drawId', requireAdmin, async (req, res) => {
  const drawId = parseInt(req.params.drawId);
  if (isNaN(drawId)) return res.status(400).json({ error: 'Ongeldig drawId' });
  const draw = await prisma.draw.update({ where: { id: drawId }, data: { published: true, publishedAt: new Date() } });
  res.json(draw);
});

// Admin: verificatiecode opzoeken voor een e-mailadres (troubleshooting)
router.get('/admin/verify-code/:email', requireAdmin, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.params.email } });
  if (!user) return res.status(404).json({ error: 'Gebruiker niet gevonden' });
  const code = await prisma.twoFactorCode.findFirst({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }
  });
  if (!code) return res.json({ code: null, message: 'Geen geldige code gevonden' });
  res.json({ code: code.codeHash, expiresAt: code.expiresAt, approved: user.approved });
});

// Admin: handmatig de cron-logica triggeren (voor testen)
router.post('/admin/run-cron-now', requireAdmin, async (req, res) => {
  try {
    const { date, numbers } = await fetchLottoResults();
    const dayStart = new Date(date + 'T00:00:00');
    const dayEnd   = new Date(date + 'T23:59:59');
    const existing = await prisma.draw.findFirst({ where: { drawDate: { gte: dayStart, lte: dayEnd } } });
    if (existing) return res.status(409).json({ error: `Trekking al aanwezig voor ${date}` });
    const s = await prisma.setting.findFirst();
    const creditPrice = s?.entryFee ?? 2.50;
    const draw = await prisma.draw.create({
      data: { drawDate: new Date(date + 'T12:00:00'), winningNumbers: numbers, published: true, publishedAt: new Date() }
    });
    const activeProfiles = await prisma.participantProfile.findMany({ where: { active: true, creditsBalance: { gt: 0 } } });
    await Promise.all(activeProfiles.map(p =>
      prisma.participantProfile.update({ where: { id: p.id }, data: { creditsBalance: { decrement: 1 } } })
    ));
    const potAmount = activeProfiles.length * creditPrice;
    if (potAmount > 0) {
      await prisma.potTransaction.create({
        data: { drawId: draw.id, type: 'draw', amount: potAmount,
          description: `Sim-trekking ${date}: ${activeProfiles.length} deelnemers × ${creditPrice}` }
      });
    }
    res.json({ ok: true, date, numbers, participants: activeProfiles.length, potAdded: potAmount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Cron: elke zaterdag om 21:05 automatisch de trekking ophalen en DIRECT publiceren
// Formaat: minuut uur dag-v-maand maand dag-v-week  (6 = zaterdag)
cron.schedule('5 21 * * 6', async () => {
  console.log('[Cron] Automatisch ophalen Lotto trekking...');
  try {
    const { date, numbers } = await fetchLottoResults();
    // Datumcontrole met UTC-veilige methode
    const dayStart = new Date(date + 'T00:00:00');
    const dayEnd   = new Date(date + 'T23:59:59');
    const existing = await prisma.draw.findFirst({ where: { drawDate: { gte: dayStart, lte: dayEnd } } });
    if (existing) { console.log('[Cron] Trekking al aanwezig voor', date); return; }
    const s = await prisma.setting.findFirst();
    const creditPrice = s?.entryFee ?? 2.50;
    const draw = await prisma.draw.create({
      data: { drawDate: new Date(date + 'T12:00:00'), winningNumbers: numbers, published: true, publishedAt: new Date() }
    });
    const activeProfiles = await prisma.participantProfile.findMany({ where: { active: true, creditsBalance: { gt: 0 } } });
    await Promise.all(activeProfiles.map(p =>
      prisma.participantProfile.update({ where: { id: p.id }, data: { creditsBalance: { decrement: 1 } } })
    ));
    const potAmount = activeProfiles.length * creditPrice;
    if (potAmount > 0) {
      await prisma.potTransaction.create({
        data: { drawId: draw.id, type: 'draw', amount: potAmount,
          description: `Auto-trekking ${date}: ${activeProfiles.length} deelnemers × ${creditPrice}` }
      });
    }
    console.log(`[Cron] ✅ Trekking gepubliceerd: ${date} – ${numbers.join(', ')} – ${activeProfiles.length} deelnemers`);
  } catch (e) {
    console.error('[Cron] Fout bij automatische trekking:', e.message);
  }
}, { timezone: 'Europe/Amsterdam' });

export default router;
